import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface UserResult {
  id: string;
  user_id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  level: number;
  points: number;
}

interface TrendingHashtag {
  hashtag: string;
  count: number;
}

export interface SearchFilters {
  category: "all" | "users" | "hashtags" | "posts";
  sortBy: "recent" | "popular" | "level";
  minLevel: number;
  hasAvatar: boolean;
}

const defaultFilters: SearchFilters = {
  category: "all",
  sortBy: "recent",
  minLevel: 1,
  hasAvatar: false,
};

export function useDiscovery() {
  const [users, setUsers] = useState<UserResult[]>([]);
  const [trendingHashtags, setTrendingHashtags] = useState<TrendingHashtag[]>([]);
  const [recentPosts, setRecentPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<SearchFilters>(defaultFilters);
  const [activeCategory, setActiveCategory] = useState<string>("all");

  useEffect(() => {
    fetchTrendingHashtags();
    fetchRecentPosts();
    fetchTopUsers();
  }, []);

  useEffect(() => {
    if (searchQuery.length >= 2) {
      searchUsers(searchQuery);
    } else {
      fetchTopUsers();
    }
  }, [searchQuery, filters]);

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

  const fetchRecentPosts = async () => {
    try {
      const { data, error } = await supabase
        .from("posts")
        .select(`
          *,
          profiles:user_id (
            username,
            display_name,
            avatar_url,
            level
          )
        `)
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      setRecentPosts(data || []);
    } catch (error) {
      console.error("Error fetching recent posts:", error);
    }
  };

  const fetchTopUsers = async () => {
    try {
      let query = supabase
        .from("profiles")
        .select("id, user_id, username, display_name, avatar_url, bio, level, points");

      if (filters.minLevel > 1) {
        query = query.gte("level", filters.minLevel);
      }

      if (filters.hasAvatar) {
        query = query.not("avatar_url", "is", null);
      }

      if (filters.sortBy === "level") {
        query = query.order("level", { ascending: false });
      } else if (filters.sortBy === "popular") {
        query = query.order("points", { ascending: false });
      } else {
        query = query.order("created_at", { ascending: false });
      }

      const { data, error } = await query.limit(20);

      if (error) throw error;
      if (searchQuery.length < 2) {
        setUsers(data || []);
      }
    } catch (error) {
      console.error("Error fetching top users:", error);
    }
  };

  const searchUsers = async (query: string) => {
    try {
      let dbQuery = supabase
        .from("profiles")
        .select("id, user_id, username, display_name, avatar_url, bio, level, points")
        .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`);

      if (filters.minLevel > 1) {
        dbQuery = dbQuery.gte("level", filters.minLevel);
      }

      if (filters.hasAvatar) {
        dbQuery = dbQuery.not("avatar_url", "is", null);
      }

      if (filters.sortBy === "level") {
        dbQuery = dbQuery.order("level", { ascending: false });
      } else if (filters.sortBy === "popular") {
        dbQuery = dbQuery.order("points", { ascending: false });
      }

      const { data, error } = await dbQuery.limit(20);

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
            avatar_url,
            level
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

  const searchPosts = async (query: string) => {
    try {
      const { data, error } = await supabase
        .from("posts")
        .select(`
          *,
          profiles:user_id (
            username,
            display_name,
            avatar_url,
            level
          )
        `)
        .ilike("content", `%${query}%`)
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error searching posts:", error);
      return [];
    }
  };

  const updateFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  return {
    users,
    trendingHashtags,
    recentPosts,
    loading,
    searchQuery,
    setSearchQuery,
    searchByHashtag,
    searchPosts,
    filters,
    updateFilters,
    resetFilters,
    activeCategory,
    setActiveCategory,
  };
}
