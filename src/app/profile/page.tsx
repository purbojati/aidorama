"use client";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import z from "zod/v4";
import Loader from "@/components/loader";
import SidebarLayout from "@/components/sidebar-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { trpc } from "@/utils/trpc";

export default function ProfilePage() {
	const router = useRouter();
	const queryClient = useQueryClient();
	const { data: session, isPending } = authClient.useSession();

	// Get user profile data
	const userProfile: any = useQuery(trpc.user.getProfile.queryOptions()).data;

	// Profile update mutation
	const updateProfileMutation = useMutation({
		mutationFn: async (input: {
			name: string;
			displayName?: string;
			bio?: string;
		}) => {
			const result = await queryClient.fetchQuery({
				queryKey: ["user", "updateProfile", input],
				queryFn: async () => {
					const serverUrl =
						process.env.NEXT_PUBLIC_SERVER_URL ||
						(typeof window !== "undefined"
							? window.location.origin
							: "http://localhost:3000");
					const response = await fetch(`${serverUrl}/trpc/user.updateProfile`, {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify(input),
						credentials: "include",
					});

					if (!response.ok) {
						const error = await response.json();
						throw new Error(error.error?.message || "Gagal memperbarui profil");
					}

					return response.json();
				},
			});
			return result;
		},
		onSuccess: () => {
			toast.success("Profil berhasil diperbarui!");
			// Invalidate and refetch profile data
			queryClient.invalidateQueries({ queryKey: ["user", "getProfile"] });
		},
		onError: (error: unknown) => {
			toast.error(
				error instanceof Error ? error.message : "Gagal memperbarui profil",
			);
		},
	});

	useEffect(() => {
		if (!session && !isPending) {
			router.push("/login");
		}
	}, [session, isPending, router]);

	const form = useForm({
		defaultValues: {
			name: "",
			displayName: "",
			bio: "",
		},
		onSubmit: async ({ value }) => {
			updateProfileMutation.mutate({
				name: value.name,
				displayName: value.displayName || undefined,
				bio: value.bio || undefined,
			});
		},
		validators: {
			onSubmit: z.object({
				name: z.string().min(2, "Nama lengkap minimal 2 karakter"),
				displayName: z.string().min(2, "Nama tampilan minimal 2 karakter"),
				bio: z.string().max(500, "Bio maksimal 500 karakter"),
			}),
		},
	});

	// Update form when profile data is available
	useEffect(() => {
		if (userProfile) {
			form.setFieldValue("name", userProfile.name || "");
			form.setFieldValue(
				"displayName",
				userProfile.displayName || userProfile.name || "",
			);
			form.setFieldValue("bio", userProfile.bio || "");
		}
	}, [userProfile, form.setFieldValue]);

	if (isPending || userProfile === undefined) {
		return (
			<SidebarLayout>
				<div className="flex min-h-screen items-center justify-center">
					<Loader />
				</div>
			</SidebarLayout>
		);
	}

	if (!session) {
		return null;
	}

	return (
		<SidebarLayout>
			<div className="container mx-auto px-4 py-8">
				<div className="mx-auto max-w-2xl">
					<div className="mb-6">
						<Link
							href="/"
							className="mb-4 inline-block text-muted-foreground hover:text-foreground"
						>
							← Kembali ke Karakter
						</Link>
						<h1 className="font-bold text-3xl">Pengaturan Profil</h1>
						<p className="mt-2 text-muted-foreground">
							Kelola informasi profil dan preferensi akun Anda
						</p>
					</div>

					<div className="rounded-lg border bg-card p-6">
						<form
							onSubmit={(e) => {
								e.preventDefault();
								e.stopPropagation();
								void form.handleSubmit();
							}}
							className="space-y-6"
						>
							<div className="space-y-4">
								<div>
									<Label htmlFor="email">Email</Label>
									<Input
										id="email"
										type="email"
										value={session.user.email}
										disabled
										className="bg-muted"
									/>
									<p className="mt-1 text-muted-foreground text-sm">
										Email tidak dapat diubah
									</p>
								</div>

								{userProfile?.username && (
									<div>
										<Label htmlFor="username">Username</Label>
										<Input
											id="username"
											value={userProfile.username}
											disabled
											className="bg-muted"
										/>
										<p className="mt-1 text-muted-foreground text-sm">
											Username dibuat otomatis dan tidak dapat diubah
										</p>
									</div>
								)}

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
													<p
														key={error?.message}
														className="text-red-500 text-sm"
													>
														{error?.message}
													</p>
												))}
											</div>
										)}
									</form.Field>
								</div>

								<div>
									<form.Field name="displayName">
										{(field) => (
											<div className="space-y-2">
												<Label htmlFor={field.name}>Nama Tampilan</Label>
												<Input
													id={field.name}
													name={field.name}
													placeholder="Nama yang akan ditampilkan kepada pengguna lain"
													value={field.state.value}
													onBlur={field.handleBlur}
													onChange={(e) => field.handleChange(e.target.value)}
												/>
												{field.state.meta.errors.map((error) => (
													<p
														key={error?.message}
														className="text-red-500 text-sm"
													>
														{error?.message}
													</p>
												))}
											</div>
										)}
									</form.Field>
								</div>

								<div>
									<form.Field name="bio">
										{(field) => (
											<div className="space-y-2">
												<Label htmlFor={field.name}>Bio</Label>
												<textarea
													id={field.name}
													name={field.name}
													placeholder="Ceritakan sedikit tentang diri Anda..."
													value={field.state.value}
													onBlur={field.handleBlur}
													onChange={(e) => field.handleChange(e.target.value)}
													className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
													rows={4}
												/>
												<p className="text-muted-foreground text-sm">
													{field.state.value.length}/500 karakter
												</p>
												{field.state.meta.errors.map((error) => (
													<p
														key={error?.message}
														className="text-red-500 text-sm"
													>
														{error?.message}
													</p>
												))}
											</div>
										)}
									</form.Field>
								</div>
							</div>

							<div className="flex gap-3 pt-4">
								<form.Subscribe>
									{(state) => (
										<Button
											type="submit"
											disabled={
												!state.canSubmit ||
												state.isSubmitting ||
												updateProfileMutation.isPending
											}
										>
											{state.isSubmitting || updateProfileMutation.isPending
												? "Menyimpan..."
												: "Simpan Perubahan"}
										</Button>
									)}
								</form.Subscribe>

								<Button type="button" variant="outline" asChild>
									<Link href="/">Batal</Link>
								</Button>
							</div>
						</form>
					</div>

					<div className="mt-8 rounded-lg border bg-card p-6">
						<h2 className="mb-4 font-semibold text-destructive text-xl">
							Zona Berbahaya
						</h2>
						<p className="mb-4 text-muted-foreground">
							Tindakan berikut tidak dapat dibatalkan. Pastikan Anda yakin
							sebelum melanjutkan.
						</p>
						<Button variant="destructive" disabled>
							Hapus Akun
						</Button>
						<p className="mt-2 text-muted-foreground text-sm">
							Fitur hapus akun akan tersedia segera
						</p>
					</div>
				</div>
			</div>
		</SidebarLayout>
	);
}
