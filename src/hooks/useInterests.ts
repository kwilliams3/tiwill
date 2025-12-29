import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Interest {
  id: string;
  name: string;
  emoji: string | null;
  color: string | null;
}

export function useInterests() {
  const [interests, setInterests] = useState<Interest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInterests();
  }, []);

  const fetchInterests = async () => {
    try {
      const { data, error } = await supabase
        .from("interests")
        .select("*")
        .order("name");

      if (error) throw error;
      setInterests(data || []);
    } catch (error) {
      console.error("Error fetching interests:", error);
    } finally {
      setLoading(false);
    }
  };

  return { interests, loading };
}

export function useUserInterests(userId: string | undefined) {
  const [userInterests, setUserInterests] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchUserInterests();
    }
  }, [userId]);

  const fetchUserInterests = async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from("user_interests")
        .select("interest_id")
        .eq("user_id", userId);

      if (error) throw error;
      setUserInterests(data?.map((ui) => ui.interest_id) || []);
    } catch (error) {
      console.error("Error fetching user interests:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleInterest = async (interestId: string) => {
    if (!userId) return;

    const isSelected = userInterests.includes(interestId);

    try {
      if (isSelected) {
        await supabase
          .from("user_interests")
          .delete()
          .eq("user_id", userId)
          .eq("interest_id", interestId);
        
        setUserInterests((prev) => prev.filter((id) => id !== interestId));
      } else {
        await supabase
          .from("user_interests")
          .insert({ user_id: userId, interest_id: interestId });
        
        setUserInterests((prev) => [...prev, interestId]);
      }
    } catch (error) {
      console.error("Error toggling interest:", error);
    }
  };

  return { userInterests, loading, toggleInterest };
}
