import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useStories, GroupedStories } from "@/hooks/useStories";
import { DesktopHeader } from "@/components/DesktopHeader";
import { BottomNav } from "@/components/BottomNav";
import { StoryViewer } from "@/components/StoryViewer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Plus, Sparkles, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Stories() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { groupedStories, loading, markAsViewed } = useStories();
  const [selectedGroupIndex, setSelectedGroupIndex] = useState<number | null>(null);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    navigate("/auth");
    return null;
  }

  const handleStoryClick = (index: number) => {
    setSelectedGroupIndex(index);
  };

  const handleCloseViewer = () => {
    setSelectedGroupIndex(null);
  };

  const handleViewed = (storyId: string) => {
    markAsViewed(storyId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-lavender-50 to-background">
      <DesktopHeader />
      
      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border/50">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Stories Éphémères
          </h1>
          <div className="w-9" />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 pb-24 lg:pb-8">
        <div className="hidden lg:flex items-center gap-2 mb-6">
          <Sparkles className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold">Stories Éphémères</h1>
        </div>

        {/* Add Story Button */}
        <div className="mb-8">
          <Button className="w-full sm:w-auto btn-create gap-2">
            <Plus className="w-4 h-4" />
            Créer une story
          </Button>
        </div>

        {/* Stories Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-[9/16] rounded-2xl bg-secondary/50 animate-pulse" />
            ))}
          </div>
        ) : groupedStories.length === 0 ? (
          <div className="text-center py-16">
            <Sparkles className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Aucune story pour le moment</h3>
            <p className="text-muted-foreground text-sm">
              Soyez le premier à partager une story !
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {groupedStories.map((group, index) => (
              <button
                key={group.userId}
                onClick={() => handleStoryClick(index)}
                className="relative aspect-[9/16] rounded-2xl overflow-hidden group"
              >
                {/* Story Preview */}
                <img
                  src={group.stories[0]?.media_url || ""}
                  alt=""
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                
                {/* Ring indicator */}
                <div className={cn(
                  "absolute top-3 left-3 p-0.5 rounded-full",
                  group.hasUnviewed ? "story-ring" : "story-ring-viewed"
                )}>
                  <div className="bg-background rounded-full p-0.5">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={group.profile.avatar_url || ""} />
                      <AvatarFallback className="bg-gradient-to-br from-tiwill-purple to-tiwill-blue text-white text-xs">
                        {(group.profile.display_name || "?")[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </div>

                {/* User Info */}
                <div className="absolute bottom-3 left-3 right-3">
                  <p className="text-white font-medium text-sm truncate">
                    {group.userId === user?.id ? "Votre story" : group.profile.display_name || "Utilisateur"}
                  </p>
                  <p className="text-white/70 text-xs">
                    {group.stories.length} {group.stories.length > 1 ? "stories" : "story"}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </main>

      {/* Story Viewer Modal */}
      {selectedGroupIndex !== null && (
        <StoryViewer
          groups={groupedStories}
          initialGroupIndex={selectedGroupIndex}
          onClose={handleCloseViewer}
          onViewed={handleViewed}
        />
      )}

      <BottomNav />
    </div>
  );
}