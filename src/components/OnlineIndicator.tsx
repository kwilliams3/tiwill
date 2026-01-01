import { cn } from "@/lib/utils";

interface OnlineIndicatorProps {
  isOnline: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
  showLabel?: boolean;
}

export function OnlineIndicator({ 
  isOnline, 
  size = "md", 
  className,
  showLabel = false 
}: OnlineIndicatorProps) {
  const sizeClasses = {
    sm: "w-2 h-2",
    md: "w-3 h-3",
    lg: "w-4 h-4",
  };

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <span
        className={cn(
          "rounded-full border-2 border-background",
          sizeClasses[size],
          isOnline
            ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"
            : "bg-muted-foreground/40"
        )}
      />
      {showLabel && (
        <span className={cn(
          "text-xs font-medium",
          isOnline ? "text-emerald-500" : "text-muted-foreground"
        )}>
          {isOnline ? "En ligne" : "Hors ligne"}
        </span>
      )}
    </div>
  );
}
