"use client";

import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import SidebarLayout from "@/components/sidebar-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useClientDate } from "@/hooks/use-client-date";
import { CHARACTER_TAG_OPTIONS } from "@/lib/character-tags";
import { trpc } from "@/utils/trpc";

// Helper function to get compliance mode display info
const getComplianceModeInfo = (mode: string) => {
	switch (mode) {
		case "strict":
			return { label: "Mode Ketat", icon: "🚫", description: "Karakter punya batasan, bisa menolak permintaan" };
		case "obedient":
			return { label: "Mode Patuh", icon: "✅", description: "Karakter sangat patuh dan mengikuti semua permintaan" };
		case "standard":
		default:
			return { label: "Mode Standar", icon: "⚖️", description: "Seimbang antara kepatuhan dan konsistensi karakter" };
	}
};

// Helper function to get character tags by category
const getTagsByCategory = (characterTags: string[]) => {
	const tagsByCategory: { [key: string]: string[] } = {};
	
	characterTags.forEach(tagValue => {
		const tagOption = CHARACTER_TAG_OPTIONS.find(option => option.value === tagValue);
		if (tagOption) {
			const category = tagOption.category;
			if (!tagsByCategory[category]) {
				tagsByCategory[category] = [];
			}
			tagsByCategory[category].push(tagOption.label);
		}
	});
	
	return tagsByCategory;
};

