import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Users, Heart, Sparkles } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useFriendSuggestions } from "@/hooks/useFriendSuggestions";
import { useAuth } from "@/hooks/useAuth";
import { FollowButton } from "@/components/FollowButton";

export function FriendSuggestions() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { suggestions, loading } = useFriendSuggestions();

  if (!user) {
    return (
      <div className="text-center py-8">
        <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
        <p className="text-muted-foreground">
          Connectez-vous pour voir les suggestions
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="h-20 bg-muted/50 rounded-xl animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (suggestions.length === 0) {
    return (
      <div className="text-center py-8">
        <Sparkles className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
        <p className="text-muted-foreground">
          Ajoutez des centres d'intérêt dans votre profil pour découvrir des personnes similaires !
        </p>
        <Button
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={() => navigate("/profile")}
        >
          Modifier mon profil
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {suggestions.map((friend, index) => (
        <motion.div
          key={friend.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="relative overflow-hidden rounded-xl group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative p-4 bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl">
            <div className="flex items-start gap-3">
              <Avatar
                className="h-14 w-14 ring-2 ring-primary/20 shrink-0 cursor-pointer"
                onClick={() => navigate(`/profile/${friend.user_id}`)}
              >
                <AvatarImage src={friend.avatar_url || ""} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground text-lg">
                  {friend.display_name?.[0] || friend.username?.[0] || "?"}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div
                    className="cursor-pointer"
                    onClick={() => navigate(`/profile/${friend.user_id}`)}
                  >
                    <p className="font-semibold truncate">
                      {friend.display_name || friend.username || "Anonyme"}
                    </p>
                    {friend.username && (
                      <p className="text-sm text-muted-foreground truncate">
                        @{friend.username}
                      </p>
                    )}
                  </div>
                  <FollowButton targetUserId={friend.user_id} variant="compact" />
                </div>

                <div className="flex items-center gap-1.5 mt-2">
                  <Heart className="h-3.5 w-3.5 text-pink-500" />
                  <span className="text-xs text-muted-foreground">
                    {friend.commonInterestCount} intérêt{friend.commonInterestCount > 1 ? "s" : ""} en commun
                  </span>
                </div>

                {friend.commonInterests.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {friend.commonInterests.slice(0, 3).map((interest, i) => (
                      <Badge
                        key={i}
                        variant="outline"
                        className="text-xs bg-primary/5 border-primary/20"
                      >
                        {interest}
                      </Badge>
                    ))}
                    {friend.commonInterests.length > 3 && (
                      <Badge
                        variant="outline"
                        className="text-xs bg-muted/50"
                      >
                        +{friend.commonInterests.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
