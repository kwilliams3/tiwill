import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { ChatList } from "@/components/ChatList";
import { ChatConversation } from "@/components/ChatConversation";
import { MessageCircle, Home, Search, Plus, User } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Chat() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(
    searchParams.get("id")
  );

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const id = searchParams.get("id");
    if (id) {
      setSelectedConversation(id);
    }
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b px-4 py-3 safe-top">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-display font-bold gradient-text">Messages</h1>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat list - always visible on desktop, hidden when conversation selected on mobile */}
        <div
          className={`w-full md:w-80 lg:w-96 border-r border-border flex-shrink-0 ${
            selectedConversation ? "hidden md:block" : "block"
          }`}
        >
          <ChatList
            onSelectConversation={setSelectedConversation}
            selectedId={selectedConversation}
          />
        </div>

        {/* Conversation area */}
        <div
          className={`flex-1 ${
            selectedConversation ? "block" : "hidden md:flex md:items-center md:justify-center"
          }`}
        >
          {selectedConversation ? (
            <ChatConversation
              conversationId={selectedConversation}
              onBack={() => setSelectedConversation(null)}
            />
          ) : (
            <div className="hidden md:flex flex-col items-center justify-center text-muted-foreground">
              <MessageCircle className="h-16 w-16 mb-4 opacity-50" />
              <p className="text-lg">Sélectionnez une conversation</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <nav className="bottom-nav safe-bottom">
        <div className="flex justify-around py-3">
          {[
            { icon: Home, label: "Accueil", path: "/feed" },
            { icon: Search, label: "Découvrir" },
            { icon: Plus, label: "Créer", special: true },
            { icon: MessageCircle, label: "Messages", active: true },
            { icon: User, label: "Profil", path: "/profile" },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => item.path && navigate(item.path)}
              className={cn(
                "flex flex-col items-center gap-1 px-4 py-1 rounded-xl transition-colors",
                item.active && "text-primary",
                item.special && "gradient-primary text-white rounded-full px-6 py-2 -mt-6 shadow-lg"
              )}
            >
              <item.icon className={cn("w-6 h-6", item.special && "w-7 h-7")} />
              {!item.special && <span className="text-xs">{item.label}</span>}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
