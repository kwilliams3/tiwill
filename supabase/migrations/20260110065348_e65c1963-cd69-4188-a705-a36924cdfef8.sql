-- Create collaboration_messages table
CREATE TABLE public.collaboration_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  collaboration_id UUID NOT NULL REFERENCES public.collaborations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.collaboration_messages ENABLE ROW LEVEL SECURITY;

-- Collaboration messages policies
CREATE POLICY "Participants can view collaboration messages"
ON public.collaboration_messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.collaboration_participants cp
    WHERE cp.collaboration_id = collaboration_messages.collaboration_id
    AND cp.user_id = auth.uid()
  )
);

CREATE POLICY "Participants can send messages"
ON public.collaboration_messages FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.collaboration_participants cp
    WHERE cp.collaboration_id = collaboration_messages.collaboration_id
    AND cp.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their own messages"
ON public.collaboration_messages FOR DELETE
USING (auth.uid() = user_id);

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.collaboration_messages;