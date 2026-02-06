
-- Create a function to get leaderboard data
CREATE OR REPLACE FUNCTION public.get_game_leaderboard(limit_count INT DEFAULT 20)
RETURNS TABLE(
  user_id UUID,
  display_name TEXT,
  avatar_url TEXT,
  username TEXT,
  total_score BIGINT,
  games_completed BIGINT,
  avg_time_seconds NUMERIC,
  best_time_seconds INT
) 
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    ga.user_id,
    p.display_name,
    p.avatar_url,
    p.username,
    COALESCE(SUM(ga.score), 0) AS total_score,
    COUNT(*) FILTER (WHERE ga.completed = true) AS games_completed,
    ROUND(AVG(ga.time_taken_seconds) FILTER (WHERE ga.completed = true AND ga.time_taken_seconds IS NOT NULL), 1) AS avg_time_seconds,
    MIN(ga.time_taken_seconds) FILTER (WHERE ga.completed = true AND ga.time_taken_seconds IS NOT NULL) AS best_time_seconds
  FROM game_attempts ga
  JOIN profiles p ON p.user_id = ga.user_id
  WHERE ga.completed = true
  GROUP BY ga.user_id, p.display_name, p.avatar_url, p.username
  ORDER BY total_score DESC, avg_time_seconds ASC NULLS LAST
  LIMIT limit_count;
$$;
