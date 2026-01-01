import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, Camera, User, Bell, Shield, LogOut, Save,
  Mail, AtSign, Sparkles, Eye, EyeOff, UserX, Volume2, VolumeX,
  MessageSquare, Heart, Users, Trash2
} from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const Settings = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { profile, updateProfile, uploadAvatar, loading } = useProfile();
  
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    display_name: "",
    username: "",
    bio: "",
  });
  
  // Privacy settings
  const [privacySettings, setPrivacySettings] = useState({
    is_anonymous: false,
    hide_likes: false,
    hide_views: false,
  });
  
  // Notification settings (local state - could be extended to database)
  const [notificationSettings, setNotificationSettings] = useState({
    push_enabled: true,
    email_notifications: true,
    new_followers: true,
    likes: true,
    comments: true,
    messages: true,
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        display_name: profile.display_name || "",
        username: profile.username || "",
        bio: profile.bio || "",
      });
      setPrivacySettings({
        is_anonymous: profile.is_anonymous || false,
        hide_likes: profile.hide_likes || false,
        hide_views: profile.hide_views || false,
      });
    }
  }, [profile]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      await uploadAvatar(file);
      setIsUploading(false);
      toast.success("Photo de profil mise à jour");
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      await updateProfile({
        ...formData,
        ...privacySettings,
      });
      toast.success("Profil mis à jour avec succès");
    } catch (error) {
      toast.error("Erreur lors de la mise à jour");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const SettingRow = ({ 
    icon: Icon, 
    title, 
    description, 
    checked, 
    onChange,
    iconColor = "text-primary"
  }: {
    icon: React.ElementType;
    title: string;
    description: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    iconColor?: string;
  }) => (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-muted/50 to-muted/30 hover:from-muted/70 hover:to-muted/50 transition-all duration-200"
    >
      <div className="flex items-center gap-4">
        <div className={cn("p-2 rounded-xl bg-background/50", iconColor)}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="font-medium text-sm">{title}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onChange}
        className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-primary data-[state=checked]:to-primary/80"
      />
    </motion.div>
  );

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring" as const, stiffness: 100 } }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 pb-24">
      {/* Header */}
      <div className="relative bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
        <div className="flex items-center justify-between px-6 py-6 safe-top">
          <div className="flex items-center gap-4">
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
              <h1 className="text-2xl font-bold">Paramètres</h1>
              <p className="text-sm text-muted-foreground">
                Gérer votre compte et préférences
              </p>
            </motion.div>
          </div>
          
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
          >
            <Button
              onClick={handleSaveProfile}
              disabled={isSaving}
              className="rounded-xl bg-gradient-to-r from-primary to-primary/80 gap-2"
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">Sauvegarder</span>
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 mt-6">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="w-full grid grid-cols-3 h-14 p-1 bg-muted/50 rounded-2xl mb-6">
            <TabsTrigger
              value="profile"
              className="rounded-xl h-full text-sm font-semibold data-[state=active]:bg-background data-[state=active]:shadow-lg transition-all duration-300"
            >
              <User className="w-4 h-4 mr-2" />
              Profil
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="rounded-xl h-full text-sm font-semibold data-[state=active]:bg-background data-[state=active]:shadow-lg transition-all duration-300"
            >
              <Bell className="w-4 h-4 mr-2" />
              Notifs
            </TabsTrigger>
            <TabsTrigger
              value="privacy"
              className="rounded-xl h-full text-sm font-semibold data-[state=active]:bg-background data-[state=active]:shadow-lg transition-all duration-300"
            >
              <Shield className="w-4 h-4 mr-2" />
              Privacité
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
              className="space-y-6"
            >
              {/* Avatar Section */}
              <motion.div 
                variants={itemVariants}
                className="flex flex-col items-center p-6 rounded-3xl bg-gradient-to-br from-card to-card/80 border border-border/50 shadow-lg"
              >
                <div className="relative group">
                  <div className="absolute -inset-2 bg-gradient-to-r from-primary/30 to-primary/10 rounded-full blur-xl opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
                  <label className={cn(
                    "relative inline-block cursor-pointer",
                    isUploading && "animate-pulse"
                  )}>
                    <Avatar className="w-28 h-28 border-4 border-background shadow-xl relative z-10 transform transition-transform duration-300 group-hover:scale-105">
                      <AvatarImage src={profile?.avatar_url || ""} />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-primary/60 text-primary-foreground text-3xl">
                        {(profile?.display_name || user?.email || "U")[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute bottom-1 right-1 w-9 h-9 rounded-full bg-gradient-to-r from-primary to-primary/80 flex items-center justify-center shadow-lg transform transition-transform duration-300 group-hover:scale-110 z-20">
                      <Camera className="w-4 h-4 text-primary-foreground" />
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                      disabled={isUploading}
                    />
                  </label>
                </div>
                <p className="mt-4 text-sm text-muted-foreground">
                  Cliquez pour changer votre photo
                </p>
              </motion.div>

              {/* Form Fields */}
              <motion.div 
                variants={itemVariants}
                className="space-y-4 p-6 rounded-3xl bg-gradient-to-br from-card to-card/80 border border-border/50 shadow-lg"
              >
                <div className="space-y-2">
                  <Label htmlFor="display_name" className="flex items-center gap-2 text-sm font-medium">
                    <Sparkles className="w-4 h-4 text-primary" />
                    Nom d'affichage
                  </Label>
                  <Input
                    id="display_name"
                    value={formData.display_name}
                    onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                    placeholder="Votre nom"
                    className="h-12 rounded-xl bg-muted/50 border-border/50 focus:border-primary/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username" className="flex items-center gap-2 text-sm font-medium">
                    <AtSign className="w-4 h-4 text-primary" />
                    Nom d'utilisateur
                  </Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="votre_username"
                    className="h-12 rounded-xl bg-muted/50 border-border/50 focus:border-primary/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2 text-sm font-medium">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    value={user?.email || ""}
                    disabled
                    className="h-12 rounded-xl bg-muted/30 border-border/30 text-muted-foreground"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio" className="flex items-center gap-2 text-sm font-medium">
                    <User className="w-4 h-4 text-primary" />
                    Bio
                  </Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Parlez de vous..."
                    className="min-h-[100px] rounded-xl bg-muted/50 border-border/50 focus:border-primary/50 resize-none"
                  />
                </div>
              </motion.div>
            </motion.div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-4">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
              className="space-y-4"
            >
              <motion.div variants={itemVariants} className="p-6 rounded-3xl bg-gradient-to-br from-card to-card/80 border border-border/50 shadow-lg space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Bell className="w-5 h-5 text-primary" />
                  Paramètres généraux
                </h3>
                
                <SettingRow
                  icon={Volume2}
                  title="Notifications push"
                  description="Recevoir des notifications sur votre appareil"
                  checked={notificationSettings.push_enabled}
                  onChange={(checked) => setNotificationSettings({ ...notificationSettings, push_enabled: checked })}
                />
                
                <SettingRow
                  icon={Mail}
                  title="Notifications email"
                  description="Recevoir des emails pour les activités importantes"
                  checked={notificationSettings.email_notifications}
                  onChange={(checked) => setNotificationSettings({ ...notificationSettings, email_notifications: checked })}
                />
              </motion.div>

              <motion.div variants={itemVariants} className="p-6 rounded-3xl bg-gradient-to-br from-card to-card/80 border border-border/50 shadow-lg space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Types de notifications
                </h3>
                
                <SettingRow
                  icon={Users}
                  title="Nouveaux abonnés"
                  description="Quand quelqu'un commence à vous suivre"
                  checked={notificationSettings.new_followers}
                  onChange={(checked) => setNotificationSettings({ ...notificationSettings, new_followers: checked })}
                />
                
                <SettingRow
                  icon={Heart}
                  title="Likes"
                  description="Quand quelqu'un aime votre contenu"
                  checked={notificationSettings.likes}
                  onChange={(checked) => setNotificationSettings({ ...notificationSettings, likes: checked })}
                />
                
                <SettingRow
                  icon={MessageSquare}
                  title="Commentaires"
                  description="Quand quelqu'un commente votre contenu"
                  checked={notificationSettings.comments}
                  onChange={(checked) => setNotificationSettings({ ...notificationSettings, comments: checked })}
                />
                
                <SettingRow
                  icon={MessageSquare}
                  title="Messages"
                  description="Quand vous recevez un nouveau message"
                  checked={notificationSettings.messages}
                  onChange={(checked) => setNotificationSettings({ ...notificationSettings, messages: checked })}
                />
              </motion.div>
            </motion.div>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy" className="space-y-4">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
              className="space-y-4"
            >
              <motion.div variants={itemVariants} className="p-6 rounded-3xl bg-gradient-to-br from-card to-card/80 border border-border/50 shadow-lg space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Confidentialité du profil
                </h3>
                
                <SettingRow
                  icon={UserX}
                  title="Mode anonyme"
                  description="Vos posts seront publiés de façon anonyme"
                  checked={privacySettings.is_anonymous}
                  onChange={(checked) => setPrivacySettings({ ...privacySettings, is_anonymous: checked })}
                />
                
                <SettingRow
                  icon={EyeOff}
                  title="Masquer les likes"
                  description="Les autres ne verront pas le nombre de likes"
                  checked={privacySettings.hide_likes}
                  onChange={(checked) => setPrivacySettings({ ...privacySettings, hide_likes: checked })}
                />
                
                <SettingRow
                  icon={Eye}
                  title="Masquer les vues"
                  description="Les autres ne verront pas le nombre de vues"
                  checked={privacySettings.hide_views}
                  onChange={(checked) => setPrivacySettings({ ...privacySettings, hide_views: checked })}
                />
              </motion.div>

              {/* Danger Zone */}
              <motion.div variants={itemVariants} className="p-6 rounded-3xl bg-gradient-to-br from-destructive/5 to-destructive/10 border border-destructive/20 shadow-lg space-y-4">
                <h3 className="font-semibold flex items-center gap-2 text-destructive">
                  <Trash2 className="w-5 h-5" />
                  Zone de danger
                </h3>
                
                <Button
                  variant="outline"
                  onClick={handleSignOut}
                  className="w-full h-12 rounded-xl border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Se déconnecter
                </Button>
              </motion.div>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;
