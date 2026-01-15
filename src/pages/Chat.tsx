import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { ChatList } from "@/components/ChatList";
import { ChatConversation } from "@/components/ChatConversation";
import { BottomNav } from "@/components/BottomNav";
import { MessageCircle, ArrowLeft, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function Chat() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(
    searchParams.get("id")
  );

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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
      <div className="min-h-screen flex items-center justify-center bg-background safe-area-padding">
        <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const showChatList = !selectedConversation || !isMobile;
  const showConversation = selectedConversation;

  return (
    <div className="min-h-screen bg-background flex flex-col safe-area-padding pb-20 md:pb-0">
      {/* Header - Changes based on state */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b px-4 py-3 safe-top">
        <div className="flex items-center justify-between h-12">
          {showConversation && isMobile ? (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedConversation(null)}
                className="w-10 h-10 touch-target rounded-full"
                aria-label="Retour aux conversations"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-lg font-semibold truncate max-w-[60vw]">
                {/* Will be populated by ChatConversation component */}
              </h1>
              <Button
                variant="ghost"
                size="icon"
                className="w-10 h-10 touch-target rounded-full"
                aria-label="Options"
              >
                <MoreVertical className="w-5 h-5" />
              </Button>
            </>
          ) : (
            <>
              <h1 className="text-xl font-bold gradient-text">Messages</h1>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-10 h-10 touch-target rounded-full"
                  aria-label="Nouvelle conversation"
                >
                  <MessageCircle className="w-5 h-5" />
                </Button>
              </div>
            </>
          )}
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Chat list */}
        <div
          className={cn(
            "w-full md:w-80 lg:w-96 border-r border-border flex-shrink-0 transition-all duration-200",
            showChatList ? "block" : "hidden md:block",
            isMobile && showConversation && "absolute inset-0 z-10 bg-background"
          )}
        >
          <ChatList
            onSelectConversation={setSelectedConversation}
            selectedId={selectedConversation}
          />
        </div>

        {/* Conversation area */}
        <div
          className={cn(
            "flex-1 transition-all duration-200",
            showConversation ? "block" : "hidden md:flex md:items-center md:justify-center",
            isMobile && !showConversation && "hidden"
          )}
        >
          {selectedConversation ? (
            <ChatConversation
              conversationId={selectedConversation}
              onBack={() => setSelectedConversation(null)}
            />
          ) : (
            <div className="hidden md:flex flex-col items-center justify-center text-muted-foreground p-8">
              <div className="relative mb-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                  <MessageCircle className="h-12 w-12 text-primary/60" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">Aucune conversation sélectionnée</h3>
              <p className="text-sm text-muted-foreground text-center max-w-sm mb-6">
                Sélectionnez une conversation existante ou démarrez-en une nouvelle
              </p>
              <Button
                className="rounded-full gradient-primary text-white px-6"
                onClick={() => {/* TODO: Add new conversation logic */}}
              >
                Nouvelle conversation
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav />

      {/* FAB for new conversation (mobile) */}
      {!selectedConversation && (
        <button
          className="fixed right-4 bottom-20 w-14 h-14 rounded-full gradient-primary shadow-xl flex items-center justify-center text-white touch-target z-30"
          onClick={() => {/* TODO: Add new conversation logic */}}
          aria-label="Nouvelle conversation"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}
