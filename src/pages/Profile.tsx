import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useInterests, useUserInterests } from "@/hooks/useInterests";
import { useGamification } from "@/hooks/useGamification";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { BadgeDisplay, LevelProgress } from "@/components/GamificationUI";
import { ArrowLeft, Camera, Settings, LogOut, Shield, Eye, EyeOff, Star, Trophy } from "lucide-react";
import { motion } from "framer-motion";

const Profile = () => {
  const { user, signOut } = useAuth();
  const { profile, updateProfile, uploadAvatar } = useProfile();
  const { interests } = useInterests();
  const { userInterests } = useUserInterests(user?.id);
  const { badges, userBadges } = useGamification();
  const navigate = useNavigate();

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await uploadAvatar(file);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const userInterestsList = interests.filter((i) => userInterests.includes(i.id));

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header with gradient */}
      <div className="relative h-40 gradient-primary">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 flex items-center justify-between px-4 pt-4 safe-top">
          <Button variant="ghost" size="icon" onClick={() => navigate("/feed")} className="text-white hover:bg-white/20 rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-full">
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Avatar */}
      <div className="relative -mt-16 px-6">
        <label className="relative inline-block cursor-pointer group">
          <Avatar className="w-32 h-32 border-4 border-background shadow-xl">
            <AvatarImage src={profile?.avatar_url || ""} />
            <AvatarFallback className="bg-gradient-to-br from-tiwill-pink to-tiwill-purple text-white text-3xl">
              {(profile?.display_name || user?.email || "U")[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="absolute bottom-2 right-2 w-8 h-8 rounded-full gradient-primary flex items-center justify-center shadow-lg">
            <Camera className="w-4 h-4 text-white" />
          </div>
          <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
        </label>
      </div>

      {/* Profile Info */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="px-6 mt-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">{profile?.display_name || "Utilisateur"}</h1>
          <span className="level-badge"><Star className="w-3 h-3" /> Nv.{profile?.level || 1}</span>
        </div>
        {profile?.username && <p className="text-muted-foreground">@{profile.username}</p>}
        {profile?.bio && <p className="mt-2 text-sm">{profile.bio}</p>}

        {/* Level Progress */}
        <div className="mt-6 p-4 rounded-2xl bg-muted/50">
          <LevelProgress level={profile?.level || 1} points={profile?.points || 0} />
        </div>

        {/* Stats */}
        <div className="flex gap-6 mt-6 py-4 border-y border-border">
          <div className="text-center">
            <p className="text-2xl font-bold gradient-text">{profile?.points || 0}</p>
            <p className="text-xs text-muted-foreground">Points</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{userBadges.length}</p>
            <p className="text-xs text-muted-foreground">Badges</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">0</p>
            <p className="text-xs text-muted-foreground">Posts</p>
          </div>
        </div>

        {/* Badges */}
        <div className="mt-6">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-primary" /> Badges
          </h3>
          <BadgeDisplay badges={badges} userBadges={userBadges} size="md" />
        </div>

        {/* Interests */}
        {userInterestsList.length > 0 && (
          <div className="mt-6">
            <h3 className="font-semibold mb-3">Centres d'intérêt</h3>
            <div className="flex flex-wrap gap-2">
              {userInterestsList.map((interest) => (
                <span key={interest.id} className="px-3 py-1 rounded-full bg-muted text-sm">
                  {interest.emoji} {interest.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Privacy Settings */}
        <div className="mt-8 space-y-4">
          <h3 className="font-semibold flex items-center gap-2"><Shield className="w-4 h-4" /> Confidentialité</h3>
          
          <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/50">
            <div className="flex items-center gap-3">
              <EyeOff className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium text-sm">Mode anonyme</p>
                <p className="text-xs text-muted-foreground">Tes posts seront anonymes</p>
              </div>
            </div>
            <Switch checked={profile?.is_anonymous || false} onCheckedChange={(checked) => updateProfile({ is_anonymous: checked })} />
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/50">
            <div className="flex items-center gap-3">
              <Eye className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium text-sm">Masquer les likes</p>
                <p className="text-xs text-muted-foreground">Mode anti-FOMO</p>
              </div>
            </div>
            <Switch checked={profile?.hide_likes || false} onCheckedChange={(checked) => updateProfile({ hide_likes: checked })} />
          </div>
        </div>

        {/* Logout */}
        <Button onClick={handleSignOut} variant="outline" className="w-full mt-8 h-12 rounded-2xl text-destructive border-destructive/30 hover:bg-destructive/10">
          <LogOut className="w-5 h-5 mr-2" /> Se déconnecter
        </Button>
      </motion.div>
    </div>
  );
};

export default Profile;
