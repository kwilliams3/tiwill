-- Fix the conversations SELECT policy - the previous migration may have had the wrong reference
DROP POLICY IF EXISTS "Users can view their conversations" ON public.conversations;
CREATE POLICY "Users can view their conversations"
ON public.conversations
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.conversation_participants cp
    WHERE cp.conversation_id = conversations.id
      AND cp.user_id = auth.uid()
  )
);

-- Fix the conversation_participants INSERT policy 
-- The subquery was comparing conversation_id to itself instead of the NEW row's conversation_id
DROP POLICY IF EXISTS "Users can add participants" ON public.conversation_participants;
CREATE POLICY "Users can add participants"
ON public.conversation_participants
FOR INSERT
WITH CHECK (
  user_id = auth.uid()
);