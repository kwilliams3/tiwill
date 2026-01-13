-- Allow users to add participants if they are already in the conversation
-- This uses a security definer function to avoid recursion

CREATE OR REPLACE FUNCTION public.can_add_participant(_conversation_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    -- User is adding themselves
    _user_id = auth.uid()
    OR
    -- User is already a participant of this conversation
    EXISTS (
      SELECT 1
      FROM public.conversation_participants
      WHERE conversation_id = _conversation_id
        AND user_id = auth.uid()
    )
$$;

-- Update the policy to use the function
DROP POLICY IF EXISTS "Users can add participants" ON public.conversation_participants;
CREATE POLICY "Users can add participants"
ON public.conversation_participants
FOR INSERT
WITH CHECK (
  public.can_add_participant(conversation_id, user_id)
);