"use client";

import { useQuery } from "@tanstack/react-query";
import {
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
import { Skeleton } from "@/components/ui/skeleton";
import { useClientDate } from "@/hooks/use-client-date";
import { authClient } from "@/lib/auth-client";
import { trpc } from "@/utils/trpc";

interface SidebarLayoutProps {
	children: React.ReactNode;
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
	const recentSessions = chatSessions?.slice(0, 4) || [];

	return (
		<div className="flex h-screen flex-col">
			{/* Header */}
			<div className="flex-shrink-0 border-b p-4">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<img 
							src="/aidorama-logo-trans.png" 
							alt="AiDorama Logo" 
							className="h-8 w-8 object-contain"
						/>
						<h1 className="font-semibold text-lg">AiDorama</h1>
					</div>
					<ModeToggle />
				</div>
			</div>

			<div className="flex-1 overflow-hidden p-6">
				{/* Quick Actions */}
				<div className="mb-8">
					<div className="mb-4 flex items-center gap-2">
						<h3 className="font-semibold text-sm">Menu Cepat</h3>
						<div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
					</div>
					<div className="flex flex-wrap gap-2">
						<Link href="/" onClick={onLinkClick}>
							<Button
								variant="outline"
								size="sm"
								className="justify-start bg-background/50 hover:bg-muted/50"
							>
								<Sparkles className="mr-2 h-4 w-4" />
								Jelajah
							</Button>
						</Link>
						<Link href="/characters/create" onClick={onLinkClick}>
							<Button
								variant="outline"
								size="sm"
								className="justify-start bg-background/50 hover:bg-muted/50"
							>
								<Plus className="mr-2 h-4 w-4" />
								Bikin Karakter
							</Button>
						</Link>

						<Link href="/characters/my" onClick={onLinkClick}>
							<Button
								variant="outline"
								size="sm"
								className="justify-start bg-background/50 hover:bg-muted/50"
							>
								<User className="mr-2 h-4 w-4" />
								Karakterku
							</Button>
						</Link>
					</div>
				</div>

				{/* Recent Chat History */}
				<div className="min-h-0 flex-1">
					<div className="mb-4 flex items-center justify-between">
						<div className="flex items-center gap-2">
							<Clock className="h-4 w-4 text-muted-foreground" />
							<h3 className="font-semibold text-sm">Chat Terakhir</h3>
						</div>
						<Link href="/chats" onClick={onLinkClick}>
							<Button
								variant="ghost"
								size="sm"
								className="text-xs hover:bg-muted/50"
							>
								Lihat Semua
							</Button>
						</Link>
					</div>

					<div className="h-full overflow-y-auto">
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
								<p className="mb-3 text-muted-foreground text-sm">
									Belum ada chat nih
								</p>
								{/* <Link href="/characters" onClick={onLinkClick}>
									<Button size="sm" className="bg-primary/90 hover:bg-primary">
										<Sparkles className="mr-2 h-4 w-4" />
										Mulai Chat Yuk
									</Button>
								</Link> */}
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
						)}
					</div>
				</div>
			</div>

			{/* Bottom Section - User Account Only */}
			<div className="flex-shrink-0 border-t bg-muted/20 p-4">
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
			</div>
		</div>
	);
}

export default function SidebarLayout({ children }: SidebarLayoutProps) {
	const router = useRouter();
	const pathname = usePathname();
	const { data: session, isPending } = authClient.useSession();
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

	// Fetch user's chat sessions for sidebar
	const { data: chatSessions, isLoading: sessionsLoading } = useQuery(
		trpc.chat.getUserSessions.queryOptions(),
	);

	useEffect(() => {
		if (!session && !isPending) {
			router.push("/login");
		}
	}, [session, isPending]);

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

	if (!session) {
		return null; // Will redirect to login
	}

	const handleMobileLinkClick = () => {
		setIsMobileMenuOpen(false);
	};

	return (
		<div className="flex h-screen bg-gradient-to-br from-background to-muted/20">
			{/* Mobile Header */}
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

			{/* Desktop Sidebar */}
			<div className="hidden w-80 flex-shrink-0 border-r bg-card/80 backdrop-blur-sm lg:flex">
				<SidebarContent
					session={session}
					chatSessions={chatSessions || []}
					sessionsLoading={sessionsLoading}
				/>
			</div>

			{/* Main Content */}
			<div className="flex-1 overflow-y-auto pt-16 lg:pt-0">{children}</div>
		</div>
	);
}
