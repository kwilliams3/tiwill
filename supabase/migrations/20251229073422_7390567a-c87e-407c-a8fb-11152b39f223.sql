-- Create storage bucket for media files (avatars, posts, stories)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']),
  ('posts', 'posts', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm']),
  ('stories', 'stories', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm']);

-- Storage policies for avatars bucket
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for posts bucket
CREATE POLICY "Post media is publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'posts');

CREATE POLICY "Users can upload their own post media"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'posts' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own post media"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'posts' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for stories bucket
CREATE POLICY "Story media is publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'stories');

CREATE POLICY "Users can upload their own story media"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'stories' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own story media"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'stories' AND auth.uid()::text = (storage.foldername(name))[1]);