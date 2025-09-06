"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Shield, 
  Users, 
  Bot, 
  MessageCircle, 
  Eye, 
  EyeOff, 
  Search,
  Calendar,
  User,
  Settings,
  BarChart3
} from "lucide-react";
import SidebarLayout from "@/components/sidebar-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsAdmin } from "@/lib/admin";
import { trpc } from "@/utils/trpc";
import { useClientDate } from "@/hooks/use-client-date";
import { toast } from "sonner";

export default function AdminDashboard() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { formatDate } = useClientDate();
  const isAdmin = useIsAdmin();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
  const [charactersPage, setCharactersPage] = useState(0);
  const [sessionsPage, setSessionsPage] = useState(0);
  const [hasMoreCharacters, setHasMoreCharacters] = useState(true);
  const [hasMoreSessions, setHasMoreSessions] = useState(true);

  // Redirect if not admin
  useEffect(() => {
    if (!isAdmin) {
      router.push("/");
    }
  }, [isAdmin, router]);

  if (!isAdmin) {
    return null;
  }

  // Fetch dashboard stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    ...trpc.admin.getDashboardStats.queryOptions(),
  });

  // Fetch characters with pagination
  const { data: charactersData, isLoading: charactersLoading } = useQuery({
    ...trpc.admin.getAllCharacters.queryOptions({
      search: searchTerm,
      limit: 20,
      offset: charactersPage * 20,
    }),
  });

  // Fetch chat sessions with pagination
  const { data: sessionsData, isLoading: sessionsLoading } = useQuery({
    ...trpc.admin.getAllChatSessions.queryOptions({
      limit: 20,
      offset: sessionsPage * 20,
    }),
  });

  // Extract data and check if there are more items
  const characters = charactersData || [];
  const chatSessions = sessionsData || [];
  
  // Check if there are more items to load
  useEffect(() => {
    setHasMoreCharacters(characters.length === 20);
    setHasMoreSessions(chatSessions.length === 20);
  }, [characters.length, chatSessions.length]);

  // Reset pagination when search term changes
  useEffect(() => {
    setCharactersPage(0);
    setSessionsPage(0);
  }, [searchTerm]);

  // Fetch messages for selected session
  const { data: sessionMessages } = useQuery({
    ...trpc.admin.getSessionMessages.queryOptions({
      sessionId: selectedSessionId!,
    }),
    enabled: !!selectedSessionId,
  });

  // Toggle character visibility mutation
  const toggleVisibilityMutation = useMutation({
    mutationFn: trpc.admin.toggleCharacterVisibility.mutate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trpc.admin.getAllCharacters.getQueryKey() });
      queryClient.invalidateQueries({ queryKey: trpc.admin.getDashboardStats.getQueryKey() });
      toast.success("Visibility updated successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update visibility");
    },
  });

  const handleToggleVisibility = (characterId: number, currentVisibility: boolean) => {
    toggleVisibilityMutation.mutate({
      characterId,
      isPublic: !currentVisibility,
    });
  };

  const loadMoreCharacters = () => {
    setCharactersPage(prev => prev + 1);
  };

  const loadMoreSessions = () => {
    setSessionsPage(prev => prev + 1);
  };

  return (
    <SidebarLayout requireAuth={true}>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
        <div className="overflow-auto p-3 sm:p-4 lg:p-6">
          <div className="mx-auto max-w-7xl">
            {/* Header */}
            <div className="mb-4 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500/20 to-red-500/10 ring-1 ring-red-500/20 sm:h-12 sm:w-12">
                <Shield className="h-5 w-5 text-red-500 sm:h-6 sm:w-6" />
              </div>
              <div className="min-w-0">
                <h1 className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text font-bold font-sans text-xl text-transparent sm:text-2xl">
                  Admin Dashboard
                </h1>
                <p className="text-muted-foreground text-xs sm:text-sm">
                  Manage characters and monitor user activity
                </p>
              </div>
            </div>

            {/* Stats Cards */}
            {statsLoading ? (
              <div className="mb-4 grid grid-cols-2 gap-3 sm:mb-6 sm:grid-cols-4 sm:gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i} className="border-primary/10 bg-card/50 backdrop-blur-sm">
                    <CardContent className="p-3 sm:p-6">
                      <div className="h-12 animate-pulse rounded bg-muted sm:h-16" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="mb-4 grid grid-cols-2 gap-3 sm:mb-6 sm:grid-cols-4 sm:gap-4">
                <Card className="border-primary/10 bg-card/50 backdrop-blur-sm">
                  <CardContent className="p-3 sm:p-6">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/20 sm:h-10 sm:w-10">
                        <Bot className="h-4 w-4 text-blue-500 sm:h-5 sm:w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-muted-foreground text-xs sm:text-sm">Total Characters</p>
                        <p className="font-bold text-lg sm:text-2xl">{stats?.totalCharacters || 0}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-primary/10 bg-card/50 backdrop-blur-sm">
                  <CardContent className="p-3 sm:p-6">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/20 sm:h-10 sm:w-10">
                        <Eye className="h-4 w-4 text-green-500 sm:h-5 sm:w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-muted-foreground text-xs sm:text-sm">Public Characters</p>
                        <p className="font-bold text-lg sm:text-2xl">{stats?.publicCharacters || 0}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-primary/10 bg-card/50 backdrop-blur-sm">
                  <CardContent className="p-3 sm:p-6">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/20 sm:h-10 sm:w-10">
                        <MessageCircle className="h-4 w-4 text-purple-500 sm:h-5 sm:w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-muted-foreground text-xs sm:text-sm">Total Sessions</p>
                        <p className="font-bold text-lg sm:text-2xl">{stats?.totalSessions || 0}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-primary/10 bg-card/50 backdrop-blur-sm">
                  <CardContent className="p-3 sm:p-6">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/20 sm:h-10 sm:w-10">
                        <Users className="h-4 w-4 text-orange-500 sm:h-5 sm:w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-muted-foreground text-xs sm:text-sm">Total Users</p>
                        <p className="font-bold text-lg sm:text-2xl">{stats?.totalUsers || 0}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Main Content Tabs */}
            <Tabs defaultValue="characters" className="space-y-4 sm:space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="characters" className="text-xs sm:text-sm">Character Management</TabsTrigger>
                <TabsTrigger value="chats" className="text-xs sm:text-sm">Chat Histories</TabsTrigger>
              </TabsList>

              {/* Characters Tab */}
              <TabsContent value="characters" className="space-y-4">
                <Card className="border-primary/10 bg-card/50 backdrop-blur-sm">
                  <CardHeader className="p-3 sm:p-6">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                        <Bot className="h-4 w-4 sm:h-5 sm:w-5" />
                        All Characters
                      </CardTitle>
                      <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          placeholder="Search characters..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 text-sm"
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-6">
                    {charactersLoading ? (
                      <div className="space-y-3 sm:space-y-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div key={i} className="flex items-center gap-3 rounded-lg border p-3 sm:gap-4 sm:p-4">
                            <div className="h-10 w-10 animate-pulse rounded-lg bg-muted sm:h-12 sm:w-12" />
                            <div className="flex-1 space-y-2">
                              <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
                              <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
                            </div>
                            <div className="h-6 w-16 animate-pulse rounded bg-muted" />
                          </div>
                        ))}
                      </div>
                    ) : characters && characters.length > 0 ? (
                      <div className="space-y-3 sm:space-y-4">
                        {characters.map((character: any) => (
                          <div
                            key={character.id}
                            className="flex flex-col gap-3 rounded-lg border bg-background/50 p-3 transition-all hover:bg-muted/50 sm:flex-row sm:items-center sm:gap-4 sm:p-4"
                          >
                            {/* Avatar */}
                            <div className="flex-shrink-0">
                              {character.avatarUrl ? (
                                <img
                                  src={character.avatarUrl}
                                  alt={character.name}
                                  className="h-10 w-10 rounded-lg object-cover ring-2 ring-background sm:h-12 sm:w-12"
                                />
                              ) : (
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 sm:h-12 sm:w-12">
                                  <span className="font-semibold text-primary text-sm sm:text-lg">
                                    {character.name.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Character Info */}
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                <h3 className="font-semibold text-base sm:text-lg">{character.name}</h3>
                                <Badge
                                  variant={character.isPublic ? "default" : "secondary"}
                                  className={`text-xs ${
                                    character.isPublic
                                      ? "bg-green-500/20 text-green-700 hover:bg-green-500/30"
                                      : "bg-gray-500/20 text-gray-700 hover:bg-gray-500/30"
                                  }`}
                                >
                                  {character.isPublic ? "Public" : "Private"}
                                </Badge>
                              </div>
                              <p className="text-muted-foreground text-xs sm:text-sm">
                                by {character.user?.displayName || character.user?.name || character.user?.username || "Unknown"}
                              </p>
                              <p className="text-muted-foreground text-xs sm:text-sm line-clamp-2">
                                {character.synopsis}
                              </p>
                              <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground sm:mt-2">
                                <Calendar className="h-3 w-3" />
                                Created {formatDate(character.createdAt, { day: "numeric", month: "short", year: "numeric" })}
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-between gap-2 sm:justify-end">
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground sm:text-sm">
                                  {character.isPublic ? "Public" : "Private"}
                                </span>
                                <Switch
                                  checked={character.isPublic}
                                  onCheckedChange={() => handleToggleVisibility(character.id, character.isPublic)}
                                  disabled={toggleVisibilityMutation.isPending}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-12 text-center">
                        <Bot className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
                        <h3 className="mb-2 font-semibold text-lg">No characters found</h3>
                        <p className="text-muted-foreground text-sm">
                          {searchTerm ? "No characters match your search." : "No characters have been created yet."}
                        </p>
                      </div>
                    )}

                    {/* Load More Button for Characters */}
                    {characters.length > 0 && hasMoreCharacters && (
                      <div className="mt-4 text-center">
                        <Button
                          variant="outline"
                          onClick={loadMoreCharacters}
                          disabled={charactersLoading}
                          className="border-primary/20 bg-background/50 backdrop-blur-sm hover:bg-muted/50"
                        >
                          {charactersLoading ? "Loading..." : "Load More Characters"}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Chat Histories Tab */}
              <TabsContent value="chats" className="space-y-4">
                <Card className="border-primary/10 bg-card/50 backdrop-blur-sm">
                  <CardHeader className="p-3 sm:p-6">
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                      <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                      All Chat Sessions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-6">
                    {sessionsLoading ? (
                      <div className="space-y-3 sm:space-y-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div key={i} className="flex items-center gap-3 rounded-lg border p-3 sm:gap-4 sm:p-4">
                            <div className="h-8 w-8 animate-pulse rounded-full bg-muted sm:h-10 sm:w-10" />
                            <div className="flex-1 space-y-2">
                              <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
                              <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
                            </div>
                            <div className="h-6 w-16 animate-pulse rounded bg-muted sm:h-8 sm:w-20" />
                          </div>
                        ))}
                      </div>
                    ) : chatSessions && chatSessions.length > 0 ? (
                      <div className="space-y-3 sm:space-y-4">
                        {chatSessions.map((session: any) => (
                          <div
                            key={session.id}
                            className="flex flex-col gap-3 rounded-lg border bg-background/50 p-3 transition-all hover:bg-muted/50 sm:flex-row sm:items-center sm:gap-4 sm:p-4"
                          >
                            {/* Character Avatar */}
                            <div className="flex-shrink-0">
                              {session.character?.avatarUrl ? (
                                <img
                                  src={session.character.avatarUrl}
                                  alt={session.character.name}
                                  className="h-8 w-8 rounded-full object-cover ring-2 ring-background sm:h-10 sm:w-10"
                                />
                              ) : (
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/10 sm:h-10 sm:w-10">
                                  <span className="font-semibold text-primary text-xs sm:text-sm">
                                    {session.character?.name?.charAt(0)?.toUpperCase() || "?"}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Session Info */}
                            <div className="min-w-0 flex-1">
                              <h3 className="font-semibold text-sm sm:text-lg">{session.title}</h3>
                              <div className="flex flex-col gap-1 text-xs text-muted-foreground sm:flex-row sm:items-center sm:gap-4 sm:text-sm">
                                <div className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  {session.user?.displayName || session.user?.name || session.user?.username || "Unknown"}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Bot className="h-3 w-3" />
                                  {session.character?.name || "Unknown Character"}
                                </div>
                              </div>
                              <div className="mt-1 flex flex-col gap-1 text-xs text-muted-foreground sm:flex-row sm:items-center sm:gap-4">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  <span className="font-medium">Started:</span>
                                  {formatDate(session.createdAt, { 
                                    day: "numeric", 
                                    month: "short", 
                                    hour: "2-digit",
                                    minute: "2-digit"
                                  })}
                                </div>
                                <div className="flex items-center gap-1">
                                  <MessageCircle className="h-3 w-3" />
                                  <span className="font-medium">Last chat:</span>
                                  {formatDate(session.updatedAt, { 
                                    day: "numeric", 
                                    month: "short", 
                                    hour: "2-digit",
                                    minute: "2-digit"
                                  })}
                                </div>
                              </div>
                            </div>

                            {/* Actions */}
                            <Sheet>
                              <SheetTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedSessionId(session.id)}
                                  className="text-xs sm:text-sm"
                                >
                                  <Settings className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
                                  <span className="hidden sm:inline">View Messages</span>
                                  <span className="sm:hidden">View</span>
                                </Button>
                              </SheetTrigger>
                              <SheetContent 
                                side="right" 
                                className="w-full sm:w-[600px] lg:w-[800px] xl:w-[1000px]"
                              >
                                <SheetHeader className="pb-4">
                                  <SheetTitle className="text-left">
                                    Chat Messages - {session.title}
                                  </SheetTitle>
                                </SheetHeader>
                                <ScrollArea className="h-[calc(100vh-120px)]">
                                  <div className="space-y-4 pr-4">
                                    {sessionMessages?.map((message: any, index: number) => (
                                      <div
                                        key={message.id}
                                        className={`flex gap-3 ${
                                          message.role === "user" ? "justify-end" : "justify-start"
                                        }`}
                                      >
                                        <div
                                          className={`max-w-[80%] rounded-lg p-3 ${
                                            message.role === "user"
                                              ? "bg-primary text-primary-foreground"
                                              : "bg-muted"
                                          }`}
                                        >
                                          <p className="text-sm leading-relaxed">{message.content}</p>
                                          <p className="text-xs opacity-70 mt-2">
                                            {formatDate(message.createdAt, {
                                              hour: "2-digit",
                                              minute: "2-digit",
                                              day: "numeric",
                                              month: "short",
                                            })}
                                          </p>
                                        </div>
                                      </div>
                                    ))}
                                    {!sessionMessages || sessionMessages.length === 0 ? (
                                      <div className="flex items-center justify-center py-8">
                                        <p className="text-muted-foreground text-sm">
                                          No messages found in this session.
                                        </p>
                                      </div>
                                    ) : null}
                                  </div>
                                </ScrollArea>
                              </SheetContent>
                            </Sheet>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-12 text-center">
                        <MessageCircle className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
                        <h3 className="mb-2 font-semibold text-lg">No chat sessions found</h3>
                        <p className="text-muted-foreground text-sm">
                          No chat sessions have been created yet.
                        </p>
                      </div>
                    )}

                    {/* Load More Button for Sessions */}
                    {chatSessions.length > 0 && hasMoreSessions && (
                      <div className="mt-4 text-center">
                        <Button
                          variant="outline"
                          onClick={loadMoreSessions}
                          disabled={sessionsLoading}
                          className="border-primary/20 bg-background/50 backdrop-blur-sm hover:bg-muted/50"
                        >
                          {sessionsLoading ? "Loading..." : "Load More Sessions"}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}
