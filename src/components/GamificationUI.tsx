import { motion, AnimatePresence } from "framer-motion";
import { Badge, UserBadge } from "@/hooks/useGamification";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface BadgeDisplayProps {
  badges: Badge[];
  userBadges: UserBadge[];
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: "w-8 h-8 text-lg",
  md: "w-12 h-12 text-2xl",
  lg: "w-16 h-16 text-3xl",
};

export function BadgeDisplay({ badges, userBadges, size = "md" }: BadgeDisplayProps) {
  const earnedBadgeIds = new Set(userBadges.map((ub) => ub.badge_id));

  return (
    <div className="flex flex-wrap gap-2">
      {badges.map((badge, index) => {
        const isEarned = earnedBadgeIds.has(badge.id);
        
        return (
          <Tooltip key={badge.id}>
            <TooltipTrigger asChild>
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className={`
                  ${sizeMap[size]} 
                  rounded-full flex items-center justify-center
                  ${isEarned 
                    ? "bg-gradient-to-br from-primary/20 to-primary/10 ring-2 ring-primary/50 shadow-lg shadow-primary/20" 
                    : "bg-muted/50 opacity-40 grayscale"
                  }
                  transition-all cursor-pointer hover:scale-110
                `}
                style={{
                  boxShadow: isEarned ? `0 0 20px ${badge.color}40` : undefined,
                }}
              >
                <span>{badge.icon}</span>
              </motion.div>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs">
              <div className="text-center">
                <p className="font-semibold">{badge.name}</p>
                <p className="text-xs text-muted-foreground">{badge.description}</p>
                {!isEarned && badge.points_required > 0 && (
                  <p className="text-xs text-primary mt-1">{badge.points_required} points requis</p>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}

interface LevelProgressProps {
  level: number;
  points: number;
  showDetails?: boolean;
}

export function LevelProgress({ level, points, showDetails = true }: LevelProgressProps) {
  const pointsForCurrentLevel = (level - 1) * 100;
  const pointsForNextLevel = level * 100;
  const progressPoints = points - pointsForCurrentLevel;
  const neededPoints = pointsForNextLevel - pointsForCurrentLevel;
  const progressPercent = Math.min(100, (progressPoints / neededPoints) * 100);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <motion.div
            className="relative"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-tiwill-pink via-tiwill-purple to-tiwill-blue flex items-center justify-center text-white font-bold shadow-lg">
              {level}
            </div>
            <motion.div
              className="absolute -inset-1 rounded-full bg-gradient-to-br from-tiwill-pink via-tiwill-purple to-tiwill-blue opacity-30 blur-sm -z-10"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>
          <div>
            <p className="font-semibold text-sm">Niveau {level}</p>
            {showDetails && (
              <p className="text-xs text-muted-foreground">
                {points} points au total
              </p>
            )}
          </div>
        </div>
        {showDetails && (
          <span className="text-xs text-muted-foreground">
            {progressPoints}/{neededPoints} pts
          </span>
        )}
      </div>
      
      <div className="relative">
        <Progress value={progressPercent} className="h-2" />
        <motion.div
          className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-tiwill-pink via-tiwill-purple to-tiwill-blue"
          style={{ width: `${progressPercent}%` }}
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

interface PointsAnimationProps {
  points: number;
  show: boolean;
  onComplete: () => void;
}

export function PointsAnimation({ points, show, onComplete }: PointsAnimationProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center pointer-events-none z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onAnimationComplete={onComplete}
        >
          <motion.div
            className="text-4xl font-bold text-primary"
            initial={{ y: 0, scale: 1 }}
            animate={{ y: -100, scale: 1.5, opacity: 0 }}
            transition={{ duration: 1.5 }}
          >
            +{points} pts
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface BadgeUnlockProps {
  badge: Badge | null;
  show: boolean;
  onClose: () => void;
}

export function BadgeUnlock({ badge, show, onClose }: BadgeUnlockProps) {
  if (!badge) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-card p-8 rounded-3xl shadow-2xl text-center max-w-sm mx-4"
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 10 }}
            transition={{ type: "spring", damping: 15 }}
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              className="w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center text-5xl"
              style={{
                background: `linear-gradient(135deg, ${badge.color}20, ${badge.color}40)`,
                boxShadow: `0 0 40px ${badge.color}40`,
              }}
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {badge.icon}
            </motion.div>

            <motion.h2
              className="text-2xl font-bold mb-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Badge débloqué !
            </motion.h2>

            <motion.p
              className="text-lg font-semibold text-primary mb-1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              {badge.name}
            </motion.p>

            <motion.p
              className="text-muted-foreground"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              {badge.description}
            </motion.p>

            <motion.button
              className="mt-6 px-6 py-2 bg-primary text-primary-foreground rounded-full font-medium"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
            >
              Super !
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
