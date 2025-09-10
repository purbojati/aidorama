"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

// Declare sa_event for Simple Analytics
declare global {
	interface Window {
		sa_event?: (eventName: string) => void;
	}
}
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
	compressImage,
	formatFileSize,
	validateImageFile,
} from "@/lib/image-compression";
import { trpc } from "@/utils/trpc";
import Image from "next/image";

interface CharacterForm {
	name: string;
	synopsis: string;
	description: string;
	greetings: string;
	avatarUrl: string;
	defaultUserRoleName: string;
	defaultUserRoleDetails: string;
	defaultSituationName: string;
	initialSituationDetails: string;
	complianceMode: string;
	isPublic: boolean;
}

interface CharacterFormComponentProps {
	mode: "create" | "edit";
	characterId?: number;
}

export default function CharacterFormComponent({
	mode,
	characterId,
}: CharacterFormComponentProps) {
	const router = useRouter();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [form, setForm] = useState<CharacterForm>({
		name: "",
		synopsis: "",
		description: "",
		greetings: "",
		avatarUrl: "",
		defaultUserRoleName: "",
		defaultUserRoleDetails: "",
		defaultSituationName: "",
		initialSituationDetails: "",
		complianceMode: "standard",
		isPublic: false,
	});
	const [avatarPreview, setAvatarPreview] = useState<string>("");
	const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

	const [errors, setErrors] = useState<Partial<CharacterForm>>({});
	const [isInitialized, setIsInitialized] = useState(false);

	// AI Auto-fill states (only for create mode)
	const [isAiDialogOpen, setIsAiDialogOpen] = useState(false);
	const [aiInput, setAiInput] = useState("");

	// Query for character data (only for edit mode)
	const { data: character, isLoading } = useQuery({
		...trpc.characters.getCharacter.queryOptions({ id: characterId! }),
		enabled: mode === "edit" && !!characterId,
	});

	// Initialize form when character data is loaded (edit mode)
	useEffect(() => {
		if (mode === "edit" && character && !isInitialized) {
			setForm({
				name: character.name || "",
				synopsis: character.synopsis || "",
				description: character.description || "",
				greetings: character.greetings || "",
				avatarUrl: character.avatarUrl || "",
				defaultUserRoleName: character.defaultUserRoleName || "",
				defaultUserRoleDetails: character.defaultUserRoleDetails || "",
				defaultSituationName: character.defaultSituationName || "",
				initialSituationDetails: character.initialSituationDetails || "",
				complianceMode: character.complianceMode || "standard",
				isPublic: character.isPublic || false,
			});
			if (character.avatarUrl) {
				setAvatarPreview(character.avatarUrl);
			}
			setIsInitialized(true);
		}
	}, [mode, character, isInitialized]);

	const createCharacterMutation = useMutation({
		mutationFn: async (input: any) => {
			const serverUrl =
				process.env.NEXT_PUBLIC_SERVER_URL ||
				(typeof window !== "undefined"
					? window.location.origin
					: "http://localhost:3000");
			const response = await fetch(
				`${serverUrl}/trpc/characters.createCharacter`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					credentials: "include",
					body: JSON.stringify(input),
				},
			);

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error?.message || "Gagal bikin karakter");
			}

			const result = await response.json();
			return result.result?.data;
		},
		onSuccess: (character: any) => {
			toast.success("Karakter udah jadi nih! 🎉");
			router.push(`/chat/${character.id}`);
			
			// Track create_character_save event
			if (typeof window !== "undefined" && window.sa_event) {
				window.sa_event("create_character_save");
			}
		},
		onError: (error: any) => {
			toast.error(error.message || "Waduh, gagal bikin karakter");
		},
	});

	const updateCharacterMutation = useMutation({
		mutationFn: async (input: any) => {
			const serverUrl =
				process.env.NEXT_PUBLIC_SERVER_URL ||
				(typeof window !== "undefined"
					? window.location.origin
					: "http://localhost:3000");
			const response = await fetch(
				`${serverUrl}/trpc/characters.updateCharacter`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					credentials: "include",
					body: JSON.stringify(input),
				},
			);
			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error?.message || "Gagal memperbarui karakter");
			}
			return response.json();
		},
		onSuccess: () => {
			toast.success("Karakter berhasil diperbarui! ✨");
			router.push("/");
			
			// Track create_character_save event
			if (typeof window !== "undefined" && window.sa_event) {
				window.sa_event("create_character_save");
			}
		},
		onError: (error: any) => {
			toast.error(error.message || "Gagal memperbarui karakter");
		},
	});

	// AI parsing mutation (only for create mode)
	const parseUserInputMutation = useMutation({
		mutationFn: async (input: { userInput: string }) => {
			const serverUrl =
				process.env.NEXT_PUBLIC_SERVER_URL ||
				(typeof window !== "undefined"
					? window.location.origin
					: "http://localhost:3000");
			const response = await fetch(
				`${serverUrl}/trpc/characters.parseUserInput`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					credentials: "include",
					body: JSON.stringify(input),
				},
			);

			if (!response.ok) {
				const error = await response.json();
				throw new Error(
					error.error?.message || "Gagal memproses input dengan AI",
				);
			}

			const result = await response.json();
			return result.result?.data;
		},
		onSuccess: (parsedData: any) => {
			// Fill form with parsed data
			const newForm = { ...form };

			if (parsedData.name) newForm.name = parsedData.name;
			if (parsedData.synopsis) newForm.synopsis = parsedData.synopsis;
			if (parsedData.description) newForm.description = parsedData.description;
			if (parsedData.greetings) newForm.greetings = parsedData.greetings;
			if (parsedData.defaultUserRoleName)
				newForm.defaultUserRoleName = parsedData.defaultUserRoleName;
			if (parsedData.defaultUserRoleDetails)
				newForm.defaultUserRoleDetails = parsedData.defaultUserRoleDetails;
			if (parsedData.defaultSituationName)
				newForm.defaultSituationName = parsedData.defaultSituationName;
			if (parsedData.initialSituationDetails)
				newForm.initialSituationDetails = parsedData.initialSituationDetails;
			if (typeof parsedData.isPublic === "boolean")
				newForm.isPublic = parsedData.isPublic;

			setForm(newForm);
			setIsAiDialogOpen(false);
			setAiInput("");
			toast.success("Berhasil mengisi form dengan AI! ✨🤖");
		},
		onError: (error: any) => {
			toast.error(error.message || "Gagal memproses input dengan AI");
		},
	});

	const validateForm = (): boolean => {
		const newErrors: Partial<CharacterForm> = {};

		if (!form.name.trim()) {
			newErrors.name = "Nama karakter harus diisi dong";
		} else if (form.name.length > 50) {
			newErrors.name = "Nama karakter kepanjangan, maksimal 50 karakter aja";
		}

		if (!form.synopsis.trim()) {
			newErrors.synopsis = "Synopsis jangan kosong ya";
		} else if (form.synopsis.length > 300) {
			newErrors.synopsis = "Synopsis kepanjangan, maksimal 300 karakter";
		}

		if (!form.description.trim()) {
			newErrors.description = "Deskripsi wajib diisi nih";
		} else if (form.description.length > 500) {
			newErrors.description =
				"Deskripsi terlalu panjang, maksimal 500 karakter";
		}

		if (!form.greetings.trim()) {
			newErrors.greetings = "Greetings harus ada dong";
		} else if (form.greetings.length > 200) {
			newErrors.greetings = "Greetings kepanjangan, maksimal 200 karakter";
		}



		if (
			form.avatarUrl &&
			form.avatarUrl.trim() !== "" &&
			!isValidUrl(form.avatarUrl)
		) {
			newErrors.avatarUrl = "URL avatar gak valid nih";
		}

		if (form.defaultUserRoleName.length > 50) {
			newErrors.defaultUserRoleName =
				"Nama peran kepanjangan, maksimal 50 karakter";
		}

		if (form.defaultUserRoleDetails.length > 200) {
			newErrors.defaultUserRoleDetails =
				"Detail peran kepanjangan, maksimal 200 karakter";
		}

		if (form.defaultSituationName.length > 50) {
			newErrors.defaultSituationName =
				"Nama situasi kepanjangan, maksimal 50 karakter";
		}

		if (form.initialSituationDetails.length > 300) {
			newErrors.initialSituationDetails =
				"Detail situasi kepanjangan, maksimal 300 karakter";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const isValidUrl = (url: string): boolean => {
		try {
			new URL(url);
			return true;
		} catch {
			return false;
		}
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateForm()) {
			return;
		}

		const submitData = {
			name: form.name.trim(),
			synopsis: form.synopsis.trim(),
			description: form.description.trim(),
			greetings: form.greetings.trim(),
			avatarUrl: form.avatarUrl.trim() || undefined,
			defaultUserRoleName: form.defaultUserRoleName.trim() || undefined,
			defaultUserRoleDetails: form.defaultUserRoleDetails.trim() || undefined,
			defaultSituationName: form.defaultSituationName.trim() || undefined,
			initialSituationDetails: form.initialSituationDetails.trim() || undefined,
			complianceMode: form.complianceMode,
			isPublic: form.isPublic,
		};

		if (mode === "create") {
			createCharacterMutation.mutate(submitData);
		} else {
			updateCharacterMutation.mutate({
				id: characterId,
				...submitData,
			});
		}
	};

	const handleInputChange = (
		field: keyof CharacterForm,
		value: string | boolean | string[],
	) => {
		setForm((prev) => ({ ...prev, [field]: value }));
		// Clear error when user starts typing
		if (errors[field]) {
			setErrors((prev) => ({ ...prev, [field]: undefined }));
		}
	};

	const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		// Validate file first
		const validation = validateImageFile(file);
		if (!validation.valid) {
			toast.error(validation.error);
			return;
		}

		// Clean up previous preview if it was a blob
		if (avatarPreview && avatarPreview.startsWith("blob:")) {
			URL.revokeObjectURL(avatarPreview);
		}

		// Create initial preview
		const previewUrl = URL.createObjectURL(file);
		setAvatarPreview(previewUrl);
		setIsUploadingAvatar(true);

		try {
			// Client-side compression first
			console.log(`📁 Original file: ${formatFileSize(file.size)}`);

			const clientCompressed = await compressImage(file, {
				maxWidth: 800,
				maxHeight: 800,
				quality: 0.85,
				format: "jpeg",
			});

			console.log(
				`🗜️ Client compressed: ${formatFileSize(clientCompressed.compressedSize)} (${clientCompressed.compressionRatio}% reduction)`,
			);

			// Clean up previous preview if it was a blob (again, in case compression is async and user uploads again quickly)
			if (avatarPreview && avatarPreview.startsWith("blob:")) {
				URL.revokeObjectURL(avatarPreview);
			}

			// Update preview with compressed version
			const compressedPreviewUrl = URL.createObjectURL(clientCompressed.file);
			setAvatarPreview(compressedPreviewUrl);

			// Upload compressed file to R2
			const formData = new FormData();
			formData.append("avatar", clientCompressed.file);

			const serverUrl =
				process.env.NEXT_PUBLIC_SERVER_URL ||
				(typeof window !== "undefined"
					? window.location.origin
					: "http://localhost:3000");
			const response = await fetch(`${serverUrl}/api/upload/avatar`, {
				method: "POST",
				body: formData,
				credentials: "include",
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Gagal upload avatar");
			}

			const result = await response.json();

			// Update form with R2 URL
			setForm((prev) => ({ ...prev, avatarUrl: result.url }));

			// Clean up preview URL if it was a blob (compressedPreviewUrl)
			if (compressedPreviewUrl.startsWith("blob:")) {
				URL.revokeObjectURL(compressedPreviewUrl);
			}

			// Use R2 URL for preview
			setAvatarPreview(result.url);

			console.log(
				`🌩️ Server compressed: ${formatFileSize(result.compression?.compressedSize || 0)} (${result.compression?.compressionRatio || 0}% reduction)`,
			);
			console.log(
				`📊 Total compression: ${formatFileSize(file.size)} → ${formatFileSize(result.compression?.compressedSize || 0)}`,
			);
		} catch (error: any) {
			console.error("Avatar upload error:", error);
			toast.error(error.message || "Gagal upload avatar");

			// Reset on error
			setAvatarPreview("");
			setForm((prev) => ({ ...prev, avatarUrl: "" }));
			if (previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
		} finally {
			setIsUploadingAvatar(false);
			URL.revokeObjectURL(avatarPreview);
		}
	};

	const handleAvatarClick = () => {
		fileInputRef.current?.click();
	};

	const handleRemoveAvatar = () => {
		// Clean up preview URL if it's a blob URL
		if (avatarPreview && avatarPreview.startsWith("blob:")) {
			URL.revokeObjectURL(avatarPreview);
		}

		setAvatarPreview("");
		setForm((prev) => ({ ...prev, avatarUrl: "" }));
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	// AI Auto-fill handlers (only for create mode)
	const handleAiParse = () => {
		if (!aiInput.trim()) {
			toast.error("Silakan masukkan deskripsi karakter terlebih dahulu");
			return;
		}

		parseUserInputMutation.mutate({
			userInput: aiInput.trim(),
		});
	};

	const handleOpenAiDialog = () => {
		setIsAiDialogOpen(true);
		setAiInput("");
	};

	// Show loading state for edit mode
	if (mode === "edit" && isLoading) {
		return (
			<div className="w-full max-w-sm mx-auto px-2 py-6 sm:max-w-2xl sm:px-4 lg:max-w-5xl lg:py-8 overflow-x-hidden">
				<div className="mb-6 lg:mb-8">
					<div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center">
						<Skeleton className="h-10 w-24" />
						<div>
							<Skeleton className="mb-2 h-8 w-48" />
							<Skeleton className="h-5 w-64" />
						</div>
					</div>
				</div>

				<div className="space-y-6">
					{[1, 2, 3, 4, 5].map((i) => (
						<Card key={i}>
							<CardHeader>
								<Skeleton className="h-6 w-40" />
								<Skeleton className="h-4 w-full" />
							</CardHeader>
							<CardContent className="space-y-6">
								{[1, 2, 3].map((j) => (
									<div key={j} className="space-y-2">
										<Skeleton className="h-4 w-32" />
										<Skeleton className="h-10 w-full" />
									</div>
								))}
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		);
	}

	// Show error state for edit mode if character not found
	if (mode === "edit" && !character && !isLoading) {
		return (
			<div className="w-full max-w-sm mx-auto px-2 py-6 sm:max-w-2xl sm:px-4 lg:max-w-5xl lg:py-8 overflow-x-hidden">
				<Card className="py-12 text-center">
					<CardContent>
						<h2 className="mb-2 font-semibold text-xl">
							Karakter Tidak Ditemukan
						</h2>
						<p className="mb-4 text-muted-foreground">
							Karakter yang Anda cari tidak ditemukan atau Anda tidak memiliki
							akses.
						</p>
						<Link href="/">
							<Button>Kembali ke Daftar Karakter</Button>
						</Link>
					</CardContent>
				</Card>
			</div>
		);
	}

	const isSubmitting =
		mode === "create"
			? createCharacterMutation.isPending
			: updateCharacterMutation.isPending;

	return (
		<div className="w-full max-w-sm mx-auto px-2 py-6 sm:max-w-2xl sm:px-4 lg:max-w-5xl lg:py-8 overflow-x-hidden">
			<div className="mb-6 lg:mb-8">
				<div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center">
					<div>
						<h1 className="flex items-center gap-2 font-bold font-sans text-xl sm:text-2xl lg:text-3xl">
							<span>{mode === "create" ? "✨" : "📝"}</span>
							<span className="break-words">{mode === "create" ? "Bikin Karakter Baru" : "Edit Karakter"}</span>
						</h1>
						<p className="text-muted-foreground text-xs sm:text-sm lg:text-base">
							{mode === "create"
								? "Bikin karakter imajiner dengan kepribadian dan cerita yang seru"
								: `Perbarui informasi karakter "${character?.name || ""}"`}
						</p>
					</div>
				</div>
			</div>

			<div className="space-y-6 w-full overflow-hidden">
				{/* AI Auto-fill Section (only for create mode) */}
				{mode === "create" && (
					<Button
						onClick={handleOpenAiDialog}
						size="lg"
						className="h-12 w-full text-sm sm:text-base"
					>
						<span className="mr-3 text-lg">✨</span>
						<span className="truncate">Isi Form dengan AI</span>
					</Button>
				)}

				{/* Avatar Upload Section */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-base sm:text-lg">
							<span>🖼️</span>
							<span className="break-words">Avatar Karakter</span>
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex flex-col items-center space-y-4">
							{/* Avatar Circle */}
							<button
								type="button"
								className="group relative cursor-pointer rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
								onClick={handleAvatarClick}
								disabled={isUploadingAvatar}
								aria-label={
									avatarPreview
										? "Ganti avatar karakter"
										: "Upload avatar karakter"
								}
							>
								<div className="flex h-24 w-24 sm:h-32 sm:w-32 items-center justify-center overflow-hidden rounded-full border-4 border-muted-foreground/30 border-dashed bg-muted/20 transition-colors group-hover:border-primary/50">
									{isUploadingAvatar ? (
										<div className="text-center">
											<div className="mb-2 animate-spin text-3xl">⏳</div>
											<p className="font-medium text-muted-foreground text-xs">
												Uploading...
											</p>
										</div>
									) : avatarPreview ? (
										<div className="h-full w-full relative">
											{avatarPreview.startsWith("blob:") ? (
												// Use regular img tag for blob URLs to avoid Next.js Image issues
												<img
													src={avatarPreview}
													alt="Avatar preview"
													className="h-full w-full object-cover"
													onError={(e) => {
														console.error("Avatar blob image load error:", avatarPreview, e);
														// Hide the image and show fallback
														e.currentTarget.style.display = 'none';
														const fallback = e.currentTarget.nextElementSibling as HTMLElement;
														if (fallback) fallback.style.display = 'flex';
													}}
													onLoad={() => {}}
												/>
											) : (
												// Use Next.js Image for R2 URLs
												<Image
													src={avatarPreview}
													alt="Avatar preview"
													fill
													className="object-cover"
													onError={(e) => {
														console.error("Avatar R2 image load error:", avatarPreview, e);
														// Hide the image and show fallback
														e.currentTarget.style.display = 'none';
														const fallback = e.currentTarget.nextElementSibling as HTMLElement;
														if (fallback) fallback.style.display = 'flex';
													}}
													onLoad={() => {}}
													unoptimized={true}
												/>
											)}
											{/* Fallback when image fails to load */}
											<div className="absolute inset-0 h-full w-full bg-muted flex items-center justify-center" style={{ display: 'none' }}>
												<div className="text-center">
													<div className="mb-2 text-3xl">📷</div>
													<p className="font-medium text-muted-foreground text-xs">
														Preview Error
													</p>
												</div>
											</div>
										</div>
									) : (
										<div className="text-center">
											<div className="mb-2 text-3xl">📷</div>
											<p className="font-medium text-muted-foreground text-xs">
												Klik untuk upload
											</p>
										</div>
									)}
								</div>

								{/* Overlay on hover */}
								{avatarPreview && !isUploadingAvatar && (
									<div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
										<p className="font-medium text-white text-xs">Ganti foto</p>
									</div>
								)}
							</button>

							{/* Action Buttons */}
							<div className="flex gap-2">
								<Button
									variant="outline"
									size="sm"
									onClick={handleAvatarClick}
									disabled={isUploadingAvatar}
									className="font-medium"
								>
									{isUploadingAvatar ? (
										<>
											<span className="mr-2 animate-spin text-sm">⏳</span>
											Uploading...
										</>
									) : avatarPreview ? (
										"Ganti Avatar"
									) : (
										"Pilih Avatar"
									)}
								</Button>
								{avatarPreview && !isUploadingAvatar && (
									<Button
										variant="outline"
										size="sm"
										onClick={handleRemoveAvatar}
										className="font-medium text-destructive hover:text-destructive"
									>
										Hapus
									</Button>
								)}
							</div>

							{/* Hidden file input */}
							<input
								ref={fileInputRef}
								type="file"
								accept="image/*"
								onChange={handleAvatarChange}
								className="hidden"
							/>
						</div>
					</CardContent>
				</Card>

				{/* Basic Information */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-base sm:text-lg">
							<span>📝</span>
							<span className="break-words">Info Dasar</span>
						</CardTitle>
						<CardDescription>
							Info dasar tentang karakter kamu yang bakal dilihat sama user
							lain.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-6">
							{/* Name */}
							<div className="space-y-2">
								<Label htmlFor="name" className="font-medium text-xs sm:text-sm">
									Nama Karakter <span className="text-red-500">*</span>
								</Label>
								<Input
									id="name"
									value={form.name}
									onChange={(e) => handleInputChange("name", e.target.value)}
									placeholder="Contoh: Kirana Bulanasih"
									maxLength={50}
									className={`h-10 text-sm transition-colors ${errors.name ? "border-red-500 focus:border-red-500" : "focus:border-primary"}`}
								/>
								{errors.name && (
									<p className="flex items-center gap-1 text-red-500 text-sm">
										<span className="text-xs">⚠️</span> {errors.name}
									</p>
								)}
								<p className="text-muted-foreground text-xs">
									{form.name.length}/50 karakter
								</p>
							</div>

							{/* Synopsis */}
							<div className="space-y-2">
								<Label htmlFor="synopsis" className="font-medium text-sm">
									Ringkasan <span className="text-red-500">*</span>
								</Label>
								<textarea
									id="synopsis"
									value={form.synopsis}
									onChange={(e) =>
										handleInputChange("synopsis", e.target.value)
									}
									placeholder="Contoh: Kirana adalah penyihir muda yang menguasai sihir bulan dan bintang. Dia dikenal dengan kemampuan magisnya yang luar biasa dan kepribadian yang lembut namun penuh misteri."
									maxLength={300}
									rows={3}
									className={`w-full resize-none rounded-md border px-3 py-2 text-sm transition-colors ${
										errors.synopsis
											? "border-red-500 focus:border-red-500"
											: "border-border focus:border-primary"
									}`}
									style={{ minHeight: '80px' }}
								/>
								{errors.synopsis && (
									<p className="flex items-center gap-1 text-red-500 text-sm">
										<span className="text-xs">⚠️</span> {errors.synopsis}
									</p>
								)}
								<p className="text-muted-foreground text-xs">
									{form.synopsis.length}/300 karakter
								</p>
							</div>

							{/* Description */}
							<div className="space-y-2">
								<Label htmlFor="description">
									Deskripsi <span className="text-red-500">*</span>
								</Label>
								<textarea
									id="description"
									value={form.description}
									onChange={(e) =>
										handleInputChange("description", e.target.value)
									}
									placeholder="Contoh: Kirana punya kepribadian yang tenang, bijaksana, dan selalu siap membantu sesama penyihir. Dia sering jadi tempat curhat teman-temannya di akademi sihir karena kemampuannya yang empatik."
									maxLength={500}
									rows={4}
									className={`w-full resize-none rounded-md border px-3 py-2 ${
										errors.description ? "border-red-500" : "border-border"
									}`}
								/>
								{errors.description && (
									<p className="text-red-500 text-sm">{errors.description}</p>
								)}
								<p className="text-muted-foreground text-sm">
									{form.description.length}/500 karakter
								</p>
							</div>

							{/* Greetings */}
							<div className="space-y-2">
								<Label htmlFor="greetings">
									Sapaan <span className="text-red-500">*</span>
								</Label>
								<textarea
									id="greetings"
									value={form.greetings}
									onChange={(e) =>
										handleInputChange("greetings", e.target.value)
									}
									placeholder="Contoh: Selamat datang, traveler! Aku Kirana, penjaga perpustakaan sihir di menara bulan. ✨ Ada mantra atau ramuan yang ingin kamu pelajari hari ini?"
									maxLength={200}
									rows={3}
									className={`w-full resize-none rounded-md border px-3 py-2 ${
										errors.greetings ? "border-red-500" : "border-border"
									}`}
								/>
								{errors.greetings && (
									<p className="text-red-500 text-sm">{errors.greetings}</p>
								)}
								<p className="text-muted-foreground text-sm">
									{form.greetings.length}/200 karakter
								</p>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Default User Role */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<span>👤</span>
							Peran Kamu (Opsional)
						</CardTitle>
						<CardDescription>
							Setting buat peran dan identitas user waktu ngobrol sama karakter.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-6">
							{/* Default User Role Name */}
							<div className="space-y-2">
								<Label htmlFor="defaultUserRoleName">
									Nama Peran Kamu (Opsional)
								</Label>
								<Input
									id="defaultUserRoleName"
									value={form.defaultUserRoleName}
									onChange={(e) =>
										handleInputChange("defaultUserRoleName", e.target.value)
									}
									placeholder="Contoh: Apprentice, Traveler, Fellow Mage"
									maxLength={50}
									className={errors.defaultUserRoleName ? "border-red-500" : ""}
								/>
								{errors.defaultUserRoleName && (
									<p className="text-red-500 text-sm">
										{errors.defaultUserRoleName}
									</p>
								)}
								<p className="text-muted-foreground text-sm">
									{form.defaultUserRoleName.length}/50 karakter
								</p>
							</div>

							{/* Default User Role Details */}
							<div className="space-y-2">
								<Label htmlFor="defaultUserRoleDetails">
									Detail Peran Kamu (Opsional)
								</Label>
								<textarea
									id="defaultUserRoleDetails"
									value={form.defaultUserRoleDetails}
									onChange={(e) =>
										handleInputChange("defaultUserRoleDetails", e.target.value)
									}
									placeholder="Contoh: Seorang murid baru di akademi sihir yang haus akan pengetahuan. Sangat tertarik dengan sihir bulan dan sering mencari Kirana untuk belajar mantra-mantra kuno."
									maxLength={200}
									rows={3}
									className={`w-full resize-none rounded-md border px-3 py-2 ${
										errors.defaultUserRoleDetails
											? "border-red-500"
											: "border-border"
									}`}
								/>
								{errors.defaultUserRoleDetails && (
									<p className="text-red-500 text-sm">
										{errors.defaultUserRoleDetails}
									</p>
								)}
								<p className="text-muted-foreground text-sm">
									{form.defaultUserRoleDetails.length}/200 karakter
								</p>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Default Situation */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<span>🎬</span>
							Situasi (Opsional)
						</CardTitle>
						<CardDescription>
							Setting situasi dan konteks awal waktu mulai ngobrol sama
							karakter.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-6">
							{/* Default Situation Name */}
							<div className="space-y-2">
								<Label htmlFor="defaultSituationName">
									Nama Situasi (Opsional)
								</Label>
								<Input
									id="defaultSituationName"
									value={form.defaultSituationName}
									onChange={(e) =>
										handleInputChange("defaultSituationName", e.target.value)
									}
									placeholder="Contoh: Perpustakaan Sihir, Menara Bulan"
									maxLength={50}
									className={
										errors.defaultSituationName ? "border-red-500" : ""
									}
								/>
								{errors.defaultSituationName && (
									<p className="text-red-500 text-sm">
										{errors.defaultSituationName}
									</p>
								)}
								<p className="text-muted-foreground text-sm">
									{form.defaultSituationName.length}/50 karakter
								</p>
							</div>

							{/* Initial Situation Details */}
							<div className="space-y-2">
								<Label htmlFor="initialSituationDetails">
									Detail Situasi Awal (Opsional)
								</Label>
								<textarea
									id="initialSituationDetails"
									value={form.initialSituationDetails}
									onChange={(e) =>
										handleInputChange("initialSituationDetails", e.target.value)
									}
									placeholder="Contoh: {{user}} menemukan Kirana di perpustakaan sihir tengah malam saat dia sedang membaca gulungan mantra kuno di bawah sinar bulan purnama."
									maxLength={300}
									rows={3}
									className={`w-full resize-none rounded-md border px-3 py-2 ${
										errors.initialSituationDetails
											? "border-red-500"
											: "border-border"
									}`}
								/>
								{errors.initialSituationDetails && (
									<p className="text-red-500 text-sm">
										{errors.initialSituationDetails}
									</p>
								)}
								<p className="text-muted-foreground text-sm">
									{form.initialSituationDetails.length}/300 karakter
								</p>
							</div>
						</div>
					</CardContent>
				</Card>


				{/* Compliance Mode */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<span>🎭</span>
							Mode Kepatuhan Karakter
						</CardTitle>
						<CardDescription>
							Atur seberapa patuh karakter terhadap permintaan user saat roleplay.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-3">
							<Label htmlFor="complianceMode" className="font-medium text-sm">
								Mode Kepatuhan
							</Label>
							<Select
								value={form.complianceMode}
								onValueChange={(value) => handleInputChange("complianceMode", value)}
							>
								<SelectTrigger>
									<SelectValue placeholder="Pilih mode kepatuhan" />
								</SelectTrigger>
								<SelectContent className="w-full max-w-[calc(100vw-2rem)] sm:max-w-none">
									<SelectItem value="strict">
										<div className="flex flex-col text-left">
											<span className="font-medium">🚫 Mode Ketat</span>
											<span className="text-muted-foreground text-xs">
												Karakter punya batasan, bisa menolak permintaan
											</span>
										</div>
									</SelectItem>
									<SelectItem value="standard">
										<div className="flex flex-col text-left">
											<span className="font-medium">⚖️ Mode Standar</span>
											<span className="text-muted-foreground text-xs">
												Seimbang antara kepatuhan dan konsistensi karakter
											</span>
										</div>
									</SelectItem>
									<SelectItem value="obedient">
										<div className="flex flex-col text-left">
											<span className="font-medium">✅ Mode Patuh</span>
											<span className="text-muted-foreground text-xs">
												Karakter sangat patuh dan mengikuti semua permintaan
											</span>
										</div>
									</SelectItem>
								</SelectContent>
							</Select>

						</div>
					</CardContent>
				</Card>

				{/* Privacy Setting */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<span>🔒</span>
							Setting Privasi
						</CardTitle>
						<CardDescription>
							Tentuin visibilitas karakter kamu buat user lain di platform.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="flex items-center space-x-2">
							<Checkbox
								id="isPublic"
								checked={form.isPublic}
								onCheckedChange={(checked) =>
									handleInputChange("isPublic", !!checked)
								}
							/>
							<Label htmlFor="isPublic" className="cursor-pointer">
								Jadiin karakter ini publik
							</Label>
						</div>
					</CardContent>
				</Card>

				{/* Submit Button */}
				<div className="flex flex-col justify-end gap-4 border-border border-t-2 pt-8 sm:flex-row sm:gap-6">
					<Link href="/" className="w-full sm:w-auto">
						<Button
							variant="outline"
							type="button"
							size="lg"
							className="h-12 w-full px-4 font-medium text-sm transition-all duration-200 hover:bg-accent sm:w-auto sm:px-8 sm:text-base"
						>
							Batal
						</Button>
					</Link>
					<Button
						onClick={handleSubmit}
						disabled={isSubmitting}
						size="lg"
						className="h-12 w-full transform bg-primary px-4 font-semibold text-sm text-primary-foreground shadow-lg transition-all duration-200 hover:scale-105 hover:bg-primary/90 hover:shadow-xl sm:w-auto sm:px-8 sm:text-base"
					>
						{isSubmitting ? (
							<>
								<span className="mr-3 animate-spin text-lg">⏳</span>
								{mode === "create" ? "Lagi bikin..." : "Menyimpan..."}
							</>
						) : (
							<>
								<span className="mr-3 text-lg">
									{mode === "create" ? "🚀" : "💾"}
								</span>
								{mode === "create" ? "Bikin Karakter" : "Simpan Perubahan"}
							</>
						)}
					</Button>
				</div>
			</div>

			{/* AI Auto-fill Dialog (only for create mode) */}
			{mode === "create" && (
				<Dialog open={isAiDialogOpen} onOpenChange={setIsAiDialogOpen}>
					<DialogContent className="max-w-2xl">
						<DialogHeader>
							<DialogTitle className="flex items-center gap-2">
								<span>🤖</span>
								Buat Karakter Pake AI
							</DialogTitle>
							<DialogDescription>
								Tuliskan deskripsi karakter yang mau kamu buat.
							</DialogDescription>
						</DialogHeader>

						<div className="space-y-4">
							<div className="space-y-2">
								<textarea
									id="ai-input"
									value={aiInput}
									onChange={(e) => setAiInput(e.target.value)}
									placeholder="Contoh: Aku mau bikin karakter namanya Luna, seorang penyihir muda berusia 19 tahun yang tinggal di akademi sihir di pegunungan. Dia ahli dalam sihir elemen air dan punya kepribadian pemalu tapi penasaran. Latar belakangnya dia dari keluarga petani biasa, tapi punya bakat sihir yang luar biasa. Dia suka membaca buku kuno dan mengoleksi kristal. Untuk situasinya, kita ketemu pertama kali di perpustakaan akademi tengah malam saat dia lagi nyari buku rahasia. Hubungan kita sebagai sesama murid akademi yang jadi teman study partner. Dia sering gugup kalau ngomong sama orang baru, tapi kalau udah akrab bisa jadi cerewet dan suka berbagi pengetahuan sihir..."
									rows={8}
									className="w-full resize-none rounded-md border border-border px-3 py-2 focus:border-primary"
								/>
								<p className="text-muted-foreground text-xs">
									💡 Tip: Semakin detail deskripsi kamu, semakin akurat AI dalam
									mengisi form
								</p>
							</div>
						</div>

						<DialogFooter className="gap-2">
							<Button
								variant="outline"
								onClick={() => setIsAiDialogOpen(false)}
								disabled={parseUserInputMutation.isPending}
							>
								Batal
							</Button>
							<Button
								onClick={handleAiParse}
								disabled={parseUserInputMutation.isPending || !aiInput.trim()}
								className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
							>
								{parseUserInputMutation.isPending ? (
									<>
										<span className="mr-2 animate-spin text-sm">⏳</span>
										Sedang diproses...
									</>
								) : (
									<>
										<span className="mr-2">✨</span>
										Buat
									</>
								)}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			)}
		</div>
	);
}
