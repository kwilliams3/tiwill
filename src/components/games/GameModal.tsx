import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, HelpCircle, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { DailyGame } from "@/hooks/useDailyGames";

interface GameModalProps {
  game: DailyGame | null;
  open: boolean;
  onClose: () => void;
  onSubmit: (answer: string, timeTaken: number) => Promise<{ correct: boolean; points?: number }>;
}

export function GameModal({ game, open, onClose, onSubmit }: GameModalProps) {
  const [answer, setAnswer] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [timer, setTimer] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);
  const [wrongAttempts, setWrongAttempts] = useState(0);

  useEffect(() => {
    if (open) {
      setAnswer("");
      setShowHint(false);
      setTimer(0);
      setResult(null);
      setWrongAttempts(0);
    }
  }, [open]);

  useEffect(() => {
    if (!open || result === "correct") return;

    const interval = setInterval(() => {
      setTimer((t) => t + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [open, result]);

  const handleSubmit = async () => {
    if (!answer.trim() || !game) return;
    
    setSubmitting(true);
    const { correct, points } = await onSubmit(answer, timer);
    
    if (correct) {
      setResult("correct");
    } else {
      setResult("wrong");
      setWrongAttempts((w) => w + 1);
      setTimeout(() => setResult(null), 1500);
    }
    
    setSubmitting(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!game) return null;

  return (
    <Dialog open={open} onOpenChange={() => result !== "correct" && onClose()}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary/80 p-4 text-white">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">{game.title}</h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full">
                <Clock className="h-4 w-4" />
                <span className="font-mono">{formatTime(timer)}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-white hover:bg-white/20"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Game content */}
        <div className="p-6 space-y-6">
          {/* Word Scramble */}
          {game.game_type === "word_scramble" && (
            <div className="space-y-4">
              <p className="text-muted-foreground text-center">
                Réarrangez ces lettres pour former un mot :
              </p>
              <div className="flex justify-center gap-2 flex-wrap">
                {game.data.scrambled?.split("").map((letter, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center font-bold text-xl"
                  >
                    {letter}
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Math Puzzle or Pattern */}
          {(game.game_type === "math_puzzle" || game.game_type === "pattern") && (
            <div className="space-y-4">
              <p className="text-center text-lg font-medium">
                {game.data.question || game.data.sequence?.join(" → ")}
              </p>
              {game.data.options && (
                <div className="grid grid-cols-2 gap-3">
                  {game.data.options.map((option) => (
                    <Button
                      key={option}
                      variant={answer === option ? "default" : "outline"}
                      className="h-14 text-lg"
                      onClick={() => setAnswer(option)}
                    >
                      {option}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Text input for word scramble */}
          {game.game_type === "word_scramble" && (
            <Input
              placeholder="Tapez votre réponse..."
              value={answer}
              onChange={(e) => setAnswer(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              className="text-center text-xl font-bold h-14"
            />
          )}

          {/* Hint button */}
          {game.data.hint && !showHint && (
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => setShowHint(true)}
            >
              <HelpCircle className="h-4 w-4 mr-2" />
              Voir l'indice
            </Button>
          )}

          {/* Hint display */}
          <AnimatePresence>
            {showHint && game.data.hint && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-muted p-3 rounded-lg text-center text-muted-foreground"
              >
                💡 {game.data.hint}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Wrong attempts indicator */}
          {wrongAttempts > 0 && result !== "correct" && (
            <div className="flex items-center justify-center gap-2 text-destructive text-sm">
              <AlertCircle className="h-4 w-4" />
              {wrongAttempts} tentative{wrongAttempts > 1 ? "s" : ""} incorrecte{wrongAttempts > 1 ? "s" : ""}
            </div>
          )}

          {/* Result feedback */}
          <AnimatePresence>
            {result === "wrong" && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="bg-destructive/10 text-destructive p-3 rounded-lg text-center"
              >
                ❌ Mauvaise réponse, réessayez !
              </motion.div>
            )}
            {result === "correct" && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-green-500/10 text-green-600 p-4 rounded-lg text-center space-y-2"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.2 }}
                  className="text-4xl"
                >
                  🎉
                </motion.div>
                <p className="font-bold text-lg">Bravo !</p>
                <p className="text-sm">+{game.points_reward} points gagnés</p>
                {game.data.explanation && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {game.data.explanation}
                  </p>
                )}
                <Button onClick={onClose} className="mt-3">
                  Continuer
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit button */}
          {result !== "correct" && (
            <Button
              className="w-full h-12"
              onClick={handleSubmit}
              disabled={!answer.trim() || submitting}
            >
              {submitting ? (
                "Vérification..."
              ) : (
                <>
                  <Check className="h-5 w-5 mr-2" />
                  Valider ma réponse
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
