"use client";

import { useQuery } from "@tanstack/react-query";
import {
	Calendar,
	Hash,
	MapPin,
	MessageCircle,
	User,
	UserCircle,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/utils/trpc";
import { useClientDate } from "@/hooks/use-client-date";

interface CharacterDetailSheetProps {
	characterId: number | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function CharacterDetailSheet({
	characterId,
	open,
	onOpenChange,
}: CharacterDetailSheetProps) {
	const { formatDate } = useClientDate();
	const { data: character, isLoading } = useQuery({
		...trpc.characters.getCharacter.queryOptions({ id: characterId! }),
		enabled: !!characterId && open,
	});

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent side="right" className="w-full overflow-y-auto p-4 sm:max-w-lg sm:p-6">
				{isLoading ? (
					<div className="space-y-6">
						<SheetHeader>
							<div className="flex items-center space-x-4">
								<Skeleton className="h-16 w-16 rounded-full" />
								<div className="flex-1">
									<Skeleton className="mb-2 h-6 w-48" />
									<Skeleton className="h-4 w-64" />
								</div>
							</div>
						</SheetHeader>
						<div className="space-y-4">
							<Skeleton className="h-32 w-full" />
							<Skeleton className="h-24 w-full" />
						</div>
					</div>
				) : character ? (
					<div className="space-y-6">
						<SheetHeader>
							<div className="flex items-start space-x-4">
								{/* Avatar */}
								{character.avatarUrl ? (
									<div className="relative">
										<img
											src={character.avatarUrl}
											alt={character.name}
											className="h-16 w-16 flex-shrink-0 rounded-full object-cover ring-2 ring-primary/20"
										/>
										<div className="-bottom-1 -right-1 absolute h-4 w-4 rounded-full bg-green-500 ring-2 ring-background" />
									</div>
								) : (
									<div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/10 ring-2 ring-primary/20">
										<span className="font-semibold text-primary text-xl">
											{character.name.charAt(0).toUpperCase()}
										</span>
									</div>
								)}

								{/* Character Info */}
								<div className="min-w-0 flex-1">
									<SheetTitle className="mb-2 text-xl">
										{character.name}
									</SheetTitle>
									{character.synopsis && (
										<SheetDescription className="text-base">
											{character.synopsis}
										</SheetDescription>
									)}

									<div className="mt-3 flex items-center space-x-4 text-muted-foreground text-sm">
										<div className="flex items-center gap-1">
											<Calendar className="h-3 w-3" />
											<span>
												{formatDate(character.createdAt, {
													day: "numeric",
													month: "short",
													year: "numeric",
												})}
											</span>
										</div>
										{character.isPublic && (
											<span className="rounded-full bg-green-100 px-2 py-1 text-green-800 text-xs">
												Publik
											</span>
										)}
									</div>
								</div>
							</div>
						</SheetHeader>

						{/* Actions */}
						<div className="space-y-3">
							<Link href={`/chat/${character.id}`} className="block">
								<Button className="w-full" size="lg">
									<MessageCircle className="mr-2 h-4 w-4" />
									Mulai Chat
								</Button>
							</Link>
						</div>

						{/* Character Details */}
						<div className="space-y-4">
							{/* Character Tags */}
							{character.characterTags &&
								character.characterTags.length > 0 && (
									<Card>
										<CardHeader>
											<CardTitle className="flex items-center gap-2 text-base">
												<Hash className="h-4 w-4" />
												Tags
											</CardTitle>
										</CardHeader>
										<CardContent>
											<div className="flex flex-wrap gap-2">
												{character.characterTags.map(
													(tag: string, index: number) => (
														<Badge
															key={`${character.id}-tag-${index}`}
															variant="secondary"
															className="border-primary/20 bg-primary/10 text-primary text-xs"
														>
															{tag}
														</Badge>
													),
												)}
											</div>
										</CardContent>
									</Card>
								)}

							{/* Description */}
							{character.description && (
								<Card>
									<CardHeader>
										<CardTitle className="text-base">Deskripsi</CardTitle>
									</CardHeader>
									<CardContent>
										<p className="whitespace-pre-wrap text-sm leading-relaxed">
											{character.description}
										</p>
									</CardContent>
								</Card>
							)}

							{/* Greetings */}
							{character.greetings && (
								<Card>
									<CardHeader>
										<CardTitle className="text-base">Sapaan</CardTitle>
									</CardHeader>
									<CardContent>
										<div className="rounded-lg border-primary/30 border-l-4 bg-muted/50 p-3">
											<p className="whitespace-pre-wrap text-sm italic">
												"{character.greetings}"
											</p>
										</div>
									</CardContent>
								</Card>
							)}

							{/* Character History */}
							{character.characterHistory && (
								<Card>
									<CardHeader>
										<CardTitle className="text-base">
											Sejarah Karakter
										</CardTitle>
									</CardHeader>
									<CardContent>
										<p className="whitespace-pre-wrap text-sm leading-relaxed">
											{character.characterHistory}
										</p>
									</CardContent>
								</Card>
							)}

							{/* Personality */}
							{character.personality && (
								<Card>
									<CardHeader>
										<CardTitle className="text-base">Kepribadian</CardTitle>
									</CardHeader>
									<CardContent>
										<p className="whitespace-pre-wrap text-sm leading-relaxed">
											{character.personality}
										</p>
									</CardContent>
								</Card>
							)}

							{/* Backstory */}
							{character.backstory && (
								<Card>
									<CardHeader>
										<CardTitle className="text-base">Latar Belakang</CardTitle>
									</CardHeader>
									<CardContent>
										<p className="whitespace-pre-wrap text-sm leading-relaxed">
											{character.backstory}
										</p>
									</CardContent>
								</Card>
							)}

							{/* Default User Role */}
							{(character.defaultUserRoleName ||
								character.defaultUserRoleDetails) && (
								<Card>
									<CardHeader>
										<CardTitle className="flex items-center gap-2 text-base">
											<UserCircle className="h-4 w-4" />
											Role User Default
										</CardTitle>
									</CardHeader>
									<CardContent className="space-y-2">
										{character.defaultUserRoleName && (
											<div>
												<span className="text-muted-foreground text-sm">
													Nama Role:
												</span>
												<p className="font-medium text-sm">
													{character.defaultUserRoleName}
												</p>
											</div>
										)}
										{character.defaultUserRoleDetails && (
											<div>
												<span className="text-muted-foreground text-sm">
													Detail:
												</span>
												<p className="text-sm leading-relaxed">
													{character.defaultUserRoleDetails}
												</p>
											</div>
										)}
									</CardContent>
								</Card>
							)}

							{/* Default Situation */}
							{(character.defaultSituationName ||
								character.initialSituationDetails) && (
								<Card>
									<CardHeader>
										<CardTitle className="flex items-center gap-2 text-base">
											<MapPin className="h-4 w-4" />
											Situasi Default
										</CardTitle>
									</CardHeader>
									<CardContent className="space-y-2">
										{character.defaultSituationName && (
											<div>
												<span className="text-muted-foreground text-sm">
													Nama Situasi:
												</span>
												<p className="font-medium text-sm">
													{character.defaultSituationName}
												</p>
											</div>
										)}
										{character.initialSituationDetails && (
											<div>
												<span className="text-muted-foreground text-sm">
													Detail Situasi:
												</span>
												<p className="text-sm leading-relaxed">
													{character.initialSituationDetails}
												</p>
											</div>
										)}
									</CardContent>
								</Card>
							)}

							{/* Character Info */}
							<Card>
								<CardHeader>
									<CardTitle className="text-base">Informasi</CardTitle>
								</CardHeader>
								<CardContent className="space-y-3">
									<div className="flex justify-between text-sm">
										<span className="text-muted-foreground">Status:</span>
										<span
											className={
												character.isPublic ? "text-green-600" : "text-gray-600"
											}
										>
											{character.isPublic ? "Publik" : "Privat"}
										</span>
									</div>

									<div className="flex justify-between text-sm">
										<span className="text-muted-foreground">Dibuat:</span>
										<span>
											{formatDate(character.createdAt, {
												day: "numeric",
												month: "short",
												year: "numeric",
											})}
										</span>
									</div>

									<div className="flex justify-between text-sm">
										<span className="text-muted-foreground">Diperbarui:</span>
										<span>
											{formatDate(character.updatedAt, {
												day: "numeric",
												month: "short",
												year: "numeric",
											})}
										</span>
									</div>
								</CardContent>
							</Card>
						</div>
					</div>
				) : (
					<div className="flex h-full items-center justify-center">
						<div className="text-center">
							<h3 className="mb-2 font-semibold text-lg">
								Karakter Tidak Ditemukan
							</h3>
							<p className="text-muted-foreground text-sm">
								Karakter yang Anda cari tidak dapat ditemukan.
							</p>
						</div>
					</div>
				)}
			</SheetContent>
		</Sheet>
	);
}
