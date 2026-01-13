import { useEffect, useRef, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useConversation } from "@/hooks/useChat";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useOnlinePresence } from "@/hooks/useOnlinePresence";
import { OnlineIndicator } from "@/components/OnlineIndicator";
import { ArrowLeft, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

interface ChatConversationProps {
  conversationId: string;
  onBack: () => void;
}

export function ChatConversation({ conversationId, onBack }: ChatConversationProps) {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { toast } = useToast();
  const { isUserOnline } = useOnlinePresence();
  const { messages, loading, typingUsers, sendMessage, setTyping, markAsRead } =
    useConversation(conversationId);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [otherUser, setOtherUser] = useState<{
    user_id: string;
    display_name: string;
    avatar_url: string | null;
  } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const fetchOtherUser = async () => {
      const { data: participants } = await supabase
        .from("conversation_participants")
        .select("user_id")
        .eq("conversation_id", conversationId);

      const otherUserId = participants?.find((p) => p.user_id !== user?.id)?.user_id;
      if (otherUserId) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("display_name, avatar_url, username")
          .eq("user_id", otherUserId)
          .maybeSingle();

        setOtherUser({
          user_id: otherUserId,
          display_name: profile?.display_name || profile?.username || "Utilisateur",
          avatar_url: profile?.avatar_url,
        });
      }
    };

    fetchOtherUser();
  }, [conversationId, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    markAsRead();
  }, [messages, markAsRead]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);

    // Set typing indicator (best-effort)
    setTyping(true, profile?.display_name || "Quelqu'un").catch(() => {});

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      setTyping(false, profile?.display_name || "").catch(() => {});
    }, 2000);
  };

  const handleSend = async () => {
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      await sendMessage(newMessage);
      setNewMessage("");
      setTyping(false, "").catch(() => {});

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    } catch (err: any) {
      console.error("Send message failed:", err);
      toast({
        title: "Erreur",
        description: err?.message || "Impossible d'envoyer le message",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isOnline = otherUser ? isUserOnline(otherUser.user_id) : false;
  const initials = otherUser?.display_name?.slice(0, 2).toUpperCase() || "??";

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse text-muted-foreground">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border bg-background/95 backdrop-blur">
        <Button variant="ghost" size="icon" onClick={onBack} className="md:hidden">
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <div className="relative">
          <Avatar>
            <AvatarImage src={otherUser?.avatar_url || undefined} />
            <AvatarFallback className="bg-primary/10 text-primary">{initials}</AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-0.5 -right-0.5">
            <OnlineIndicator isOnline={isOnline} size="md" />
          </div>
        </div>

        <div className="flex-1">
          <h3 className="font-semibold">{otherUser?.display_name}</h3>
          <p className="text-xs text-muted-foreground">
            {isOnline ? "En ligne" : "Hors ligne"}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          const isOwn = message.sender_id === user?.id;

          return (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                  isOwn
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "bg-muted rounded-bl-md"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                <p
                  className={`text-xs mt-1 ${
                    isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
                  }`}
                >
                  {formatDistanceToNow(new Date(message.created_at), {
                    addSuffix: true,
                    locale: fr,
                  })}
                </p>
              </div>
            </motion.div>
          );
        })}

        {/* Typing indicator */}
        <AnimatePresence>
          {typingUsers.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="flex justify-start"
            >
              <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-2">
                <div className="flex items-center gap-1">
                  <span className="text-sm text-muted-foreground">
                    {typingUsers[0].display_name} écrit
                  </span>
                  <div className="flex gap-1 ml-1">
                    <motion.span
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                      className="w-1.5 h-1.5 bg-muted-foreground rounded-full"
                    />
                    <motion.span
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                      className="w-1.5 h-1.5 bg-muted-foreground rounded-full"
                    />
                    <motion.span
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                      className="w-1.5 h-1.5 bg-muted-foreground rounded-full"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border bg-background">
        <div className="flex gap-2">
          <Input
            placeholder="Écrire un message..."
            value={newMessage}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className="flex-1"
          />
          <Button onClick={handleSend} disabled={!newMessage.trim() || sending}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
