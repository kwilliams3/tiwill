-- Create badges table
CREATE TABLE public.badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#8B5CF6',
  points_required INTEGER DEFAULT 0,
  category TEXT NOT NULL DEFAULT 'activity',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_badges table
CREATE TABLE public.user_badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

-- Enable RLS
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- RLS policies for badges (read-only for everyone)
CREATE POLICY "Badges are viewable by everyone"
  ON public.badges FOR SELECT
  USING (true);

-- RLS policies for user_badges
CREATE POLICY "User badges are viewable by everyone"
  ON public.user_badges FOR SELECT
  USING (true);

CREATE POLICY "System can insert user badges"
  ON public.user_badges FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create function to award points
CREATE OR REPLACE FUNCTION public.award_points(
  _user_id UUID,
  _points INTEGER,
  _action TEXT
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_points INTEGER;
  new_level INTEGER;
BEGIN
  -- Update points
  UPDATE public.profiles
  SET points = COALESCE(points, 0) + _points
  WHERE user_id = _user_id
  RETURNING points INTO new_points;

  -- Calculate new level (every 100 points = 1 level, max 50)
  new_level := LEAST(50, 1 + (new_points / 100));
  
  UPDATE public.profiles
  SET level = new_level
  WHERE user_id = _user_id;

  RETURN new_points;
END;
$$;

-- Insert default badges
INSERT INTO public.badges (name, description, icon, color, points_required, category) VALUES
  ('Nouveau Venu', 'Bienvenue dans la communauté TiWill!', '🌟', '#FFD700', 0, 'milestone'),
  ('Premier Post', 'Tu as publié ton premier post', '📝', '#10B981', 0, 'activity'),
  ('Social Butterfly', 'Tu as commenté 10 posts', '🦋', '#8B5CF6', 0, 'social'),
  ('Storyteller', 'Tu as partagé ta première story', '📖', '#F59E0B', 0, 'activity'),
  ('Niveau 5', 'Tu as atteint le niveau 5', '⭐', '#3B82F6', 500, 'milestone'),
  ('Niveau 10', 'Tu as atteint le niveau 10', '🌟', '#8B5CF6', 1000, 'milestone'),
  ('Niveau 25', 'Tu as atteint le niveau 25', '💫', '#EC4899', 2500, 'milestone'),
  ('Populaire', 'Tes posts ont reçu 50 réactions', '🔥', '#EF4444', 0, 'social'),
  ('Bavard', 'Tu as envoyé 100 messages', '💬', '#06B6D4', 0, 'chat'),
  ('Réactif', 'Tu as donné 25 réactions', '❤️', '#F43F5E', 0, 'social'),
  ('Nuit Blanche', 'Tu as posté après minuit', '🌙', '#6366F1', 0, 'special'),
  ('Lève-tôt', 'Tu as posté avant 6h du matin', '🌅', '#FB923C', 0, 'special');