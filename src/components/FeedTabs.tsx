import { useLocation, useNavigate } from "react-router-dom";
import { Zap, Trophy, Users, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeedTab {
  id: string;
  label: string;
  icon: typeof Zap;
}

const feedTabs: FeedTab[] = [
  { id: "feed", label: "Feed", icon: Zap },
  { id: "challenges", label: "Challenges", icon: Trophy },
  { id: "collaborations", label: "Collaborations", icon: Users },
  { id: "tendances", label: "Tendances", icon: TrendingUp },
];

interface FeedTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function FeedTabs({ activeTab, onTabChange }: FeedTabsProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-2">
      {feedTabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200",
              isActive
                ? "bg-gradient-to-r from-primary/10 to-tiwill-pink/10 text-primary border border-primary/20"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            )}
          >
            <Icon className={cn("w-4 h-4", isActive && "text-primary")} />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
