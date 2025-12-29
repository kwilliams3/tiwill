import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface Story {
  id: string;
  user_id: string;
  media_url: string;
  media_type: string;
  caption: string | null;
  is_collaborative: boolean;
  collaborators: string[] | null;
  views_count: number;
  expires_at: string;
  created_at: string;
  profile?: {
    username: string | null;
    display_name: string | null;
    avatar_url: string | null;
  };
  viewed?: boolean;
}

export interface GroupedStories {
  userId: string;
  profile: { username: string | null; display_name: string | null; avatar_url: string | null };
  stories: Story[];
  hasUnviewed: boolean;
}

export function useStories() {
  const { user } = useAuth();
  const [stories, setStories] = useState<Story[]>([]);
  const [groupedStories, setGroupedStories] = useState<GroupedStories[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStories = useCallback(async () => {
    try {
      const { data: storiesData, error } = await supabase.from("stories").select("*").order("created_at", { ascending: false });
      if (error) throw error;

      const userIds = [...new Set(storiesData?.map(s => s.user_id) || [])];
      const { data: profiles } = await supabase.from("profiles").select("user_id, username, display_name, avatar_url").in("user_id", userIds);
      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      let viewedStoryIds: string[] = [];
      if (user) {
        const { data: views } = await supabase.from("story_views").select("story_id").eq("user_id", user.id);
        viewedStoryIds = views?.map(v => v.story_id) || [];
      }

      const storiesWithData = (storiesData || []).map(story => ({
        ...story,
        profile: profileMap.get(story.user_id),
        viewed: viewedStoryIds.includes(story.id),
      }));

      setStories(storiesWithData);

      const grouped = storiesWithData.reduce((acc, story) => {
        const existing = acc.find(g => g.userId === story.user_id);
        if (existing) {
          existing.stories.push(story);
          if (!story.viewed) existing.hasUnviewed = true;
        } else {
          acc.push({
            userId: story.user_id,
            profile: story.profile || { username: null, display_name: null, avatar_url: null },
            stories: [story],
            hasUnviewed: !story.viewed,
          });
        }
        return acc;
      }, [] as GroupedStories[]);

      grouped.sort((a, b) => {
        if (a.userId === user?.id) return -1;
        if (b.userId === user?.id) return 1;
        return a.hasUnviewed === b.hasUnviewed ? 0 : a.hasUnviewed ? -1 : 1;
      });

      setGroupedStories(grouped);
    } catch (error) {
      console.error("Error fetching stories:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchStories();
    const channel = supabase.channel("stories-changes").on("postgres_changes", { event: "*", schema: "public", table: "stories" }, () => fetchStories()).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchStories]);

  const createStory = async (mediaUrl: string, mediaType: string, caption?: string) => {
    if (!user) return { error: new Error("No user") };
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);
    const { error } = await supabase.from("stories").insert({ user_id: user.id, media_url: mediaUrl, media_type: mediaType, caption, expires_at: expiresAt.toISOString() });
    if (!error) await fetchStories();
    return { error };
  };

  const markAsViewed = async (storyId: string) => {
    if (!user) return;
    await supabase.from("story_views").upsert({ story_id: storyId, user_id: user.id });
  };

  return { stories, groupedStories, loading, createStory, markAsViewed, refetch: fetchStories };
}
