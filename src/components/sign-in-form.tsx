import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import z from "zod/v4";
import { authClient } from "@/lib/auth-client";
import Loader from "./loader";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export default function SignInForm({
	onSwitchToSignUp,
}: {
	onSwitchToSignUp: () => void;
}) {
	const router = useRouter();
	const queryClient = useQueryClient();
	const { isPending } = authClient.useSession();

	// Mutation to get email from username
	const getUserByUsernameMutation = useMutation({
		mutationFn: async (identifier: string) => {
			// If it contains @, it's already an email
			if (identifier.includes("@")) {
				return identifier;
			}

			// Otherwise, try to fetch email by username
			const result = await queryClient.fetchQuery({
				queryKey: ["user", "getEmailByUsername", identifier],
				queryFn: async () => {
					const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
					const response = await fetch(
						`${serverUrl}/trpc/user.getEmailByUsername`,
						{
							method: "POST",
							headers: {
								"Content-Type": "application/json",
							},
							body: JSON.stringify({ username: identifier }),
							credentials: "include",
						},
					);

					if (!response.ok) {
						throw new Error("Username tidak ditemukan");
					}

					const data = await response.json();
					return data.result?.data?.email || identifier;
				},
			});
			return result;
		},
	});

	const form = useForm({
		defaultValues: {
			email: "",
			password: "",
		},
		onSubmit: async ({ value }) => {
			try {
				// Get the actual email (convert username to email if needed)
				const email = await getUserByUsernameMutation.mutateAsync(value.email);

				await authClient.signIn.email(
					{
						email: email,
						password: value.password,
					},
					{
						onSuccess: () => {
							router.push("/");
							toast.success("Berhasil masuk!");
						},
						onError: (error) => {
							toast.error(
								error.error.message ||
									"Gagal masuk. Periksa kembali email/username dan kata sandi Anda.",
							);
						},
					},
				);
			} catch (error: any) {
				toast.error(
					error.message ||
						"Gagal masuk. Periksa kembali email/username dan kata sandi Anda.",
				);
			}
		},
		validators: {
			onSubmit: z.object({
				email: z.string().min(1, "Email atau username harus diisi"),
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
					<form.Field name="email">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>Email atau Username</Label>
								<Input
									id={field.name}
									name={field.name}
									type="text"
									placeholder="Masukkan email atau username"
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
									placeholder="Masukkan kata sandi"
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
								getUserByUsernameMutation.isPending
							}
						>
							{state.isSubmitting || getUserByUsernameMutation.isPending
								? "Memproses..."
								: "Masuk"}
						</Button>
					)}
				</form.Subscribe>
			</form>
		</div>
	);
}
