import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useChat, Conversation } from "@/hooks/useChat";
import { useAuth } from "@/hooks/useAuth";
import { useOnlinePresence } from "@/hooks/useOnlinePresence";
import { OnlineIndicator } from "@/components/OnlineIndicator";
import { MessageCircle, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface ChatListProps {
  onSelectConversation: (conversationId: string) => void;
  selectedId: string | null;
}

export function ChatList({ onSelectConversation, selectedId }: ChatListProps) {
  const { user } = useAuth();
  const { conversations, loading } = useChat();
  const { isUserOnline } = useOnlinePresence();
  const [search, setSearch] = useState("");

  const getOtherParticipant = (conversation: Conversation) => {
    return conversation.participants.find((p) => p.user_id !== user?.id);
  };

  const filteredConversations = conversations.filter((conv) => {
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
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-4">
            <MessageCircle className="h-12 w-12 mb-2 opacity-50" />
            <p className="text-center">Aucune conversation</p>
          </div>
        ) : (
          filteredConversations.map((conversation) => {
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
          })
        )}
      </div>
    </div>
  );
}