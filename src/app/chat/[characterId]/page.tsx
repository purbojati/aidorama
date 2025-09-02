"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	ArrowLeft,
	ChevronRight,
	Clock,
	LogOut,
	Menu,
	MessageCircle,
	MoreVertical,
	Plus,
	Send,
	Settings,
	Sparkles,
	Trash2,
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
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import SidebarLayout from "@/components/sidebar-layout";

interface Message {
	id: number;
	content: string;
	role: "user" | "assistant";
	createdAt: string;
}

export default function ChatPage() {
	const params = useParams();
	const router = useRouter();
	const searchParams = useSearchParams();
	const queryClient = useQueryClient();
	const { formatTime } = useClientDate();
	const characterId = Number.parseInt(params.characterId as string);
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

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
			setSessionId(session.id);
			// Update URL to include the session ID
			const newUrl = `/chat/${characterId}?sessionId=${session.id}`;
			router.replace(newUrl);
		},
		onError: (error: { message?: string }) => {
			toast.error(error.message || "Gagal membuat sesi chat");
		},
	});

	const resetChatMutation = useMutation({
		mutationFn: async (input: { sessionId: number }) => {
			const response = await fetch("/trpc/chat.resetChat", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include",
				body: JSON.stringify(input),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error?.message || "Gagal mereset chat");
			}

			return response.json();
		},
		onSuccess: () => {
			toast.success("Chat berhasil direset.");
			setMessages([]);
			// This will refetch messages which should now be empty
			refetchMessages();
			// Also invalidate sessions list as it might show outdated last message
			queryClient.invalidateQueries(trpc.chat.getUserSessions.queryOptions());
			setIsResetConfirmOpen(false);
		},
		onError: (error: Error) => {
			toast.error(error.message || "Gagal mereset chat.");
			setIsResetConfirmOpen(false);
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

	const handleResetChat = () => {
		if (sessionId) {
			resetChatMutation.mutate({ sessionId });
		}
	};

	// Helper function to check if messages should be grouped
	const shouldGroupMessage = (currentIndex: number, messages: Message[]) => {
		if (currentIndex === 0) {
			return false;
		}
		return (
			messages[currentIndex].role === messages[currentIndex - 1].role
		);
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
		<SidebarLayout>
			<div className="flex h-screen flex-col bg-background">
				{/* Header */}
				<div className="flex items-center justify-between border-b p-4">
					<div className="flex items-center gap-3">
						<Button
							variant="ghost"
							size="icon"
							className="lg:hidden"
							onClick={() => setIsMobileMenuOpen(true)}
						>
							<Menu className="h-5 w-5" />
						</Button>
						<Button
							variant="ghost"
							size="icon"
							onClick={() => router.back()}
							className="hidden lg:flex"
						>
							<ArrowLeft className="h-5 w-5" />
						</Button>
						{character.avatarUrl ? (
							<img
								src={character.avatarUrl}
								alt={character.name}
								className="h-10 w-10 rounded-full object-cover"
							/>
						) : (
							<div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
								<User className="h-5 w-5 text-muted-foreground" />
							</div>
						)}
						<div className="min-w-0">
							<h1 className="truncate font-bold">{character.name}</h1>
							<p className="truncate text-muted-foreground text-sm">
								Oleh {character.name}
							</p>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<ModeToggle />
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="ghost" size="icon">
									<MoreVertical className="h-5 w-5" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<DropdownMenuItem onClick={() => router.push(`/characters/edit/${characterId}`)}>
									Edit Karakter
								</DropdownMenuItem>
								<AlertDialog
									open={isResetConfirmOpen}
									onOpenChange={setIsResetConfirmOpen}
								>
									<AlertDialogTrigger asChild>
										<DropdownMenuItem
											onSelect={(e) => e.preventDefault()}
											className="text-destructive focus:text-destructive"
										>
											Reset Chat
										</DropdownMenuItem>
									</AlertDialogTrigger>
									<AlertDialogContent>
										<AlertDialogHeader>
											<AlertDialogTitle>Yakin mau reset chat?</AlertDialogTitle>
											<AlertDialogDescription>
												Semua history chat dengan karakter ini akan dihapus permanen.
											</AlertDialogDescription>
										</AlertDialogHeader>
										<AlertDialogFooter>
											<AlertDialogCancel>Batal</AlertDialogCancel>
											<AlertDialogAction onClick={handleResetChat}>
												Ya, Reset
											</AlertDialogAction>
										</AlertDialogFooter>
									</AlertDialogContent>
								</AlertDialog>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</div>

				{/* Chat Area */}
				<div
					ref={messagesEndRef}
					className="flex-1 overflow-y-auto p-6"
					key={sessionId} // Force re-render on session change
				>
					{messagesLoading ? (
						<div className="py-8 text-center">
							<div className="mx-auto mb-4 h-6 w-6 animate-spin rounded-full border-2 border-primary border-b-transparent" />
							<p className="text-muted-foreground text-sm">
								Memuat percakapan...
							</p>
						</div>
					) : messages.length === 0 ? (
						<div className="flex h-full flex-col items-center justify-center text-center">
							<div className="mb-4 rounded-full bg-muted p-4">
								<MessageCircle className="h-10 w-10 text-muted-foreground" />
							</div>
							<h2 className="text-xl font-semibold">
								Mulai percakapan dengan {character.name}
							</h2>
							<p className="text-muted-foreground">
								{character.greetings}
							</p>
						</div>
					) : (
						<div className="mx-auto max-w-3xl space-y-4">
							{messages.map((message, index) => {
								const isUser = message.role === "user";
								const showAvatar =
									!shouldGroupMessage(index, messages) || index === 0;
								return (
									<div
										key={message.id}
										className={`flex items-end gap-3 ${
											isUser ? "justify-end" : "justify-start"
										}`}
									>
										{!isUser && (
											<div className="h-8 w-8 flex-shrink-0">
												{showAvatar && character.avatarUrl && (
													<img
														src={character.avatarUrl}
														alt={character.name}
														className="h-full w-full rounded-full object-cover"
													/>
												)}
											</div>
										)}
										<div
											className={`max-w-md rounded-2xl px-4 py-2.5 ${
												isUser
													? "rounded-br-none bg-primary text-primary-foreground"
													: "rounded-bl-none bg-muted"
											}`}
										>
											<p className="whitespace-pre-wrap text-sm">
												{message.content}
											</p>
										</div>
									</div>
								);
							})}
							{isStreaming && (
								<div className="flex items-end gap-3 justify-start">
									<div className="h-8 w-8 flex-shrink-0">
										<img
											src={character.avatarUrl || "/placeholder.jpg"}
											alt={character.name}
											className="h-full w-full animate-pulse rounded-full object-cover"
										/>
									</div>
									<div className="max-w-md rounded-2xl rounded-bl-none bg-muted px-4 py-2.5">
										<div className="flex items-center gap-1.5">
											<span className="h-2 w-2 animate-pulse rounded-full bg-muted-foreground" />
											<span className="h-2 w-2 animate-pulse rounded-full bg-muted-foreground delay-75" />
											<span className="h-2 w-2 animate-pulse rounded-full bg-muted-foreground delay-150" />
										</div>
									</div>
								</div>
							)}
						</div>
					)}
				</div>

				{/* Input Form */}
				<div className="border-t bg-background p-4">
					<form
						onSubmit={handleSendMessage}
						className="mx-auto flex max-w-3xl items-center gap-3"
					>
						<Input
							value={newMessage}
							onChange={(e) => setNewMessage(e.target.value)}
							placeholder={`Kirim pesan ke ${character.name}...`}
							className="flex-1 rounded-full bg-muted focus-visible:ring-1 focus-visible:ring-primary/50"
							disabled={isLoading || isStreaming}
							autoComplete="off"
						/>
						<Button
							type="submit"
							size="icon"
							className="rounded-full"
							disabled={!newMessage.trim() || isLoading || isStreaming}
						>
							<Send className="h-5 w-5" />
						</Button>
					</form>
				</div>
			</div>
		</SidebarLayout>
	);
}