export default function CharacterDetailPage() {
	const params = useParams();
	const characterId = Number.parseInt(params.id as string);
	const { formatDate } = useClientDate();

	const { data: character, isLoading } = useQuery({
		...trpc.characters.getCharacter.queryOptions({ id: characterId }),
		enabled: !Number.isNaN(characterId),
	});

	if (isLoading) {
		return (
			<SidebarLayout>
				<div className="overflow-auto p-6">
					<div className="container mx-auto max-w-4xl">
						<div className="mb-8">
							<Skeleton className="mb-4 h-8 w-20" />
							<div className="flex items-center space-x-4">
								<Skeleton className="h-20 w-20 rounded-full" />
								<div className="flex-1">
									<Skeleton className="mb-2 h-8 w-64" />
									<Skeleton className="h-5 w-96" />
								</div>
							</div>
						</div>

						<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
							<div className="space-y-6 lg:col-span-2">
								<Card>
									<CardHeader>
										<Skeleton className="h-6 w-32" />
									</CardHeader>
									<CardContent>
										<Skeleton className="h-20 w-full" />
									</CardContent>
								</Card>
							</div>
							<div className="space-y-6">
								<Card>
									<CardHeader>
										<Skeleton className="h-6 w-24" />
									</CardHeader>
									<CardContent>
										<Skeleton className="h-10 w-full" />
									</CardContent>
								</Card>
							</div>
						</div>
					</div>
				</div>
			</SidebarLayout>
		);
	}

	if (!character) {
		return (
			<SidebarLayout>
				<div className="overflow-auto p-6">
					<div className="container mx-auto max-w-4xl">
						<Card className="py-12 text-center">
							<CardContent>
								<h2 className="mb-2 font-semibold text-xl">
									Karakter Tidak Ditemukan
								</h2>
								<p className="mb-4 text-muted-foreground">
									Karakter yang Anda cari tidak ditemukan atau tidak dapat
									diakses.
								</p>
								<Link href="/characters">
									<Button>Kembali ke Galeri Karakter</Button>
								</Link>
							</CardContent>
						</Card>
					</div>
				</div>
			</SidebarLayout>
		);
	}

	return (
		<SidebarLayout>
			<div className="overflow-auto p-6">
				<div className="container mx-auto max-w-4xl">
					{/* Header */}
					<div className="mb-8">
						<Link href="/characters">
							<Button variant="outline" size="sm" className="mb-4">
								← Kembali ke Galeri
							</Button>
						</Link>

						<div className="flex items-start space-x-6">
							{/* Avatar */}
							{character.avatarUrl ? (
								<Image
									src={character.avatarUrl}
									alt={character.name}
									width={80}
									height={80}
									className="h-20 w-20 flex-shrink-0 rounded-full object-cover"
								/>
							) : (
								<div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-full bg-muted">
									<span className="font-semibold text-2xl text-muted-foreground">
										{character.name.charAt(0).toUpperCase()}
									</span>
								</div>
							)}

							{/* Character Info */}
							<div className="flex-1">
								<h1 className="mb-2 font-bold text-3xl">{character.name}</h1>
								{character.synopsis && (
									<p className="mb-4 text-lg text-muted-foreground">
										{character.synopsis}
									</p>
								)}

								<div className="flex items-center space-x-4 text-muted-foreground text-sm">
									<span>
										Dibuat:{" "}
										{formatDate(character.createdAt, {
											day: "numeric",
											month: "long",
											year: "numeric",
										})}
									</span>
									{character.isPublic && (
										<span className="rounded-full bg-green-100 px-2 py-1 text-green-800 text-xs">
											Publik
										</span>
									)}
								</div>
							</div>
						</div>
					</div>

					{/* Content */}
					<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
						{/* Main Content */}
						<div className="space-y-6 lg:col-span-2">
							{/* Description */}
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<span>📝</span>
										Deskripsi
									</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="whitespace-pre-wrap text-muted-foreground">
										{character.description}
									</p>
								</CardContent>
							</Card>

							{/* Greetings */}
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<span>💬</span>
										Sapaan
									</CardTitle>
									<CardDescription>
										Pesan pembuka yang akan dikirim karakter saat memulai percakapan
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="rounded-lg bg-muted/50 p-4">
										<p className="whitespace-pre-wrap italic">
											"{character.greetings}"
										</p>
									</div>
								</CardContent>
							</Card>

							{/* Character History */}
							{character.characterHistory && (
								<Card>
									<CardHeader>
										<CardTitle className="flex items-center gap-2">
											<span>📚</span>
											Sejarah Karakter
										</CardTitle>
									</CardHeader>
									<CardContent>
										<p className="whitespace-pre-wrap">
											{character.characterHistory}
										</p>
									</CardContent>
								</Card>
							)}

							{/* Personality */}
							{character.personality && (
								<Card>
									<CardHeader>
										<CardTitle className="flex items-center gap-2">
											<span>🎭</span>
											Kepribadian
										</CardTitle>
									</CardHeader>
									<CardContent>
										<p className="whitespace-pre-wrap">
											{character.personality}
										</p>
									</CardContent>
								</Card>
							)}

							{/* Backstory */}
							{character.backstory && (
								<Card>
									<CardHeader>
										<CardTitle className="flex items-center gap-2">
											<span>📖</span>
											Latar Belakang
										</CardTitle>
									</CardHeader>
									<CardContent>
										<p className="whitespace-pre-wrap">{character.backstory}</p>
									</CardContent>
								</Card>
							)}

							{/* Default User Role */}
							{(character.defaultUserRoleName || character.defaultUserRoleDetails) && (
								<Card>
									<CardHeader>
										<CardTitle className="flex items-center gap-2">
											<span>👤</span>
											Peran User
										</CardTitle>
										<CardDescription>
											Peran dan identitas yang akan dimiliki user saat berinteraksi dengan karakter ini
										</CardDescription>
									</CardHeader>
									<CardContent className="space-y-3">
										{character.defaultUserRoleName && (
											<div>
												<h4 className="font-medium text-sm text-muted-foreground">Nama Peran:</h4>
												<p className="font-medium">{character.defaultUserRoleName}</p>
											</div>
										)}
										{character.defaultUserRoleDetails && (
											<div>
												<h4 className="font-medium text-sm text-muted-foreground">Detail Peran:</h4>
												<p className="whitespace-pre-wrap">{character.defaultUserRoleDetails}</p>
											</div>
										)}
									</CardContent>
								</Card>
							)}

							{/* Default Situation */}
							{(character.defaultSituationName || character.initialSituationDetails) && (
								<Card>
									<CardHeader>
										<CardTitle className="flex items-center gap-2">
											<span>🎬</span>
											Situasi Awal
										</CardTitle>
										<CardDescription>
											Konteks dan situasi awal saat memulai percakapan dengan karakter ini
										</CardDescription>
									</CardHeader>
									<CardContent className="space-y-3">
										{character.defaultSituationName && (
											<div>
												<h4 className="font-medium text-sm text-muted-foreground">Nama Situasi:</h4>
												<p className="font-medium">{character.defaultSituationName}</p>
											</div>
										)}
										{character.initialSituationDetails && (
											<div>
												<h4 className="font-medium text-sm text-muted-foreground">Detail Situasi:</h4>
												<p className="whitespace-pre-wrap">{character.initialSituationDetails}</p>
											</div>
										)}
									</CardContent>
								</Card>
							)}
						</div>

						{/* Sidebar */}
						<div className="space-y-6">
							{/* Actions */}
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<span>⚡</span>
										Aksi
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-3">
									<Link href={`/chat/${character.id}`} className="block">
										<Button className="w-full" size="lg">
											💬 Mulai Percakapan
										</Button>
									</Link>

									{character.isPublic && (
										<p className="text-center text-muted-foreground text-sm">
											Karakter ini dapat digunakan oleh semua orang
										</p>
									)}
								</CardContent>
							</Card>

							{/* Character Tags */}
							{character.characterTags && character.characterTags.length > 0 && (
								<Card>
									<CardHeader>
										<CardTitle className="flex items-center gap-2">
											<span>🏷️</span>
											Label Karakter
										</CardTitle>
									</CardHeader>
									<CardContent>
										<div className="space-y-3">
											{Object.entries(getTagsByCategory(character.characterTags)).map(([category, tags]) => (
												<div key={category}>
													<h4 className="font-medium text-sm text-muted-foreground mb-2">{category}:</h4>
													<div className="flex flex-wrap gap-1">
														{tags.map((tag) => (
															<Badge key={tag} variant="secondary" className="text-xs">
																{tag}
															</Badge>
														))}
													</div>
												</div>
											))}
										</div>
									</CardContent>
								</Card>
							)}

							{/* Compliance Mode */}
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<span>🎭</span>
										Mode Kepatuhan
									</CardTitle>
								</CardHeader>
								<CardContent>
									{(() => {
										const modeInfo = getComplianceModeInfo(character.complianceMode);
										return (
											<div className="space-y-2">
												<div className="flex items-center gap-2">
													<span className="text-lg">{modeInfo.icon}</span>
													<span className="font-medium">{modeInfo.label}</span>
												</div>
												<p className="text-muted-foreground text-sm">{modeInfo.description}</p>
											</div>
										);
									})()}
								</CardContent>
							</Card>

							{/* Character Stats */}
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<span>📊</span>
										Informasi
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-3">
									<div className="flex justify-between">
										<span className="text-muted-foreground">Status:</span>
										<span
											className={
												character.isPublic ? "text-green-600" : "text-gray-600"
											}
										>
											{character.isPublic ? "Publik" : "Privat"}
										</span>
									</div>

									<div className="flex justify-between">
										<span className="text-muted-foreground">Dibuat:</span>
										<span>{formatDate(character.createdAt)}</span>
									</div>

									<div className="flex justify-between">
										<span className="text-muted-foreground">Diperbarui:</span>
										<span>{formatDate(character.updatedAt)}</span>
									</div>
								</CardContent>
							</Card>
						</div>
					</div>
				</div>
			</div>
		</SidebarLayout>
	);
}
