import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface Post {
  id: string;
  user_id: string;
  content: string | null;
  media_url: string | null;
  media_type: string | null;
  hashtags: string[] | null;
  tagged_users: string[] | null;
  location: string | null;
  is_anonymous: boolean;
  likes_count: number;
  comments_count: number;
  views_count: number;
  expires_at: string;
  created_at: string;
  profile?: {
    username: string | null;
    display_name: string | null;
    avatar_url: string | null;
    level: number;
  };
}

export function usePosts() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = useCallback(async () => {
    try {
      const { data: postsData, error } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      // Fetch profiles separately
      const userIds = [...new Set(postsData?.map(p => p.user_id) || [])];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, username, display_name, avatar_url, level")
        .in("user_id", userIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      const postsWithProfiles = (postsData || []).map(post => ({
        ...post,
        profile: profileMap.get(post.user_id),
      }));

      setPosts(postsWithProfiles);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();

    const channel = supabase
      .channel("posts-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "posts" }, () => fetchPosts())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchPosts]);

  const createPost = async (content: string, mediaUrl?: string, mediaType?: string, hashtags?: string[], location?: string, isAnonymous?: boolean) => {
    if (!user) return { error: new Error("No user") };

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 72);

    try {
      const { error } = await supabase.from("posts").insert({
        user_id: user.id,
        content,
        media_url: mediaUrl,
        media_type: mediaType || "text",
        hashtags,
        location,
        is_anonymous: isAnonymous || false,
        expires_at: expiresAt.toISOString(),
      });

      if (error) throw error;
      await fetchPosts();
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const deletePost = async (postId: string) => {
    const { error } = await supabase.from("posts").delete().eq("id", postId).eq("user_id", user?.id);
    if (!error) await fetchPosts();
    return { error };
  };

  return { posts, loading, createPost, deletePost, refetch: fetchPosts };
}

export function usePostReactions(postId: string) {
  const { user } = useAuth();
  const [userReaction, setUserReaction] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      supabase.from("post_reactions").select("emoji").eq("post_id", postId).eq("user_id", user.id).maybeSingle()
        .then(({ data }) => setUserReaction(data?.emoji || null));
    }
  }, [user, postId]);

  const toggleReaction = async (emoji: string) => {
    if (!user) return;
    if (userReaction === emoji) {
      await supabase.from("post_reactions").delete().eq("post_id", postId).eq("user_id", user.id);
      setUserReaction(null);
    } else {
      await supabase.from("post_reactions").upsert({ post_id: postId, user_id: user.id, emoji });
      setUserReaction(emoji);
    }
  };

  return { userReaction, toggleReaction };
}
