import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Send, Heart, Pause, Play, Volume2, VolumeX } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import type { GroupedStories, Story } from "@/hooks/useStories";

const STORY_DURATION = 5000; // 5 seconds per story

const STORY_REACTIONS = ["❤️", "😂", "😮", "😢", "🔥", "👏"];

interface StoryViewerProps {
  groups: GroupedStories[];
  initialGroupIndex: number;
  onClose: () => void;
  onViewed: (storyId: string) => void;
}

export function StoryViewer({ groups, initialGroupIndex, onClose, onViewed }: StoryViewerProps) {
  const [groupIndex, setGroupIndex] = useState(initialGroupIndex);
  const [storyIndex, setStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showReactions, setShowReactions] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [floatingEmoji, setFloatingEmoji] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  const currentGroup = groups[groupIndex];
  const currentStory = currentGroup?.stories[storyIndex];
  const isVideo = currentStory?.media_type === "video";

  // Mark story as viewed
  useEffect(() => {
    if (currentStory && !currentStory.viewed) {
      onViewed(currentStory.id);
    }
  }, [currentStory, onViewed]);

  // Progress timer
  useEffect(() => {
    if (isPaused) return;

    const duration = isVideo && videoRef.current 
      ? videoRef.current.duration * 1000 || STORY_DURATION 
      : STORY_DURATION;

    const startTime = Date.now() - (progress / 100) * duration;

    progressInterval.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / duration) * 100, 100);
      setProgress(newProgress);

      if (newProgress >= 100) {
        goToNext();
      }
    }, 50);

    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, [groupIndex, storyIndex, isPaused, isVideo]);

  const goToNext = useCallback(() => {
    if (storyIndex < currentGroup.stories.length - 1) {
      setStoryIndex(prev => prev + 1);
      setProgress(0);
    } else if (groupIndex < groups.length - 1) {
      setGroupIndex(prev => prev + 1);
      setStoryIndex(0);
      setProgress(0);
    } else {
      onClose();
    }
  }, [storyIndex, groupIndex, currentGroup, groups.length, onClose]);

  const goToPrev = useCallback(() => {
    if (storyIndex > 0) {
      setStoryIndex(prev => prev - 1);
      setProgress(0);
    } else if (groupIndex > 0) {
      setGroupIndex(prev => prev - 1);
      const prevGroup = groups[groupIndex - 1];
      setStoryIndex(prevGroup.stories.length - 1);
      setProgress(0);
    }
  }, [storyIndex, groupIndex, groups]);

  // Touch/Click navigation
  const handleTouchNavigation = (e: React.MouseEvent | React.TouchEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('input')) return;
    
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const x = clientX - rect.left;
    const width = rect.width;

    if (x < width / 3) {
      goToPrev();
    } else if (x > (width * 2) / 3) {
      goToNext();
    } else {
      setIsPaused(prev => !prev);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goToPrev();
      if (e.key === "ArrowRight") goToNext();
      if (e.key === "Escape") onClose();
      if (e.key === " ") {
        e.preventDefault();
        setIsPaused(prev => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToNext, goToPrev, onClose]);

  const handleReaction = (emoji: string) => {
    setFloatingEmoji(emoji);
    setTimeout(() => setFloatingEmoji(null), 1000);
    setShowReactions(false);
  };

  const handleSendReply = () => {
    if (!replyText.trim()) return;
    // TODO: Implement reply functionality
    setReplyText("");
  };

  if (!currentGroup || !currentStory) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black flex items-center justify-center"
    >
      {/* Story Container */}
      <div 
        className="relative w-full h-full max-w-lg mx-auto"
        onClick={handleTouchNavigation}
        onTouchStart={handleTouchNavigation}
      >
        {/* Progress Bars */}
        <div className="absolute top-0 left-0 right-0 z-20 flex gap-1 p-2 safe-top">
          {currentGroup.stories.map((story, i) => (
            <div 
              key={story.id} 
              className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden"
            >
              <motion.div
                className="h-full bg-white rounded-full"
                initial={{ width: "0%" }}
                animate={{ 
                  width: i < storyIndex ? "100%" : i === storyIndex ? `${progress}%` : "0%" 
                }}
                transition={{ duration: 0.05 }}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-20 p-4 pt-8 bg-gradient-to-b from-black/60 to-transparent safe-top">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10 border-2 border-white">
              <AvatarImage src={currentGroup.profile.avatar_url || ""} />
              <AvatarFallback className="bg-gradient-to-br from-tiwill-pink to-tiwill-purple text-white">
                {(currentGroup.profile.display_name || "U")[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-white font-semibold text-sm">
                {currentGroup.profile.display_name || "Utilisateur"}
              </p>
              <p className="text-white/70 text-xs">
                {formatDistanceToNow(new Date(currentStory.created_at), { addSuffix: true, locale: fr })}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              {isVideo && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20 rounded-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMuted(prev => !prev);
                    if (videoRef.current) videoRef.current.muted = !isMuted;
                  }}
                >
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20 rounded-full"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsPaused(prev => !prev);
                }}
              >
                {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20 rounded-full"
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Story Media */}
        <div className="absolute inset-0 flex items-center justify-center">
          {isVideo ? (
            <video
              ref={videoRef}
              src={currentStory.media_url}
              className="w-full h-full object-cover"
              autoPlay
              muted={isMuted}
              playsInline
              loop={false}
            />
          ) : (
            <img
              src={currentStory.media_url}
              alt=""
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* Caption */}
        {currentStory.caption && (
          <div className="absolute bottom-32 left-0 right-0 z-20 px-4">
            <p className="text-white text-center text-shadow-lg">
              {currentStory.caption}
            </p>
          </div>
        )}

        {/* Navigation hints */}
        <div className="absolute inset-y-0 left-0 w-1/3 z-10 cursor-pointer" />
        <div className="absolute inset-y-0 right-0 w-1/3 z-10 cursor-pointer" />

        {/* Navigation arrows (desktop) */}
        <div className="hidden md:block">
          {(groupIndex > 0 || storyIndex > 0) && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 z-30 text-white hover:bg-white/20 rounded-full"
              onClick={(e) => {
                e.stopPropagation();
                goToPrev();
              }}
            >
              <ChevronLeft className="w-8 h-8" />
            </Button>
          )}
          {(groupIndex < groups.length - 1 || storyIndex < currentGroup.stories.length - 1) && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 z-30 text-white hover:bg-white/20 rounded-full"
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
              }}
            >
              <ChevronRight className="w-8 h-8" />
            </Button>
          )}
        </div>

        {/* Floating Emoji Animation */}
        <AnimatePresence>
          {floatingEmoji && (
            <motion.div
              initial={{ opacity: 1, scale: 1, y: 0 }}
              animate={{ opacity: 0, scale: 2, y: -100 }}
              exit={{ opacity: 0 }}
              className="absolute bottom-1/2 left-1/2 -translate-x-1/2 text-6xl z-30 pointer-events-none"
            >
              {floatingEmoji}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom Actions */}
        <div className="absolute bottom-0 left-0 right-0 z-20 p-4 pb-8 bg-gradient-to-t from-black/60 to-transparent safe-bottom">
          {/* Quick Reactions */}
          <AnimatePresence>
            {showReactions && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="flex justify-center gap-2 mb-4"
              >
                {STORY_REACTIONS.map((emoji) => (
                  <motion.button
                    key={emoji}
                    className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl"
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReaction(emoji);
                    }}
                  >
                    {emoji}
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Reply Input */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "text-white hover:bg-white/20 rounded-full shrink-0",
                showReactions && "bg-white/20"
              )}
              onClick={(e) => {
                e.stopPropagation();
                setShowReactions(prev => !prev);
              }}
            >
              <Heart className="w-6 h-6" />
            </Button>
            <Input
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Envoyer un message..."
              className="flex-1 bg-white/20 border-0 text-white placeholder:text-white/60 rounded-full"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSendReply();
              }}
            />
            {replyText && (
              <Button
                size="icon"
                className="rounded-full shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSendReply();
                }}
              >
                <Send className="w-5 h-5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
