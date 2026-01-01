import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useStories } from "@/hooks/useStories";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface StoriesSidebarProps {
  onStoryClick: (index: number) => void;
}

export function StoriesSidebar({ onStoryClick }: StoriesSidebarProps) {
  const { user } = useAuth();
  const { groupedStories } = useStories();

  return (
    <div className="sidebar-section">
      <h3 className="flex items-center gap-2 text-base font-semibold mb-4">
        <Sparkles className="w-4 h-4 text-primary" />
        Stories Éphémères
      </h3>
      
      <div className="flex flex-col items-center gap-4">
        {/* Add Story Button */}
        <div className="flex flex-col items-center gap-2">
          <button className="w-16 h-16 rounded-full border-2 border-dashed border-primary/40 flex items-center justify-center hover:border-primary hover:bg-primary/5 transition-all">
            <Plus className="w-6 h-6 text-primary/60" />
          </button>
          <span className="text-xs text-muted-foreground">Votre story</span>
        </div>

        {/* Stories List */}
        {groupedStories.map((group, index) => (
          <div 
            key={group.userId}
            className="flex flex-col items-center gap-2 cursor-pointer"
            onClick={() => onStoryClick(index)}
          >
            <div className={cn(
              "p-0.5 rounded-full",
              group.hasUnviewed ? "story-ring" : "story-ring-viewed"
            )}>
              <div className="bg-background rounded-full p-0.5">
                <Avatar className="w-14 h-14">
                  <AvatarImage src={group.profile.avatar_url || ""} />
                  <AvatarFallback className="bg-gradient-to-br from-tiwill-purple to-tiwill-blue text-white">
                    {(group.profile.display_name || "?")[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
            <span className="text-xs font-medium truncate max-w-[70px]">
              {group.userId === user?.id ? "Vous" : (group.profile.display_name || "User").split(" ")[0]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
