import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface LeaderboardEntry {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  username: string | null;
  total_score: number;
  games_completed: number;
  avg_time_seconds: number | null;
  best_time_seconds: number | null;
}

export function useLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    setLoading(true);
    const { data, error } = await supabase.rpc("get_game_leaderboard", {
      limit_count: 20,
    });

    if (error) {
      console.error("Error fetching leaderboard:", error);
    } else {
      setLeaderboard((data || []) as LeaderboardEntry[]);
    }
    setLoading(false);
  };

  return {
    leaderboard,
    loading,
    refetch: fetchLeaderboard,
  };
}
