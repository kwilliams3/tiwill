-- Fix conversations INSERT policy - make it explicitly PERMISSIVE for authenticated users

DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;

CREATE POLICY "Users can create conversations"
ON public.conversations
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Also fix the can_add_participant function to allow the first participant (the creator)
CREATE OR REPLACE FUNCTION public.can_add_participant(_conversation_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    -- User is adding themselves (always allowed - they become the first participant)
    _user_id = auth.uid()
    OR
    -- Caller is already a participant and can add others
    public.is_conversation_participant(_conversation_id, auth.uid())
$$;