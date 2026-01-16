import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useGamification } from "@/hooks/useGamification";
import { DesktopHeader } from "@/components/DesktopHeader";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { DailyGamesSection } from "@/components/games/DailyGamesSection";
import { 
  Trophy, 
  Camera, 
  Music, 
  PenTool, 
  Flame, 
  Star, 
  ArrowLeft,
  Clock,
  Users,
  Zap,
  Gamepad2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Challenge {
  id: string;
  title: string;
  description: string;
  emoji: string;
  points: number;
  icon: typeof Camera;
  type: "daily" | "weekly";
  participants: number;
  progress: number;
  deadline: string;
}

const challenges: Challenge[] = [
  { 
    id: "1", 
    title: "Photo Lumière", 
    description: "Capturez un moment où la lumière naturelle sublime votre sujet",
    emoji: "📸", 
    points: 20, 
    icon: Camera,
    type: "daily",
    participants: 156,
    progress: 0,
    deadline: "23h restantes"
  },
  { 
    id: "2", 
    title: "Rythme Urbain", 
    description: "Partagez une création musicale inspirée par les sons de la ville",
    emoji: "🎵", 
    points: 40, 
    icon: Music,
    type: "daily",
    participants: 89,
    progress: 0,
    deadline: "23h restantes"
  },
  { 
    id: "3", 
    title: "Micro-Fiction", 
    description: "Écrivez une histoire captivante en moins de 280 caractères",
    emoji: "✍️", 
    points: 60, 
    icon: PenTool,
    type: "daily",
    participants: 234,
    progress: 0,
    deadline: "23h restantes"
  },
  { 
    id: "4", 
    title: "7 Jours de Créativité", 
    description: "Publiez une création originale chaque jour pendant une semaine",
    emoji: "🔥", 
    points: 200, 
    icon: Flame,
    type: "weekly",
    participants: 412,
    progress: 42,
    deadline: "5 jours restants"
  },
  { 
    id: "5", 
    title: "Collaboration Stars", 
    description: "Créez une œuvre collaborative avec 3 autres créateurs",
    emoji: "⭐", 
    points: 150, 
    icon: Star,
    type: "weekly",
    participants: 67,
    progress: 33,
    deadline: "5 jours restants"
  },
];

export default function Challenges() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { userBadges, badges } = useGamification();

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

  const dailyChallenges = challenges.filter(c => c.type === "daily");
  const weeklyChallenges = challenges.filter(c => c.type === "weekly");

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
            <Trophy className="w-5 h-5 text-tiwill-orange" />
            Challenges
          </h1>
          <div className="w-9" />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 pb-24 lg:pb-8">
        <div className="hidden lg:flex items-center gap-2 mb-6">
          <Trophy className="w-6 h-6 text-tiwill-orange" />
          <h1 className="text-2xl font-bold">Challenges</h1>
        </div>

        {/* Stats Banner */}
        <div className="bg-gradient-to-r from-tiwill-purple to-tiwill-blue rounded-2xl p-6 mb-8 text-white">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-white/80 text-sm mb-1">Vos badges gagnés</p>
              <p className="text-3xl font-bold">{userBadges.length}</p>
            </div>
            <div className="flex gap-2">
              {userBadges.slice(0, 4).map((ub) => {
                const badge = badges.find(b => b.id === ub.badge_id);
                return badge ? (
                  <div 
                    key={ub.id}
                    className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-xl"
                    title={badge.name}
                  >
                    {badge.icon}
                  </div>
                ) : null;
              })}
              {userBadges.length > 4 && (
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-sm font-medium">
                  +{userBadges.length - 4}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Daily Games Section - Jeux de réflexion */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Gamepad2 className="w-5 h-5 text-tiwill-purple" />
            <h2 className="text-lg font-semibold">Jeux de Réflexion</h2>
          </div>
          <DailyGamesSection />
        </section>

        {/* Daily Challenges */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-tiwill-orange" />
            <h2 className="text-lg font-semibold">Challenges du Jour</h2>
          </div>
          
          <div className="grid gap-4">
            {dailyChallenges.map((challenge) => {
              const Icon = challenge.icon;
              return (
                <div
                  key={challenge.id}
                  className="bg-card rounded-2xl p-4 border border-border/50 hover:border-primary/30 transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-tiwill-orange/20 to-tiwill-pink/20 flex items-center justify-center shrink-0">
                      <span className="text-2xl">{challenge.emoji}</span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-semibold">{challenge.title}</h3>
                        <span className="points-badge shrink-0">
                          +{challenge.points} pts
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {challenge.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          {challenge.participants} participants
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {challenge.deadline}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <Button className="w-full mt-4 btn-create">
                    Participer
                  </Button>
                </div>
              );
            })}
          </div>
        </section>

        {/* Weekly Challenges */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Flame className="w-5 h-5 text-tiwill-orange" />
            <h2 className="text-lg font-semibold">Challenges de la Semaine</h2>
          </div>
          
          <div className="grid gap-4">
            {weeklyChallenges.map((challenge) => {
              const Icon = challenge.icon;
              return (
                <div
                  key={challenge.id}
                  className="bg-card rounded-2xl p-4 border border-border/50 hover:border-primary/30 transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-tiwill-purple/20 to-tiwill-blue/20 flex items-center justify-center shrink-0">
                      <span className="text-2xl">{challenge.emoji}</span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-semibold">{challenge.title}</h3>
                        <span className="points-badge shrink-0">
                          +{challenge.points} pts
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {challenge.description}
                      </p>
                      
                      {/* Progress */}
                      <div className="mb-3">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Progression</span>
                          <span className="font-medium">{challenge.progress}%</span>
                        </div>
                        <Progress value={challenge.progress} className="h-2" />
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          {challenge.participants} participants
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {challenge.deadline}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <Button className="w-full mt-4" variant="outline">
                    Continuer
                  </Button>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}