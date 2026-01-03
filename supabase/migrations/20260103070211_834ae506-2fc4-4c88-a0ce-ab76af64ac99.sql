-- Create collaborations table
CREATE TABLE public.collaborations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'other',
  image_url TEXT,
  creator_id UUID NOT NULL,
  max_participants INTEGER DEFAULT 10,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Create collaboration participants table
CREATE TABLE public.collaboration_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  collaboration_id UUID NOT NULL REFERENCES public.collaborations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'participant',
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(collaboration_id, user_id)
);

-- Enable RLS
ALTER TABLE public.collaborations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaboration_participants ENABLE ROW LEVEL SECURITY;

-- RLS policies for collaborations
CREATE POLICY "Collaborations are viewable by everyone"
ON public.collaborations
FOR SELECT
USING (true);

CREATE POLICY "Users can create collaborations"
ON public.collaborations
FOR INSERT
WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update their collaborations"
ON public.collaborations
FOR UPDATE
USING (auth.uid() = creator_id);

CREATE POLICY "Creators can delete their collaborations"
ON public.collaborations
FOR DELETE
USING (auth.uid() = creator_id);

-- RLS policies for participants
CREATE POLICY "Participants are viewable by everyone"
ON public.collaboration_participants
FOR SELECT
USING (true);

CREATE POLICY "Users can join collaborations"
ON public.collaboration_participants
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave collaborations"
ON public.collaboration_participants
FOR DELETE
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_collaborations_updated_at
BEFORE UPDATE ON public.collaborations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();