import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  points_required: number;
  category: string;
}

export interface UserBadge {
  id: string;
  badge_id: string;
  earned_at: string;
  badge?: Badge;
}

export function useGamification() {
  const { user } = useAuth();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBadges();
    if (user) {
      fetchUserBadges();
    }
  }, [user]);

  const fetchBadges = async () => {
    const { data, error } = await supabase
      .from("badges")
      .select("*")
      .order("points_required", { ascending: true });

    if (error) {
      console.error("Error fetching badges:", error);
    } else {
      setBadges(data || []);
    }
  };

  const fetchUserBadges = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("user_badges")
      .select("*, badge:badges(*)")
      .eq("user_id", user.id);

    if (error) {
      console.error("Error fetching user badges:", error);
    } else {
      setUserBadges(data || []);
    }
    setLoading(false);
  };

  const awardBadge = async (badgeId: string) => {
    if (!user) return { error: new Error("No user") };

    // Check if already has badge
    const existing = userBadges.find((ub) => ub.badge_id === badgeId);
    if (existing) return { error: null, alreadyHas: true };

    const { error } = await supabase
      .from("user_badges")
      .insert({ user_id: user.id, badge_id: badgeId });

    if (!error) {
      await fetchUserBadges();
    }

    return { error };
  };

  const awardPoints = async (points: number, action: string) => {
    if (!user) return { error: new Error("No user"), newPoints: 0 };

    const { data, error } = await supabase.rpc("award_points", {
      _user_id: user.id,
      _points: points,
      _action: action,
    });

    return { error, newPoints: data as number };
  };

  const hasBadge = (badgeId: string) => {
    return userBadges.some((ub) => ub.badge_id === badgeId);
  };

  const getBadgeByName = (name: string) => {
    return badges.find((b) => b.name === name);
  };

  return {
    badges,
    userBadges,
    loading,
    awardBadge,
    awardPoints,
    hasBadge,
    getBadgeByName,
    refetch: fetchUserBadges,
  };
}
