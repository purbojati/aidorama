"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	ArrowLeft,
	ChevronRight,
	Clock,
	LogOut,
	Menu,
	MessageCircle,
	Plus,
	Settings,
	Sparkles,
	User,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
	Sheet,
	SheetContent,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { useClientDate } from "@/hooks/use-client-date";
import { authClient } from "@/lib/auth-client";
import { trpc } from "@/utils/trpc";

interface Message {
	id: number;
	content: string;
	role: "user" | "assistant";
	createdAt: string;
}

// Sidebar content for mobile menu
function MobileSidebarContent({
	session,
	chatSessions,
	sessionsLoading,
	onLinkClick,
}: {
	session: any;
	chatSessions: any[];
	sessionsLoading: boolean;
	onLinkClick?: () => void;
}) {
	const router = useRouter();
	const recentSessions = chatSessions?.slice(0, 4) || [];

	return (
		<div className="flex h-full flex-col">
			{/* Header */}
			<div className="border-b bg-gradient-to-r from-primary/5 to-primary/10 p-6">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg">
							<Sparkles className="h-6 w-6 text-primary-foreground" />
						</div>
						<div>
							<h1 className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text font-bold text-transparent text-xl">
								AiDorama
							</h1>
							<p className="font-medium text-muted-foreground text-xs">
								Platform Karakter AI
							</p>
						</div>
					</div>
					<ModeToggle />
				</div>
			</div>

			<div className="flex-1 overflow-hidden p-6">
				{/* Quick Actions */}
				<div className="mb-8">
					<div className="mb-4 flex items-center gap-2">
						<h3 className="font-semibold text-sm">Aksi Cepat</h3>
						<div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
					</div>
					<div className="grid grid-cols-2 gap-2">
						<Link href="/characters/create" onClick={onLinkClick}>
							<Button
								variant="outline"
								size="sm"
								className="w-full justify-start bg-background/50 font-medium hover:bg-muted/50"
							>
								<Plus className="mr-2 h-4 w-4" />
								Buat Karakter
							</Button>
						</Link>
						<Link href="/" onClick={onLinkClick}>
							<Button
								variant="outline"
								size="sm"
								className="w-full justify-start bg-background/50 font-medium hover:bg-muted/50"
							>
								<Sparkles className="mr-2 h-4 w-4" />
								Jelajahi
							</Button>
						</Link>
					</div>
				</div>

				{/* Recent Chat History */}
				<div className="flex-1">
					<div className="mb-4 flex items-center justify-between">
						<div className="flex items-center gap-2">
							<Clock className="h-4 w-4 text-muted-foreground" />
							<h3 className="font-semibold text-sm">Chat Terbaru</h3>
						</div>
						<Link href="/chats" onClick={onLinkClick}>
							<Button
								variant="ghost"
								size="sm"
								className="font-medium text-xs hover:bg-muted/50"
							>
								Lihat Semua
							</Button>
						</Link>
					</div>

					{sessionsLoading ? (
						<div className="space-y-3">
							{[1, 2, 3].map((i) => (
								<div
									key={i}
									className="flex items-center gap-3 rounded-lg border bg-background/50 p-3"
								>
									<Skeleton className="h-10 w-10 rounded-full" />
									<div className="flex-1">
										<Skeleton className="mb-2 h-4 w-full" />
										<Skeleton className="h-3 w-2/3" />
									</div>
								</div>
							))}
						</div>
					) : recentSessions.length === 0 ? (
						<div className="rounded-xl border border-dashed bg-muted/20 py-8 text-center">
							<MessageCircle className="mx-auto mb-3 h-8 w-8 text-muted-foreground/50" />
							<p className="mb-3 font-medium text-muted-foreground text-sm">
								Belum ada chat
							</p>
							<Link href="/characters" onClick={onLinkClick}>
								<Button
									size="sm"
									className="bg-primary/90 font-medium hover:bg-primary"
								>
									<Sparkles className="mr-2 h-4 w-4" />
									Mulai Chat
								</Button>
							</Link>
						</div>
					) : (
						<div className="space-y-2">
							{recentSessions.map((session: any) => (
								<Link
									key={session.id}
									href={`/chat/${session.character?.id}?sessionId=${session.id}`}
									className="block"
									onClick={onLinkClick}
								>
									<div className="group flex items-center gap-3 rounded-lg border bg-background/50 p-3 transition-all hover:bg-muted/50 hover:shadow-sm">
										{session.character?.avatarUrl ? (
											<img
												src={session.character.avatarUrl}
												alt={session.character.name}
												className="h-10 w-10 rounded-full object-cover ring-2 ring-background"
											/>
										) : (
											<div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/10">
												<span className="font-semibold text-primary text-sm">
													{session.character?.name?.charAt(0)?.toUpperCase() ||
														"?"}
												</span>
											</div>
										)}
										<div className="min-w-0 flex-1">
											<p className="truncate font-medium text-sm leading-relaxed group-hover:text-foreground">
												{session.title ||
													`Chat dengan ${session.character?.name}`}
											</p>
											<p className="font-medium text-muted-foreground text-xs">
												{new Date(session.updatedAt).toLocaleDateString(
													"id-ID",
													{ day: "numeric", month: "short" },
												)}
											</p>
										</div>
										<ChevronRight className="h-4 w-4 text-muted-foreground/50 transition-transform group-hover:translate-x-1" />
									</div>
								</Link>
							))}
						</div>
					)}
				</div>
			</div>

			{/* Bottom Section - User Account Only */}
			<div className="border-t bg-muted/20 p-4">
				<div className="flex items-center gap-3 rounded-lg bg-background/50 p-3">
					<div className="relative">
						<div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/10">
							<User className="h-4 w-4 text-primary" />
						</div>
						<div className="-bottom-0.5 -right-0.5 absolute h-3 w-3 rounded-full bg-green-500 ring-2 ring-background" />
					</div>
					<div className="min-w-0 flex-1">
						<p className="truncate font-semibold text-sm leading-relaxed">
							{session.user.name}
						</p>
						<p className="truncate font-medium text-muted-foreground text-xs">
							{session.user.email}
						</p>
					</div>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant="ghost"
								size="sm"
								className="h-8 w-8 rounded-full p-0"
							>
								<Settings className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent
							className="bg-card/95 backdrop-blur-sm"
							align="end"
						>
							<DropdownMenuLabel className="font-semibold">
								Akun Saya
							</DropdownMenuLabel>
							<DropdownMenuSeparator />
							<DropdownMenuItem asChild>
								<Link
									href="/profile"
									className="w-full cursor-pointer font-medium"
									onClick={onLinkClick}
								>
									<User className="mr-2 h-4 w-4" />
									Pengaturan Profil
								</Link>
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem
								className="cursor-pointer font-medium text-destructive focus:text-destructive"
								onClick={() => {
									authClient.signOut({
										fetchOptions: {
											onSuccess: () => {
												window.location.href = "/";
											},
										},
									});
								}}
							>
								<LogOut className="mr-2 h-4 w-4" />
								Keluar
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>
		</div>
	);
}

