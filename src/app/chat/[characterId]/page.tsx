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
	Send,
	Settings,
	Sparkles,
	User,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import posthog from "posthog-js";
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
		<div className="flex h-full flex-col bg-background">
			{/* Header */}
			<div className="border-b p-6">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
							<Sparkles className="h-5 w-5 text-primary-foreground" />
						</div>
						<div>
							<h1 className="font-bold text-lg">
								AiDorama - Karakter Imajiner
							</h1>
							<p className="text-muted-foreground text-sm">
								Platform Roleplay Indonesia | Ngobrol dengan karakter imajiner yang seru.
							</p>
						</div>
					</div>
					<ModeToggle />
				</div>
			</div>

			<div className="flex-1 overflow-hidden p-6">
				{/* Quick Actions */}
				<div className="mb-6">
					<h3 className="mb-3 font-medium text-sm text-muted-foreground">Aksi Cepat</h3>
					<div className="grid grid-cols-2 gap-2">
						<Link href="/characters/create" onClick={onLinkClick}>
							<Button
								variant="outline"
								size="sm"
								className="w-full justify-start"
							>
								<Plus className="mr-2 h-4 w-4" />
								Buat Karakter
							</Button>
						</Link>
						<Link href="/" onClick={onLinkClick}>
							<Button
								variant="outline"
								size="sm"
								className="w-full justify-start"
							>
								<Sparkles className="mr-2 h-4 w-4" />
								Jelajahi
							</Button>
						</Link>
					</div>
				</div>

				{/* Recent Chat History */}
				<div className="flex-1">
					<div className="mb-3 flex items-center justify-between">
						<h3 className="font-medium text-sm text-muted-foreground">Chat Terbaru</h3>
						<Link href="/chats" onClick={onLinkClick}>
							<Button
								variant="ghost"
								size="sm"
								className="text-xs"
							>
								Lihat Semua
							</Button>
						</Link>
					</div>

					{sessionsLoading ? (
						<div className="space-y-2">
							{[1, 2, 3].map((i) => (
								<div
									key={i}
									className="flex items-center gap-3 rounded-lg p-3"
								>
									<Skeleton className="h-8 w-8 rounded-full" />
									<div className="flex-1">
										<Skeleton className="mb-1 h-3 w-full" />
										<Skeleton className="h-3 w-16" />
									</div>
								</div>
							))}
						</div>
					) : recentSessions.length === 0 ? (
						<div className="rounded-lg border border-dashed p-6 text-center">
							<MessageCircle className="mx-auto mb-2 h-6 w-6 text-muted-foreground" />
							<p className="mb-3 text-muted-foreground text-sm">
								Belum ada chat
							</p>
							<Link href="/characters" onClick={onLinkClick}>
								<Button size="sm">
									Mulai Chat
								</Button>
							</Link>
						</div>
					) : (
						<div className="space-y-1">
							{recentSessions.map((session: any) => (
								<Link
									key={session.id}
									href={`/chat/${session.character?.id}?sessionId=${session.id}`}
									className="block"
									onClick={onLinkClick}
								>
									<div className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-muted/50">
										{session.character?.avatarUrl ? (
											<img
												src={session.character.avatarUrl}
												alt={session.character.name}
												className="h-8 w-8 rounded-full object-cover"
											/>
										) : (
											<div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
												<span className="text-muted-foreground text-xs">
													{session.character?.name?.charAt(0)?.toUpperCase() ||
														"?"}
												</span>
											</div>
										)}
										<div className="min-w-0 flex-1">
											<p className="truncate text-sm">
												{session.title ||
													`Chat dengan ${session.character?.name}`}
											</p>
											<p className="text-muted-foreground text-xs">
												{new Date(session.updatedAt).toLocaleDateString(
													"id-ID",
													{ day: "numeric", month: "short" },
												)}
											</p>
										</div>
									</div>
								</Link>
							))}
						</div>
					)}
				</div>
			</div>

			{/* Bottom Section - User Account */}
			<div className="border-t p-4">
				<div className="flex items-center gap-3">
					<div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
						<User className="h-4 w-4" />
					</div>
					<div className="min-w-0 flex-1">
						<p className="truncate text-sm font-medium">
							{session.user.name}
						</p>
						<p className="truncate text-muted-foreground text-xs">
							{session.user.email}
						</p>
					</div>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant="ghost"
								size="sm"
								className="h-8 w-8 p-0"
							>
								<Settings className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuLabel>Akun Saya</DropdownMenuLabel>
							<DropdownMenuSeparator />
							<DropdownMenuItem asChild>
								<Link
									href="/profile"
									className="w-full cursor-pointer"
									onClick={onLinkClick}
								>
									<User className="mr-2 h-4 w-4" />
									Pengaturan Profil
								</Link>
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem
								className="cursor-pointer text-destructive focus:text-destructive"
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
	
	const { data: sessionMessages, refetch: refetchMessages, isLoading: messagesLoading } = useQuery({
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
			// Track start chat event
			posthog.capture('chat_started', {
				character_id: characterId
			});
			
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

		// Track send message event
		posthog.capture('message_sent', {
			character_id: characterId,
			session_id: sessionId
		});

		sendMessageMutation.mutate({
			sessionId,
			content: newMessage.trim(),
		});
	};

	const handleMobileLinkClick = () => {
		setIsMobileMenuOpen(false);
	};

	// Helper function to check if messages should be grouped
	const shouldGroupMessage = (currentIndex: number, messages: Message[]) => {
		if (currentIndex === 0) return false;
		const currentMessage = messages[currentIndex];
		const previousMessage = messages[currentIndex - 1];
		
		// Group if same role and within 5 minutes
		const timeDiff = new Date(currentMessage.createdAt).getTime() - new Date(previousMessage.createdAt).getTime();
		return currentMessage.role === previousMessage.role && timeDiff < 5 * 60 * 1000;
	};

	// Check if character ID is valid
	if (params.characterId === "undefined" || isNaN(characterId)) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-background">
				<div className="text-center">
					<h2 className="mb-2 font-semibold text-xl">URL Tidak Valid</h2>
					<p className="mb-4 text-muted-foreground">
						Silakan pilih karakter dari galeri untuk memulai chat.
					</p>
					<Link href="/characters">
						<Button>Kembali ke Galeri Karakter</Button>
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
					<div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-primary border-b-transparent" />
					<p className="text-muted-foreground">
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
					<p className="mb-4 text-muted-foreground">
						Karakter yang Anda cari tidak ditemukan atau tidak dapat diakses.
					</p>
					<Link href="/characters">
						<Button>Kembali ke Galeri Karakter</Button>
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
					<div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-primary border-b-transparent" />
					<p className="text-muted-foreground">
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
					<div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-primary border-b-transparent" />
					<p className="text-muted-foreground">
						Memuat karakter...
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="flex min-h-screen flex-col bg-background">
			{/* Header - iMessage style */}
			<div className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
				<div className="flex h-14 items-center px-4 lg:px-6">
					{/* Mobile menu button */}
					<div className="lg:hidden">
						{session && (
							<Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
								<SheetTrigger asChild>
									<Button variant="ghost" size="sm" className="mr-2">
										<Menu className="h-5 w-5" />
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
					</div>

					{/* Back button */}
					<Link href="/characters" className="mr-3">
						<Button variant="ghost" size="sm">
							<ArrowLeft className="h-4 w-4" />
						</Button>
					</Link>

					{/* Character info */}
					<div className="flex min-w-0 flex-1 items-center gap-3">
						{character.avatarUrl && (
							<img
								src={character.avatarUrl}
								alt={character.name}
								className="h-8 w-8 rounded-full object-cover"
							/>
						)}
						<div className="min-w-0 flex-1">
							<h1 className="truncate font-semibold text-base">
								{character.name}
							</h1>
							<p className="text-muted-foreground text-xs">Online</p>
						</div>
					</div>
				</div>
			</div>

			{/* Messages area - iMessage style */}
			<div className="flex-1 overflow-y-auto px-4 pb-4 lg:px-6">
				<div className="mx-auto max-w-2xl space-y-1 py-4">
					{messagesLoading ? (
						<div className="py-8 text-center">
							<div className="mx-auto mb-4 h-6 w-6 animate-spin rounded-full border-2 border-primary border-b-transparent" />
							<p className="text-muted-foreground text-sm">
								Memuat percakapan...
							</p>
						</div>
					) : (
						<>
							{messages.map((message, index) => {
								const isGrouped = shouldGroupMessage(index, messages);
								const isUser = message.role === "user";
								
								return (
									<div
										key={message.id}
										className={`flex ${isUser ? "justify-end" : "justify-start"} ${isGrouped ? "mt-0.5" : "mt-4"}`}
									>
										<div
											className={`group relative max-w-[70%] rounded-2xl px-4 py-2 ${
												isUser
													? "bg-primary text-primary-foreground"
													: "bg-muted text-foreground"
											} ${
												isUser
													? isGrouped
														? "rounded-br-md"
														: ""
													: isGrouped
													? "rounded-bl-md"
													: ""
											}`}
										>
											<p className="text-sm leading-relaxed whitespace-pre-wrap">
												{message.content}
											</p>
											{!isGrouped && (
												<p className={`mt-1 text-xs opacity-70 ${isUser ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
													{formatTime(message.createdAt, {
														hour: "2-digit",
														minute: "2-digit",
													})}
												</p>
											)}
										</div>
									</div>
								);
							})}

							{/* Streaming message */}
							{isStreaming && (
								<div className="flex justify-start mt-4">
									<div className="max-w-[70%] rounded-2xl bg-muted px-4 py-2 text-foreground">
										<p className="text-sm leading-relaxed whitespace-pre-wrap">
											{streamingMessage}
											<span className="animate-pulse text-primary">|</span>
										</p>
									</div>
								</div>
							)}

							{/* Loading indicator */}
							{isLoading && !isStreaming && (
								<div className="flex justify-start mt-4">
									<div className="rounded-2xl bg-muted px-4 py-2">
										<div className="flex items-center space-x-1">
											<div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" />
											<div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:0.1s]" />
											<div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:0.2s]" />
										</div>
									</div>
								</div>
							)}

							<div ref={messagesEndRef} />
						</>
					)}
				</div>
			</div>

			{/* Input area - iMessage style */}
			<div className="sticky bottom-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
				<div className="mx-auto max-w-2xl px-4 py-3 lg:px-6">
					<form onSubmit={handleSendMessage} className="flex items-end gap-3">
						<div className="flex-1 rounded-full border bg-muted/50 px-4 py-3">
							<textarea
								value={newMessage}
								onChange={(e) => setNewMessage(e.target.value)}
								placeholder="Ketik pesan..."
								disabled={isLoading || isStreaming}
								rows={1}
								className="w-full resize-none bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none max-h-20"
								maxLength={500}
								style={{ minHeight: "20px" }}
								onInput={(e) => {
									const target = e.target as HTMLTextAreaElement;
									target.style.height = "auto";
									target.style.height = Math.min(target.scrollHeight, 80) + "px";
								}}
								onKeyDown={(e) => {
									if (e.key === "Enter" && !e.shiftKey) {
										e.preventDefault();
										handleSendMessage(e);
									}
								}}
							/>
						</div>
						<Button
							type="submit"
							disabled={isLoading || isStreaming || !newMessage.trim()}
							className="h-11 w-11 rounded-full p-0 flex-shrink-0"
						>
							{isLoading || isStreaming ? (
								<div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-b-transparent" />
							) : (
								<Send className="h-5 w-5" />
							)}
						</Button>
					</form>
				</div>
			</div>
		</div>
	);
}
