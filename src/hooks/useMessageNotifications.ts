import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "@/hooks/use-toast";

interface MessagePayload {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

export function useMessageNotifications() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const senderCacheRef = useRef<Map<string, string>>(new Map());

  useEffect(() => {
    if (!user) return;

    // Subscribe to new messages for the current user's conversations
    const channel = supabase
      .channel("global-messages-notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        async (payload) => {
          const message = payload.new as MessagePayload;

          // Don't notify for own messages
          if (message.sender_id === user.id) return;

          // Check if user is a participant of this conversation
          const { data: participant } = await supabase
            .from("conversation_participants")
            .select("id")
            .eq("conversation_id", message.conversation_id)
            .eq("user_id", user.id)
            .maybeSingle();

          if (!participant) return;

          // Don't notify if already viewing this conversation
          const isViewingConversation =
            location.pathname === "/chat" &&
            location.search.includes(message.conversation_id);

          if (isViewingConversation) return;

          // Get sender name (with cache)
          let senderName = senderCacheRef.current.get(message.sender_id);
          if (!senderName) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("display_name, username")
              .eq("user_id", message.sender_id)
              .maybeSingle();

            senderName =
              profile?.display_name || profile?.username || "Quelqu'un";
            senderCacheRef.current.set(message.sender_id, senderName);
          }

          // Truncate message content for display
          const truncatedContent =
            message.content.length > 50
              ? message.content.slice(0, 50) + "..."
              : message.content;

          // Show toast notification
          toast({
            title: `💬 ${senderName}`,
            description: truncatedContent,
            duration: 5000,
          });

          // Navigate to conversation when toast is clicked
          // (Toast click is handled separately if needed)

          // Also show browser notification if page is hidden
          if (
            document.hidden &&
            "Notification" in window &&
            Notification.permission === "granted"
          ) {
            new Notification(`Message de ${senderName}`, {
              body: message.content,
              icon: "/favicon.ico",
              tag: `message-${message.id}`,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, location, navigate]);
}
