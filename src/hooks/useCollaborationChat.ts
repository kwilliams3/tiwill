import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface CollaborationMessage {
  id: string;
  collaboration_id: string;
  user_id: string;
  content: string;
  created_at: string;
  sender?: {
    display_name: string | null;
    avatar_url: string | null;
    username: string | null;
  } | null;
}

export function useCollaborationChat(collaborationId: string | null) {
  const [messages, setMessages] = useState<CollaborationMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchMessages = useCallback(async () => {
    if (!collaborationId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      const { data: messagesData, error } = await supabase
        .from("collaboration_messages")
        .select("*")
        .eq("collaboration_id", collaborationId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Fetch sender profiles
      const userIds = [...new Set(messagesData?.map(m => m.user_id) || [])];
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url, username")
        .in("user_id", userIds);

      const profilesMap = new Map(profilesData?.map(p => [p.user_id, p]) || []);

      const enrichedMessages: CollaborationMessage[] = (messagesData || []).map(msg => ({
        ...msg,
        sender: profilesMap.get(msg.user_id) || null
      }));

      setMessages(enrichedMessages);
    } catch (error) {
      console.error("Error fetching collaboration messages:", error);
    } finally {
      setLoading(false);
    }
  }, [collaborationId]);

  const sendMessage = useCallback(async (content: string) => {
    if (!collaborationId || !user || !content.trim()) return false;

    try {
      const { error } = await supabase
        .from("collaboration_messages")
        .insert({
          collaboration_id: collaborationId,
          user_id: user.id,
          content: content.trim()
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error sending message:", error);
      return false;
    }
  }, [collaborationId, user]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!collaborationId) return;

    fetchMessages();

    const channel = supabase
      .channel(`collaboration-chat-${collaborationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "collaboration_messages",
          filter: `collaboration_id=eq.${collaborationId}`
        },
        async (payload) => {
          const newMessage = payload.new as CollaborationMessage;
          
          // Fetch sender profile
          const { data: profileData } = await supabase
            .from("profiles")
            .select("user_id, display_name, avatar_url, username")
            .eq("user_id", newMessage.user_id)
            .single();

          setMessages(prev => [...prev, {
            ...newMessage,
            sender: profileData || null
          }]);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "collaboration_messages",
          filter: `collaboration_id=eq.${collaborationId}`
        },
        (payload) => {
          const deletedId = (payload.old as { id: string }).id;
          setMessages(prev => prev.filter(m => m.id !== deletedId));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [collaborationId, fetchMessages]);

  return {
    messages,
    loading,
    sendMessage,
    refetch: fetchMessages
  };
}
