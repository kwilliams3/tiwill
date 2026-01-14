-- Create an RPC to create a conversation + participants in one transaction.
-- This avoids PostgREST "return=representation" SELECT checks that can fail RLS right after INSERT.

CREATE OR REPLACE FUNCTION public.create_conversation_with_participants(_other_user_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _conversation_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF _other_user_id IS NULL THEN
    RAISE EXCEPTION 'Missing other user id';
  END IF;

  IF _other_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Cannot create conversation with yourself';
  END IF;

  INSERT INTO public.conversations DEFAULT VALUES
  RETURNING id INTO _conversation_id;

  INSERT INTO public.conversation_participants (conversation_id, user_id)
  VALUES (_conversation_id, auth.uid());

  INSERT INTO public.conversation_participants (conversation_id, user_id)
  VALUES (_conversation_id, _other_user_id);

  RETURN _conversation_id;
END;
$$;

-- Allow authenticated users to call it
GRANT EXECUTE ON FUNCTION public.create_conversation_with_participants(uuid) TO authenticated;
