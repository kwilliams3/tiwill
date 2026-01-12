import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useChat, Conversation } from "@/hooks/useChat";
import { useAuth } from "@/hooks/useAuth";
import { useOnlinePresence } from "@/hooks/useOnlinePresence";
import { OnlineIndicator } from "@/components/OnlineIndicator";
import { MessageCircle, Search, UserPlus, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

interface ChatListProps {
  onSelectConversation: (conversationId: string) => void;
  selectedId: string | null;
}

interface UserSearchResult {
  id: string;
  user_id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
}

export function ChatList({ onSelectConversation, selectedId }: ChatListProps) {
  const { user } = useAuth();
  const { conversations, loading, createConversation } = useChat();
  const { isUserOnline } = useOnlinePresence();
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [creatingConversation, setCreatingConversation] = useState<string | null>(null);

  const getOtherParticipant = (conversation: Conversation) => {
    return conversation.participants.find((p) => p.user_id !== user?.id);
  };

  // Search for users when typing
  useEffect(() => {
    const searchUsers = async () => {
      if (search.length < 2) {
        setSearchResults([]);
        return;
      }

      setSearchLoading(true);
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, user_id, username, display_name, avatar_url")
          .neq("user_id", user?.id || "")
          .or(`username.ilike.%${search}%,display_name.ilike.%${search}%`)
          .limit(10);

        if (error) throw error;
        setSearchResults(data || []);
      } catch (error) {
        console.error("Error searching users:", error);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    };

    const debounce = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounce);
  }, [search, user?.id]);

  const handleStartConversation = async (targetUserId: string) => {
    setCreatingConversation(targetUserId);
    try {
      const conversationId = await createConversation(targetUserId);
      if (conversationId) {
        onSelectConversation(conversationId);
        setSearch("");
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Error creating conversation:", error);
    } finally {
      setCreatingConversation(null);
    }
  };

  const filteredConversations = conversations.filter((conv) => {
    if (search.length < 2) return true;
    const other = getOtherParticipant(conv);
    const name = other?.profile?.display_name || other?.profile?.username || "";
    return name.toLowerCase().includes(search.toLowerCase());
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse text-muted-foreground">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un utilisateur..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-9"
          />
          {search && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
              onClick={() => {
                setSearch("");
                setSearchResults([]);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Search Results - New Conversations */}
        <AnimatePresence>
          {search.length >= 2 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="border-b border-border"
            >
              <div className="p-3 bg-muted/30">
                <h3 className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                  <UserPlus className="h-3.5 w-3.5" />
                  Nouvelle conversation
                </h3>
              </div>
              
              {searchLoading ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
                  Recherche...
                </div>
              ) : searchResults.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Aucun utilisateur trouvé
                </div>
              ) : (
                searchResults.map((result) => (
                  <motion.button
                    key={result.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => handleStartConversation(result.user_id)}
                    disabled={creatingConversation === result.user_id}
                    className="w-full p-3 flex items-center gap-3 hover:bg-accent/50 transition-colors disabled:opacity-50"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={result.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary text-sm">
                        {(result.display_name || result.username || "?").slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="font-medium truncate">
                        {result.display_name || result.username || "Utilisateur"}
                      </p>
                      {result.username && (
                        <p className="text-xs text-muted-foreground truncate">
                          @{result.username}
                        </p>
                      )}
                    </div>
                    {creatingConversation === result.user_id ? (
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    ) : (
                      <MessageCircle className="h-5 w-5 text-primary" />
                    )}
                  </motion.button>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Existing Conversations */}
        {filteredConversations.length === 0 && search.length < 2 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-4">
            <MessageCircle className="h-12 w-12 mb-2 opacity-50" />
            <p className="text-center mb-2">Aucune conversation</p>
            <p className="text-xs text-center">
              Recherchez un utilisateur pour démarrer une conversation
            </p>
          </div>
        ) : (
          <>
            {search.length >= 2 && filteredConversations.length > 0 && (
              <div className="p-3 bg-muted/30 border-b border-border">
                <h3 className="text-xs font-medium text-muted-foreground">
                  Conversations existantes
                </h3>
              </div>
            )}
            {filteredConversations.map((conversation) => {
              const other = getOtherParticipant(conversation);
              const displayName = other?.profile?.display_name || other?.profile?.username || "Utilisateur";
              const avatarUrl = other?.profile?.avatar_url;
              const initials = displayName.slice(0, 2).toUpperCase();
              const isOnline = other ? isUserOnline(other.user_id) : false;

              return (
                <button
                  key={conversation.id}
                  onClick={() => onSelectConversation(conversation.id)}
                  className={`w-full p-4 flex items-center gap-3 hover:bg-accent/50 transition-colors border-b border-border ${
                    selectedId === conversation.id ? "bg-accent" : ""
                  }`}
                >
                  <div className="relative">
                    <Avatar>
                      <AvatarImage src={avatarUrl || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    {/* Online indicator */}
                    <div className="absolute -bottom-0.5 -right-0.5">
                      <OnlineIndicator isOnline={isOnline} size="sm" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">{displayName}</span>
                        {isOnline && (
                          <span className="text-[10px] text-emerald-500 font-medium">
                            en ligne
                          </span>
                        )}
                      </div>
                      {conversation.last_message && (
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(conversation.last_message.created_at), {
                            addSuffix: true,
                            locale: fr,
                          })}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-sm text-muted-foreground truncate">
                        {conversation.last_message?.content || "Démarrer la conversation"}
                      </p>
                      {(conversation.unread_count ?? 0) > 0 && (
                        <Badge variant="default" className="ml-2 h-5 min-w-5 flex items-center justify-center">
                          {conversation.unread_count}
                        </Badge>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
