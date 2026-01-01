import { useNavigate, useLocation } from "react-router-dom";
import { TiWillLogo } from "@/components/TiWillLogo";
import { NotificationCenter } from "@/components/NotificationCenter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { Search, Plus, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { path: "/feed", label: "Feed" },
  { path: "/stories", label: "Stories" },
  { path: "/challenges", label: "Challenges" },
  { path: "/collaborations", label: "Collaborer" },
];

export function DesktopHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { profile } = useProfile();

  return (
    <header className="hidden lg:block sticky top-0 z-50 bg-gradient-to-r from-lavender-50 via-background to-lavender-50 border-b border-border/50">
      <div className="max-w-7xl mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div 
            className="cursor-pointer" 
            onClick={() => navigate("/feed")}
          >
            <TiWillLogo size="md" animate={false} />
          </div>

          {/* Center Navigation */}
          <nav className="flex items-center gap-8">
            {navLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                className={cn(
                  "text-sm font-medium transition-colors duration-200",
                  location.pathname === link.path
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/search")}
              className="rounded-full w-10 h-10 hover:bg-secondary"
            >
              <Search className="w-5 h-5" />
            </Button>

            <Button
              onClick={() => navigate("/create")}
              className="btn-create"
            >
              <Plus className="w-4 h-4" />
              Créer
            </Button>

            <NotificationCenter />

            <button
              onClick={() => navigate("/profile")}
              className="relative"
            >
              <Avatar className="w-10 h-10 ring-2 ring-primary/20 hover:ring-primary/40 transition-all">
                <AvatarImage src={profile?.avatar_url || ""} />
                <AvatarFallback className="bg-gradient-to-br from-tiwill-pink to-tiwill-purple text-white">
                  {(profile?.display_name || user?.email || "U")[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
