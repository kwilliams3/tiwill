-- Table pour stocker les jeux quotidiens
CREATE TABLE public.daily_games (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  game_type TEXT NOT NULL, -- 'word_scramble', 'math_puzzle', 'pattern', 'memory'
  title TEXT NOT NULL,
  description TEXT,
  data JSONB NOT NULL, -- contient les données du jeu (question, options, réponse)
  points_reward INTEGER NOT NULL DEFAULT 10,
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour stocker les tentatives des utilisateurs
CREATE TABLE public.game_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  game_id UUID NOT NULL REFERENCES public.daily_games(id) ON DELETE CASCADE,
  score INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT false,
  time_taken_seconds INTEGER,
  attempts_count INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, game_id)
);

-- Enable RLS
ALTER TABLE public.daily_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_attempts ENABLE ROW LEVEL SECURITY;

-- Policies for daily_games (everyone can read active games)
CREATE POLICY "Anyone can view active games" 
ON public.daily_games 
FOR SELECT 
USING (now() >= starts_at AND now() <= expires_at);

-- Policies for game_attempts
CREATE POLICY "Users can view their own attempts" 
ON public.game_attempts 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own attempts" 
ON public.game_attempts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own attempts" 
ON public.game_attempts 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Index for faster queries
CREATE INDEX idx_daily_games_active ON public.daily_games (starts_at, expires_at);
CREATE INDEX idx_game_attempts_user ON public.game_attempts (user_id);
CREATE INDEX idx_game_attempts_game ON public.game_attempts (game_id);

-- Enable realtime for game attempts (for leaderboard)
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_attempts;