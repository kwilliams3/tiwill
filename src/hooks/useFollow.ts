import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface FollowStats {
  followersCount: number;
  followingCount: number;
}

export function useFollow(targetUserId: string | undefined) {
  const { user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (user && targetUserId && user.id !== targetUserId) {
      checkFollowStatus();
    } else {
      setLoading(false);
    }
  }, [user, targetUserId]);

  const checkFollowStatus = async () => {
    if (!user || !targetUserId) return;

    try {
      const { data, error } = await supabase
        .from("follows")
        .select("id")
        .eq("follower_id", user.id)
        .eq("following_id", targetUserId)
        .maybeSingle();

      if (error) throw error;
      setIsFollowing(!!data);
    } catch (error) {
      console.error("Error checking follow status:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFollow = useCallback(async () => {
    if (!user || !targetUserId || user.id === targetUserId) return;

    setActionLoading(true);
    try {
      if (isFollowing) {
        const { error } = await supabase
          .from("follows")
          .delete()
          .eq("follower_id", user.id)
          .eq("following_id", targetUserId);

        if (error) throw error;
        setIsFollowing(false);
      } else {
        const { error } = await supabase
          .from("follows")
          .insert({ follower_id: user.id, following_id: targetUserId });

        if (error) throw error;
        setIsFollowing(true);
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
    } finally {
      setActionLoading(false);
    }
  }, [user, targetUserId, isFollowing]);

  return { isFollowing, loading, actionLoading, toggleFollow };
}

export function useFollowStats(userId: string | undefined) {
  const [stats, setStats] = useState<FollowStats>({ followersCount: 0, followingCount: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchStats();
    }
  }, [userId]);

  const fetchStats = async () => {
    if (!userId) return;

    try {
      const [followersRes, followingRes] = await Promise.all([
        supabase
          .from("follows")
          .select("id", { count: "exact", head: true })
          .eq("following_id", userId),
        supabase
          .from("follows")
          .select("id", { count: "exact", head: true })
          .eq("follower_id", userId),
      ]);

      setStats({
        followersCount: followersRes.count || 0,
        followingCount: followingRes.count || 0,
      });
    } catch (error) {
      console.error("Error fetching follow stats:", error);
    } finally {
      setLoading(false);
    }
  };

  return { ...stats, loading, refetch: fetchStats };
}

export function useFollowers(userId: string | undefined) {
  const [followers, setFollowers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchFollowers();
    }
  }, [userId]);

  const fetchFollowers = async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from("follows")
        .select("follower_id, created_at")
        .eq("following_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        const followerIds = data.map((f) => f.follower_id);
        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select("id, user_id, username, display_name, avatar_url, level")
          .in("user_id", followerIds);

        if (profilesError) throw profilesError;
        setFollowers(profiles || []);
      } else {
        setFollowers([]);
      }
    } catch (error) {
      console.error("Error fetching followers:", error);
    } finally {
      setLoading(false);
    }
  };

  return { followers, loading };
}

export function useFollowing(userId: string | undefined) {
  const [following, setFollowing] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchFollowing();
    }
  }, [userId]);

  const fetchFollowing = async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from("follows")
        .select("following_id, created_at")
        .eq("follower_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        const followingIds = data.map((f) => f.following_id);
        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select("id, user_id, username, display_name, avatar_url, level")
          .in("user_id", followingIds);

        if (profilesError) throw profilesError;
        setFollowing(profiles || []);
      } else {
        setFollowing([]);
      }
    } catch (error) {
      console.error("Error fetching following:", error);
    } finally {
      setLoading(false);
    }
  };

  return { following, loading };
}
