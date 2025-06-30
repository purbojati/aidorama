"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
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
import { MultiSelect } from "@/components/ui/multi-select";
import { Skeleton } from "@/components/ui/skeleton";
import {
	compressImage,
	formatFileSize,
	validateImageFile,
} from "@/lib/image-compression";
import { trpc } from "@/utils/trpc";

interface CharacterForm {
	name: string;
	synopsis: string;
	description: string;
	greetings: string;
	characterHistory: string;
	personality: string;
	backstory: string;
	avatarUrl: string;
	defaultUserRoleName: string;
	defaultUserRoleDetails: string;
	defaultSituationName: string;
	initialSituationDetails: string;
	characterTags: string[];
	isPublic: boolean;
}

interface CharacterFormComponentProps {
	mode: "create" | "edit";
	characterId?: number;
}

// Character tag options grouped by category
const CHARACTER_TAG_OPTIONS = [
	// Media Type
	{ value: "anime", label: "Anime", category: "Media Type" },
	{ value: "manga", label: "Manga", category: "Media Type" },
	{ value: "video-games", label: "Video Games", category: "Media Type" },
	{ value: "movies", label: "Movies", category: "Media Type" },
	{ value: "series", label: "Series", category: "Media Type" },
	{
		value: "western-cartoon",
		label: "Western Cartoon",
		category: "Media Type",
	},
	{
		value: "meme-characters",
		label: "Meme Characters",
		category: "Media Type",
	},
	{ value: "original", label: "Original", category: "Media Type" },

	// Role
	{ value: "actor", label: "Actor", category: "Role" },
	{ value: "singer", label: "Singer", category: "Role" },
	{ value: "idol", label: "Idol", category: "Role" },
	{ value: "sportsperson", label: "Sportsperson", category: "Role" },
	{ value: "businessperson", label: "Businessperson", category: "Role" },
	{ value: "politician", label: "Politician", category: "Role" },
	{
		value: "historical-figure",
		label: "Important People in History",
		category: "Role",
	},
	{ value: "youtuber", label: "YouTuber", category: "Role" },
	{ value: "streamer", label: "Streamer", category: "Role" },
	{ value: "influencer", label: "Influencer", category: "Role" },
	{ value: "mafia", label: "Mafia", category: "Role" },
	{ value: "teknisi", label: "Teknisi", category: "Role" },
	{ value: "doctor", label: "Doctor", category: "Role" },
	{ value: "teacher", label: "Teacher", category: "Role" },
	{ value: "artist", label: "Artist", category: "Role" },
	{ value: "chef", label: "Chef", category: "Role" },
	{ value: "pilot", label: "Pilot", category: "Role" },
	{ value: "musician", label: "Musician", category: "Role" },
	{ value: "ojek-online", label: "Ojek Online", category: "Role" },

	// Personality & Character Traits
	{ value: "romantic", label: "Romantic", category: "Personality" },
	{ value: "gentle", label: "Gentle", category: "Personality" },
	{ value: "funny", label: "Funny", category: "Personality" },
	{ value: "horror", label: "Horror", category: "Personality" },
	{ value: "thriller", label: "Thriller", category: "Personality" },
	{ value: "drama", label: "Drama", category: "Personality" },
	{ value: "mysterious", label: "Mysterious", category: "Personality" },
	{ value: "clever", label: "Clever", category: "Personality" },
	{ value: "shy", label: "Shy", category: "Personality" },
	{ value: "serious", label: "Serious", category: "Personality" },
	{ value: "cheerful", label: "Cheerful", category: "Personality" },
	{ value: "clumsy", label: "Clumsy", category: "Personality" },
	{ value: "enigma", label: "Enigma", category: "Personality" },
	{ value: "alpha", label: "Alpha", category: "Personality" },
	{ value: "beta", label: "Beta", category: "Personality" },
	{ value: "omega", label: "Omega", category: "Personality" },

	// Genre/Composition
	{ value: "adventure", label: "Adventure", category: "Genre" },
	{ value: "fantasy", label: "Fantasy", category: "Genre" },
	{ value: "action", label: "Action", category: "Genre" },
	{ value: "daily-life", label: "Daily Life", category: "Genre" },

	// Gender
	{ value: "sweetheart", label: "Sweetheart", category: "Gender" },
	{ value: "married", label: "Married", category: "Gender" },
	{ value: "male-and-female", label: "Male and Female", category: "Gender" },
	{ value: "male", label: "Male", category: "Gender" },
	{ value: "female", label: "Female", category: "Gender" },
	{ value: "femboy", label: "Femboy", category: "Gender" },

	// Relationship
	{ value: "friend", label: "Friend", category: "Relationship" },
	{ value: "roommate", label: "Roommate", category: "Relationship" },
	{ value: "close-friend", label: "Close Friend", category: "Relationship" },

	// Age Range
	{ value: "teenager", label: "Teenager", category: "Age Range" },
	{ value: "adult", label: "Adult", category: "Age Range" },

	// Supernatural Beings
	{ value: "devil", label: "Devil", category: "Supernatural" },
	{ value: "angel", label: "Angel", category: "Supernatural" },
	{ value: "spirit", label: "Spirit", category: "Supernatural" },
	{ value: "satan", label: "Satan", category: "Supernatural" },
	{ value: "witch", label: "Witch", category: "Supernatural" },
	{ value: "wizard", label: "Wizard", category: "Supernatural" },
	{ value: "elf", label: "Elf", category: "Supernatural" },
];

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
		characterHistory: "",
		personality: "",
		backstory: "",
		avatarUrl: "",
		defaultUserRoleName: "",
		defaultUserRoleDetails: "",
		defaultSituationName: "",
		initialSituationDetails: "",
		characterTags: [],
		isPublic: false,
	});
	const [avatarFile, setAvatarFile] = useState<File | null>(null);
	const [avatarPreview, setAvatarPreview] = useState<string>("");
	const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
	const [compressionStats, setCompressionStats] = useState<{
		clientCompression?: number;
		serverCompression?: number;
		originalSize?: number;
		finalSize?: number;
	} | null>(null);

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
				characterHistory: character.characterHistory || "",
				personality: character.personality || "",
				backstory: character.backstory || "",
				avatarUrl: character.avatarUrl || "",
				defaultUserRoleName: character.defaultUserRoleName || "",
				defaultUserRoleDetails: character.defaultUserRoleDetails || "",
				defaultSituationName: character.defaultSituationName || "",
				initialSituationDetails: character.initialSituationDetails || "",
				characterTags: character.characterTags || [],
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
			alert("Karakter udah jadi nih!");
			router.push(`/chat/${character.id}`);
		},
		onError: (error: any) => {
			alert(error.message || "Waduh, gagal bikin karakter");
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
			alert("Karakter berhasil diperbarui!");
			router.push("/");
		},
		onError: (error: any) => {
			alert(error.message || "Gagal memperbarui karakter");
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
			if (parsedData.characterHistory)
				newForm.characterHistory = parsedData.characterHistory;
			if (parsedData.personality) newForm.personality = parsedData.personality;
			if (parsedData.backstory) newForm.backstory = parsedData.backstory;
			if (parsedData.defaultUserRoleName)
				newForm.defaultUserRoleName = parsedData.defaultUserRoleName;
			if (parsedData.defaultUserRoleDetails)
				newForm.defaultUserRoleDetails = parsedData.defaultUserRoleDetails;
			if (parsedData.defaultSituationName)
				newForm.defaultSituationName = parsedData.defaultSituationName;
			if (parsedData.initialSituationDetails)
				newForm.initialSituationDetails = parsedData.initialSituationDetails;
			if (parsedData.characterTags && Array.isArray(parsedData.characterTags)) {
				newForm.characterTags = parsedData.characterTags;
			}
			if (typeof parsedData.isPublic === "boolean")
				newForm.isPublic = parsedData.isPublic;

			setForm(newForm);
			setIsAiDialogOpen(false);
			setAiInput("");
			alert("Berhasil mengisi form dengan AI! 🎉");
		},
		onError: (error: any) => {
			alert(error.message || "Gagal memproses input dengan AI");
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

		if (form.characterHistory.length > 800) {
			newErrors.characterHistory =
				"Sejarah karakter terlalu panjang, maksimal 800 karakter";
		}

		if (form.personality.length > 500) {
			newErrors.personality =
				"Kepribadian terlalu panjang, maksimal 500 karakter";
		}

		if (form.backstory.length > 800) {
			newErrors.backstory =
				"Latar belakang terlalu panjang, maksimal 800 karakter";
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
				"Nama role kepanjangan, maksimal 50 karakter";
		}

		if (form.defaultUserRoleDetails.length > 200) {
			newErrors.defaultUserRoleDetails =
				"Detail role kepanjangan, maksimal 200 karakter";
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
			characterHistory: form.characterHistory.trim() || undefined,
			personality: form.personality.trim() || undefined,
			backstory: form.backstory.trim() || undefined,
			avatarUrl: form.avatarUrl.trim() || undefined,
			defaultUserRoleName: form.defaultUserRoleName.trim() || undefined,
			defaultUserRoleDetails: form.defaultUserRoleDetails.trim() || undefined,
			defaultSituationName: form.defaultSituationName.trim() || undefined,
			initialSituationDetails: form.initialSituationDetails.trim() || undefined,
			characterTags: form.characterTags,
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
			alert(validation.error);
			return;
		}

		// Create initial preview
		const previewUrl = URL.createObjectURL(file);
		setAvatarPreview(previewUrl);
		setIsUploadingAvatar(true);
		setCompressionStats(null);

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

			// Update preview with compressed version
			URL.revokeObjectURL(previewUrl);
			const compressedPreviewUrl = URL.createObjectURL(clientCompressed.file);
			setAvatarPreview(compressedPreviewUrl);
			setAvatarFile(clientCompressed.file);

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

			// Clean up preview URL and use R2 URL
			URL.revokeObjectURL(compressedPreviewUrl);
			setAvatarPreview(result.url);

			// Store compression statistics
			setCompressionStats({
				clientCompression: clientCompressed.compressionRatio,
				serverCompression: result.compression?.compressionRatio || 0,
				originalSize: file.size,
				finalSize:
					result.compression?.compressedSize || clientCompressed.compressedSize,
			});

			console.log(
				`🌩️ Server compressed: ${formatFileSize(result.compression?.compressedSize || 0)} (${result.compression?.compressionRatio || 0}% reduction)`,
			);
			console.log(
				`📊 Total compression: ${formatFileSize(file.size)} → ${formatFileSize(result.compression?.compressedSize || 0)}`,
			);
		} catch (error: any) {
			console.error("Avatar upload error:", error);
			alert(error.message || "Gagal upload avatar");

			// Reset on error
			setAvatarFile(null);
			setAvatarPreview("");
			setForm((prev) => ({ ...prev, avatarUrl: "" }));
			setCompressionStats(null);
			if (previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
		} finally {
			setIsUploadingAvatar(false);
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

		setAvatarFile(null);
		setAvatarPreview("");
		setForm((prev) => ({ ...prev, avatarUrl: "" }));
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	// AI Auto-fill handlers (only for create mode)
	const handleAiParse = () => {
		if (!aiInput.trim()) {
			alert("Silakan masukkan deskripsi karakter terlebih dahulu");
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
			<div className="container mx-auto max-w-4xl px-4 py-6 lg:py-8">
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
			<div className="container mx-auto max-w-4xl px-4 py-6 lg:py-8">
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
		<div className="container mx-auto max-w-4xl px-4 py-6 lg:py-8">
			<div className="mb-6 lg:mb-8">
				<div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center">
					<div>
						<h1 className="flex items-center gap-2 font-bold font-sans text-2xl lg:text-3xl">
							<span>{mode === "create" ? "✨" : "📝"}</span>
							{mode === "create" ? "Bikin Karakter Baru" : "Edit Karakter"}
						</h1>
						<p className="text-muted-foreground text-sm lg:text-base">
							{mode === "create"
								? "Bikin karakter AI dengan kepribadian dan cerita yang seru"
								: `Perbarui informasi karakter "${character?.name || ""}"`}
						</p>
					</div>
				</div>
			</div>

			<div className="space-y-6">
				{/* AI Auto-fill Section (only for create mode) */}
				{mode === "create" && (
					<Button
						onClick={handleOpenAiDialog}
						size="lg"
						className="h-12 w-full"
					>
						<span className="mr-3 text-lg">✨</span>
						Isi Form dengan AI
					</Button>
				)}

				{/* Avatar Upload Section */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<span>🖼️</span>
							Avatar Karakter
						</CardTitle>
						<CardDescription>
							Upload gambar avatar untuk karakter kamu. File akan dikompresi
							otomatis untuk menghemat storage.
						</CardDescription>
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
								<div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-4 border-muted-foreground/30 border-dashed bg-muted/20 transition-colors group-hover:border-primary/50">
									{isUploadingAvatar ? (
										<div className="text-center">
											<div className="mb-2 animate-spin text-3xl">⏳</div>
											<p className="font-medium text-muted-foreground text-xs">
												Uploading...
											</p>
										</div>
									) : avatarPreview ? (
										<img
											src={avatarPreview}
											alt="Avatar preview"
											className="h-full w-full object-cover"
										/>
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
						<CardTitle className="flex items-center gap-2">
							<span>📝</span>
							Info Dasar
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
								<Label htmlFor="name" className="font-medium text-sm">
									Nama Karakter <span className="text-red-500">*</span>
								</Label>
								<Input
									id="name"
									value={form.name}
									onChange={(e) => handleInputChange("name", e.target.value)}
									placeholder="Contoh: Jisoo Kim"
									maxLength={50}
									className={`transition-colors ${errors.name ? "border-red-500 focus:border-red-500" : "focus:border-primary"}`}
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
									placeholder="Contoh: Jisoo adalah vokalis utama BLACKPINK yang terkenal dengan suara merdu dan kepribadian yang hangat."
									maxLength={300}
									rows={3}
									className={`w-full resize-none rounded-md border px-3 py-2 transition-colors ${
										errors.synopsis
											? "border-red-500 focus:border-red-500"
											: "border-border focus:border-primary"
									}`}
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
									placeholder="Contoh: Jisoo punya kepribadian yang ceria, perhatian, dan sayang banget sama teman-temannya. Dia sering jadi mood maker di grup."
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
									placeholder="Contoh: Annyeonghaseyo! Aku Jisoo dari BLACKPINK! 😊 Seneng banget bisa ketemu kamu hari ini."
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

				{/* Character Details */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<span>🎭</span>
							Detail Karakter
						</CardTitle>
						<CardDescription>
							Info lebih dalam tentang kepribadian dan cerita karakter kamu.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-6">
							{/* Character History */}
							<div className="space-y-2">
								<Label htmlFor="characterHistory">
									Sejarah Karakter (Opsional)
								</Label>
								<textarea
									id="characterHistory"
									value={form.characterHistory}
									onChange={(e) =>
										handleInputChange("characterHistory", e.target.value)
									}
									placeholder="Contoh: Jisoo gabung sama YG Entertainment tahun 2011 sebagai trainee. Setelah 5 tahun training, dia debut jadi vokalis utama BLACKPINK bulan Agustus 2016."
									maxLength={800}
									rows={4}
									className={`w-full resize-none rounded-md border px-3 py-2 ${
										errors.characterHistory ? "border-red-500" : "border-border"
									}`}
								/>
								{errors.characterHistory && (
									<p className="text-red-500 text-sm">
										{errors.characterHistory}
									</p>
								)}
								<p className="text-muted-foreground text-sm">
									{form.characterHistory.length}/800 karakter
								</p>
							</div>

							{/* Personality */}
							<div className="space-y-2">
								<Label htmlFor="personality">Kepribadian (Opsional)</Label>
								<textarea
									id="personality"
									value={form.personality}
									onChange={(e) =>
										handleInputChange("personality", e.target.value)
									}
									placeholder="Contoh: Jisoo punya kepribadian yang hangat dan gampang akrab. Dia suka ngomong dengan nada yang lembut tapi ekspresif."
									maxLength={500}
									rows={4}
									className={`w-full resize-none rounded-md border px-3 py-2 ${
										errors.personality ? "border-red-500" : "border-border"
									}`}
								/>
								{errors.personality && (
									<p className="text-red-500 text-sm">{errors.personality}</p>
								)}
								<p className="text-muted-foreground text-sm">
									{form.personality.length}/500 karakter
								</p>
							</div>

							{/* Backstory */}
							<div className="space-y-2">
								<Label htmlFor="backstory">Latar Belakang (Opsional)</Label>
								<textarea
									id="backstory"
									value={form.backstory}
									onChange={(e) =>
										handleInputChange("backstory", e.target.value)
									}
									placeholder="Contoh: Jisoo lahir di Seoul, Korea Selatan, dalam keluarga yang support banget mimpinya jadi artis. Dari kecil dia udah suka musik dan sering ikut kompetisi."
									maxLength={800}
									rows={5}
									className={`w-full resize-none rounded-md border px-3 py-2 ${
										errors.backstory ? "border-red-500" : "border-border"
									}`}
								/>
								{errors.backstory && (
									<p className="text-red-500 text-sm">{errors.backstory}</p>
								)}
								<p className="text-muted-foreground text-sm">
									{form.backstory.length}/800 karakter
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
							Role User Default (Opsional)
						</CardTitle>
						<CardDescription>
							Setting default buat role dan identitas user waktu ngobrol sama
							karakter.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-6">
							{/* Default User Role Name */}
							<div className="space-y-2">
								<Label htmlFor="defaultUserRoleName">
									Nama Role User Default
								</Label>
								<Input
									id="defaultUserRoleName"
									value={form.defaultUserRoleName}
									onChange={(e) =>
										handleInputChange("defaultUserRoleName", e.target.value)
									}
									placeholder="Contoh: BLINK, Fan, Temen Deket"
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
									Detail Role User Default
								</Label>
								<textarea
									id="defaultUserRoleDetails"
									value={form.defaultUserRoleDetails}
									onChange={(e) =>
										handleInputChange("defaultUserRoleDetails", e.target.value)
									}
									placeholder="Contoh: Seorang BLINK yang setia dan support BLACKPINK dari debut. Ngefans banget sama Jisoo dan sering ngikutin update terbaru."
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
							Situasi Default (Opsional)
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
									Nama Situasi Default
								</Label>
								<Input
									id="defaultSituationName"
									value={form.defaultSituationName}
									onChange={(e) =>
										handleInputChange("defaultSituationName", e.target.value)
									}
									placeholder="Contoh: Backstage Konser, Cafe di Seoul"
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
									Detail Situasi Awal
								</Label>
								<textarea
									id="initialSituationDetails"
									value={form.initialSituationDetails}
									onChange={(e) =>
										handleInputChange("initialSituationDetails", e.target.value)
									}
									placeholder="Contoh: {{user}} ketemu sama Jisoo di backstage setelah konser BLACKPINK selesai. Jisoo lagi istirahat dan keliatan seneng."
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

				{/* Character Tags */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<span>🏷️</span>
							Tag Karakter <span className="text-red-500">*</span>
						</CardTitle>
						<CardDescription>
							Pilih tag yang cocok sama karakter kamu buat bantu kategorisasi
							dan pencarian.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-3">
							<Label className="font-medium text-sm">Tags</Label>
							<MultiSelect
								options={CHARACTER_TAG_OPTIONS}
								selected={form.characterTags}
								onChange={(tags) => handleInputChange("characterTags", tags)}
								placeholder="Pilih tags yang cocok sama karakter kamu..."
								searchPlaceholder="Cari tags (contoh: idol, female, kpop)..."
								className="w-full"
							/>
							<div className="flex items-start gap-2">
								<span className="text-xs">💡</span>
								<p className="text-muted-foreground text-xs">
									Pilih satu atau lebih tag yang menggambarin karakter kamu.
									Tags bantu user lain nemuin karakter kamu dengan gampang.
								</p>
							</div>
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
								Jadiin karakter ini publik (orang lain bisa liat dan pake)
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
							className="h-12 w-full px-8 font-medium text-base transition-all duration-200 hover:bg-accent sm:w-auto"
						>
							Batal
						</Button>
					</Link>
					<Button
						onClick={handleSubmit}
						disabled={isSubmitting}
						size="lg"
						className="h-12 w-full transform bg-primary px-8 font-semibold text-base text-primary-foreground shadow-lg transition-all duration-200 hover:scale-105 hover:bg-primary/90 hover:shadow-xl sm:w-auto"
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
								Auto-Fill Form dengan AI
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
									placeholder="Contoh: Aku mau bikin karakter namanya Jisoo dari BLACKPINK. Dia vokalis utama yang punya suara merdu dan kepribadian hangat. Lahir di Korea Selatan, suka musik dan akting. Orangnya ceria, care sama teman-teman, jadi mood maker di grup. Suka bikin dad jokes dan punya selera humor unik..."
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
										Isi Form
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
