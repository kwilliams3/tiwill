import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { DesktopHeader } from "@/components/DesktopHeader";
import { BottomNav } from "@/components/BottomNav";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Plus, 
  ArrowLeft, 
  Search,
  Palette,
  Music,
  Camera,
  Video,
  PenTool,
  Sparkles,
  Clock,
  UserPlus
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CollaborationProject {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: typeof Palette;
  participants: {
    id: string;
    name: string;
    avatar?: string;
  }[];
  maxParticipants: number;
  status: "open" | "in_progress" | "completed";
  createdAt: string;
}

const mockProjects: CollaborationProject[] = [
  {
    id: "1",
    title: "Fresque Collaborative",
    description: "Créons ensemble une fresque numérique qui représente notre communauté",
    category: "Art Visuel",
    icon: Palette,
    participants: [
      { id: "1", name: "Marie", avatar: "" },
      { id: "2", name: "Lucas", avatar: "" },
      { id: "3", name: "Emma", avatar: "" },
    ],
    maxParticipants: 8,
    status: "open",
    createdAt: "Il y a 2h"
  },
  {
    id: "2",
    title: "Mixtape TiWill",
    description: "Compilons nos morceaux préférés pour créer la playlist ultime",
    category: "Musique",
    icon: Music,
    participants: [
      { id: "4", name: "Thomas", avatar: "" },
      { id: "5", name: "Sarah", avatar: "" },
    ],
    maxParticipants: 5,
    status: "in_progress",
    createdAt: "Il y a 1j"
  },
  {
    id: "3",
    title: "Photo Walk Paris",
    description: "Balade photo collaborative dans les rues de Paris",
    category: "Photographie",
    icon: Camera,
    participants: [
      { id: "6", name: "Julie", avatar: "" },
      { id: "7", name: "Pierre", avatar: "" },
      { id: "8", name: "Claire", avatar: "" },
      { id: "9", name: "Antoine", avatar: "" },
    ],
    maxParticipants: 10,
    status: "open",
    createdAt: "Il y a 3h"
  },
  {
    id: "4",
    title: "Court-métrage Éphémère",
    description: "Réalisons un court-métrage de 3 minutes en 48h",
    category: "Vidéo",
    icon: Video,
    participants: [
      { id: "10", name: "Alex", avatar: "" },
    ],
    maxParticipants: 6,
    status: "open",
    createdAt: "Il y a 5h"
  },
  {
    id: "5",
    title: "Recueil de Poésie",
    description: "Écrivons ensemble un recueil de poèmes sur le thème de l'éphémère",
    category: "Écriture",
    icon: PenTool,
    participants: [
      { id: "11", name: "Léa", avatar: "" },
      { id: "12", name: "Hugo", avatar: "" },
      { id: "13", name: "Camille", avatar: "" },
    ],
    maxParticipants: 12,
    status: "in_progress",
    createdAt: "Il y a 2j"
  },
];

const categories = [
  { id: "all", label: "Tous", icon: Sparkles },
  { id: "art", label: "Art Visuel", icon: Palette },
  { id: "music", label: "Musique", icon: Music },
  { id: "photo", label: "Photo", icon: Camera },
  { id: "video", label: "Vidéo", icon: Video },
  { id: "writing", label: "Écriture", icon: PenTool },
];

export default function Collaborations() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    navigate("/auth");
    return null;
  }

  const filteredProjects = mockProjects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || 
      project.category.toLowerCase().includes(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  const getStatusBadge = (status: CollaborationProject["status"]) => {
    switch (status) {
      case "open":
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Ouvert</Badge>;
      case "in_progress":
        return <Badge className="bg-tiwill-orange/10 text-tiwill-orange border-tiwill-orange/20">En cours</Badge>;
      case "completed":
        return <Badge className="bg-muted text-muted-foreground">Terminé</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-lavender-50 to-background">
      <DesktopHeader />
      
      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border/50">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold flex items-center gap-2">
            <Users className="w-5 h-5 text-tiwill-purple" />
            Collaborations
          </h1>
          <div className="w-9" />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 pb-24 lg:pb-8">
        <div className="hidden lg:flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-tiwill-purple" />
            <h1 className="text-2xl font-bold">Collaborations</h1>
          </div>
          <Button className="btn-create gap-2">
            <Plus className="w-4 h-4" />
            Créer un projet
          </Button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un projet collaboratif..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-card border-border/50"
          />
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all",
                  selectedCategory === cat.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-border/50 text-muted-foreground hover:text-foreground hover:border-primary/30"
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Mobile Create Button */}
        <div className="lg:hidden mb-6">
          <Button className="w-full btn-create gap-2">
            <Plus className="w-4 h-4" />
            Créer un projet collaboratif
          </Button>
        </div>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <div className="text-center py-16">
            <Users className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Aucun projet trouvé</h3>
            <p className="text-muted-foreground text-sm">
              Essayez une autre recherche ou créez votre propre projet !
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredProjects.map((project) => {
              const Icon = project.icon;
              const spotsLeft = project.maxParticipants - project.participants.length;
              
              return (
                <div
                  key={project.id}
                  className="bg-card rounded-2xl p-5 border border-border/50 hover:border-primary/30 transition-all group"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-tiwill-purple/20 to-tiwill-blue/20 flex items-center justify-center shrink-0">
                      <Icon className="w-6 h-6 text-tiwill-purple" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-semibold group-hover:text-primary transition-colors">
                          {project.title}
                        </h3>
                        {getStatusBadge(project.status)}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {project.description}
                      </p>
                    </div>
                  </div>

                  {/* Participants */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="flex -space-x-2">
                        {project.participants.slice(0, 4).map((p, i) => (
                          <Avatar key={p.id} className="w-8 h-8 border-2 border-background">
                            <AvatarImage src={p.avatar} />
                            <AvatarFallback className="bg-gradient-to-br from-tiwill-pink to-tiwill-purple text-white text-xs">
                              {p.name[0]}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                        {project.participants.length > 4 && (
                          <div className="w-8 h-8 rounded-full bg-secondary border-2 border-background flex items-center justify-center text-xs font-medium">
                            +{project.participants.length - 4}
                          </div>
                        )}
                      </div>
                      <span className="ml-3 text-xs text-muted-foreground">
                        {project.participants.length}/{project.maxParticipants}
                      </span>
                    </div>
                    
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3.5 h-3.5" />
                      {project.createdAt}
                    </span>
                  </div>

                  {/* Action Button */}
                  {project.status === "open" && spotsLeft > 0 ? (
                    <Button className="w-full gap-2" variant="outline">
                      <UserPlus className="w-4 h-4" />
                      Rejoindre ({spotsLeft} place{spotsLeft > 1 ? "s" : ""})
                    </Button>
                  ) : project.status === "in_progress" ? (
                    <Button className="w-full" variant="secondary">
                      Voir le projet
                    </Button>
                  ) : (
                    <Button className="w-full" variant="ghost" disabled>
                      Complet
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}