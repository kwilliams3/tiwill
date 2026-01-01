import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { usePosts } from "@/hooks/usePosts";
import { useStories } from "@/hooks/useStories";
import { DesktopHeader } from "@/components/DesktopHeader";
import { FeedTabs } from "@/components/FeedTabs";
import { StoriesSidebar } from "@/components/StoriesSidebar";
import { ChallengesSidebar } from "@/components/ChallengesSidebar";
import { PostCard } from "@/components/PostCard";
import { BottomNav } from "@/components/BottomNav";
import { TiWillLogo } from "@/components/TiWillLogo";
import { NotificationCenter } from "@/components/NotificationCenter";
import { CreatePostModal } from "@/components/CreatePostModal";
import { StoryViewer } from "@/components/StoryViewer";
import { CommentsSection } from "@/components/CommentsSection";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Plus, Globe, MessageCircle, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const Feed = () => {
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [viewingStoryGroupIndex, setViewingStoryGroupIndex] = useState<number | null>(null);
  const [viewingCommentsPostId, setViewingCommentsPostId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("feed");
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
    <div className="min-h-screen bg-gradient-to-b from-lavender-50 to-background">
      {/* Desktop Header */}
      <DesktopHeader />

      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b px-4 py-3 safe-top">
        <div className="flex items-center justify-between mb-3">
          <TiWillLogo size="sm" animate={false} />
          <div className="flex items-center gap-2">
            <NotificationCenter />
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full w-10 h-10 touch-target"
              onClick={() => navigate("/chat")}
            >
              <MessageCircle className="w-5 h-5" />
            </Button>
          </div>
        </div>
        
        {/* Mobile Search Bar */}
        <button
          onClick={() => navigate("/search")}
          className="w-full flex items-center gap-3 px-4 h-11 rounded-full bg-muted/60 border border-border/50 hover:border-primary/30 transition-all"
        >
          <Search className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground text-sm">Rechercher des amis...</span>
        </button>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-4">
        {/* Feed Tabs */}
        <div className="mb-6">
          <FeedTabs activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        <div className="flex gap-6">
          {/* Left Sidebar - Desktop only */}
          <aside className="hidden lg:block w-72 flex-shrink-0 space-y-6">
            <StoriesSidebar onStoryClick={setViewingStoryGroupIndex} />
            <ChallengesSidebar />
          </aside>

          {/* Main Feed */}
          <main className="flex-1 min-w-0">
            {/* Mobile Stories */}
            <div className="lg:hidden mb-6">
              <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
                {/* Add Story */}
                <div className="flex flex-col items-center gap-1.5 shrink-0">
                  <button className="w-16 h-16 rounded-full bg-muted flex items-center justify-center border-2 border-dashed border-muted-foreground/30">
                    <Plus className="w-5 h-5 text-muted-foreground" />
                  </button>
                  <span className="text-xs text-muted-foreground">Ajouter</span>
                </div>

                {/* Stories */}
                {groupedStories.map((group, index) => (
                  <button 
                    key={group.userId}
                    className="flex flex-col items-center gap-1.5 shrink-0"
                    onClick={() => setViewingStoryGroupIndex(index)}
                  >
                    <div className={cn(
                      "p-0.5 rounded-full",
                      group.hasUnviewed ? "story-ring" : "story-ring-viewed"
                    )}>
                      <Avatar className="w-14 h-14 border-2 border-background">
                        <AvatarImage src={group.profile.avatar_url || ""} />
                        <AvatarFallback className="bg-gradient-to-br from-tiwill-pink to-tiwill-purple text-white">
                          {(group.profile.display_name || "?")[0]}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <span className="text-xs font-medium truncate w-full text-center px-1">
                      {group.userId === user?.id ? "Vous" : (group.profile.display_name || "User").split(" ")[0]}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Posts */}
            <div className="space-y-4 pb-24 lg:pb-8">
              {posts.length === 0 ? (
                <div className="text-center py-16 px-4">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                    <Globe className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground font-medium">Aucun post pour le moment</p>
                  <p className="text-sm text-muted-foreground mt-1">Sois le premier à partager !</p>
                  <Button
                    onClick={() => setShowCreatePost(true)}
                    className="mt-6 btn-create"
                  >
                    <Plus className="w-4 h-4" />
                    Créer un post
                  </Button>
                </div>
              ) : (
                posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onCommentClick={() => setViewingCommentsPostId(post.id)}
                  />
                ))
              )}

              {/* Load more button */}
              {posts.length > 0 && (
                <div className="flex justify-center pt-4">
                  <Button
                    variant="outline"
                    className="rounded-full px-8 bg-gradient-to-r from-tiwill-orange/10 to-tiwill-pink/10 border-tiwill-orange/30 text-tiwill-orange hover:bg-gradient-to-r hover:from-tiwill-orange/20 hover:to-tiwill-pink/20"
                  >
                    Charger plus de contenu éphémère
                  </Button>
                </div>
              )}
            </div>
          </main>
        </div>
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

      {/* FAB - Mobile only */}
      <button
        className="lg:hidden fab"
        onClick={() => setShowCreatePost(true)}
        aria-label="Créer un post"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Bottom Navigation - Mobile only */}
      <div className="lg:hidden">
        <BottomNav />
      </div>
    </div>
  );
};

export default Feed;
