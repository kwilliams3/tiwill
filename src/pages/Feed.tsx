import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { usePosts } from "@/hooks/usePosts";
import { useStories } from "@/hooks/useStories";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CreatePostModal } from "@/components/CreatePostModal";
import { Home, Search, Plus, MessageCircle, User, Clock, Heart, MessageSquare, MoreHorizontal } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

const Feed = () => {
  const [showCreatePost, setShowCreatePost] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const { posts, loading: postsLoading } = usePosts();
  const { groupedStories } = useStories();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  if (authLoading || postsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-30 glass border-b px-4 py-3 safe-top">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-display font-bold gradient-text">TiWill</h1>
          <Button variant="ghost" size="icon" className="rounded-full">
            <MessageCircle className="w-6 h-6" />
          </Button>
        </div>
      </header>

      {/* Stories */}
      <div className="px-4 py-4 overflow-x-auto scrollbar-hide">
        <div className="flex gap-4">
          {/* Add Story */}
          <button className="flex flex-col items-center gap-1 shrink-0">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center border-2 border-dashed border-muted-foreground/30">
              <Plus className="w-6 h-6 text-muted-foreground" />
            </div>
            <span className="text-xs text-muted-foreground">Ajouter</span>
          </button>

          {groupedStories.map((group) => (
            <button key={group.userId} className="flex flex-col items-center gap-1 shrink-0">
              <div className={cn("p-0.5 rounded-full", group.hasUnviewed ? "story-ring" : "bg-muted")}>
                <Avatar className="w-14 h-14 border-2 border-background">
                  <AvatarImage src={group.profile.avatar_url || ""} />
                  <AvatarFallback className="bg-gradient-to-br from-tiwill-pink to-tiwill-purple text-white">
                    {(group.profile.display_name || "?")[0]}
                  </AvatarFallback>
                </Avatar>
              </div>
              <span className="text-xs truncate w-16 text-center">
                {group.userId === user?.id ? "Toi" : group.profile.display_name || "User"}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Posts */}
      <div className="px-4 space-y-4">
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Aucun post pour le moment</p>
            <p className="text-sm text-muted-foreground mt-1">Sois le premier à partager !</p>
          </div>
        ) : (
          posts.map((post, i) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="post-card"
            >
              {/* Post Header */}
              <div className="flex items-center gap-3 p-4">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={post.profile?.avatar_url || ""} />
                  <AvatarFallback className="bg-gradient-to-br from-tiwill-pink to-tiwill-purple text-white text-sm">
                    {post.is_anonymous ? "?" : (post.profile?.display_name || "U")[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-semibold text-sm">
                    {post.is_anonymous ? "Anonyme" : post.profile?.display_name || "Utilisateur"}
                    {post.profile?.level && post.profile.level > 1 && (
                      <span className="level-badge ml-2">Nv.{post.profile.level}</span>
                    )}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: fr })}</span>
                    {post.location && <span>• {post.location}</span>}
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>

              {/* Post Content */}
              {post.content && <p className="px-4 pb-3 text-sm">{post.content}</p>}
              
              {post.media_url && (
                <div className="aspect-square bg-muted">
                  <img src={post.media_url} alt="" className="w-full h-full object-cover" />
                </div>
              )}

              {/* Hashtags */}
              {post.hashtags && post.hashtags.length > 0 && (
                <div className="px-4 py-2 flex flex-wrap gap-2">
                  {post.hashtags.map((tag) => (
                    <span key={tag} className="text-xs text-primary font-medium">#{tag}</span>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-6 p-4 border-t border-border/50">
                <button className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                  <Heart className="w-5 h-5" />
                  <span className="text-sm">{post.likes_count}</span>
                </button>
                <button className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                  <MessageSquare className="w-5 h-5" />
                  <span className="text-sm">{post.comments_count}</span>
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Create Post Modal */}
      <CreatePostModal open={showCreatePost} onOpenChange={setShowCreatePost} />

      {/* FAB */}
      <button className="fab animate-pulse-glow" onClick={() => setShowCreatePost(true)}>
        <Plus className="w-7 h-7" />
      </button>

      {/* Bottom Navigation */}
      <nav className="bottom-nav safe-bottom">
        <div className="flex justify-around py-3">
          {[
            { icon: Home, label: "Accueil", active: true },
            { icon: Search, label: "Découvrir" },
            { icon: Plus, label: "Créer", special: true, action: () => setShowCreatePost(true) },
            { icon: MessageCircle, label: "Messages" },
            { icon: User, label: "Profil", path: "/profile" },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => item.path ? navigate(item.path) : item.action?.()}
              className={cn(
                "flex flex-col items-center gap-1 px-4 py-1 rounded-xl transition-colors",
                item.active && "text-primary",
                item.special && "gradient-primary text-white rounded-full px-6 py-2 -mt-6 shadow-lg"
              )}
            >
              <item.icon className={cn("w-6 h-6", item.special && "w-7 h-7")} />
              {!item.special && <span className="text-xs">{item.label}</span>}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default Feed;
