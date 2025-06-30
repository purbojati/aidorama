import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import z from "zod/v4";
import { authClient } from "@/lib/auth-client";
import { trpc } from "@/utils/trpc";
import Loader from "./loader";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export default function SignUpForm({
	onSwitchToSignIn,
}: {
	onSwitchToSignIn: () => void;
}) {
	const router = useRouter();
	const queryClient = useQueryClient();
	const { isPending } = authClient.useSession();

	// Username generation mutation
	const generateUsernameMutation = useMutation({
		mutationFn: async () => {
			const result = await queryClient.fetchQuery({
				queryKey: ["user", "generateUsername"],
				queryFn: async () => {
					const serverUrl =
						process.env.NEXT_PUBLIC_SERVER_URL ||
						(typeof window !== "undefined"
							? window.location.origin
							: "http://localhost:3000");
					const response = await fetch(
						`${serverUrl}/trpc/user.generateUsername`,
						{
							method: "POST",
							headers: {
								"Content-Type": "application/json",
							},
							body: JSON.stringify({}),
							credentials: "include",
						},
					);

					if (!response.ok) {
						const error = await response.json();
						throw new Error(error.error?.message || "Gagal membuat username");
					}

					return response.json();
				},
			});
			return result;
		},
	});

	const form = useForm({
		defaultValues: {
			email: "",
			password: "",
			name: "",
		},
		onSubmit: async ({ value }) => {
			await authClient.signUp.email(
				{
					email: value.email,
					password: value.password,
					name: value.name,
				},
				{
					onSuccess: async (context) => {
						try {
							// Wait a moment for session to be established
							await new Promise((resolve) => setTimeout(resolve, 1000));

							// Generate username after successful signup
							await generateUsernameMutation.mutateAsync();

							toast.success(
								"Berhasil mendaftar! Username telah dibuat otomatis.",
							);
							router.push("/dashboard");
						} catch (error) {
							// Even if username generation fails, user is created successfully
							console.warn("Username generation failed:", error);
							toast.success("Berhasil mendaftar! Selamat datang!");
							router.push("/dashboard");
						}
					},
					onError: (error) => {
						toast.error(
							error.error.message || "Gagal mendaftar. Silakan coba lagi.",
						);
					},
				},
			);
		},
		validators: {
			onSubmit: z.object({
				name: z.string().min(2, "Nama lengkap minimal 2 karakter"),
				email: z.string().email("Format email tidak valid"),
				password: z.string().min(8, "Kata sandi minimal 8 karakter"),
			}),
		},
	});

	if (isPending) {
		return <Loader />;
	}

	return (
		<div className="space-y-4">
			<form
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					void form.handleSubmit();
				}}
				className="space-y-4"
			>
				<div>
					<form.Field name="name">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>Nama Lengkap</Label>
								<Input
									id={field.name}
									name={field.name}
									placeholder="Masukkan nama lengkap"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
								/>
								{field.state.meta.errors.map((error) => (
									<p key={error?.message} className="text-red-500 text-sm">
										{error?.message}
									</p>
								))}
							</div>
						)}
					</form.Field>
				</div>

				<div>
					<form.Field name="email">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>Email</Label>
								<Input
									id={field.name}
									name={field.name}
									type="email"
									placeholder="Masukkan alamat email"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
								/>
								{field.state.meta.errors.map((error) => (
									<p key={error?.message} className="text-red-500 text-sm">
										{error?.message}
									</p>
								))}
							</div>
						)}
					</form.Field>
				</div>

				<div>
					<form.Field name="password">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>Kata Sandi</Label>
								<Input
									id={field.name}
									name={field.name}
									type="password"
									placeholder="Masukkan kata sandi (minimal 8 karakter)"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
								/>
								{field.state.meta.errors.map((error) => (
									<p key={error?.message} className="text-red-500 text-sm">
										{error?.message}
									</p>
								))}
							</div>
						)}
					</form.Field>
				</div>

				<form.Subscribe>
					{(state) => (
						<Button
							type="submit"
							className="w-full"
							disabled={
								!state.canSubmit ||
								state.isSubmitting ||
								generateUsernameMutation.isPending
							}
						>
							{state.isSubmitting || generateUsernameMutation.isPending
								? "Memproses..."
								: "Daftar"}
						</Button>
					)}
				</form.Subscribe>
			</form>

			<div className="mt-4 text-center">
				<p className="text-muted-foreground text-sm">
					Username akan dibuat otomatis berdasarkan nama Anda
				</p>
			</div>
		</div>
	);
}
