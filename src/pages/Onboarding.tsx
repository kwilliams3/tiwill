import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useInterests, useUserInterests } from "@/hooks/useInterests";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Camera, Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const Onboarding = () => {
  const [step, setStep] = useState(0);
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const { user } = useAuth();
  const { updateProfile, uploadAvatar } = useProfile();
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
      title: "Choisis ton pseudo",
      content: (
        <div className="space-y-6">
          <div className="flex justify-center">
            <label className="relative cursor-pointer group">
              <div className="w-28 h-28 rounded-full bg-muted flex items-center justify-center overflow-hidden border-4 border-dashed border-muted-foreground/30 group-hover:border-primary transition-colors">
                <Camera className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
              <span className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full gradient-primary flex items-center justify-center">
                <span className="text-white text-lg">+</span>
              </span>
            </label>
          </div>
          <Input placeholder="@tonpseudo" value={username} onChange={(e) => setUsername(e.target.value)} className="h-14 text-center text-xl rounded-2xl" />
        </div>
      ),
    },
    {
      title: "Parle-nous de toi",
      content: (
        <Textarea placeholder="Une courte bio pour te présenter..." value={bio} onChange={(e) => setBio(e.target.value)} className="min-h-32 rounded-2xl resize-none" />
      ),
    },
    {
      title: "Tes centres d'intérêt",
      content: (
        <div className="flex flex-wrap gap-3 justify-center">
          {interests.map((interest) => (
            <button
              key={interest.id}
              onClick={() => toggleInterest(interest.id)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all",
                userInterests.includes(interest.id)
                  ? "gradient-primary text-white shadow-lg scale-105"
                  : "bg-muted hover:bg-muted/80"
              )}
            >
              {interest.emoji} {interest.name}
            </button>
          ))}
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="absolute inset-0 bg-gradient-to-br from-tiwill-pink/5 via-transparent to-tiwill-blue/5" />
      
      <div className="relative min-h-screen flex flex-col px-6 py-8">
        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {steps.map((_, i) => (
            <div key={i} className={cn("h-1 flex-1 rounded-full transition-colors", i <= step ? "gradient-primary" : "bg-muted")} />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col"
          >
            <div className="text-center mb-8">
              <Sparkles className="w-10 h-10 mx-auto mb-4 text-primary" />
              <h1 className="text-2xl font-display font-bold">{steps[step].title}</h1>
            </div>

            <div className="flex-1 flex items-center justify-center">
              <div className="w-full max-w-sm">{steps[step].content}</div>
            </div>

            <div className="flex gap-4 mt-8">
              {step > 0 && (
                <Button variant="outline" onClick={() => setStep(step - 1)} className="flex-1 h-14 rounded-2xl">
                  Retour
                </Button>
              )}
              <Button
                onClick={() => (step === steps.length - 1 ? handleComplete() : setStep(step + 1))}
                className="flex-1 h-14 rounded-2xl gradient-primary text-white"
              >
                {step === steps.length - 1 ? (
                  <>
                    <Check className="w-5 h-5 mr-2" /> Terminer
                  </>
                ) : (
                  <>
                    Suivant <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Onboarding;
