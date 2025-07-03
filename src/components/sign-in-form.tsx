import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import z from "zod/v4";
import posthog from "posthog-js";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import Loader from "./loader";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export default function SignInForm({
	onSwitchToSignUp,
	className,
	...props
}: {
	onSwitchToSignUp: () => void;
	className?: string;
} & React.ComponentProps<"div">) {
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
					const serverUrl =
						process.env.NEXT_PUBLIC_SERVER_URL ||
						(typeof window !== "undefined"
							? window.location.origin
							: "http://localhost:3000");
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
							// Track login event
							posthog.capture('user_login', {
								login_method: 'email',
								login_identifier_type: value.email.includes('@') ? 'email' : 'username'
							});
							
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
								<h1 className="text-2xl font-bold">Selamat Datang Kembali</h1>
								<p className="text-muted-foreground text-balance">
									Masuk ke akun Aidorama Anda
								</p>
							</div>

							<div className="grid gap-4">
								{/* Google Sign In Button */}
								<Button
									type="button"
									variant="outline"
									className="w-full"
									onClick={() => {
										posthog.capture('user_login_attempt', {
											login_method: 'google'
										});
										authClient.signIn.social({
											provider: "google",
											callbackURL: "/",
										});
									}}
								>
									<svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
										<path
											fill="currentColor"
											d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
										/>
										<path
											fill="currentColor"
											d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
										/>
										<path
											fill="currentColor"
											d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
										/>
										<path
											fill="currentColor"
											d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
										/>
									</svg>
									Masuk dengan Google
								</Button>

								<div className="relative">
									<div className="absolute inset-0 flex items-center">
										<span className="w-full border-t" />
									</div>
									<div className="relative flex justify-center text-xs uppercase">
										<span className="bg-background px-2 text-muted-foreground">
											Atau masuk dengan email
										</span>
									</div>
								</div>

								<div>
									<form.Field name="email">
										{(field) => (
											<div className="space-y-2">
												<Label htmlFor={field.name}>Email atau Username</Label>
												<Input
													id={field.name}
													name={field.name}
													type="text"
													placeholder="nama@contoh.com atau username"
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
												<div className="flex items-center">
													<Label htmlFor={field.name}>Kata Sandi</Label>
													<a
														href="#"
														className="ml-auto text-sm underline-offset-2 hover:underline"
														onClick={(e) => {
															e.preventDefault();
															toast.info("Fitur reset kata sandi segera hadir!");
														}}
													>
														Lupa kata sandi?
													</a>
												</div>
												<Input
													id={field.name}
													name={field.name}
													type="password"
													placeholder="Masukkan kata sandi"
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
												getUserByUsernameMutation.isPending
											}
										>
											{state.isSubmitting || getUserByUsernameMutation.isPending
												? "Memproses..."
												: "Masuk"}
										</Button>
									)}
								</form.Subscribe>
							</div>

							<div className="text-center text-sm">
								Belum punya akun?{" "}
								<button
									type="button"
									onClick={onSwitchToSignUp}
									className="underline underline-offset-4 hover:text-primary"
								>
									Daftar di sini
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
				Dengan melanjutkan, Anda menyetujui{" "}
				<Link href="/privacy" className="underline underline-offset-4 hover:text-primary">
					Kebijakan Privasi
				</Link>{" "}
				kami.
			</div>
		</div>
	);
}
