import { motion } from "framer-motion";
import { Trophy, Medal, Clock, Zap, Crown, User } from "lucide-react";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const rankStyles: Record<number, { bg: string; icon: typeof Crown; color: string }> = {
  1: { bg: "bg-gradient-to-r from-yellow-400/20 to-amber-300/20 border-yellow-400/40", icon: Crown, color: "text-yellow-500" },
  2: { bg: "bg-gradient-to-r from-gray-300/20 to-slate-200/20 border-gray-300/40", icon: Medal, color: "text-gray-400" },
  3: { bg: "bg-gradient-to-r from-orange-400/20 to-amber-600/20 border-orange-400/40", icon: Medal, color: "text-orange-400" },
};

function formatTime(seconds: number | null): string {
  if (seconds === null) return "—";
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return `${mins}m${secs}s`;
}

export function Leaderboard() {
  const { leaderboard, loading } = useLeaderboard();
  const { user } = useAuth();

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-16 bg-muted animate-pulse rounded-xl" />
        ))}
      </div>
    );
  }

  if (leaderboard.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Trophy className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p className="font-medium">Pas encore de classement</p>
        <p className="text-sm">Jouez aux jeux pour apparaître ici !</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Top 3 podium */}
      {leaderboard.length >= 3 && (
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[1, 0, 2].map((idx) => {
            const entry = leaderboard[idx];
            if (!entry) return null;
            const rank = idx + 1;
            const style = rankStyles[rank];
            return (
              <motion.div
                key={entry.user_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.15 }}
                className={cn(
                  "flex flex-col items-center p-3 rounded-2xl border text-center",
                  style?.bg,
                  rank === 1 && "order-2 -mt-2",
                  rank === 2 && "order-1 mt-2",
                  rank === 3 && "order-3 mt-2"
                )}
              >
                <div className="relative mb-2">
                  <Avatar className={cn("h-12 w-12 border-2", rank === 1 ? "h-14 w-14 border-yellow-400" : "border-border")}>
                    <AvatarImage src={entry.avatar_url || undefined} />
                    <AvatarFallback className="bg-muted text-muted-foreground">
                      <User className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div className={cn(
                    "absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                    rank === 1 && "bg-yellow-400 text-yellow-900",
                    rank === 2 && "bg-gray-300 text-gray-700",
                    rank === 3 && "bg-orange-400 text-orange-900"
                  )}>
                    {rank}
                  </div>
                </div>
                <p className="font-semibold text-xs truncate w-full">
                  {entry.display_name || entry.username || "Joueur"}
                </p>
                <p className="text-primary font-bold text-sm">{entry.total_score} pts</p>
                <p className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                  <Clock className="h-2.5 w-2.5" />
                  {formatTime(entry.avg_time_seconds)}
                </p>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Rest of leaderboard */}
      <div className="space-y-1.5">
        {leaderboard.slice(leaderboard.length >= 3 ? 3 : 0).map((entry, i) => {
          const rank = (leaderboard.length >= 3 ? 3 : 0) + i + 1;
          const isCurrentUser = user?.id === entry.user_id;

          return (
            <motion.div
              key={entry.user_id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.05 }}
              className={cn(
                "flex items-center gap-3 p-3 rounded-xl border border-border/50 transition-all",
                isCurrentUser
                  ? "bg-primary/5 border-primary/30 ring-1 ring-primary/20"
                  : "bg-card hover:bg-muted/50"
              )}
            >
              <span className="w-7 text-center font-bold text-sm text-muted-foreground">
                {rank}
              </span>
              <Avatar className="h-9 w-9">
                <AvatarImage src={entry.avatar_url || undefined} />
                <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className={cn("font-medium text-sm truncate", isCurrentUser && "text-primary")}>
                  {entry.display_name || entry.username || "Joueur"}
                  {isCurrentUser && " (vous)"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {entry.games_completed} jeu{entry.games_completed > 1 ? "x" : ""} complété{entry.games_completed > 1 ? "s" : ""}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-bold text-sm flex items-center gap-1 text-primary">
                  <Zap className="h-3.5 w-3.5" />
                  {entry.total_score}
                </p>
                <p className="text-[10px] text-muted-foreground flex items-center gap-0.5 justify-end">
                  <Clock className="h-2.5 w-2.5" />
                  moy. {formatTime(entry.avg_time_seconds)}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
