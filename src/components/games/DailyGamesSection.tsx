import { useState } from "react";
import { motion } from "framer-motion";
import { Gamepad2, Trophy, Sparkles } from "lucide-react";
import { useDailyGames, DailyGame } from "@/hooks/useDailyGames";
import { GameCard } from "./GameCard";
import { GameModal } from "./GameModal";

export function DailyGamesSection() {
  const { games, loading, hasCompleted, getTimeRemaining, startGame, submitAnswer } =
    useDailyGames();
  const [selectedGame, setSelectedGame] = useState<DailyGame | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handlePlay = async (game: DailyGame) => {
    await startGame(game.id);
    setSelectedGame(game);
    setModalOpen(true);
  };

  const handleSubmit = async (answer: string, timeTaken: number) => {
    if (!selectedGame) return { correct: false };
    const result = await submitAnswer(selectedGame.id, answer, timeTaken);
    return { correct: result.correct, points: result.points };
  };

  const handleClose = () => {
    setModalOpen(false);
    setSelectedGame(null);
  };

  const completedCount = games.filter((g) => hasCompleted(g.id)).length;
  const totalPoints = games
    .filter((g) => hasCompleted(g.id))
    .reduce((sum, g) => sum + g.points_reward, 0);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-muted animate-pulse rounded-lg w-48" />
        <div className="h-32 bg-muted animate-pulse rounded-2xl" />
        <div className="h-32 bg-muted animate-pulse rounded-2xl" />
      </div>
    );
  }

  if (games.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Gamepad2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p>Aucun jeu disponible pour le moment</p>
        <p className="text-sm">Revenez dans quelques heures !</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold">Jeux du Jour</h2>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Trophy className="h-4 w-4 text-yellow-500" />
            {completedCount}/{games.length}
          </span>
          <span className="flex items-center gap-1">
            <Sparkles className="h-4 w-4 text-primary" />
            {totalPoints} pts
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-primary to-primary/60"
          initial={{ width: 0 }}
          animate={{ width: `${(completedCount / games.length) * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Game cards */}
      <div className="space-y-3">
        {games.map((game, index) => (
          <motion.div
            key={game.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <GameCard
              game={game}
              completed={hasCompleted(game.id)}
              timeRemaining={getTimeRemaining(game.expires_at)}
              onPlay={() => handlePlay(game)}
            />
          </motion.div>
        ))}
      </div>

      {/* Game modal */}
      <GameModal
        game={selectedGame}
        open={modalOpen}
        onClose={handleClose}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
