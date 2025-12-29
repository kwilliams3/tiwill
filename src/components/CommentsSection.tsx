import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Send, CornerDownRight, Heart, MoreHorizontal, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const COMMENT_REACTIONS = ["❤️", "😂", "😮", "👍", "🔥"];

interface Comment {
  id: string;
  user_id: string;
  content: string;
  is_anonymous: boolean;
  created_at: string;
  parent_id: string | null;
  profile?: {
    username: string | null;
    display_name: string | null;
    avatar_url: string | null;
  };
  reactions: { emoji: string; count: number }[];
  userReaction: string | null;
  replies: Comment[];
}

interface CommentsSectionProps {
  postId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  commentsCount: number;
}

export function CommentsSection({ postId, open, onOpenChange, commentsCount }: CommentsSectionProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<{ id: string; username: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchComments = useCallback(async () => {
    if (!open) return;
    
    try {
      // Fetch all comments for the post
      const { data: commentsData, error } = await supabase
        .from("post_comments")
        .select("*")
        .eq("post_id", postId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Fetch profiles
      const userIds = [...new Set(commentsData?.map(c => c.user_id) || [])];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, username, display_name, avatar_url")
        .in("user_id", userIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      // Fetch reactions
      const commentIds = commentsData?.map(c => c.id) || [];
      const { data: allReactions } = await supabase
        .from("comment_reactions")
        .select("*")
        .in("comment_id", commentIds);

      // Group reactions by comment
      const reactionsMap = new Map<string, { emoji: string; count: number; userReacted: boolean }[]>();
      commentIds.forEach(id => reactionsMap.set(id, []));

      allReactions?.forEach(reaction => {
        const commentReactions = reactionsMap.get(reaction.comment_id) || [];
        const existing = commentReactions.find(r => r.emoji === reaction.emoji);
        if (existing) {
          existing.count++;
          if (reaction.user_id === user?.id) existing.userReacted = true;
        } else {
          commentReactions.push({
            emoji: reaction.emoji,
            count: 1,
            userReacted: reaction.user_id === user?.id,
          });
        }
        reactionsMap.set(reaction.comment_id, commentReactions);
      });

      // Build comments with profiles and reactions
      const commentsWithData = (commentsData || []).map(comment => ({
        ...comment,
        profile: profileMap.get(comment.user_id),
        reactions: (reactionsMap.get(comment.id) || []).map(r => ({ emoji: r.emoji, count: r.count })),
        userReaction: (reactionsMap.get(comment.id) || []).find(r => r.userReacted)?.emoji || null,
        replies: [] as Comment[],
      }));

      // Organize into tree structure
      const rootComments: Comment[] = [];
      const commentMap = new Map<string, Comment>();

      commentsWithData.forEach(comment => {
        commentMap.set(comment.id, comment);
      });

      commentsWithData.forEach(comment => {
        if (comment.parent_id && commentMap.has(comment.parent_id)) {
          commentMap.get(comment.parent_id)!.replies.push(comment);
        } else {
          rootComments.push(comment);
        }
      });

      setComments(rootComments);
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoading(false);
    }
  }, [postId, open, user?.id]);

  useEffect(() => {
    if (open) {
      fetchComments();

      // Subscribe to real-time changes
      const channel = supabase
        .channel(`comments-${postId}`)
        .on("postgres_changes", { event: "*", schema: "public", table: "post_comments", filter: `post_id=eq.${postId}` }, () => fetchComments())
        .on("postgres_changes", { event: "*", schema: "public", table: "comment_reactions" }, () => fetchComments())
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [fetchComments, open, postId]);

  const handleSubmit = async () => {
    if (!user || !newComment.trim() || submitting) return;

    setSubmitting(true);
    try {
      const { error } = await supabase.from("post_comments").insert({
        post_id: postId,
        user_id: user.id,
        content: newComment.trim(),
        parent_id: replyingTo?.id || null,
      });

      if (error) throw error;

      setNewComment("");
      setReplyingTo(null);
      toast({ title: "Commentaire publié" });
    } catch (error) {
      toast({ title: "Erreur", description: "Impossible de publier le commentaire", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("post_comments")
        .delete()
        .eq("id", commentId)
        .eq("user_id", user.id);

      if (error) throw error;
      toast({ title: "Commentaire supprimé" });
    } catch (error) {
      toast({ title: "Erreur", description: "Impossible de supprimer", variant: "destructive" });
    }
  };

  const handleReaction = async (commentId: string, emoji: string, currentReaction: string | null) => {
    if (!user) return;

    try {
      if (currentReaction === emoji) {
        await supabase
          .from("comment_reactions")
          .delete()
          .eq("comment_id", commentId)
          .eq("user_id", user.id);
      } else {
        await supabase
          .from("comment_reactions")
          .upsert({ comment_id: commentId, user_id: user.id, emoji });
      }
    } catch (error) {
      console.error("Error toggling reaction:", error);
    }
  };

  const CommentItem = ({ comment, depth = 0 }: { comment: Comment; depth?: number }) => {
    const [showReactions, setShowReactions] = useState(false);
    const isOwner = comment.user_id === user?.id;

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn("py-3", depth > 0 && "ml-8 border-l-2 border-border/50 pl-4")}
      >
        <div className="flex gap-3">
          <Avatar className="w-8 h-8 shrink-0">
            <AvatarImage src={comment.profile?.avatar_url || ""} />
            <AvatarFallback className="bg-gradient-to-br from-tiwill-pink to-tiwill-purple text-white text-xs">
              {comment.is_anonymous ? "?" : (comment.profile?.display_name || "U")[0]}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm">
                {comment.is_anonymous ? "Anonyme" : comment.profile?.display_name || "Utilisateur"}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: fr })}
              </span>
              
              {isOwner && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6 ml-auto">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem 
                      className="text-destructive"
                      onClick={() => handleDelete(comment.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Supprimer
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            <p className="text-sm mt-1 break-words">{comment.content}</p>

            {/* Actions */}
            <div className="flex items-center gap-3 mt-2">
              {/* Reaction button */}
              <div className="relative">
                <button
                  className={cn(
                    "flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors",
                    comment.userReaction && "text-primary"
                  )}
                  onClick={() => setShowReactions(!showReactions)}
                >
                  <span>{comment.userReaction || "❤️"}</span>
                  {comment.reactions.reduce((sum, r) => sum + r.count, 0) > 0 && (
                    <span>{comment.reactions.reduce((sum, r) => sum + r.count, 0)}</span>
                  )}
                </button>

                <AnimatePresence>
                  {showReactions && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="absolute bottom-full left-0 mb-1 flex gap-1 p-1.5 rounded-full bg-card shadow-lg border z-10"
                    >
                      {COMMENT_REACTIONS.map(emoji => (
                        <button
                          key={emoji}
                          className={cn(
                            "w-7 h-7 rounded-full flex items-center justify-center hover:bg-muted transition-colors",
                            comment.userReaction === emoji && "bg-primary/10"
                          )}
                          onClick={() => {
                            handleReaction(comment.id, emoji, comment.userReaction);
                            setShowReactions(false);
                          }}
                        >
                          {emoji}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Reply button */}
              {depth < 2 && (
                <button
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                  onClick={() => setReplyingTo({ 
                    id: comment.id, 
                    username: comment.profile?.display_name || "Utilisateur" 
                  })}
                >
                  <CornerDownRight className="w-3 h-3" />
                  Répondre
                </button>
              )}
            </div>

            {/* Reaction badges */}
            {comment.reactions.length > 0 && (
              <div className="flex gap-1 mt-2">
                {comment.reactions.slice(0, 3).map(reaction => (
                  <span 
                    key={reaction.emoji}
                    className="text-xs bg-muted px-1.5 py-0.5 rounded-full"
                  >
                    {reaction.emoji} {reaction.count}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Replies */}
        {comment.replies.length > 0 && (
          <div className="mt-2">
            {comment.replies.map(reply => (
              <CommentItem key={reply.id} comment={reply} depth={depth + 1} />
            ))}
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[80vh] rounded-t-3xl">
        <SheetHeader className="pb-4 border-b">
          <SheetTitle className="text-center">
            Commentaires ({commentsCount})
          </SheetTitle>
        </SheetHeader>

        {/* Comments list */}
        <div className="flex-1 overflow-y-auto py-4 max-h-[calc(80vh-140px)]">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Aucun commentaire</p>
              <p className="text-sm text-muted-foreground mt-1">Sois le premier à commenter !</p>
            </div>
          ) : (
            <div className="space-y-1">
              {comments.map(comment => (
                <CommentItem key={comment.id} comment={comment} />
              ))}
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-background border-t safe-bottom">
          {replyingTo && (
            <div className="flex items-center justify-between mb-2 px-2 py-1 bg-muted rounded-lg">
              <span className="text-xs text-muted-foreground">
                Réponse à <span className="font-medium text-foreground">{replyingTo.username}</span>
              </span>
              <button 
                className="text-xs text-primary"
                onClick={() => setReplyingTo(null)}
              >
                Annuler
              </button>
            </div>
          )}
          
          <div className="flex gap-2">
            <Input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={replyingTo ? "Écrire une réponse..." : "Ajouter un commentaire..."}
              className="flex-1 rounded-full"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
            />
            <Button 
              size="icon" 
              className="rounded-full shrink-0"
              onClick={handleSubmit}
              disabled={!newComment.trim() || submitting}
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
