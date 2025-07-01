import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import z from "zod/v4";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { trpc } from "@/utils/trpc";
import Loader from "./loader";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export default function SignUpForm({
	onSwitchToSignIn,
	className,
	...props
}: {
	onSwitchToSignIn: () => void;
	className?: string;
} & React.ComponentProps<"div">) {
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
								router.push("/");
							} catch (error) {
								// Even if username generation fails, user is created successfully
								console.warn("Username generation failed:", error);
								toast.success("Berhasil mendaftar! Selamat datang!");
								router.push("/");
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
		<div className={cn("flex flex-col gap-6", className)} {...props}>
			<Card className="overflow-hidden p-0">
				<CardContent className="grid p-0 md:grid-cols-2">
					<form
						onSubmit={(e) => {
							e.preventDefault();
							e.stopPropagation();
							void form.handleSubmit();
						}}
						className="p-6 md:p-8"
					>
						<div className="flex flex-col gap-6">
							<div className="flex flex-col items-center text-center">
								<h1 className="text-2xl font-bold">Buat Akun Baru</h1>
								<p className="text-muted-foreground text-balance">
									Bergabunglah dengan komunitas Aidorama
								</p>
							</div>

							<div className="grid gap-4">
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
													required
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
													placeholder="nama@contoh.com"
													value={field.state.value}
													onBlur={field.handleBlur}
													onChange={(e) => field.handleChange(e.target.value)}
													required
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
													placeholder="Minimal 8 karakter"
													value={field.state.value}
													onBlur={field.handleBlur}
													onChange={(e) => field.handleChange(e.target.value)}
													required
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
												: "Buat Akun"}
										</Button>
									)}
								</form.Subscribe>

								<div className="text-center text-sm">
									<p className="text-muted-foreground mb-2">
										Username akan dibuat otomatis berdasarkan nama Anda
									</p>
								</div>
							</div>

							<div className="text-center text-sm">
								Sudah punya akun?{" "}
								<button
									type="button"
									onClick={onSwitchToSignIn}
									className="underline underline-offset-4 hover:text-primary"
								>
									Masuk di sini
								</button>
							</div>
						</div>
					</form>
					<div className="bg-muted relative hidden md:block">
						<img
							src="/aidorama-logo-trans.png"
							alt="Aidorama"
							className="absolute inset-0 h-full w-full object-contain p-8 dark:brightness-[0.8]"
						/>
					</div>
				</CardContent>
			</Card>
			<div className="text-muted-foreground text-center text-xs text-balance">
				Dengan mendaftar, Anda menyetujui{" "}
				<a href="#" className="underline underline-offset-4 hover:text-primary">
					Syarat Layanan
				</a>{" "}
				dan{" "}
				<a href="#" className="underline underline-offset-4 hover:text-primary">
					Kebijakan Privasi
				</a>{" "}
				kami.
			</div>
		</div>
	);
}
