import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface SuggestedFriend {
  id: string;
  user_id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  level: number;
  commonInterests: string[];
  commonInterestCount: number;
}

interface InterestData {
  id: string;
  name: string;
  emoji: string | null;
}

export function useFriendSuggestions() {
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState<SuggestedFriend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSuggestions();
    } else {
      setSuggestions([]);
      setLoading(false);
    }
  }, [user]);

  const fetchSuggestions = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // 1. Get current user's interests
      const { data: myInterests, error: myInterestsError } = await supabase
        .from("user_interests")
        .select("interest_id")
        .eq("user_id", user.id);

      if (myInterestsError) throw myInterestsError;

      if (!myInterests || myInterests.length === 0) {
        setSuggestions([]);
        setLoading(false);
        return;
      }

      const myInterestIds = myInterests.map((i) => i.interest_id);

      // 2. Get all interests data for names
      const { data: interestsData, error: interestsError } = await supabase
        .from("interests")
        .select("id, name, emoji")
        .in("id", myInterestIds);

      if (interestsError) throw interestsError;

      const interestMap = new Map<string, InterestData>();
      interestsData?.forEach((interest) => {
        interestMap.set(interest.id, interest);
      });

      // 3. Find users who share interests with current user (excluding self)
      const { data: sharedInterests, error: sharedError } = await supabase
        .from("user_interests")
        .select("user_id, interest_id")
        .in("interest_id", myInterestIds)
        .neq("user_id", user.id);

      if (sharedError) throw sharedError;

      if (!sharedInterests || sharedInterests.length === 0) {
        setSuggestions([]);
        setLoading(false);
        return;
      }

      // 4. Group by user and count common interests
      const userInterestMap = new Map<string, string[]>();
      sharedInterests.forEach((item) => {
        const current = userInterestMap.get(item.user_id) || [];
        current.push(item.interest_id);
        userInterestMap.set(item.user_id, current);
      });

      // 5. Get profiles for these users
      const userIds = Array.from(userInterestMap.keys());
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, user_id, username, display_name, avatar_url, bio, level")
        .in("user_id", userIds);

      if (profilesError) throw profilesError;

      // 6. Build suggestions with common interest info
      const suggestionsWithInterests: SuggestedFriend[] = (profiles || [])
        .map((profile) => {
          const commonInterestIds = userInterestMap.get(profile.user_id) || [];
          const commonInterests = commonInterestIds
            .map((id) => {
              const interest = interestMap.get(id);
              return interest ? `${interest.emoji || ""} ${interest.name}`.trim() : null;
            })
            .filter(Boolean) as string[];

          return {
            id: profile.id,
            user_id: profile.user_id,
            username: profile.username,
            display_name: profile.display_name,
            avatar_url: profile.avatar_url,
            bio: profile.bio,
            level: profile.level || 1,
            commonInterests,
            commonInterestCount: commonInterests.length,
          };
        })
        .sort((a, b) => b.commonInterestCount - a.commonInterestCount)
        .slice(0, 10);

      setSuggestions(suggestionsWithInterests);
    } catch (error) {
      console.error("Error fetching friend suggestions:", error);
    } finally {
      setLoading(false);
    }
  };

  return { suggestions, loading, refetch: fetchSuggestions };
}