export default function ChatPage() {
	const params = useParams();
	const router = useRouter();
	const searchParams = useSearchParams();
	const queryClient = useQueryClient();
	const { formatTime } = useClientDate();
	const characterId = Number.parseInt(params.characterId as string);
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

	// Debug logging
	console.log(
		"Character ID from params:",
		params.characterId,
		"Parsed:",
		characterId,
	);

	// Get sessionId from URL params if continuing an existing chat
	const existingSessionId = searchParams.get("sessionId");
	const [sessionId, setSessionId] = useState<number | null>(
		existingSessionId ? Number.parseInt(existingSessionId) : null,
	);

	// Ensure sessionId state is synced with URL when existingSessionId changes
	useEffect(() => {
		if (existingSessionId) {
			const parsedSessionId = Number.parseInt(existingSessionId);
			if (sessionId !== parsedSessionId) {
				setSessionId(parsedSessionId);
			}
		}
	}, [existingSessionId, sessionId]);
	const [messages, setMessages] = useState<Message[]>([]);
	const [newMessage, setNewMessage] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [isCheckingSession, setIsCheckingSession] = useState(false);
	const [streamingMessage, setStreamingMessage] = useState("");
	const [isStreaming, setIsStreaming] = useState(false);
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const tempIdRef = useRef(0);

	// Auth and sidebar data
	const { data: session } = authClient.useSession();
	const { data: chatSessions, isLoading: sessionsLoading } = useQuery(
		trpc.chat.getUserSessions.queryOptions(),
	);

	const {
		data: character,
		isLoading: characterLoading,
		error: characterError,
	} = useQuery({
		...trpc.characters.getCharacter.queryOptions({ id: characterId }),
		enabled: !isNaN(characterId),
	});

	// Check for existing session for this character (only when not already continuing a session)
	const { data: existingSession, isLoading: existingSessionLoading } = useQuery(
		{
			...trpc.chat.findExistingSession.queryOptions({ characterId }),
			enabled: !isNaN(characterId) && !existingSessionId,
		},
	);

	// Use the actual sessionId we have, either from state or URL
	const actualSessionId = sessionId || (existingSessionId ? Number.parseInt(existingSessionId) : null);
	
	const { data: sessionMessages, refetch: refetchMessages } = useQuery({
		...trpc.chat.getSessionMessages.queryOptions({ 
			sessionId: actualSessionId || 0  // Provide a default value instead of assertion
		}),
		enabled: !!actualSessionId && actualSessionId > 0, // More explicit check
	});

	const createSessionMutation = useMutation({
		mutationFn: async (input: { characterId: number; forceNew?: boolean }) => {
			const response = await fetch("/trpc/chat.getOrCreateSession", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include",
				body: JSON.stringify(input),
			});

			if (!response.ok) {
				const errorText = await response.text();
				console.error("CreateSession fetch error:", response.status, errorText);
				try {
					const error = JSON.parse(errorText);
					throw new Error(
						error.error?.message || error.message || "Failed to create session",
					);
				} catch {
					throw new Error(`HTTP ${response.status}: ${errorText}`);
				}
			}

			const result = await response.json();
			console.log("CreateSession success:", result);
			return result.result?.data;
		},
		onSuccess: (session: { id: number }) => {
			setSessionId(session.id);
			// Update URL to include the session ID
			const newUrl = `/chat/${characterId}?sessionId=${session.id}`;
			router.replace(newUrl);
		},
		onError: (error: { message?: string }) => {
			toast.error(error.message || "Gagal membuat sesi chat");
		},
	});

	const sendMessageMutation = useMutation({
		mutationFn: async (input: { sessionId: number; content: string }) => {
			setIsStreaming(true);
			setStreamingMessage("");

			console.log("Streaming to:", "/api/chat/stream");

			const response = await fetch("/api/chat/stream", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify(input),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Failed to send message");
			}

			// Handle streaming response
			const reader = response.body?.getReader();
			if (!reader) throw new Error("No reader available");

			const decoder = new TextDecoder();
			let finalUserMessage: Message | null = null;
			let finalAiMessage: Message | null = null;

			while (true) {
				const { done, value } = await reader.read();
				if (done) break;

				const chunk = decoder.decode(value, { stream: true });
				const lines = chunk.split("\n");

				for (const line of lines) {
					if (line.startsWith("data: ")) {
						const data = line.slice(6);
						try {
							const parsed = JSON.parse(data);

							if (parsed.type === "delta") {
								// Update streaming message in real-time
								setStreamingMessage(parsed.accumulated);
							} else if (parsed.type === "done") {
								// Streaming complete
								finalUserMessage = parsed.userMessage;
								finalAiMessage = parsed.aiMessage;
							} else if (parsed.type === "error") {
								// Handle error
								finalUserMessage = parsed.userMessage;
								finalAiMessage = parsed.aiMessage;
								throw new Error(parsed.error || "Streaming error");
							}
						} catch (e) {
							// Ignore parsing errors for non-JSON lines
						}
					}
				}
			}

			if (!finalUserMessage || !finalAiMessage) {
				throw new Error("Stream completed without final messages");
			}

			return {
				userMessage: finalUserMessage,
				aiMessage: finalAiMessage,
			};
		},
		onSuccess: (response: { userMessage: Message; aiMessage: Message }) => {
			// Replace the temporary user message with the actual saved one and add AI message
			setMessages((prev) => {
				const withoutTemp = prev.slice(0, -1); // Remove temporary user message
				return [...withoutTemp, response.userMessage, response.aiMessage];
			});
			setNewMessage("");
			setIsLoading(false);
			setIsStreaming(false);
			setStreamingMessage("");
		},
		onError: (error: { message?: string }) => {
			// Remove the temporary user message on error
			setMessages((prev) => prev.slice(0, -1));
			toast.error(error.message || "Gagal mengirim pesan");
			setIsLoading(false);
			setIsStreaming(false);
			setStreamingMessage("");
		},
	});

	// Check for existing session and redirect if found
	useEffect(() => {
		if (existingSession && !existingSessionId && !isCheckingSession) {
			setIsCheckingSession(true);
			// Redirect to existing session
			const newUrl = `/chat/${characterId}?sessionId=${existingSession.id}`;
			router.replace(newUrl);

			// Reset checking state after a short delay to prevent infinite loading
			const timer = setTimeout(() => {
				setIsCheckingSession(false);
			}, 2000);

			return () => clearTimeout(timer);
		}
	}, [
		existingSession,
		existingSessionId,
		characterId,
		router,
		isCheckingSession,
	]);

	// Initialize session when character is loaded (only if no existing session found)
	useEffect(() => {
		if (
			character &&
			!sessionId &&
			!existingSessionId &&
			!existingSession &&
			!existingSessionLoading &&
			!createSessionMutation.isPending
		) {
			createSessionMutation.mutate({
				characterId: character.id,
				forceNew: false, // This will find existing session or create new one
			});
		}
	}, [
		character,
		sessionId,
		existingSessionId,
		existingSession,
		existingSessionLoading,
		createSessionMutation.isPending,
	]);

	// Load messages when session is created or when continuing existing session
	useEffect(() => {
		if (sessionMessages) {
			setMessages(sessionMessages as Message[]);
		}
	}, [sessionMessages]);

	// Trigger message fetch when we have an existing session from URL
	useEffect(() => {
		if (existingSessionId && sessionId) {
			refetchMessages();
		}
	}, [existingSessionId, sessionId, refetchMessages]);

	// Scroll to bottom when new messages arrive or streaming updates
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages, streamingMessage]);

	// Close mobile menu when route changes
	useEffect(() => {
		setIsMobileMenuOpen(false);
	}, []);



	const handleSendMessage = (e: React.FormEvent) => {
		e.preventDefault();

		if (!newMessage.trim() || !sessionId || isLoading || isStreaming) {
			return;
		}

		setIsLoading(true);

		// Add user message immediately for better UX
		const userMessage: Message = {
			id: -++tempIdRef.current, // Use negative IDs for temporary messages
			content: newMessage.trim(),
			role: "user",
			createdAt: new Date().toISOString(),
		};

		setMessages((prev) => [...prev, userMessage]);

		sendMessageMutation.mutate({
			sessionId,
			content: newMessage.trim(),
		});
	};

	const handleMobileLinkClick = () => {
		setIsMobileMenuOpen(false);
	};

	// Check if character ID is valid
	if (params.characterId === "undefined" || isNaN(characterId)) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-background">
				<div className="text-center">
					<h2 className="mb-2 font-semibold text-xl">URL Tidak Valid</h2>
					<p className="mb-4 text-muted-foreground leading-relaxed">
						Silakan pilih karakter dari galeri untuk memulai chat.
					</p>
					<Link href="/characters">
						<Button className="font-medium">Kembali ke Galeri Karakter</Button>
					</Link>
				</div>
			</div>
		);
	}

	// Show loading while character data is being fetched
	if (characterLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-background">
				<div className="text-center">
					<div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-primary border-b-2" />
					<p className="font-medium text-muted-foreground leading-relaxed">
						Memuat karakter...
					</p>
				</div>
			</div>
		);
	}

	// Show error only after loading is complete and character is not found
	if (!character && !characterLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-background">
				<div className="text-center">
					<h2 className="mb-2 font-semibold text-xl">
						Karakter Tidak Ditemukan
					</h2>
					<p className="mb-4 text-muted-foreground leading-relaxed">
						Karakter yang Anda cari tidak ditemukan atau tidak dapat diakses.
					</p>
					<Link href="/characters">
						<Button className="font-medium">Kembali ke Galeri Karakter</Button>
					</Link>
				</div>
			</div>
		);
	}

	// Show loading while checking for existing session (only when no sessionId in URL)
	if (!existingSessionId && (existingSessionLoading || isCheckingSession)) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-background">
				<div className="text-center">
					<div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-primary border-b-2" />
					<p className="font-medium text-muted-foreground leading-relaxed">
						{existingSession
							? "Melanjutkan percakapan sebelumnya..."
							: "Memuat percakapan..."}
					</p>
				</div>
			</div>
		);
	}

	// Ensure character is loaded before rendering
	if (!character) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-background">
				<div className="text-center">
					<div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-primary border-b-2" />
					<p className="font-medium text-muted-foreground leading-relaxed">
						Memuat karakter...
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="relative flex min-h-screen flex-col">
			{/* Background with character avatar */}
			{character.avatarUrl && (
				<div className="fixed inset-0 z-0">
					<div
						className="h-full w-full bg-cover bg-center bg-no-repeat"
						style={{
							backgroundImage: `url(${character.avatarUrl})`,
						}}
					/>
					{/* Multiple overlay layers for depth and readability */}
					<div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />
					<div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/10" />
					<div className="absolute inset-0 backdrop-blur-sm" />
					<div className="absolute inset-0 bg-background/20" />
				</div>
			)}

			{/* Content overlay */}
			<div className="relative z-10 flex min-h-screen flex-col">
				{/* Mobile Header - Minimal full width */}
				<div className="sticky top-0 z-50 bg-black/30 backdrop-blur-xl border-b border-white/10 lg:hidden">
					<div className="flex items-center justify-between px-4 py-3">
						{session && (
							<Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
								<SheetTrigger asChild>
									<Button
										variant="ghost"
										size="sm"
										className="text-white hover:bg-white/20"
									>
										<Menu className="h-5 w-5" />
										<span className="sr-only">Open menu</span>
									</Button>
								</SheetTrigger>
								<SheetContent side="left" className="w-80 p-0">
									<SheetTitle className="sr-only">Menu Navigasi</SheetTitle>
									<MobileSidebarContent
										session={session}
										chatSessions={chatSessions || []}
										sessionsLoading={sessionsLoading}
										onLinkClick={handleMobileLinkClick}
									/>
								</SheetContent>
							</Sheet>
						)}

						<div className="flex flex-1 items-center justify-center">
							<div className="text-center">
								<h1 className="max-w-[200px] truncate bg-gradient-to-r from-white to-white/80 bg-clip-text font-bold text-transparent text-xl leading-tight">
									{character.name}
								</h1>
								<span className="font-medium text-white/80 text-xs opacity-80">
									Chat Pribadi
								</span>
							</div>
						</div>

						<Link href="/characters">
							<Button
								variant="ghost"
								size="sm"
								className="text-white hover:bg-white/20"
							>
								<ArrowLeft className="h-4 w-4" />
							</Button>
						</Link>
					</div>
				</div>

				{/* Desktop Header - Minimal full width */}
				<div className="sticky top-0 z-50 hidden bg-black/30 backdrop-blur-xl border-b border-white/10 lg:block">
					<div className="flex items-center justify-between px-6 py-3">
						<Link href="/characters">
							<Button
								variant="ghost"
								size="sm"
								className="font-medium text-white hover:bg-white/20"
							>
								← Kembali
							</Button>
						</Link>
						<div className="text-center">
							<h1 className="bg-gradient-to-r from-white via-white to-white/90 bg-clip-text font-bold text-transparent text-2xl leading-tight">
								{character.name}
							</h1>
							<span className="font-medium text-white/80 text-xs">
								Obrolan Pribadi
							</span>
						</div>
						<div className="w-20" /> {/* Spacer for balance */}
					</div>
				</div>

				{/* Chat Messages - Enhanced styling */}
				<div className="flex-1 overflow-y-auto px-4 pt-4 pb-32 lg:px-6 lg:pb-24">
					<div className="mx-auto max-w-4xl space-y-6">
						{messages.length === 0 ? (
							<div className="py-12 text-center">
								<div className="mx-auto mb-6 max-w-md">
									<div className="relative mb-8">
										{character.avatarUrl && (
											<div className="relative mx-auto h-32 w-32">
												<img
													src={character.avatarUrl}
													alt={character.name}
													className="h-full w-full rounded-full object-cover shadow-2xl ring-4 ring-white/30"
												/>
												<div className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-green-500 ring-4 ring-background/20">
													<div className="h-3 w-3 rounded-full bg-white" />
												</div>
											</div>
										)}
									</div>
									<h2 className="mb-6 bg-gradient-to-r from-white via-white to-white/90 bg-clip-text font-bold text-transparent text-5xl leading-tight">
										{character.name}
									</h2>
									{character.description && (
										<p className="mb-8 font-medium text-white/80 text-lg leading-relaxed">
											{character.description}
										</p>
									)}
								</div>
								<div className="rounded-2xl border border-white/20 bg-black/30 p-6 backdrop-blur-sm">
									<p className="font-medium text-white/90 text-lg leading-relaxed">
										{existingSessionId
											? `Selamat datang kembali! Lanjutkan obrolan intim dengan ${character.name}.`
											: `Mulai obrolan pribadi dengan ${character.name}!`}
									</p>
									<div className="mt-4 flex items-center justify-center gap-2 text-white/60">
										<span className="text-sm">
											Ini adalah ruang pribadi kalian berdua
										</span>
									</div>
									{/* Show refresh button if we have a sessionId but no messages loaded */}
									{existingSessionId && (
										<div className="mt-6">
											<Button
												onClick={() => {
													refetchMessages();
													toast.success("Memuat ulang percakapan...");
												}}
												variant="outline"
												className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:border-white/50"
											>
												<MessageCircle className="mr-2 h-4 w-4" />
												Muat Percakapan Sebelumnya
											</Button>
										</div>
									)}
								</div>
							</div>
						) : (
							<>
								{messages.map((message) => (
									<div
										key={message.id}
										className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
									>
										<div
											className={`max-w-[85%] rounded-2xl px-6 py-4 shadow-lg sm:max-w-[75%] md:max-w-[70%] ${
												message.role === "user"
													? "ml-8 bg-gradient-to-br from-primary via-primary to-primary/90 text-primary-foreground shadow-primary/25 sm:ml-16"
													: "mr-8 bg-black/60 text-white shadow-black/25 backdrop-blur-sm sm:mr-16"
											}`}
										>
											<div className="whitespace-pre-wrap font-normal text-base leading-relaxed tracking-wide">
												{message.content}
											</div>
											<div
												className={`mt-3 font-medium text-xs ${message.role === "user" ? "opacity-70" : "text-white/60"}`}
											>
												{formatTime(message.createdAt, {
													hour: "2-digit",
													minute: "2-digit",
												})}
											</div>
										</div>
									</div>
								))}

								{/* Streaming message */}
								{isStreaming && (
									<div className="flex justify-start">
										<div className="mr-8 max-w-[85%] rounded-2xl bg-black/60 px-6 py-4 text-white shadow-lg shadow-black/25 backdrop-blur-sm sm:mr-16 sm:max-w-[75%] md:max-w-[70%]">
											<div className="whitespace-pre-wrap font-normal text-base leading-relaxed tracking-wide">
												{streamingMessage}
												<span className="animate-pulse text-primary">|</span>
											</div>
										</div>
									</div>
								)}

								{/* Loading indicator when not streaming */}
								{isLoading && !isStreaming && (
									<div className="flex justify-start">
										<div className="mr-8 max-w-[85%] rounded-2xl bg-black/60 px-6 py-4 text-white shadow-lg shadow-black/25 backdrop-blur-sm sm:mr-16 sm:max-w-[75%] md:max-w-[70%]">
											<div className="flex items-center space-x-3">
												<div className="flex space-x-1">
													<div className="h-2 w-2 animate-bounce rounded-full bg-primary" />
													<div className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:0.1s]" />
													<div className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:0.2s]" />
												</div>
												<span className="font-medium text-white/80 text-sm">
													{character.name} sedang berpikir...
												</span>
											</div>
										</div>
									</div>
								)}

								<div ref={messagesEndRef} />
							</>
						)}
					</div>
				</div>

				{/* Message Input - Enhanced floating style */}
				<div className="sticky bottom-0 left-0 right-0 z-50 bg-black/40 backdrop-blur-xl border-t border-white/20">
					<div className="mx-auto max-w-4xl px-4 py-6 lg:px-6">
						<form
							onSubmit={handleSendMessage}
							className="flex items-end space-x-3"
						>
							<textarea
								value={newMessage}
								onChange={(e) => setNewMessage(e.target.value)}
								placeholder={`Ketik disini...`}
								disabled={isLoading || isStreaming}
								rows={1}
								className="flex-1 resize-none rounded-2xl border-white/30 bg-white/10 px-6 py-4 font-normal text-base text-white placeholder:text-white/60 leading-relaxed focus:bg-white/20 focus:border-white/50 focus:outline-none focus:ring-2 focus:ring-white/20 max-h-32 overflow-y-auto"
								maxLength={200}
								style={{
									minHeight: "56px",
									height: "auto",
								}}
								onInput={(e) => {
									const target = e.target as HTMLTextAreaElement;
									target.style.height = "auto";
									target.style.height =
										Math.min(target.scrollHeight, 128) + "px";
								}}
								onKeyDown={(e) => {
									if (e.key === "Enter" && !e.shiftKey) {
										e.preventDefault();
										handleSendMessage(e);
									}
								}}
							/>
							<Button
								type="submit"
								disabled={isLoading || isStreaming || !newMessage.trim()}
								className="rounded-2xl bg-gradient-to-r from-primary to-primary/80 px-8 py-4 font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 min-h-[56px]"
							>
								{isLoading || isStreaming ? (
									<div className="flex items-center gap-2">
										<div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
										<span>Kirim</span>
									</div>
								) : (
									<div className="flex items-center gap-2">
										<span>Kirim</span>
									</div>
								)}
							</Button>
						</form>
					</div>
				</div>
			</div>
		</div>
	);
}
