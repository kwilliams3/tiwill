import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface UserResult {
  id: string;
  user_id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  level: number;
}

interface TrendingHashtag {
  hashtag: string;
  count: number;
}

export function useDiscovery() {
  const [users, setUsers] = useState<UserResult[]>([]);
  const [trendingHashtags, setTrendingHashtags] = useState<TrendingHashtag[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchTrendingHashtags();
  }, []);

  useEffect(() => {
    if (searchQuery.length >= 2) {
      searchUsers(searchQuery);
    } else {
      setUsers([]);
    }
  }, [searchQuery]);

  const fetchTrendingHashtags = async () => {
    try {
      const { data: posts, error } = await supabase
        .from("posts")
        .select("hashtags")
        .not("hashtags", "is", null)
        .gt("expires_at", new Date().toISOString());

      if (error) throw error;

      const hashtagCounts: Record<string, number> = {};
      posts?.forEach((post) => {
        if (post.hashtags && Array.isArray(post.hashtags)) {
          post.hashtags.forEach((tag: string) => {
            const normalizedTag = tag.toLowerCase().replace("#", "");
            hashtagCounts[normalizedTag] = (hashtagCounts[normalizedTag] || 0) + 1;
          });
        }
      });

      const sorted = Object.entries(hashtagCounts)
        .map(([hashtag, count]) => ({ hashtag, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      setTrendingHashtags(sorted);
    } catch (error) {
      console.error("Error fetching trending hashtags:", error);
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = async (query: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, user_id, username, display_name, avatar_url, bio, level")
        .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
        .limit(20);

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error("Error searching users:", error);
    }
  };

  const searchByHashtag = async (hashtag: string) => {
    try {
      const { data, error } = await supabase
        .from("posts")
        .select(`
          *,
          profiles:user_id (
            username,
            display_name,
            avatar_url
          )
        `)
        .contains("hashtags", [hashtag])
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error searching by hashtag:", error);
      return [];
    }
  };

  return {
    users,
    trendingHashtags,
    loading,
    searchQuery,
    setSearchQuery,
    searchByHashtag,
  };
}
