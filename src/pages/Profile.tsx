import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useInterests, useUserInterests } from "@/hooks/useInterests";
import { useGamification } from "@/hooks/useGamification";
import { useFollowStats } from "@/hooks/useFollow";
import { useChat } from "@/hooks/useChat";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { BadgeDisplay, LevelProgress } from "@/components/GamificationUI";
import { FollowButton } from "@/components/FollowButton";
import { 
  ArrowLeft, Camera, Settings, LogOut, Shield, Eye, EyeOff, Star, Trophy,
  User, Mail, Sparkles, Heart, Zap, Crown, Users, MessageCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ViewProfile {
  id: string;
  user_id: string;
  username: string | null;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  level: number;
  points: number;
}

const Profile = () => {
  const { userId } = useParams();
  const { user, signOut } = useAuth();
  const { profile, updateProfile, uploadAvatar } = useProfile();
  const { interests } = useInterests();
  const { createConversation } = useChat();
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = useState(false);
  const [isStartingChat, setIsStartingChat] = useState(false);
  
  // Determine if viewing own profile or another user's
  const isOwnProfile = !userId || userId === user?.id;
  const targetUserId = userId || user?.id;
  
  const { userInterests } = useUserInterests(targetUserId);
  const { badges, userBadges } = useGamification();
  const { followersCount, followingCount } = useFollowStats(targetUserId);
  
  // For viewing other profiles
  const [viewProfile, setViewProfile] = useState<ViewProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  
  const handleStartChat = async () => {
    if (!targetUserId) return;
    setIsStartingChat(true);
    try {
      const conversationId = await createConversation(targetUserId);
      if (conversationId) {
        navigate(`/chat?id=${conversationId}`);
      }
    } catch (error) {
      console.error("Error starting chat:", error);
    } finally {
      setIsStartingChat(false);
    }
  };
  
  useEffect(() => {
    if (!isOwnProfile && userId) {
      fetchUserProfile(userId);
    }
  }, [userId, isOwnProfile]);
  
  const fetchUserProfile = async (id: string) => {
    setLoadingProfile(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, user_id, username, display_name, bio, avatar_url, level, points")
        .eq("user_id", id)
        .maybeSingle();
      
      if (error) throw error;
      setViewProfile(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoadingProfile(false);
    }
  };
  
  const displayProfile = isOwnProfile ? profile : viewProfile;

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      await uploadAvatar(file);
      setIsUploading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const userInterestsList = interests.filter((i) => userInterests.includes(i.id));

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring" as const, stiffness: 100 }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 pb-8">
      {/* Gradient Header with Glass Effect */}
      <div className="relative h-48 gradient-primary overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/30" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full bg-gradient-to-r from-tiwill-pink/30 to-tiwill-purple/30 blur-3xl" />
        <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-gradient-to-r from-tiwill-purple/20 to-blue-500/20 blur-3xl" />
        
        {/* Glassmorphism Navigation */}
        <div className="relative z-10 flex items-center justify-between px-6 pt-8 safe-top">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/feed")}
              className="backdrop-blur-lg bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all duration-300"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </motion.div>
          
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/settings")}
              className="backdrop-blur-lg bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all duration-300"
            >
              <Settings className="w-5 h-5" />
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="relative px-6 -mt-24">
        {/* Avatar with Glow Effect */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", delay: 0.2 }}
          className="relative flex justify-center"
        >
          <div className="relative flex justify-center">
            <div className="relative group">
              <div className="absolute -inset-2 bg-gradient-to-r from-tiwill-pink to-tiwill-purple rounded-full blur-xl opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
              {isOwnProfile ? (
                <label className={cn(
                  "relative inline-block cursor-pointer",
                  isUploading && "animate-pulse"
                )}>
                  <Avatar className="w-36 h-36 border-6 border-background shadow-2xl relative z-10 transform transition-transform duration-300 group-hover:scale-105">
                    <AvatarImage src={displayProfile?.avatar_url || ""} />
                    <AvatarFallback className="bg-gradient-to-br from-tiwill-pink to-tiwill-purple text-white text-4xl">
                      {(displayProfile?.display_name || user?.email || "U")[0].toUpperCase()}
                    </AvatarFallback>
                    {isUploading && (
                      <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      </div>
                    )}
                  </Avatar>
                  <div className="absolute bottom-3 right-3 w-10 h-10 rounded-full gradient-primary flex items-center justify-center shadow-xl transform transition-transform duration-300 group-hover:scale-110 z-20">
                    <Camera className="w-5 h-5 text-white" />
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                    disabled={isUploading}
                  />
                </label>
              ) : (
                <Avatar className="w-36 h-36 border-6 border-background shadow-2xl relative z-10">
                  <AvatarImage src={displayProfile?.avatar_url || ""} />
                  <AvatarFallback className="bg-gradient-to-br from-tiwill-pink to-tiwill-purple text-white text-4xl">
                    {(displayProfile?.display_name || "U")[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          </div>
        </motion.div>

        {/* Follow & Message Buttons for other profiles */}
        {!isOwnProfile && targetUserId && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center gap-3 mt-4"
          >
            <FollowButton targetUserId={targetUserId} />
            <Button
              onClick={handleStartChat}
              disabled={isStartingChat}
              className="rounded-full gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
            >
              {isStartingChat ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <MessageCircle className="w-4 h-4" />
              )}
              Message
            </Button>
          </motion.div>
        )}

        {/* Profile Info */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6 mt-8"
        >
          {/* Name and Level */}
          <motion.div variants={itemVariants} className="text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-tiwill-pink to-tiwill-purple bg-clip-text text-transparent">
                {displayProfile?.display_name || "Utilisateur"}
              </h1>
              <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-600 text-sm font-semibold">
                <Star className="w-3 h-3 fill-amber-500" />
                Nv.{displayProfile?.level || 1}
              </span>
            </div>
            
            <div className="flex items-center justify-center gap-4 text-muted-foreground text-sm">
              {displayProfile?.username && (
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  @{displayProfile.username}
                </span>
              )}
              {isOwnProfile && user?.email && (
                <span className="flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  {user.email}
                </span>
              )}
            </div>
            
            {displayProfile?.bio && (
              <p className="mt-4 text-center text-foreground/80 max-w-2xl mx-auto">
                {displayProfile.bio}
              </p>
            )}
          </motion.div>

          {/* Level Progress Card */}
          <motion.div variants={itemVariants}>
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white to-muted/50 dark:from-gray-900 dark:to-gray-800 p-6 shadow-xl border border-border/50">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-tiwill-pink/10 to-tiwill-purple/10 rounded-full -translate-y-16 translate-x-16" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-primary" />
                    <h3 className="font-bold">Progression</h3>
                  </div>
                  <span className="text-sm font-semibold gradient-text">
                    {profile?.points || 0} points
                  </span>
                </div>
                <LevelProgress level={profile?.level || 1} points={profile?.points || 0} />
              </div>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div variants={itemVariants}>
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: "Followers", value: followersCount, icon: Users, color: "from-pink-500 to-rose-500", tab: "followers" },
                { label: "Suivis", value: followingCount, icon: Heart, color: "from-tiwill-pink to-tiwill-purple", tab: "following" },
                { label: "Badges", value: userBadges.length, icon: Trophy, color: "from-amber-500 to-orange-500", tab: null },
                { label: "Points", value: displayProfile?.points || 0, icon: Sparkles, color: "from-emerald-500 to-cyan-500", tab: null },
              ].map((stat, index) => (
                <div
                  key={index}
                  onClick={() => stat.tab && navigate(`/connections/${targetUserId}?tab=${stat.tab}`)}
                  className={cn(
                    "rounded-2xl bg-gradient-to-br from-white/50 to-white/20 dark:from-gray-900/50 dark:to-gray-800/50 p-3 text-center backdrop-blur-sm border border-border/30 shadow-lg transition-all duration-200",
                    stat.tab && "cursor-pointer hover:scale-105 hover:shadow-xl"
                  )}
                >
                  <div className={`inline-flex p-2 rounded-xl bg-gradient-to-br ${stat.color} mb-2`}>
                    <stat.icon className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Badges Section */}
          {userBadges.length > 0 && (
            <motion.div variants={itemVariants}>
              <div className="rounded-3xl bg-gradient-to-br from-white to-muted/50 dark:from-gray-900 dark:to-gray-800 p-6 shadow-xl border border-border/50">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20">
                      <Trophy className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-bold">Badges obtenus</h3>
                      <p className="text-sm text-muted-foreground">Vos accomplissements</p>
                    </div>
                  </div>
                  <Crown className="w-5 h-5 text-amber-500" />
                </div>
                <BadgeDisplay badges={badges} userBadges={userBadges} size="md" />
              </div>
            </motion.div>
          )}

          {/* Interests Section */}
          {userInterestsList.length > 0 && (
            <motion.div variants={itemVariants}>
              <div className="rounded-3xl bg-gradient-to-br from-white to-muted/50 dark:from-gray-900 dark:to-gray-800 p-6 shadow-xl border border-border/50">
                <h3 className="font-bold mb-4">Centres d'intérêt</h3>
                <div className="flex flex-wrap gap-2">
                  <AnimatePresence>
                    {userInterestsList.map((interest, index) => (
                      <motion.span
                        key={interest.id}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="px-4 py-2 rounded-full bg-gradient-to-r from-muted to-muted/80 border border-border/50 text-sm font-medium hover:scale-105 transition-transform duration-200"
                      >
                        <span className="mr-2">{interest.emoji}</span>
                        {interest.name}
                      </motion.span>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}

          {/* Privacy Settings - Only show on own profile */}
          {isOwnProfile && (
            <motion.div variants={itemVariants}>
              <div className="rounded-3xl bg-gradient-to-br from-white to-muted/50 dark:from-gray-900 dark:to-gray-800 p-6 shadow-xl border border-border/50">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20">
                    <Shield className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold">Confidentialité</h3>
                    <p className="text-sm text-muted-foreground">Gérer votre vie privée</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    {
                      icon: EyeOff,
                      title: "Mode anonyme",
                      description: "Tes posts seront anonymes",
                      checked: profile?.is_anonymous || false,
                      onChange: (checked: boolean) => updateProfile({ is_anonymous: checked })
                    },
                    {
                      icon: Eye,
                      title: "Masquer les likes",
                      description: "Mode anti-FOMO",
                      checked: profile?.hide_likes || false,
                      onChange: (checked: boolean) => updateProfile({ hide_likes: checked })
                    }
                  ].map((setting, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.02 }}
                      className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-muted/50 to-muted/30 hover:from-muted/70 hover:to-muted/50 transition-all duration-200"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-xl bg-white/50 dark:bg-gray-800/50">
                          <setting.icon className="w-5 h-5 text-foreground/70" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{setting.title}</p>
                          <p className="text-xs text-muted-foreground">{setting.description}</p>
                        </div>
                      </div>
                      <Switch
                        checked={setting.checked}
                        onCheckedChange={setting.onChange}
                        className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-tiwill-pink data-[state=checked]:to-tiwill-purple"
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Logout Button - Only show on own profile */}
          {isOwnProfile && (
            <motion.div variants={itemVariants}>
              <Button
                onClick={handleSignOut}
                variant="outline"
                className="w-full h-14 rounded-2xl text-destructive border-destructive/30 hover:bg-destructive/10 hover:border-destructive/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lg"
              >
                <LogOut className="w-5 h-5 mr-2" />
                Se déconnecter
              </Button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
