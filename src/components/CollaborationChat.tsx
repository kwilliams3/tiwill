import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useCollaborationChat } from "@/hooks/useCollaborationChat";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { MessageCircle, Send, Loader2, X, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, isToday, isYesterday } from "date-fns";
import { fr } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";

interface CollaborationChatProps {
  collaborationId: string;
  collaborationTitle: string;
  isOpen: boolean;
  onClose: () => void;
  participantsCount: number;
}

export function CollaborationChat({
  collaborationId,
  collaborationTitle,
  isOpen,
  onClose,
  participantsCount
}: CollaborationChatProps) {
  const { user } = useAuth();
  const { messages, loading, sendMessage } = useCollaborationChat(
    isOpen ? collaborationId : null
  );
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input when sheet opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    const success = await sendMessage(newMessage);
    if (success) {
      setNewMessage("");
    }
    setIsSending(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) {
      return format(date, "HH:mm");
    } else if (isYesterday(date)) {
      return `Hier ${format(date, "HH:mm")}`;
    }
    return format(date, "d MMM HH:mm", { locale: fr });
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "?";
    return name.charAt(0).toUpperCase();
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col">
        {/* Header */}
        <SheetHeader className="px-4 py-3 border-b border-border/50 bg-card shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-tiwill-purple/20 to-tiwill-blue/20 flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-tiwill-purple" />
              </div>
              <div>
                <SheetTitle className="text-base font-semibold line-clamp-1">
                  {collaborationTitle}
                </SheetTitle>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {participantsCount} participant{participantsCount > 1 ? "s" : ""}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="shrink-0">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </SheetHeader>

        {/* Messages */}
        <ScrollArea className="flex-1 px-4" ref={scrollRef}>
          <div className="py-4 space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-12">
                <MessageCircle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  Aucun message pour l'instant
                </p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  Soyez le premier à écrire !
                </p>
              </div>
            ) : (
              <AnimatePresence initial={false}>
                {messages.map((message, index) => {
                  const isOwn = message.user_id === user?.id;
                  const showAvatar = 
                    !isOwn && 
                    (index === 0 || messages[index - 1].user_id !== message.user_id);

                  return (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className={cn(
                        "flex gap-2",
                        isOwn ? "flex-row-reverse" : "flex-row"
                      )}
                    >
                      {!isOwn && (
                        <div className="w-8 shrink-0">
                          {showAvatar && (
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={message.sender?.avatar_url || ""} />
                              <AvatarFallback className="bg-gradient-to-br from-tiwill-pink to-tiwill-purple text-white text-xs">
                                {getInitials(message.sender?.display_name)}
                              </AvatarFallback>
                            </Avatar>
                          )}
                        </div>
                      )}
                      
                      <div className={cn("max-w-[75%]", isOwn && "text-right")}>
                        {showAvatar && !isOwn && (
                          <p className="text-xs text-muted-foreground mb-1 ml-1">
                            {message.sender?.display_name || "Anonyme"}
                          </p>
                        )}
                        <div
                          className={cn(
                            "rounded-2xl px-4 py-2 inline-block",
                            isOwn
                              ? "bg-primary text-primary-foreground rounded-br-md"
                              : "bg-muted rounded-bl-md"
                          )}
                        >
                          <p className="text-sm whitespace-pre-wrap break-words">
                            {message.content}
                          </p>
                        </div>
                        <p className={cn(
                          "text-[10px] text-muted-foreground mt-1",
                          isOwn ? "mr-1" : "ml-1"
                        )}>
                          {formatMessageTime(message.created_at)}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="p-4 border-t border-border/50 bg-card shrink-0">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              placeholder="Écrire un message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              className="flex-1"
              disabled={isSending}
            />
            <Button 
              onClick={handleSend} 
              disabled={!newMessage.trim() || isSending}
              size="icon"
              className="shrink-0"
            >
              {isSending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
