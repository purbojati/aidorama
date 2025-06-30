"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
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
import { useClientDate } from "@/hooks/use-client-date";

type ChatSession = {
	id: number;
	createdAt: string;
	updatedAt: string;
	title: string | null;
	character: {
		id: number;
		name: string;
		avatarUrl: string | null;
	} | null;
};

export default function ChatsPage() {
	const [searchTerm, setSearchTerm] = useState("");
	const queryClient = useQueryClient();
	const { formatDate } = useClientDate();
	const {
		data: chatSessions,
		isLoading,
		refetch,
	} = useQuery(trpc.chat.getUserSessions.queryOptions());
	const [deletedSessions, setDeletedSessions] = useState<number[]>([]);

	const deleteSessionMutation = useMutation({
		mutationFn: async (input: { sessionId: number }) => {
			const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
			const response = await fetch(
				`${serverUrl}/trpc/chat.deleteSession`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					credentials: "include",
					body: JSON.stringify(input),
				},
			);

			if (!response.ok) {
				const errorData = await response.json().catch(() => null);
				throw new Error(
					errorData?.error?.message || "Failed to delete session",
				);
			}

			return response.json();
		},
		onSuccess: (data, variables) => {
			console.log("Delete session success:", data);
			alert("Sesi chat berhasil dihapus");
			// Immediately remove from local state
			setDeletedSessions((prev) => [...prev, variables.sessionId]);
			// Invalidate all chat-related queries
			queryClient.invalidateQueries({ queryKey: ["chat"] });
			// Remove the cached query data completely and refetch
			queryClient.removeQueries({ queryKey: ["chat"] });
			refetch();
		},
		onError: (error: unknown) => {
			console.error("Delete session error:", error);
			alert(
				error instanceof Error ? error.message : "Gagal menghapus sesi chat",
			);
		},
	});

	const filteredSessions =
		(chatSessions?.filter(
			(session: ChatSession) =>
				!deletedSessions.includes(session.id) && session.character,
		) as ChatSession[]) || [];

	const handleDeleteSession = async (sessionId: number, title: string) => {
		if (
			window.confirm(
				`Apakah Anda yakin ingin menghapus sesi "${title}"? Tindakan ini tidak dapat dibatalkan.`,
			)
		) {
			deleteSessionMutation.mutate({ sessionId });
		}
	};

	if (isLoading) {
		return (
			<SidebarLayout>
				<div className="container mx-auto px-4 py-8">
					<div className="mb-8">
						<h1 className="font-bold text-3xl">Riwayat Chat</h1>
						<p className="text-muted-foreground">
							Kelola percakapan Anda dengan karakter AI
						</p>
					</div>

					<div className="mb-6">
						<Skeleton className="h-10 w-full max-w-sm" />
					</div>

					<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
						{[1, 2, 3].map((i) => (
							<Card key={i}>
								<CardHeader>
									<Skeleton className="h-6 w-3/4" />
									<Skeleton className="h-4 w-full" />
								</CardHeader>
								<CardContent>
									<Skeleton className="h-20 w-full" />
								</CardContent>
							</Card>
						))}
					</div>
				</div>
			</SidebarLayout>
		);
	}

	return (
		<SidebarLayout>
			<div className="container mx-auto px-4 py-8">
				<div className="mb-8">
					<h1 className="font-bold text-3xl">Riwayat Chat</h1>
					<p className="text-muted-foreground">
						Kelola percakapan Anda dengan karakter AI ({filteredSessions.length}{" "}
						sesi)
					</p>
				</div>

				{/* Search Bar */}
				<div className="mb-6">
					<div className="relative max-w-sm">
						<Input
							placeholder="Cari sesi chat..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
						/>
					</div>
				</div>

				{/* Sessions Grid */}
				{filteredSessions.length === 0 ? (
					<Card className="py-12 text-center">
						<CardContent>
							<div className="mb-4 text-muted-foreground">
								{searchTerm
									? `Tidak ada sesi chat yang cocok dengan pencarian "${searchTerm}"`
									: "Anda belum memiliki sesi chat. Mulai chat dengan karakter!"}
							</div>
							{!searchTerm && (
								<Link href="/characters">
									<Button>Jelajahi Karakter</Button>
								</Link>
							)}
						</CardContent>
					</Card>
				) : (
					<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
						{filteredSessions.map((session) => (
							<Card
								key={session.id}
								className="transition-shadow hover:shadow-lg"
							>
								<CardHeader>
									<div className="flex items-start justify-between">
										<div className="flex-1">
											<CardTitle className="line-clamp-1 text-lg">
												{session.title || "Chat Tanpa Judul"}
											</CardTitle>
											<CardDescription className="mt-1">
												dengan {session.character?.name || "Karakter"}
											</CardDescription>
										</div>
										{session.character?.avatarUrl && (
											<Image
												src={session.character.avatarUrl}
												alt={session.character?.name || "Character"}
												width={40}
												height={40}
												className="ml-2 h-10 w-10 rounded-full object-cover"
											/>
										)}
									</div>
								</CardHeader>
								<CardContent>
									<div className="mb-4 space-y-1 text-muted-foreground text-sm">
										<p>
											Dibuat:{" "}
											{formatDate(session.createdAt, {
												day: "numeric",
												month: "long",
												year: "numeric",
											})}
										</p>
										<p>
											Terakhir diperbarui:{" "}
											{formatDate(session.updatedAt, {
												day: "numeric",
												month: "long",
												year: "numeric",
												hour: "2-digit",
												minute: "2-digit",
											})}
										</p>
									</div>

									<div className="flex space-x-2">
										<Link
											href={`/chat/${session.character?.id}?sessionId=${session.id}`}
											className="flex-1"
										>
											<Button size="sm" className="w-full">
												Lanjutkan Chat
											</Button>
										</Link>
										<Button
											variant="destructive"
											size="sm"
											onClick={() =>
												handleDeleteSession(session.id, session.title || "Chat")
											}
											disabled={deleteSessionMutation.isPending}
										>
											Hapus
										</Button>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				)}
			</div>
		</SidebarLayout>
	);
}
