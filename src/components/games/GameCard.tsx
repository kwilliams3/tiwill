import { motion } from "framer-motion";
import { Clock, Trophy, Zap, Brain, Calculator, Puzzle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DailyGame } from "@/hooks/useDailyGames";

interface GameCardProps {
  game: DailyGame;
  completed: boolean;
  timeRemaining: { hours: number; minutes: number } | null;
  onPlay: () => void;
}

const gameIcons: Record<string, React.ReactNode> = {
  word_scramble: <Brain className="h-6 w-6" />,
  math_puzzle: <Calculator className="h-6 w-6" />,
  pattern: <Puzzle className="h-6 w-6" />,
  memory: <Zap className="h-6 w-6" />,
};

const gameColors: Record<string, string> = {
  word_scramble: "from-purple-500 to-pink-500",
  math_puzzle: "from-blue-500 to-cyan-500",
  pattern: "from-orange-500 to-yellow-500",
  memory: "from-green-500 to-emerald-500",
};

export function GameCard({ game, completed, timeRemaining, onPlay }: GameCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl bg-card border border-border"
    >
      {/* Gradient header */}
      <div className={`bg-gradient-to-r ${gameColors[game.game_type] || "from-primary to-primary/80"} p-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur">
              {gameIcons[game.game_type] || <Brain className="h-6 w-6" />}
            </div>
            <div>
              <h3 className="font-bold text-white">{game.title}</h3>
              <p className="text-white/80 text-sm">{game.description}</p>
            </div>
          </div>
          <Badge className="bg-white/20 text-white border-0">
            <Trophy className="h-3 w-3 mr-1" />
            {game.points_reward} pts
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-center justify-between">
          {/* Time remaining */}
          {timeRemaining && (
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Clock className="h-4 w-4" />
              <span>
                {timeRemaining.hours}h {timeRemaining.minutes}m restantes
              </span>
            </div>
          )}

          {/* Play button */}
          {completed ? (
            <Badge variant="secondary" className="bg-green-500/10 text-green-600">
              ✓ Complété
            </Badge>
          ) : (
            <Button
              onClick={onPlay}
              className={`bg-gradient-to-r ${gameColors[game.game_type] || "from-primary to-primary/80"}`}
            >
              Jouer
            </Button>
          )}
        </div>
      </div>

      {/* Completed overlay */}
      {completed && (
        <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="bg-green-500 text-white p-4 rounded-full"
          >
            <Trophy className="h-8 w-8" />
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
