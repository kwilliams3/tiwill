import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useInterests, useUserInterests } from "@/hooks/useInterests";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Camera, Check, Sparkles, User, Smile, Heart, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Onboarding = () => {
  const [step, setStep] = useState(0);
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const { user } = useAuth();
  const { profile, updateProfile, uploadAvatar } = useProfile();
  const { interests } = useInterests();
  const { userInterests, toggleInterest } = useUserInterests(user?.id);
  const navigate = useNavigate();

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await uploadAvatar(file);
  };

  const handleComplete = async () => {
    await updateProfile({ username, bio, onboarding_completed: true });
    navigate("/feed");
  };

  const steps = [
    {
      title: "Personnalise ton profil",
      subtitle: "Ajoute une photo et choisis ton pseudo",
      icon: User,
      content: (
        <div className="space-y-8 w-full">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center gap-4">
            <label 
              className="relative cursor-pointer group touch-target" 
              htmlFor="avatar-upload"
            >
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center overflow-hidden border-4 border-dashed border-primary/20 group-hover:border-primary/40 transition-all duration-300">
                {profile?.avatar_url ? (
                  <Avatar className="w-full h-full">
                    <AvatarImage src={profile.avatar_url} alt="Avatar" />
                    <AvatarFallback className="bg-gradient-to-br from-tiwill-pink to-tiwill-purple text-white text-3xl">
                      {(user?.email?.[0] || "U").toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Camera className="w-10 h-10 text-primary/60 group-hover:text-primary transition-colors" />
                    <span className="text-xs text-muted-foreground font-medium">Ajouter une photo</span>
                  </div>
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 w-12 h-12 rounded-full gradient-primary flex items-center justify-center shadow-lg border-4 border-background touch-target">
                <Camera className="w-5 h-5 text-white" />
              </div>
            </label>
            <input 
              id="avatar-upload"
              type="file" 
              accept="image/*" 
              onChange={handleAvatarChange} 
              className="hidden" 
            />
            <p className="text-xs text-muted-foreground text-center px-4">
              Tappe sur l'image pour changer ta photo de profil
            </p>
          </div>

          {/* Username Input */}
          <div className="space-y-2">
            <label htmlFor="username" className="text-sm font-medium text-muted-foreground block">
              Choisis ton pseudo
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
              <Input
                id="username"
                placeholder="tonpseudo"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-14 pl-10 pr-4 rounded-2xl text-base"
                maxLength={30}
              />
            </div>
            <p className="text-xs text-muted-foreground text-right">
              {username.length}/30 caractères
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "Présente-toi",
      subtitle: "Parle-nous un peu de toi",
      icon: Smile,
      content: (
        <div className="space-y-6 w-full">
          <div className="space-y-2">
            <label htmlFor="bio" className="text-sm font-medium text-muted-foreground block">
              Ta bio (optionnel)
            </label>
            <Textarea
              id="bio"
              placeholder="Ex: Passionné de tech, amoureux de la nature, fan de musique..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="min-h-40 rounded-2xl resize-none text-base p-4"
              maxLength={160}
            />
            <p className="text-xs text-muted-foreground text-right">
              {bio.length}/160 caractères
            </p>
          </div>
          <div className="bg-muted/30 rounded-xl p-4">
            <p className="text-xs text-muted-foreground">
              💡 <span className="font-medium">Astuce :</span> Partage ce qui te passionne ou ce que tu cherches sur TiWill
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "Tes centres d'intérêt",
      subtitle: "Sélectionne au moins 3 sujets qui t'intéressent",
      icon: Heart,
      content: (
        <div className="w-full">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {userInterests.length} sélectionné{userInterests.length > 1 ? 's' : ''}
            </p>
            {userInterests.length >= 3 && (
              <span className="text-xs font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
                ✓ Parfait !
              </span>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pb-4">
            {interests.map((interest) => {
              const isSelected = userInterests.includes(interest.id);
              return (
                <button
                  key={interest.id}
                  onClick={() => toggleInterest(interest.id)}
                  className={cn(
                    "flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 touch-target min-h-[64px]",
                    isSelected
                      ? "border-primary bg-primary/5 scale-[1.02] shadow-sm"
                      : "border-muted hover:border-primary/30 hover:bg-muted/50"
                  )}
                >
                  <span className="text-2xl">{interest.emoji}</span>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-sm">{interest.name}</p>
                    {interest.color && (
                      <p className="text-xs text-muted-foreground mt-1">{interest.name}</p>
                    )}
                  </div>
                  {isSelected && (
                    <div className="w-6 h-6 rounded-full gradient-primary flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          
          {userInterests.length < 3 && (
            <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200">
              <p className="text-xs text-amber-800 font-medium">
                ⚡ Sélectionne encore {3 - userInterests.length} centre{3 - userInterests.length > 1 ? 's' : ''} d'intérêt pour continuer
              </p>
            </div>
          )}
        </div>
      ),
    },
  ];

  const canProceed = () => {
    if (step === 0) return username.length >= 3;
    if (step === 2) return userInterests.length >= 3;
    return true;
  };

  // Récupérer l'icône de l'étape actuelle
  const CurrentIcon = steps[step].icon as LucideIcon;

  return (
    <div className="min-h-screen bg-background safe-area-padding">
      <div className="absolute inset-0 bg-gradient-to-br from-tiwill-pink/5 via-transparent to-tiwill-blue/5" />
      
      <div className="relative min-h-screen flex flex-col px-5 py-6">
        {/* Progress Indicator */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex gap-2 flex-1">
            {steps.map((_, i) => (
              <div 
                key={i} 
                className={cn(
                  "h-1.5 flex-1 rounded-full transition-all duration-300",
                  i <= step ? "gradient-primary" : "bg-muted"
                )} 
              />
            ))}
          </div>
          <span className="text-xs font-medium text-muted-foreground ml-4">
            {step + 1}/{steps.length}
          </span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="flex-1 flex flex-col"
          >
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                <CurrentIcon className="w-7 h-7 text-primary" />
              </div>
              <h1 className="text-2xl font-bold mb-2">{steps[step].title}</h1>
              <p className="text-muted-foreground text-sm">{steps[step].subtitle}</p>
            </div>

            {/* Content */}
            <div className="flex-1 flex items-center justify-center px-2">
              <div className="w-full max-w-md">{steps[step].content}</div>
            </div>

            {/* Navigation Buttons */}
            <div className={cn(
              "flex gap-3 mt-8",
              step === 0 ? "justify-end" : "justify-between"
            )}>
              {step > 0 && (
                <Button
                  variant="outline"
                  onClick={() => setStep(step - 1)}
                  className="h-12 px-6 rounded-xl flex-1 max-w-[140px] touch-target"
                >
                  Retour
                </Button>
              )}
              <Button
                onClick={() => (step === steps.length - 1 ? handleComplete() : setStep(step + 1))}
                disabled={!canProceed()}
                className={cn(
                  "h-12 rounded-xl flex-1 min-w-[140px] touch-target",
                  step === 0 ? "ml-auto" : ""
                )}
              >
                {step === steps.length - 1 ? (
                  <>
                    <Check className="w-5 h-5 mr-2" /> 
                    Terminer l'inscription
                  </>
                ) : (
                  <>
                    Continuer 
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Skip for later (only on interests step) */}
        {step === 2 && userInterests.length === 0 && (
          <div className="text-center mt-6">
            <button
              onClick={handleComplete}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors touch-target py-2 px-4"
            >
              Passer pour l'instant, je choisirai plus tard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
