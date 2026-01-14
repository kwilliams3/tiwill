-- Fix infinite recursion in RLS for conversation_participants by moving self-references into SECURITY DEFINER functions

-- 1) Helper: checks if a user participates in a conversation
create or replace function public.is_conversation_participant(_conversation_id uuid, _user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.conversation_participants cp
    where cp.conversation_id = _conversation_id
      and cp.user_id = _user_id
  )
$$;

-- 2) Policy helper: can the current user add a participant to a conversation?
create or replace function public.can_add_participant(_conversation_id uuid, _user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  -- Allow adding participants only if the caller is already a participant.
  -- (Client should insert themselves first, then add the other user.)
  select public.is_conversation_participant(_conversation_id, auth.uid())
$$;

-- 3) Replace the SELECT policy that was self-referencing the same table (causing recursion)
drop policy if exists "Users can view participants of their conversations" on public.conversation_participants;
create policy "Users can view participants of their conversations"
on public.conversation_participants
for select
to authenticated
using (
  public.is_conversation_participant(conversation_participants.conversation_id, auth.uid())
);

-- 4) Ensure INSERT policy uses the helper (now safe)
drop policy if exists "Users can add participants" on public.conversation_participants;
create policy "Users can add participants"
on public.conversation_participants
for insert
to authenticated
with check (
  public.can_add_participant(conversation_id, user_id)
);
