import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useGamification } from "./useGamification";
import { toast } from "sonner";

export interface DailyGame {
  id: string;
  game_type: string;
  title: string;
  description: string | null;
  data: {
    scrambled?: string;
    answer: string;
    hint?: string;
    question?: string;
    options?: string[];
    sequence?: string[];
    explanation?: string;
  };
  points_reward: number;
  starts_at: string;
  expires_at: string;
  created_at: string;
}

export interface GameAttempt {
  id: string;
  user_id: string;
  game_id: string;
  score: number;
  completed: boolean;
  time_taken_seconds: number | null;
  attempts_count: number;
  created_at: string;
  completed_at: string | null;
}

export function useDailyGames() {
  const { user } = useAuth();
  const { awardPoints } = useGamification();
  const [games, setGames] = useState<DailyGame[]>([]);
  const [attempts, setAttempts] = useState<GameAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGames();
    if (user) {
      fetchAttempts();
    }
  }, [user]);

  const fetchGames = async () => {
    const { data, error } = await supabase
      .from("daily_games")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching games:", error);
    } else {
      setGames((data || []) as DailyGame[]);
    }
    setLoading(false);
  };

  const fetchAttempts = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("game_attempts")
      .select("*")
      .eq("user_id", user.id);

    if (error) {
      console.error("Error fetching attempts:", error);
    } else {
      setAttempts((data || []) as GameAttempt[]);
    }
  };

  const startGame = async (gameId: string) => {
    if (!user) return { error: new Error("Non authentifié") };

    // Check if already attempted
    const existing = attempts.find((a) => a.game_id === gameId);
    if (existing) {
      return { error: null, attempt: existing, alreadyStarted: true };
    }

    const { data, error } = await supabase
      .from("game_attempts")
      .insert({
        user_id: user.id,
        game_id: gameId,
        score: 0,
        completed: false,
        attempts_count: 1,
      })
      .select()
      .single();

    if (!error) {
      await fetchAttempts();
    }

    return { error, attempt: data as GameAttempt, alreadyStarted: false };
  };

  const submitAnswer = async (
    gameId: string,
    answer: string,
    timeTaken: number
  ) => {
    if (!user) return { error: new Error("Non authentifié"), correct: false };

    const game = games.find((g) => g.id === gameId);
    if (!game) return { error: new Error("Jeu non trouvé"), correct: false };

    const isCorrect =
      answer.toLowerCase().trim() === game.data.answer.toLowerCase().trim();
    const attempt = attempts.find((a) => a.game_id === gameId);

    if (isCorrect) {
      // Update attempt as completed
      const { error } = await supabase
        .from("game_attempts")
        .update({
          completed: true,
          score: game.points_reward,
          time_taken_seconds: timeTaken,
          completed_at: new Date().toISOString(),
        })
        .eq("game_id", gameId)
        .eq("user_id", user.id);

      if (!error) {
        // Award points
        await awardPoints(game.points_reward, `game_${game.game_type}`);
        toast.success(`🎉 Bravo! +${game.points_reward} points!`);
        await fetchAttempts();
      }

      return { error, correct: true, points: game.points_reward };
    } else {
      // Increment attempts
      if (attempt) {
        await supabase
          .from("game_attempts")
          .update({ attempts_count: attempt.attempts_count + 1 })
          .eq("id", attempt.id);
        await fetchAttempts();
      }

      return { error: null, correct: false };
    }
  };

  const getAttempt = (gameId: string) => {
    return attempts.find((a) => a.game_id === gameId);
  };

  const hasCompleted = (gameId: string) => {
    const attempt = attempts.find((a) => a.game_id === gameId);
    return attempt?.completed || false;
  };

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires.getTime() - now.getTime();

    if (diff <= 0) return null;

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return { hours, minutes, total: diff };
  };

  return {
    games,
    attempts,
    loading,
    startGame,
    submitAnswer,
    getAttempt,
    hasCompleted,
    getTimeRemaining,
    refetch: fetchGames,
  };
}
