"use client";

import { useQuery } from "@tanstack/react-query";
import {
	ChevronRight,
	LogOut,
	Menu,
	MessageCircle,
	Plus,
	Settings,
	User,
	Home,
	Users,
	Bot,
	LogIn,
	Shield,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Loader from "@/components/loader";
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
import {
	Sheet,
	SheetContent,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { useClientDate } from "@/hooks/use-client-date";
import { authClient } from "@/lib/auth-client";
import { useIsAdmin } from "@/lib/admin";
import { trpc } from "@/utils/trpc";

interface SidebarLayoutProps {
	children: React.ReactNode;
	requireAuth?: boolean;
}

// Sidebar content component to avoid duplication
function SidebarContent({
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
	const { formatDate } = useClientDate();
	const isAdmin = useIsAdmin();

	return (
		<div className="flex h-full flex-col overflow-hidden bg-card/50 backdrop-blur-sm">
			{/* Header */}
			<div className="flex-shrink-0 border-b bg-gradient-to-r from-background/90 to-muted/30 p-6">
				<div className="flex items-center justify-between gap-3">
					<div className="flex items-center gap-3">
						<div className="flex h-10 w-10 items-center justify-center">
							<img 
								src="/aidorama-logo-trans.png" 
								alt="AiDorama Logo" 
								className="h-10 w-10 object-contain"
							/>
						</div>
						<div>
							<h1 className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text font-bold font-sans text-lg text-transparent">
								AiDorama
							</h1>
							<p className="text-muted-foreground text-xs">Ngobrol dengan karakter imajinermu</p>
						</div>
					</div>
					<ModeToggle />
				</div>
			</div>

			{/* Navigation */}
			<div className="flex-1 overflow-y-auto p-4">
				<div className="space-y-6">
					{/* Main Navigation */}
					<div className="space-y-2">
						<h2 className="font-semibold text-foreground text-sm">Menu Utama</h2>
						<nav className="space-y-1">
							<Link
								href="/"
								className="flex items-center gap-3 rounded-lg px-3 py-2 text-foreground transition-all hover:bg-muted/50 hover:text-foreground"
								onClick={onLinkClick}
							>
								<Home className="h-4 w-4" />
								<span className="text-sm">Beranda</span>
							</Link>
							{session && (
								<>
									<Link
										href="/characters/my"
										className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-muted/50 hover:text-foreground"
										onClick={onLinkClick}
									>
										<Bot className="h-4 w-4" />
										<span className="text-sm">Karakterku</span>
									</Link>
									<Link
										href="/characters/create"
										className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-muted/50 hover:text-foreground"
										onClick={onLinkClick}
									>
										<Plus className="h-4 w-4" />
										<span className="text-sm font-semibold">Buat Karakter</span>
									</Link>
									{isAdmin && (
										<Link
											href="/admin"
											className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-muted/50 hover:text-foreground"
											onClick={onLinkClick}
										>
											<Shield className="h-4 w-4" />
											<span className="text-sm">Admin Panel</span>
										</Link>
									)}
								</>
							)}
						</nav>
					</div>


					{/* Chat Sessions - Only show for authenticated users */}
					{session && (
						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<h2 className="font-semibold text-foreground text-sm">
									Chat Terbaru
								</h2>
								<Button
									variant="ghost"
									size="sm"
									className="h-6 w-6 rounded-full p-0"
									asChild
								>
									<Link href="/chats" onClick={onLinkClick}>
										<ChevronRight className="h-3 w-3" />
									</Link>
								</Button>
							</div>

							{sessionsLoading ? (
								<div className="space-y-2">
									{[1, 2, 3].map((i) => (
										<div
											key={i}
											className="flex items-center gap-3 rounded-lg border bg-background/50 p-3"
										>
											<div className="h-10 w-10 animate-pulse rounded-full bg-muted" />
											<div className="flex-1">
												<div className="mb-1 h-4 animate-pulse rounded bg-muted" />
												<div className="h-3 w-3/4 animate-pulse rounded bg-muted" />
											</div>
										</div>
									))}
								</div>
							) : chatSessions.length > 0 ? (
								<div className="space-y-1">
									{chatSessions.slice(0, 5).map((session: any) => (
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
															{session.character?.name
																?.charAt(0)
																?.toUpperCase() || "?"}
														</span>
													</div>
												)}
												<div className="min-w-0 flex-1">
													<p className="truncate font-medium text-sm group-hover:text-foreground">
														{session.title ||
															`Chat sama ${session.character?.name}`}
													</p>
													<p className="text-muted-foreground text-xs">
														{formatDate(session.updatedAt, {
															day: "numeric",
															month: "short",
														})}
													</p>
												</div>
												<ChevronRight className="h-4 w-4 text-muted-foreground/50 transition-transform group-hover:translate-x-1" />
											</div>
										</Link>
									))}
								</div>
							) : (
								<div className="rounded-lg border-2 border-dashed p-4 text-center">
									<MessageCircle className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
									<p className="text-muted-foreground text-sm">
										Belum ada chat. Mulai chat dengan karakter!
									</p>
								</div>
							)}
						</div>
					)}
				</div>
			</div>

			{/* Bottom Section - Show different content based on auth */}
			<div className="flex-shrink-0 border-t bg-muted/20 p-4">
				{session ? (
					<div className="flex items-center gap-3 rounded-lg bg-background/50 p-3">
						<div className="relative">
							<div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/10">
								<User className="h-4 w-4 text-primary" />
							</div>
							<div className="-bottom-0.5 -right-0.5 absolute h-3 w-3 rounded-full bg-green-500 ring-2 ring-background" />
						</div>
						<div className="min-w-0 flex-1">
							<p className="truncate font-medium text-sm">{session.user.name}</p>
							<p className="truncate text-muted-foreground text-xs">
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
								<DropdownMenuLabel>Akun Gue</DropdownMenuLabel>
								<DropdownMenuSeparator />
								<DropdownMenuItem asChild>
									<Link
										href="/profile"
										className="w-full cursor-pointer"
										onClick={onLinkClick}
									>
										<User className="mr-2 h-4 w-4" />
										Atur Profil
									</Link>
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem
									className="cursor-pointer text-destructive focus:text-destructive"
									onClick={() => {
										authClient.signOut({
											fetchOptions: {
												onSuccess: () => {
													router.push("/");
												},
											},
										});
									}}
								>
									<LogOut className="mr-2 h-4 w-4" />
									Logout
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				) : (
					<div className="space-y-2">
						<Button asChild className="w-full">
							<Link href="/login" onClick={onLinkClick}>
								<LogIn className="mr-2 h-4 w-4" />
								Masuk / Daftar
							</Link>
						</Button>
						<p className="text-center text-muted-foreground text-xs">
							Masuk untuk membuat karakter dan chat
						</p>
					</div>
				)}
			</div>
		</div>
	);
}

export default function SidebarLayout({ children, requireAuth = true }: SidebarLayoutProps) {
	const router = useRouter();
	const pathname = usePathname();
	const { data: session, isPending } = authClient.useSession();
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

	// Fetch user's chat sessions for sidebar (only for authenticated users)
	const { data: chatSessions, isLoading: sessionsLoading } = useQuery({
		...trpc.chat.getUserSessions.queryOptions(),
		enabled: !!session,
	});

	// Only redirect to login if authentication is required
	useEffect(() => {
		if (requireAuth && !session && !isPending) {
			router.push("/login");
		}
	}, [session, isPending, requireAuth, router]);

	// Close mobile menu when route changes
	useEffect(() => {
		setIsMobileMenuOpen(false);
	}, [pathname]);

	if (isPending) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<Loader />
			</div>
		);
	}

	if (requireAuth && !session) {
		return null; // Will redirect to login
	}

	const handleMobileLinkClick = () => {
		setIsMobileMenuOpen(false);
	};

	const isChatPage = pathname?.startsWith("/chat/") ?? false;

	return (
		<div className={`flex ${isChatPage ? "h-[100dvh] overflow-hidden" : "min-h-[100dvh]"} bg-gradient-to-br from-background to-muted/20`}>
			{/* Mobile Header (hidden on chat pages) */}
			{!isChatPage && (
				<div className="fixed top-0 right-0 left-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:hidden">
					<div className="flex items-center justify-between px-4 py-3">
						<Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
							<SheetTrigger asChild>
								<Button variant="ghost" size="sm">
									<Menu className="h-5 w-5" />
									<span className="sr-only">Buka menu</span>
								</Button>
							</SheetTrigger>
							<SheetContent side="left" className="w-80 p-0">
								<SheetTitle className="sr-only">Menu Navigasi</SheetTitle>
								<SidebarContent
									session={session}
									chatSessions={chatSessions || []}
									sessionsLoading={sessionsLoading}
									onLinkClick={handleMobileLinkClick}
								/>
							</SheetContent>
						</Sheet>

						<div className="flex items-center gap-2">
							<img 
								src="/aidorama-logo-trans.png" 
								alt="AiDorama Logo" 
								className="h-8 w-8 object-contain"
							/>
							<h1 className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text font-bold font-sans text-lg text-transparent">
								AiDorama
							</h1>
						</div>

						<ModeToggle />
					</div>
				</div>
			)}

			{/* Desktop Sidebar */}
			<div className="hidden w-80 flex-shrink-0 border-r bg-card/80 backdrop-blur-sm lg:flex">
				<SidebarContent
					session={session}
					chatSessions={chatSessions || []}
					sessionsLoading={sessionsLoading}
				/>
			</div>

			{/* Main Content */}
			<div className={`flex-1 ${!isChatPage ? "pt-16 lg:pt-0" : "pt-0"} ${isChatPage ? "flex flex-col overflow-hidden" : ""}`}>{children}</div>
		</div>
	);
}
