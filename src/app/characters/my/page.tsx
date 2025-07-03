"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import {
	Eye,
	EyeOff,
	Plus,
	Search,
	Settings,
	Trash2,
	User,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import SidebarLayout from "@/components/sidebar-layout";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/utils/trpc";

export default function MyCharactersPage() {
	const [searchTerm, setSearchTerm] = useState("");
	const {
		data: userCharacters,
		isLoading,
		refetch,
	} = useQuery(trpc.characters.getUserCharacters.queryOptions());

	const deleteCharacterMutation = useMutation({
		mutationFn: async (input: { id: number }) => {
			const serverUrl =
				process.env.NEXT_PUBLIC_SERVER_URL ||
				(typeof window !== "undefined"
					? window.location.origin
					: "http://localhost:3000");
			const response = await fetch(
				`${serverUrl}/trpc/characters.deleteCharacter`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					credentials: "include",
					body: JSON.stringify(input),
				},
			);
			if (!response.ok) throw new Error("Failed to delete character");
			return response.json();
		},
		onSuccess: () => {
			toast.success("Karakter berhasil dihapus");
			refetch();
		},
		onError: (error: { message?: string }) => {
			toast.error(error.message || "Gagal menghapus karakter");
		},
	});

	const filteredCharacters =
		userCharacters?.filter(
			(character: any) =>
				character.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
				character.description?.toLowerCase().includes(searchTerm.toLowerCase()),
		) || [];

	const handleDeleteCharacter = async (id: number, name: string) => {
		if (
			window.confirm(
				`Apakah Anda yakin ingin menghapus karakter "${name}"? Tindakan ini tidak dapat dibatalkan.`,
			)
		) {
			deleteCharacterMutation.mutate({ id });
		}
	};

	if (isLoading) {
		return (
			<SidebarLayout>
				<div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
					<div className="container mx-auto px-4 py-6 lg:py-8">
						<div className="mb-6 flex flex-col justify-between gap-4 lg:mb-8 lg:flex-row lg:items-center">
							<div className="flex items-center gap-4">
								<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 ring-1 ring-primary/20">
									<User className="h-6 w-6 text-primary" />
								</div>
								<div>
									<h1 className="font-bold text-2xl lg:text-3xl">Karakter Saya</h1>
									<p className="text-muted-foreground text-sm lg:text-base">
										Kelola karakter AI yang Anda buat
									</p>
								</div>
							</div>
							<Skeleton className="h-10 w-full lg:h-10 lg:w-32" />
						</div>

						<div className="mb-6">
							<Skeleton className="h-10 w-full max-w-sm" />
						</div>

						<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
							{[1, 2, 3].map((i) => (
								<Card
									key={i}
									className="border-primary/10 bg-card/50 backdrop-blur-sm"
								>
									<CardHeader>
										<Skeleton className="h-6 w-3/4" />
										<Skeleton className="h-4 w-full" />
									</CardHeader>
									<CardContent>
										<Skeleton className="h-20 w-full" />
										<div className="mt-4 flex justify-between">
											<Skeleton className="h-8 w-16" />
											<Skeleton className="h-8 w-16" />
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					</div>
				</div>
			</SidebarLayout>
		);
	}

	return (
		<SidebarLayout>
			<div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
				<div className="container mx-auto px-4 py-6 lg:py-8">
					<div className="mb-6 flex flex-col justify-between gap-4 lg:mb-8 lg:flex-row lg:items-center">
						<div className="flex items-center gap-4">
							<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 ring-1 ring-primary/20">
								<User className="h-6 w-6 text-primary" />
							</div>
							<div>
								<h1 className="font-bold text-2xl lg:text-3xl">
									Karakterku
								</h1>
								<p className="text-muted-foreground text-sm lg:text-base">
									Kelola karakter imajiner yang Anda buat ({filteredCharacters.length}{" "}
									karakter)
								</p>
							</div>
						</div>
						<Link href="/characters/create" className="w-full lg:w-auto">
							<Button
								size="lg"
								className="w-full bg-primary/90 shadow-lg hover:bg-primary lg:w-auto"
							>
								<Plus className="mr-2 h-5 w-5" />
								Buat Karakter
							</Button>
						</Link>
					</div>

					{/* Search Bar */}
					<div className="mb-6">
						<div className="relative w-full max-w-md">
							<Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-muted-foreground" />
							<Input
								placeholder="Cari karakter..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="w-full border-primary/20 bg-background/50 pl-10 backdrop-blur-sm focus:border-primary/40 focus:ring-primary/20"
							/>
						</div>
					</div>

					{/* Characters Grid */}
					{filteredCharacters.length === 0 ? (
						<div className="mx-auto max-w-md">
							<Card className="border-primary/20 border-dashed bg-card/50 backdrop-blur-sm">
								<CardContent className="py-12 text-center">
									<div className="mb-6 flex justify-center">
										<div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-muted/50">
											<User className="h-10 w-10 text-muted-foreground/50" />
										</div>
									</div>
									<h3 className="mb-2 font-semibold text-lg">
										{searchTerm ? "Tidak Ada Hasil" : "Belum Ada Karakter"}
									</h3>
									<p className="mb-6 text-muted-foreground">
										{searchTerm
											? `Tidak ada karakter yang cocok dengan pencarian "${searchTerm}"`
											: "Anda belum memiliki karakter. Buat karakter pertama Anda!"}
									</p>
									{!searchTerm && (
										<Link href="/characters/create">
											<Button
												size="lg"
												className="bg-primary/90 hover:bg-primary"
											>
												<Plus className="mr-2 h-5 w-5" />
												Buat Karakter Pertama
											</Button>
										</Link>
									)}
								</CardContent>
							</Card>
						</div>
					) : (
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
							{filteredCharacters.map((character: any) => (
								<Card
									key={character.id}
									className="group cursor-pointer border-primary/10 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-primary/20 hover:bg-card/80 hover:shadow-lg"
								>
									<div className="flex gap-4 px-6">
										{/* Avatar on the left */}
										<div className="flex-shrink-0">
											{character.avatarUrl ? (
												<img
													src={character.avatarUrl}
													alt={character.name}
													className="aspect-[2/3] w-20 rounded-lg object-cover ring-2 ring-background transition-all group-hover:ring-primary/20"
												/>
											) : (
												<div className="aspect-[2/3] w-20 flex items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 transition-all group-hover:from-primary/30 group-hover:to-primary/20">
													<span className="font-semibold text-2xl text-primary">
														{character.name.charAt(0).toUpperCase()}
													</span>
												</div>
											)}
										</div>

										{/* Content on the right */}
										<div className="min-w-0 flex-1">
											<div className="mb-3 flex items-start justify-between">
												<div className="flex-1 min-w-0">
													<CardTitle className="truncate text-base transition-colors group-hover:text-primary">
														{character.name}
													</CardTitle>
													<p className="truncate text-muted-foreground text-xs">
														Dibuat: {new Date(character.createdAt).toLocaleDateString("id-ID", {
															day: "numeric",
															month: "short",
															year: "numeric",
														})}
													</p>
												</div>
												<div className="ml-2 flex-shrink-0">
													{character.isPublic ? (
														<div className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-green-700 text-xs">
															<Eye className="h-3 w-3" />
															<span>Publik</span>
														</div>
													) : (
														<div className="flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-gray-600 text-xs">
															<EyeOff className="h-3 w-3" />
															<span>Privat</span>
														</div>
													)}
												</div>
											</div>

											<p className="mb-3 line-clamp-2 text-muted-foreground text-sm leading-relaxed">
												{character.synopsis || "Tidak ada synopsis"}
											</p>

											{/* Action buttons */}
											<div className="flex gap-1">
												<Link href={`/characters/edit/${character.id}`}>
													<Button
														variant="outline"
														size="sm"
														className="border-primary/20 bg-primary/5 px-2 py-1 text-primary text-xs hover:bg-primary/10"
														onClick={(e) => e.stopPropagation()}
													>
														<Settings className="mr-1 h-3 w-3" />
														Edit
													</Button>
												</Link>
												<Link href={`/chat/${character.id}`}>
													<Button
														size="sm"
														className="bg-primary/90 px-2 py-1 text-xs hover:bg-primary"
														onClick={(e) => e.stopPropagation()}
													>
														Chat
													</Button>
												</Link>
												<Button
													variant="destructive"
													size="sm"
													onClick={(e) => {
														e.stopPropagation();
														handleDeleteCharacter(character.id, character.name);
													}}
													disabled={deleteCharacterMutation.isPending}
													className="px-2 py-1 text-xs hover:bg-destructive/90"
												>
													<Trash2 className="h-3 w-3" />
												</Button>
											</div>
										</div>
									</div>
								</Card>
							))}
						</div>
					)}
				</div>
			</div>
		</SidebarLayout>
	);
}
