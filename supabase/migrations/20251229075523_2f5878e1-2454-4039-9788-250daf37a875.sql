-- Add parent_comment_id for nested replies
ALTER TABLE public.post_comments 
ADD COLUMN parent_id uuid REFERENCES public.post_comments(id) ON DELETE CASCADE;

-- Create comment_reactions table
CREATE TABLE public.comment_reactions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id uuid NOT NULL REFERENCES public.post_comments(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  emoji text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(comment_id, user_id)
);

-- Enable RLS
ALTER TABLE public.comment_reactions ENABLE ROW LEVEL SECURITY;

-- RLS policies for comment_reactions
CREATE POLICY "Comment reactions are viewable by everyone" 
ON public.comment_reactions FOR SELECT USING (true);

CREATE POLICY "Users can manage their own comment reactions" 
ON public.comment_reactions FOR ALL USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_post_comments_parent_id ON public.post_comments(parent_id);
CREATE INDEX idx_post_comments_post_id ON public.post_comments(post_id);
CREATE INDEX idx_comment_reactions_comment_id ON public.comment_reactions(comment_id);