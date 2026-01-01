import { Camera, Music, PenTool, Trophy } from "lucide-react";

interface Challenge {
  id: string;
  title: string;
  emoji: string;
  points: number;
  icon: typeof Camera;
}

const dailyChallenges: Challenge[] = [
  { id: "1", title: "Photo Lumière", emoji: "📸", points: 20, icon: Camera },
  { id: "2", title: "Rythme Urbain", emoji: "🎵", points: 40, icon: Music },
  { id: "3", title: "Micro-Fiction", emoji: "✍️", points: 60, icon: PenTool },
];

export function ChallengesSidebar() {
  return (
    <div className="sidebar-section">
      <h3 className="flex items-center gap-2 text-base font-semibold mb-4">
        <Trophy className="w-4 h-4 text-tiwill-orange" />
        Challenges du Jour
      </h3>
      
      <div className="space-y-2">
        {dailyChallenges.map((challenge) => (
          <button
            key={challenge.id}
            className="challenge-card w-full group"
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">{challenge.emoji}</span>
              <span className="text-sm font-medium text-foreground/80 group-hover:text-foreground">
                {challenge.title}
              </span>
            </div>
            <span className="points-badge">
              +{challenge.points} pts
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
