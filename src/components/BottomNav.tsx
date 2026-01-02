import { useLocation, useNavigate } from "react-router-dom";
import { Home, Sparkles, Trophy, MessageCircle, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  path: string;
  icon: typeof Home;
  label: string;
}

const navItems: NavItem[] = [
  { path: "/feed", icon: Home, label: "Accueil" },
  { path: "/stories", icon: Sparkles, label: "Stories" },
  { path: "/challenges", icon: Trophy, label: "Défis" },
  { path: "/chat", icon: MessageCircle, label: "Messages" },
  { path: "/profile", icon: User, label: "Profil" },
];

export const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t z-40 safe-bottom">
      <div className="flex justify-around items-center px-1 py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path === "/feed" && location.pathname === "/");
          const Icon = item.icon;
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all touch-target min-w-[64px]",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
              aria-label={item.label}
            >
              <Icon className="w-6 h-6" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};