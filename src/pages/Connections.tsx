import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useFollowers, useFollowing, useFollow } from "@/hooks/useFollow";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Users, UserMinus, UserPlus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface UserCardProps {
  user: {
    id: string;
    user_id: string;
    username: string | null;
    display_name: string | null;
    avatar_url: string | null;
    level: number | null;
  };
  showUnfollow?: boolean;
  onAction?: () => void;
}

const UserCard = ({ user, showUnfollow, onAction }: UserCardProps) => {
  const navigate = useNavigate();
  const { isFollowing, actionLoading, toggleFollow } = useFollow(user.user_id);
  const { user: currentUser } = useAuth();
  
  const isCurrentUser = currentUser?.id === user.user_id;

  const handleFollowClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await toggleFollow();
    if (onAction) onAction();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      whileHover={{ scale: 1.02 }}
      onClick={() => navigate(`/profile/${user.user_id}`)}
      className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-card to-card/80 border border-border/50 cursor-pointer hover:shadow-lg transition-all duration-300"
    >
      <div className="flex items-center gap-4">
        <div className="relative">
          <Avatar className="w-14 h-14 border-2 border-primary/20">
            <AvatarImage src={user.avatar_url || ""} />
            <AvatarFallback className="bg-gradient-to-br from-primary to-primary/60 text-primary-foreground text-lg">
              {(user.display_name || user.username || "U")[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {user.level && (
            <span className="absolute -bottom-1 -right-1 px-2 py-0.5 text-[10px] font-bold rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white">
              {user.level}
            </span>
          )}
        </div>
        <div>
          <p className="font-semibold text-foreground">
            {user.display_name || "Utilisateur"}
          </p>
          {user.username && (
            <p className="text-sm text-muted-foreground">@{user.username}</p>
          )}
        </div>
      </div>

      {!isCurrentUser && (
        <Button
          size="sm"
          variant={isFollowing ? "outline" : "default"}
          onClick={handleFollowClick}
          disabled={actionLoading}
          className={cn(
            "rounded-full gap-2 transition-all duration-300",
            isFollowing 
              ? "hover:bg-destructive/10 hover:text-destructive hover:border-destructive" 
              : "bg-gradient-to-r from-primary to-primary/80"
          )}
        >
          {actionLoading ? (
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : isFollowing ? (
            <>
              <UserMinus className="w-4 h-4" />
              <span className="hidden sm:inline">Suivi</span>
            </>
          ) : (
            <>
              <UserPlus className="w-4 h-4" />
              <span className="hidden sm:inline">Suivre</span>
            </>
          )}
        </Button>
      )}
    </motion.div>
  );
};

const Connections = () => {
  const { userId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const targetUserId = userId || user?.id;
  const initialTab = searchParams.get("tab") || "followers";
  const [activeTab, setActiveTab] = useState(initialTab);

  const { followers, loading: loadingFollowers } = useFollowers(targetUserId);
  const { following, loading: loadingFollowing } = useFollowing(targetUserId);

  const isOwnProfile = !userId || userId === user?.id;

  const EmptyState = ({ type }: { type: "followers" | "following" }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <div className="p-6 rounded-full bg-muted/50 mb-4">
        <Users className="w-12 h-12 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">
        {type === "followers" ? "Aucun abonné" : "Aucun abonnement"}
      </h3>
      <p className="text-muted-foreground max-w-xs">
        {type === "followers"
          ? "Personne ne suit encore ce profil."
          : "Ce profil ne suit personne pour le moment."}
      </p>
    </motion.div>
  );

  const LoadingState = () => (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="flex items-center gap-4 p-4 rounded-2xl bg-muted/50 animate-pulse"
        >
          <div className="w-14 h-14 rounded-full bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-32 bg-muted rounded" />
            <div className="h-3 w-24 bg-muted rounded" />
          </div>
          <div className="h-9 w-24 bg-muted rounded-full" />
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 pb-8">
      {/* Header */}
      <div className="relative bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
        <div className="flex items-center gap-4 px-6 py-6 safe-top">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="rounded-xl hover:bg-muted"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </motion.div>
          <motion.div
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <h1 className="text-2xl font-bold">
              {isOwnProfile ? "Mes connexions" : "Connexions"}
            </h1>
            <p className="text-sm text-muted-foreground">
              Gérer vos abonnés et abonnements
            </p>
          </motion.div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 mt-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-2 h-14 p-1 bg-muted/50 rounded-2xl">
            <TabsTrigger
              value="followers"
              className="rounded-xl h-full text-sm font-semibold data-[state=active]:bg-background data-[state=active]:shadow-lg transition-all duration-300"
            >
              <Users className="w-4 h-4 mr-2" />
              Abonnés ({followers.length})
            </TabsTrigger>
            <TabsTrigger
              value="following"
              className="rounded-xl h-full text-sm font-semibold data-[state=active]:bg-background data-[state=active]:shadow-lg transition-all duration-300"
            >
              <Users className="w-4 h-4 mr-2" />
              Abonnements ({following.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="followers" className="mt-6 space-y-3">
            <AnimatePresence mode="wait">
              {loadingFollowers ? (
                <LoadingState />
              ) : followers.length === 0 ? (
                <EmptyState type="followers" />
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-3"
                >
                  {followers.map((follower) => (
                    <UserCard key={follower.id} user={follower} />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>

          <TabsContent value="following" className="mt-6 space-y-3">
            <AnimatePresence mode="wait">
              {loadingFollowing ? (
                <LoadingState />
              ) : following.length === 0 ? (
                <EmptyState type="following" />
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-3"
                >
                  {following.map((followed) => (
                    <UserCard key={followed.id} user={followed} showUnfollow />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Connections;
