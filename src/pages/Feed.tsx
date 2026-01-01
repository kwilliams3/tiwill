import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { usePosts } from "@/hooks/usePosts";
import { useStories } from "@/hooks/useStories";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CreatePostModal } from "@/components/CreatePostModal";
import { EmojiReactions } from "@/components/EmojiReactions";
import { StoryViewer } from "@/components/StoryViewer";
import { CommentsSection } from "@/components/CommentsSection";
import { TiWillLogo } from "@/components/TiWillLogo";
import { NotificationCenter } from "@/components/NotificationCenter";
import { BottomNav } from "@/components/BottomNav";
import { Plus, Clock, MessageSquare, MoreHorizontal, Globe, Search, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

const Feed = () => {
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [viewingStoryGroupIndex, setViewingStoryGroupIndex] = useState<number | null>(null);
  const [viewingCommentsPostId, setViewingCommentsPostId] = useState<string | null>(null);
  const { user, loading: authLoading } = useAuth();
  const { posts, loading: postsLoading } = usePosts();
  const { groupedStories, markAsViewed } = useStories();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  if (authLoading || postsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center safe-area-padding">
        <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24 safe-area-padding">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b px-4 py-3 safe-top">
        <div className="flex items-center justify-between mb-3">
          <TiWillLogo size="sm" animate={false} />
          <div className="flex items-center gap-2">
            <NotificationCenter />
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full w-10 h-10 touch-target"
              onClick={() => navigate("/chat")}
              aria-label="Messages"
            >
              <MessageCircle className="w-5 h-5" />
            </Button>
          </div>
        </div>
        
        {/* Search Bar */}
        <button
          onClick={() => navigate("/search")}
          className="w-full flex items-center gap-3 px-4 h-12 rounded-full bg-muted/60 border border-border/50 hover:border-primary/30 hover:bg-muted transition-all duration-300"
        >
          <Search className="w-5 h-5 text-muted-foreground" />
          <span className="text-muted-foreground text-sm">Rechercher des amis...</span>
        </button>
      </header>

      {/* Stories Section */}
      <div className="px-3 py-3 overflow-x-auto scrollbar-hide">
        <div className="flex gap-3">
          {/* Add Story Button */}
          <button
            className="flex flex-col items-center gap-1.5 shrink-0 touch-target min-w-[70px]"
            aria-label="Ajouter une story"
          >
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center border-2 border-dashed border-muted-foreground/30">
              <Plus className="w-5 h-5 text-muted-foreground" />
            </div>
            <span className="text-xs text-muted-foreground font-medium">Ajouter</span>
          </button>

          {/* Stories List */}
          {groupedStories.map((group, index) => (
            <button 
              key={group.userId} 
              className="flex flex-col items-center gap-1.5 shrink-0 touch-target min-w-[70px]"
              onClick={() => setViewingStoryGroupIndex(index)}
              aria-label={`Voir les stories de ${group.userId === user?.id ? "vous" : group.profile.display_name}`}
            >
              <div className={cn(
                "p-0.5 rounded-full",
                group.hasUnviewed ? "story-ring gradient-primary" : "bg-gradient-to-br from-muted to-muted/50"
              )}>
                <Avatar className="w-14 h-14 border-2 border-background">
                  <AvatarImage src={group.profile.avatar_url || ""} alt={group.profile.display_name} />
                  <AvatarFallback className="bg-gradient-to-br from-tiwill-pink to-tiwill-purple text-white">
                    {(group.profile.display_name || "?")[0]}
                  </AvatarFallback>
                </Avatar>
              </div>
              <span className="text-xs font-medium truncate w-full text-center px-1">
                {group.userId === user?.id ? "Toi" : (group.profile.display_name || "User").split(" ")[0]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Posts Feed */}
      <div className="px-3 space-y-3">
        {posts.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <Globe className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground font-medium">Aucun post pour le moment</p>
            <p className="text-sm text-muted-foreground mt-1">Sois le premier à partager !</p>
            <Button
              onClick={() => setShowCreatePost(true)}
              className="mt-6 h-11 px-6 rounded-full gradient-primary text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Créer un post
            </Button>
          </div>
        ) : (
          posts.map((post, i) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="bg-card rounded-2xl shadow-sm border overflow-hidden"
            >
              {/* Post Header */}
              <div className="flex items-center gap-3 p-4">
                <Avatar className="w-11 h-11">
                  <AvatarImage src={post.profile?.avatar_url || ""} alt={post.profile?.display_name} />
                  <AvatarFallback className="bg-gradient-to-br from-tiwill-pink to-tiwill-purple text-white text-sm">
                    {post.is_anonymous ? "?" : (post.profile?.display_name || "U")[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm truncate">
                      {post.is_anonymous ? "Anonyme" : post.profile?.display_name || "Utilisateur"}
                    </p>
                    {post.profile?.level && post.profile.level > 1 && (
                      <span className="px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                        Nv.{post.profile.level}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                    <Clock className="w-3 h-3" />
                    <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: fr })}</span>
                    {post.location && (
                      <>
                        <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                        <span className="truncate">{post.location}</span>
                      </>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full w-9 h-9 touch-target"
                  aria-label="Plus d'options"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>

              {/* Post Content */}
              {post.content && (
                <p className="px-4 pb-3 text-sm leading-relaxed whitespace-pre-line">
                  {post.content}
                </p>
              )}
              
              {/* Media */}
              {post.media_url && (
                <div className="relative aspect-square bg-muted/30 overflow-hidden">
                  <img
                    src={post.media_url}
                    alt=""
                    className="w-full h-full object-cover"
                    loading={i < 3 ? "eager" : "lazy"}
                  />
                </div>
              )}

              {/* Hashtags */}
              {post.hashtags && post.hashtags.length > 0 && (
                <div className="px-4 py-3 flex flex-wrap gap-2 border-t border-border/50">
                  {post.hashtags.slice(0, 5).map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                  {post.hashtags.length > 5 && (
                    <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs">
                      +{post.hashtags.length - 5}
                    </span>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-4 p-4 border-t border-border/50">
                <EmojiReactions postId={post.id} />
                <button
                  className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors ml-auto touch-target min-h-[44px] px-2"
                  onClick={() => {
                    setViewingCommentsPostId(post.id);
                  }}
                  aria-label="Commenter"
                >
                  <MessageSquare className="w-5 h-5" />
                  <span className="text-sm font-medium min-w-[20px] text-right">
                    {post.comments_count || 0}
                  </span>
                </button>
              </div>
            </motion.article>
          ))
        )}
      </div>

      {/* Story Viewer */}
      <AnimatePresence>
        {viewingStoryGroupIndex !== null && (
          <StoryViewer
            groups={groupedStories}
            initialGroupIndex={viewingStoryGroupIndex}
            onClose={() => setViewingStoryGroupIndex(null)}
            onViewed={markAsViewed}
          />
        )}
      </AnimatePresence>

      {/* Comments Section */}
      <CommentsSection
        postId={viewingCommentsPostId || ""}
        open={viewingCommentsPostId !== null}
        onOpenChange={(open) => !open && setViewingCommentsPostId(null)}
      />

      {/* Create Post Modal */}
      <CreatePostModal open={showCreatePost} onOpenChange={setShowCreatePost} />

      {/* FAB - Floating Action Button */}
      <button
        className="fixed right-4 bottom-20 w-14 h-14 rounded-full gradient-primary shadow-xl flex items-center justify-center text-white touch-target z-30"
        onClick={() => setShowCreatePost(true)}
        aria-label="Créer un post"
      >
        <Plus className="w-6 h-6" />
      </button>

      <BottomNav />
    </div>
  );
};

export default Feed;
