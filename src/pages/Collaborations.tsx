import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useCollaborations, CreateCollaborationData } from "@/hooks/useCollaborations";
import { DesktopHeader } from "@/components/DesktopHeader";
import { BottomNav } from "@/components/BottomNav";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
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
  UserPlus,
  LogOut,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

const categories = [
  { id: "all", label: "Tous", icon: Sparkles },
  { id: "art", label: "Art Visuel", icon: Palette },
  { id: "music", label: "Musique", icon: Music },
  { id: "photo", label: "Photo", icon: Camera },
  { id: "video", label: "Vidéo", icon: Video },
  { id: "writing", label: "Écriture", icon: PenTool },
];

const categoryIcons: Record<string, typeof Palette> = {
  art: Palette,
  music: Music,
  photo: Camera,
  video: Video,
  writing: PenTool,
  other: Sparkles,
};

export default function Collaborations() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { collaborations, loading, createCollaboration, joinCollaboration, leaveCollaboration } = useCollaborations();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newCollab, setNewCollab] = useState<CreateCollaborationData>({
    title: "",
    description: "",
    category: "art",
    max_participants: 10
  });

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

  const filteredProjects = collaborations.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (project.description?.toLowerCase() || "").includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || 
      project.category.toLowerCase().includes(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Ouvert</Badge>;
      case "in_progress":
        return <Badge className="bg-tiwill-orange/10 text-tiwill-orange border-tiwill-orange/20">En cours</Badge>;
      case "completed":
        return <Badge className="bg-muted text-muted-foreground">Terminé</Badge>;
      default:
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Ouvert</Badge>;
    }
  };

  const getCategoryIcon = (category: string) => {
    return categoryIcons[category.toLowerCase()] || Sparkles;
  };

  const handleCreate = async () => {
    if (!newCollab.title.trim()) return;
    
    setIsCreating(true);
    const result = await createCollaboration(newCollab);
    setIsCreating(false);
    
    if (result) {
      setIsCreateOpen(false);
      setNewCollab({ title: "", description: "", category: "art", max_participants: 10 });
    }
  };

  const handleJoinOrLeave = async (collab: typeof collaborations[0]) => {
    if (collab.is_participant) {
      await leaveCollaboration(collab.id);
    } else {
      await joinCollaboration(collab.id);
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
          
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="btn-create gap-2">
                <Plus className="w-4 h-4" />
                Créer un projet
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Créer un projet collaboratif</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Titre du projet</Label>
                  <Input
                    id="title"
                    placeholder="Ex: Fresque Collaborative"
                    value={newCollab.title}
                    onChange={(e) => setNewCollab(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Décrivez votre projet..."
                    value={newCollab.description}
                    onChange={(e) => setNewCollab(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Catégorie</Label>
                  <Select
                    value={newCollab.category}
                    onValueChange={(value) => setNewCollab(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="art">Art Visuel</SelectItem>
                      <SelectItem value="music">Musique</SelectItem>
                      <SelectItem value="photo">Photo</SelectItem>
                      <SelectItem value="video">Vidéo</SelectItem>
                      <SelectItem value="writing">Écriture</SelectItem>
                      <SelectItem value="other">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max">Nombre max de participants</Label>
                  <Input
                    id="max"
                    type="number"
                    min={2}
                    max={50}
                    value={newCollab.max_participants}
                    onChange={(e) => setNewCollab(prev => ({ ...prev, max_participants: parseInt(e.target.value) || 10 }))}
                  />
                </div>
                <Button 
                  className="w-full" 
                  onClick={handleCreate} 
                  disabled={isCreating || !newCollab.title.trim()}
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Création...
                    </>
                  ) : (
                    "Créer le projet"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
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
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="w-full btn-create gap-2">
                <Plus className="w-4 h-4" />
                Créer un projet collaboratif
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredProjects.length === 0 ? (
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
              const Icon = getCategoryIcon(project.category);
              const spotsLeft = (project.max_participants || 10) - project.participants_count;
              const isCreator = project.creator_id === user?.id;
              
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
                        {project.description || "Pas de description"}
                      </p>
                    </div>
                  </div>

                  {/* Creator info */}
                  <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
                    <Avatar className="w-5 h-5">
                      <AvatarImage src={project.creator?.avatar_url || ""} />
                      <AvatarFallback className="bg-gradient-to-br from-tiwill-pink to-tiwill-purple text-white text-xs">
                        {(project.creator?.display_name || "?")[0]}
                      </AvatarFallback>
                    </Avatar>
                    <span>par {project.creator?.display_name || "Anonyme"}</span>
                    {isCreator && <Badge variant="secondary" className="text-xs">Vous</Badge>}
                  </div>

                  {/* Participants */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {project.participants_count}/{project.max_participants || 10} participants
                      </span>
                    </div>
                    
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3.5 h-3.5" />
                      {formatDistanceToNow(new Date(project.created_at), { addSuffix: true, locale: fr })}
                    </span>
                  </div>

                  {/* Action Button */}
                  {project.is_participant ? (
                    <Button 
                      className="w-full gap-2" 
                      variant="outline"
                      onClick={() => handleJoinOrLeave(project)}
                      disabled={isCreator}
                    >
                      {isCreator ? (
                        "Votre projet"
                      ) : (
                        <>
                          <LogOut className="w-4 h-4" />
                          Quitter le projet
                        </>
                      )}
                    </Button>
                  ) : project.status === "open" && spotsLeft > 0 ? (
                    <Button 
                      className="w-full gap-2" 
                      variant="outline"
                      onClick={() => handleJoinOrLeave(project)}
                    >
                      <UserPlus className="w-4 h-4" />
                      Rejoindre ({spotsLeft} place{spotsLeft > 1 ? "s" : ""})
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
