import { UserPlus, UserMinus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFollow } from "@/hooks/useFollow";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

interface FollowButtonProps {
  targetUserId: string;
  variant?: "default" | "compact";
  className?: string;
}

export function FollowButton({ targetUserId, variant = "default", className }: FollowButtonProps) {
  const { user } = useAuth();
  const { isFollowing, loading, actionLoading, toggleFollow } = useFollow(targetUserId);

  // Don't show button for own profile or if not logged in
  if (!user || user.id === targetUserId) {
    return null;
  }

  if (loading) {
    return (
      <Button variant="outline" size={variant === "compact" ? "sm" : "default"} disabled className={className}>
        <Loader2 className="h-4 w-4 animate-spin" />
      </Button>
    );
  }

  if (variant === "compact") {
    return (
      <Button
        variant={isFollowing ? "outline" : "default"}
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          toggleFollow();
        }}
        disabled={actionLoading}
        className={cn(
          "min-w-[90px]",
          isFollowing && "hover:bg-destructive/10 hover:text-destructive hover:border-destructive",
          className
        )}
      >
        {actionLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isFollowing ? (
          "Suivi"
        ) : (
          "Suivre"
        )}
      </Button>
    );
  }

  return (
    <Button
      variant={isFollowing ? "outline" : "default"}
      onClick={(e) => {
        e.stopPropagation();
        toggleFollow();
      }}
      disabled={actionLoading}
      className={cn(
        "gap-2",
        isFollowing && "hover:bg-destructive/10 hover:text-destructive hover:border-destructive",
        className
      )}
    >
      {actionLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isFollowing ? (
        <>
          <UserMinus className="h-4 w-4" />
          Ne plus suivre
        </>
      ) : (
        <>
          <UserPlus className="h-4 w-4" />
          Suivre
        </>
      )}
    </Button>
  );
}
