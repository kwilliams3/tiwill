import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export interface Collaboration {
  id: string;
  title: string;
  description: string | null;
  category: string;
  image_url: string | null;
  creator_id: string;
  max_participants: number;
  status: string;
  created_at: string;
  updated_at: string;
  expires_at: string | null;
  creator?: {
    display_name: string | null;
    avatar_url: string | null;
    username: string | null;
  } | null;
  participants_count: number;
  is_participant: boolean;
}

export interface CreateCollaborationData {
  title: string;
  description?: string;
  category: string;
  image_url?: string;
  max_participants?: number;
  expires_at?: string;
}

export function useCollaborations() {
  const [collaborations, setCollaborations] = useState<Collaboration[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchCollaborations = async () => {
    try {
      setLoading(true);

      // Fetch collaborations
      const { data: collabsData, error: collabsError } = await supabase
        .from("collaborations")
        .select("*")
        .order("created_at", { ascending: false });

      if (collabsError) throw collabsError;

      // Fetch profiles separately
      const creatorIds = [...new Set(collabsData?.map(c => c.creator_id) || [])];
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url, username")
        .in("user_id", creatorIds);

      const profilesMap = new Map(profilesData?.map(p => [p.user_id, p]) || []);

      // Fetch participants count for each collaboration
      const { data: participantsData } = await supabase
        .from("collaboration_participants")
        .select("collaboration_id, user_id");

      const participantCounts = new Map<string, number>();
      const userParticipations = new Set<string>();

      participantsData?.forEach(p => {
        participantCounts.set(p.collaboration_id, (participantCounts.get(p.collaboration_id) || 0) + 1);
        if (user && p.user_id === user.id) {
          userParticipations.add(p.collaboration_id);
        }
      });

      const enrichedCollabs: Collaboration[] = (collabsData || []).map(collab => ({
        ...collab,
        creator: profilesMap.get(collab.creator_id) || null,
        participants_count: participantCounts.get(collab.id) || 0,
        is_participant: userParticipations.has(collab.id)
      }));

      setCollaborations(enrichedCollabs);
    } catch (error) {
      console.error("Error fetching collaborations:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les collaborations",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createCollaboration = async (data: CreateCollaborationData) => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour créer une collaboration",
        variant: "destructive"
      });
      return null;
    }

    try {
      const { data: newCollab, error } = await supabase
        .from("collaborations")
        .insert({
          ...data,
          creator_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      // Auto-join as creator
      await supabase.from("collaboration_participants").insert({
        collaboration_id: newCollab.id,
        user_id: user.id,
        role: "creator"
      });

      toast({
        title: "Collaboration créée !",
        description: "Votre projet est maintenant visible par tous"
      });

      await fetchCollaborations();
      return newCollab;
    } catch (error) {
      console.error("Error creating collaboration:", error);
      toast({
        title: "Erreur",
        description: "Impossible de créer la collaboration",
        variant: "destructive"
      });
      return null;
    }
  };

  const joinCollaboration = async (collaborationId: string) => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour participer",
        variant: "destructive"
      });
      return false;
    }

    try {
      const { error } = await supabase.from("collaboration_participants").insert({
        collaboration_id: collaborationId,
        user_id: user.id,
        role: "participant"
      });

      if (error) throw error;

      toast({
        title: "Vous avez rejoint le projet !",
        description: "Bienvenue dans cette collaboration"
      });

      await fetchCollaborations();
      return true;
    } catch (error) {
      console.error("Error joining collaboration:", error);
      toast({
        title: "Erreur",
        description: "Impossible de rejoindre la collaboration",
        variant: "destructive"
      });
      return false;
    }
  };

  const leaveCollaboration = async (collaborationId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from("collaboration_participants")
        .delete()
        .eq("collaboration_id", collaborationId)
        .eq("user_id", user.id);

      if (error) throw error;

      toast({
        title: "Vous avez quitté le projet",
        description: "Vous pouvez rejoindre à nouveau à tout moment"
      });

      await fetchCollaborations();
      return true;
    } catch (error) {
      console.error("Error leaving collaboration:", error);
      toast({
        title: "Erreur",
        description: "Impossible de quitter la collaboration",
        variant: "destructive"
      });
      return false;
    }
  };

  useEffect(() => {
    fetchCollaborations();
  }, [user]);

  return {
    collaborations,
    loading,
    createCollaboration,
    joinCollaboration,
    leaveCollaboration,
    refetch: fetchCollaborations
  };
}
