import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const REACTIONS = [
  { emoji: "❤️", label: "love", color: "text-red-500" },
  { emoji: "😂", label: "haha", color: "text-yellow-500" },
  { emoji: "😮", label: "wow", color: "text-yellow-400" },
  { emoji: "😢", label: "sad", color: "text-blue-400" },
  { emoji: "😡", label: "angry", color: "text-orange-500" },
  { emoji: "👍", label: "like", color: "text-primary" },
];

interface ReactionCount {
  emoji: string;
  count: number;
}

interface EmojiReactionsProps {
  postId: string;
}

export function EmojiReactions({ postId }: EmojiReactionsProps) {
  const { user } = useAuth();
  const [showPicker, setShowPicker] = useState(false);
  const [userReaction, setUserReaction] = useState<string | null>(null);
  const [reactionCounts, setReactionCounts] = useState<ReactionCount[]>([]);
  const [animatingEmoji, setAnimatingEmoji] = useState<string | null>(null);

  // Fetch initial reactions
  useEffect(() => {
    fetchReactions();
    
    // Subscribe to real-time changes
    const channel = supabase
      .channel(`reactions-${postId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "post_reactions", filter: `post_id=eq.${postId}` },
        () => fetchReactions()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [postId]);

  // Fetch user's reaction
  useEffect(() => {
    if (user) {
      supabase
        .from("post_reactions")
        .select("emoji")
        .eq("post_id", postId)
        .eq("user_id", user.id)
        .maybeSingle()
        .then(({ data }) => setUserReaction(data?.emoji || null));
    }
  }, [user, postId]);

  const fetchReactions = async () => {
    const { data } = await supabase
      .from("post_reactions")
      .select("emoji")
      .eq("post_id", postId);

    if (data) {
      const counts: Record<string, number> = {};
      data.forEach((r) => {
        counts[r.emoji] = (counts[r.emoji] || 0) + 1;
      });
      setReactionCounts(
        Object.entries(counts).map(([emoji, count]) => ({ emoji, count }))
      );
    }
  };

  const handleReaction = async (emoji: string) => {
    if (!user) return;

    setAnimatingEmoji(emoji);
    setTimeout(() => setAnimatingEmoji(null), 600);

    if (userReaction === emoji) {
      // Remove reaction
      await supabase
        .from("post_reactions")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", user.id);
      setUserReaction(null);
    } else {
      // Add or update reaction
      await supabase
        .from("post_reactions")
        .upsert({ post_id: postId, user_id: user.id, emoji });
      setUserReaction(emoji);
    }

    setShowPicker(false);
  };

  const totalCount = reactionCounts.reduce((sum, r) => sum + r.count, 0);
  const topReactions = reactionCounts.sort((a, b) => b.count - a.count).slice(0, 3);

  return (
    <div className="relative flex items-center gap-2">
      {/* Reaction button with picker */}
      <div className="relative">
        <motion.button
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all",
            userReaction
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-muted"
          )}
          onMouseEnter={() => setShowPicker(true)}
          onMouseLeave={() => setShowPicker(false)}
          onClick={() => handleReaction(userReaction || "❤️")}
          whileTap={{ scale: 0.95 }}
        >
          <span className="text-lg">
            {userReaction || "❤️"}
          </span>
          {totalCount > 0 && (
            <span className="text-sm font-medium">{totalCount}</span>
          )}
        </motion.button>

        {/* Emoji Picker */}
        <AnimatePresence>
          {showPicker && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              transition={{ duration: 0.15 }}
              className="absolute bottom-full left-0 mb-2 z-50"
              onMouseEnter={() => setShowPicker(true)}
              onMouseLeave={() => setShowPicker(false)}
            >
              <div className="flex gap-1 p-2 rounded-full bg-card shadow-xl border border-border/50 backdrop-blur-lg">
                {REACTIONS.map((reaction) => (
                  <motion.button
                    key={reaction.label}
                    onClick={() => handleReaction(reaction.emoji)}
                    className={cn(
                      "relative p-2 rounded-full transition-colors hover:bg-muted",
                      userReaction === reaction.emoji && "bg-primary/10"
                    )}
                    whileHover={{ scale: 1.3, y: -5 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <span className="text-2xl">{reaction.emoji}</span>
                    
                    {/* Floating animation */}
                    <AnimatePresence>
                      {animatingEmoji === reaction.emoji && (
                        <motion.span
                          initial={{ opacity: 1, y: 0, scale: 1 }}
                          animate={{ opacity: 0, y: -40, scale: 1.5 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 flex items-center justify-center text-2xl pointer-events-none"
                        >
                          {reaction.emoji}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Reaction counts display */}
      {topReactions.length > 0 && (
        <div className="flex items-center">
          <div className="flex -space-x-1">
            {topReactions.map((reaction, i) => (
              <motion.span
                key={reaction.emoji}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center text-sm"
              >
                {reaction.emoji}
              </motion.span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
