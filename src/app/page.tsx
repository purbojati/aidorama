"use client";

import { useQuery } from "@tanstack/react-query";
import { Plus, Search, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CharacterDetailSheet } from "@/components/character-detail-sheet";
import SidebarLayout from "@/components/sidebar-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { authClient } from "@/lib/auth-client";
import { trpc } from "@/utils/trpc";

export default function PublicCharactersPage() {
	const router = useRouter();
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedCharacterId, setSelectedCharacterId] = useState<number | null>(
		null,
	);
	const [isSheetOpen, setIsSheetOpen] = useState(false);
	const { data: session } = authClient.useSession();

	const handleViewDetails = (characterId: number) => {
		setSelectedCharacterId(characterId);
		setIsSheetOpen(true);
	};

	const handleCreateCharacter = () => {
		if (!session) {
			router.push("/login");
		} else {
			router.push("/characters/create");
		}
	};

	// Fetch public characters
	const { data: publicCharacters, isLoading: charactersLoading } = useQuery(
		trpc.characters.getPublicCharacters.queryOptions({
			search: searchTerm,
			limit: 12,
			offset: 0,
		}),
	);

	const filteredCharacters = publicCharacters || [];

	return (
		<SidebarLayout requireAuth={false}>
			<div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
				<div className="overflow-auto p-4 lg:p-6">
					<div className="mx-auto max-w-7xl">
						{/* Header */}
						<div className="mb-6 text-center lg:mb-8">
							{/* <div className="mb-4 flex justify-center">
								<div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 ring-1 ring-primary/20 lg:h-16 lg:w-16">
									<Sparkles className="h-6 w-6 text-primary lg:h-8 lg:w-8" />
								</div>
							</div> */}
							<h1 className="mb-3 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text font-bold font-sans text-xl lg:text-2xl">
								Jelajahi Karakter Imajiner
							</h1>
							<p className="mx-auto max-w-2xl px-4 text-muted-foreground text-sm">
								Temukan dan berinteraksi dengan karakter imajiner yang seru dibuat oleh pengguna lain.
							</p>
						</div>

						{/* Search and Actions */}
						<div className="mb-6 flex flex-col items-center justify-between gap-4 sm:flex-row lg:mb-8">
							<div className="relative w-full sm:w-auto sm:max-w-md">
								<Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
								<Input
									placeholder="Cari karakter..."
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									className="w-full border-primary/20 bg-background/50 pl-10 backdrop-blur-sm focus:border-primary/40 focus:ring-primary/20 sm:w-80"
								/>
							</div>
						</div>

						{/* Characters Grid */}
						{charactersLoading ? (
							<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
								{[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
									<Card
										key={i}
										className="border-primary/10 bg-card/50 backdrop-blur-sm"
									>
										<div className="flex gap-4 p-6">
											{/* Avatar skeleton */}
											<div className="flex-shrink-0">
												<div className="aspect-[2/3] w-20 animate-pulse rounded-lg bg-muted" />
											</div>

											{/* Content skeleton */}
											<div className="min-w-0 flex-1">
												<div className="mb-3">
													<div className="mb-2 h-5 animate-pulse rounded bg-muted" />
													<div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
												</div>
												<div className="mb-3 h-16 animate-pulse rounded bg-muted" />
												<div className="flex gap-1">
													<div className="h-6 w-16 animate-pulse rounded-full bg-muted" />
													<div className="h-6 w-12 animate-pulse rounded-full bg-muted" />
													<div className="h-6 w-14 animate-pulse rounded-full bg-muted" />
												</div>
											</div>
										</div>
									</Card>
								))}
							</div>
						) : filteredCharacters.length === 0 ? (
							<div className="py-12 text-center lg:py-20">
								<div className="mx-auto mb-6 max-w-md">
									<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-muted to-muted/50 lg:h-20 lg:w-20">
										<Search className="h-8 w-8 text-muted-foreground lg:h-10 lg:w-10" />
									</div>
									<h3 className="mb-2 font-semibold text-lg lg:text-xl">
										{searchTerm
											? "Karakter Tidak Ditemukan"
											: "Belum Ada Karakter"}
									</h3>
									<p className="px-4 text-muted-foreground text-sm">
										{searchTerm
											? `Tidak ada karakter yang cocok dengan "${searchTerm}". Coba kata kunci lain.`
											: "Belum ada karakter yang tersedia. Jadilah yang pertama membuat karakter!"}
									</p>
								</div>
								{!searchTerm && (
									<Button
										size="lg"
										className="bg-primary/90 shadow-lg hover:bg-primary"
										onClick={handleCreateCharacter}
									>
										<Sparkles className="mr-2 h-5 w-5" />
										Buat Karakter Pertama
									</Button>
								)}
							</div>
						) : (
							<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
								{filteredCharacters.map((character: any) => (
									<Card
										key={character.id}
										className="group cursor-pointer border-primary/10 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-primary/20 hover:bg-card/80 hover:shadow-lg"
										onClick={() => handleViewDetails(character.id)}
									>
										<div className="flex gap-4 px-4">
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
												<div className="mb-3">
													<CardTitle className="truncate text-base transition-colors group-hover:text-primary">
														{character.name}
													</CardTitle>
													<p className="truncate text-muted-foreground text-xs">
														by{" "}
														{character.user?.displayName ||
															character.user?.name ||
															character.user?.username ||
															"Unknown"}
													</p>
												</div>

												<p className="mb-3 line-clamp-3 text-muted-foreground text-sm leading-relaxed">
													{character.synopsis ||
														"Karakter AI yang menarik untuk diajak berbicara"}
												</p>

												{/* Character Tags */}
												{character.characterTags &&
													character.characterTags.length > 0 && (
														<div className="flex flex-wrap gap-1">
															{character.characterTags
																.slice(0, 3)
																.map((tag: string, index: number) => (
																	<Badge
																		key={`${character.id}-${tag}-${index}`}
																		variant="secondary"
																		className="border-primary/20 bg-primary/10 px-2 py-1 text-primary text-xs hover:bg-primary/20"
																	>
																		{tag}
																	</Badge>
																))}
															{character.characterTags.length > 3 && (
																<Badge
																	variant="outline"
																	className="px-2 py-1 text-muted-foreground text-xs"
																>
																	+{character.characterTags.length - 3}
																</Badge>
															)}
														</div>
													)}
											</div>
										</div>
									</Card>
								))}
							</div>
						)}

						{/* Load More Section */}
						{filteredCharacters.length === 12 && (
							<div className="mt-8 text-center lg:mt-12">
								<Button
									variant="outline"
									size="lg"
									className="border-primary/20 bg-background/50 backdrop-blur-sm hover:bg-muted/50"
									onClick={() => {
										// TODO: Implement pagination
									}}
								>
									Muat Lebih Banyak Karakter
								</Button>
							</div>
						)}
					</div>
				</div>
			</div>



			{/* Auth Overlay for unauthenticated users */}
			{!session && (
				<div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur-sm p-3 shadow-lg sm:p-4">
					<div className="mx-auto max-w-7xl">
						{/* Mobile: Stacked layout */}
						<div className="flex flex-col gap-3 sm:hidden">
							<div className="flex items-center gap-3">
								<img
									src="/aidorama-logo-trans.png"
									alt="AiDorama"
									className="h-6 w-6 object-contain dark:brightness-[0.8]"
								/>
								<div className="flex-1">
									<p className="font-semibold text-sm">Coba AiDorama GRATIS!</p>
									<p className="text-muted-foreground text-xs">
										Buat dan ngobrol dengan karakter imajinermu
									</p>
								</div>
							</div>
							<Button
								onClick={() => {
									authClient.signIn.social({
										provider: "google",
										callbackURL: "/",
									});
								}}
								className="w-full bg-primary hover:bg-primary/90 h-10"
								size="sm"
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
								Lanjutkan dengan Google
							</Button>
						</div>

						{/* Desktop: Horizontal layout */}
						<div className="hidden sm:flex items-center justify-between gap-4">
							<div className="flex items-center gap-3">
								<img
									src="/aidorama-logo-trans.png"
									alt="AiDorama"
									className="h-8 w-8 object-contain dark:brightness-[0.8]"
								/>
								<div>
									<p className="font-semibold text-sm">Bergabung dengan AiDorama</p>
									<p className="text-muted-foreground text-xs">
										Buat dan jelajahi karakter AI yang menarik
									</p>
								</div>
							</div>
							<Button
								onClick={() => {
									authClient.signIn.social({
										provider: "google",
										callbackURL: "/",
									});
								}}
								className="bg-primary hover:bg-primary/90"
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
								Lanjutkan dengan Google
							</Button>
						</div>
					</div>
				</div>
			)}

			<CharacterDetailSheet
				characterId={selectedCharacterId}
				open={isSheetOpen}
				onOpenChange={setIsSheetOpen}
			/>
		</SidebarLayout>
	);
}
