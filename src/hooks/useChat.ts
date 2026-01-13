import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { RealtimeChannel } from "@supabase/supabase-js";

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read_at: string | null;
}

export interface Conversation {
  id: string;
  created_at: string;
  updated_at: string;
  participants: {
    user_id: string;
    profile: {
      display_name: string | null;
      avatar_url: string | null;
      username: string | null;
    } | null;
  }[];
  last_message?: Message;
  unread_count?: number;
}

export interface TypingUser {
  user_id: string;
  display_name: string;
}

export function useChat() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConversations = useCallback(async () => {
    if (!user) return;

    try {
      const { data: participantData, error: partError } = await supabase
        .from("conversation_participants")
        .select("conversation_id")
        .eq("user_id", user.id);

      if (partError) throw partError;

      if (!participantData?.length) {
        setConversations([]);
        setLoading(false);
        return;
      }

      const conversationIds = participantData.map((p) => p.conversation_id);

      const { data: convData, error: convError } = await supabase
        .from("conversations")
        .select("*")
        .in("id", conversationIds)
        .order("updated_at", { ascending: false });

      if (convError) throw convError;

      const conversationsWithDetails = await Promise.all(
        (convData || []).map(async (conv) => {
          // Get participants with profiles
          const { data: participants } = await supabase
            .from("conversation_participants")
            .select("user_id")
            .eq("conversation_id", conv.id);

          const participantsWithProfiles = await Promise.all(
            (participants || []).map(async (p) => {
              const { data: profile } = await supabase
                .from("profiles")
                .select("display_name, avatar_url, username")
                .eq("user_id", p.user_id)
                .maybeSingle();
              return { user_id: p.user_id, profile };
            })
          );

          // Get last message
          const { data: messages } = await supabase
            .from("messages")
            .select("*")
            .eq("conversation_id", conv.id)
            .order("created_at", { ascending: false })
            .limit(1);

          // Get unread count
          const { count } = await supabase
            .from("messages")
            .select("*", { count: "exact", head: true })
            .eq("conversation_id", conv.id)
            .neq("sender_id", user.id)
            .is("read_at", null);

          return {
            ...conv,
            participants: participantsWithProfiles,
            last_message: messages?.[0],
            unread_count: count || 0,
          };
        })
      );

      setConversations(conversationsWithDetails);
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const createConversation = async (otherUserId: string) => {
    if (!user) return null;

    try {
      // Check if conversation already exists
      const { data: myParticipations } = await supabase
        .from("conversation_participants")
        .select("conversation_id")
        .eq("user_id", user.id);

      if (myParticipations?.length) {
        for (const part of myParticipations) {
          const { data: otherPart } = await supabase
            .from("conversation_participants")
            .select("*")
            .eq("conversation_id", part.conversation_id)
            .eq("user_id", otherUserId)
            .maybeSingle();

          if (otherPart) {
            return part.conversation_id;
          }
        }
      }

      // Create new conversation
      const { data: conv, error: convError } = await supabase
        .from("conversations")
        .insert({})
        .select()
        .single();

      if (convError) throw convError;

      // Add current user as participant first (required by RLS)
      const { error: selfPartError } = await supabase
        .from("conversation_participants")
        .insert({ conversation_id: conv.id, user_id: user.id });

      if (selfPartError) throw selfPartError;

      // Now add the other participant (allowed because we're already a participant)
      const { error: otherPartError } = await supabase
        .from("conversation_participants")
        .insert({ conversation_id: conv.id, user_id: otherUserId });

      if (otherPartError) throw otherPartError;

      await fetchConversations();
      return conv.id;
    } catch (error) {
      console.error("Error creating conversation:", error);
      return null;
    }
  };

  return {
    conversations,
    loading,
    createConversation,
    refetch: fetchConversations,
  };
}

export function useConversation(conversationId: string | null) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  useEffect(() => {
    if (!conversationId || !user) {
      setMessages([]);
      setLoading(false);
      return;
    }

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching messages:", error);
      } else {
        setMessages(data || []);
      }
      setLoading(false);
    };

    fetchMessages();

    // Subscribe to new messages
    const messagesChannel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    // Subscribe to presence for typing and online status
    const presenceChannel = supabase.channel(`presence:${conversationId}`, {
      config: { presence: { key: user.id } },
    });

    presenceChannel
      .on("presence", { event: "sync" }, () => {
        const state = presenceChannel.presenceState();
        const online: string[] = [];
        const typing: TypingUser[] = [];

        Object.entries(state).forEach(([userId, presences]) => {
          online.push(userId);
          const presence = presences[0] as { typing?: boolean; display_name?: string };
          if (presence?.typing && userId !== user.id) {
            typing.push({
              user_id: userId,
              display_name: presence.display_name || "Quelqu'un",
            });
          }
        });

        setOnlineUsers(online);
        setTypingUsers(typing);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await presenceChannel.track({
            online_at: new Date().toISOString(),
            typing: false,
          });
        }
      });

    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(presenceChannel);
    };
  }, [conversationId, user]);

  const sendMessage = async (content: string) => {
    if (!user || !conversationId || !content.trim()) return;

    const { error } = await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_id: user.id,
      content: content.trim(),
    });

    if (error) {
      console.error("Error sending message:", error);
    }
  };

  const setTyping = async (isTyping: boolean, displayName: string) => {
    if (!conversationId || !user) return;

    const channel = supabase.channel(`presence:${conversationId}`);
    await channel.track({
      online_at: new Date().toISOString(),
      typing: isTyping,
      display_name: displayName,
    });
  };

  const markAsRead = async () => {
    if (!user || !conversationId) return;

    await supabase
      .from("messages")
      .update({ read_at: new Date().toISOString() })
      .eq("conversation_id", conversationId)
      .neq("sender_id", user.id)
      .is("read_at", null);
  };

  return {
    messages,
    loading,
    typingUsers,
    onlineUsers,
    sendMessage,
    setTyping,
    markAsRead,
  };
}
