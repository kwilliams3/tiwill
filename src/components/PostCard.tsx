import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { 
  Heart, MessageCircle, Share2, MoreHorizontal, Clock, 
  Users, Star, Camera, Music
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface PostProfile {
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
  level: number | null;
}

interface Post {
  id: string;
  content: string | null;
  media_url: string | null;
  media_type: string | null;
  hashtags: string[] | null;
  location: string | null;
  is_anonymous: boolean | null;
  likes_count: number | null;
  comments_count: number | null;
  created_at: string;
  expires_at: string;
  user_id: string;
  profile?: PostProfile;
}

interface PostCardProps {
  post: Post;
  onCommentClick: () => void;
}

export function PostCard({ post, onCommentClick }: PostCardProps) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const expiresIn = formatDistanceToNow(new Date(post.expires_at), { locale: fr });
  const createdAt = formatDistanceToNow(new Date(post.created_at), { addSuffix: false, locale: fr });
  
  // Calculate points based on engagement
  const engagementPoints = Math.floor(((post.likes_count || 0) + (post.comments_count || 0) * 2) / 3) + Math.floor(Math.random() * 20);

  // Mock tags based on content
  const getTags = () => {
    const tags = [];
    if (post.content?.toLowerCase().includes("collabor")) {
      tags.push({ label: "Collaboratif", icon: Users, type: "collaborative" });
    }
    if (post.media_url && post.media_type === "image") {
      tags.push({ label: "Photographe", icon: Camera, type: "creative" });
    }
    if (post.content?.toLowerCase().includes("musique") || post.content?.toLowerCase().includes("music")) {
      tags.push({ label: "Musicienne", icon: Music, type: "creative" });
    }
    if ((post.likes_count || 0) > 50) {
      tags.push({ label: "Challenge Winner", icon: Star, type: "innovative" });
    }
    return tags;
  };

  const tags = getTags();

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="post-card"
    >
      {/* Post Header */}
      <div className="flex items-start justify-between p-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => !post.is_anonymous && navigate(`/profile/${post.user_id}`)}
            className={cn(!post.is_anonymous && "hover:opacity-80 transition-opacity")}
          >
            <Avatar className="w-12 h-12 ring-2 ring-primary/10">
              <AvatarImage src={post.is_anonymous ? "" : (post.profile?.avatar_url || "")} />
              <AvatarFallback className="bg-gradient-to-br from-tiwill-purple to-tiwill-blue text-white">
                {post.is_anonymous ? "?" : (post.profile?.display_name || "U")[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </button>
          
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">
                {post.is_anonymous ? "Anonyme" : (post.profile?.display_name || "Utilisateur")}
              </span>
              {!post.is_anonymous && post.profile?.username && (
                <span className="text-sm text-muted-foreground">
                  @{post.profile.username}
                </span>
              )}
              <span className="text-muted-foreground">•</span>
              <span className="text-sm text-muted-foreground">{createdAt}</span>
            </div>
            
            {/* Collaborative badge */}
            {post.content?.toLowerCase().includes("collabor") && (
              <div className="flex items-center gap-1 mt-1">
                <span className="tag-badge tag-collaborative">
                  <Users className="w-3 h-3" />
                  Collaboratif
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Expiry timer */}
          <div className="expiry-timer">
            <Clock className="w-3.5 h-3.5" />
            <span>{expiresIn}</span>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8 rounded-full text-muted-foreground hover:text-foreground"
          >
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Post Content */}
      {post.content && (
        <div className="px-4 pb-3">
          <p className="text-sm leading-relaxed whitespace-pre-line">{post.content}</p>
        </div>
      )}

      {/* Media */}
      {post.media_url && (
        <div className="relative aspect-video bg-muted/30 overflow-hidden">
          <img
            src={post.media_url}
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <div className="px-4 py-3 flex flex-wrap gap-2">
          {tags.map((tag, i) => (
            <span 
              key={i} 
              className={cn(
                "tag-badge",
                tag.type === "collaborative" && "tag-collaborative",
                tag.type === "creative" && "tag-creative",
                tag.type === "innovative" && "tag-innovative"
              )}
            >
              <tag.icon className="w-3 h-3" />
              {tag.label}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-border/50">
        <div className="flex items-center gap-6">
          <button className="flex items-center gap-2 text-muted-foreground hover:text-tiwill-red transition-colors group">
            <Heart className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium">{post.likes_count || 0}</span>
          </button>
          
          <button 
            onClick={onCommentClick}
            className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors group"
          >
            <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium">{post.comments_count || 0}</span>
          </button>
          
          <button className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <Share2 className="w-5 h-5" />
          </button>
        </div>

        {/* Points earned */}
        {engagementPoints > 0 && (
          <span className="points-badge">
            +{engagementPoints} pts
          </span>
        )}
      </div>
    </motion.article>
  );
}
