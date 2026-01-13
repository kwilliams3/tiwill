-- Fix broken RLS policies for messaging

-- Conversations: users can only SELECT conversations they participate in
DROP POLICY IF EXISTS "Users can view their conversations" ON public.conversations;
CREATE POLICY "Users can view their conversations"
ON public.conversations
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.conversation_participants cp
    WHERE cp.conversation_id = public.conversations.id
      AND cp.user_id = auth.uid()
  )
);

-- Conversation participants: fix INSERT check (used by conversation creation)
DROP POLICY IF EXISTS "Users can add participants" ON public.conversation_participants;
CREATE POLICY "Users can add participants"
ON public.conversation_participants
FOR INSERT
WITH CHECK (
  -- user can always add themselves
  (user_id = auth.uid())
  OR
  -- user can add another participant only if they are already a participant of that conversation
  EXISTS (
    SELECT 1
    FROM public.conversation_participants cp
    WHERE cp.conversation_id = public.conversation_participants.conversation_id
      AND cp.user_id = auth.uid()
  )
);

-- (Optional hardening) Ensure UPDATE policy remains correct
-- (kept as-is)
