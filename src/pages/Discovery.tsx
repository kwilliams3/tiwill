import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  TrendingUp, 
  Users, 
  Hash, 
  ArrowLeft, 
  Sparkles, 
  Filter,
  X,
  FileText,
  Star,
  Clock,
  Trophy,
  SlidersHorizontal,
  ChevronDown
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDiscovery } from "@/hooks/useDiscovery";
import { BottomNav } from "@/components/BottomNav";
import { FriendSuggestions } from "@/components/FriendSuggestions";
import { cn } from "@/lib/utils";

const categories = [
  { id: "all", label: "Tout", icon: Sparkles },
  { id: "users", label: "Utilisateurs", icon: Users },
  { id: "hashtags", label: "Hashtags", icon: Hash },
  { id: "posts", label: "Publications", icon: FileText },
];

const Discovery = () => {
  const navigate = useNavigate();
  const { 
    users, 
    trendingHashtags, 
    recentPosts,
    loading, 
    searchQuery, 
    setSearchQuery, 
    searchByHashtag,
    searchPosts,
    filters,
    updateFilters,
    resetFilters,
    activeCategory,
    setActiveCategory,
  } = useDiscovery();
  
  const [selectedHashtag, setSelectedHashtag] = useState<string | null>(null);
  const [hashtagPosts, setHashtagPosts] = useState<any[]>([]);
  const [searchedPosts, setSearchedPosts] = useState<any[]>([]);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const handleHashtagClick = async (hashtag: string) => {
    setSelectedHashtag(hashtag);
    const posts = await searchByHashtag(hashtag);
    setHashtagPosts(posts);
  };

  const handleSearchPosts = async () => {
    if (searchQuery.length >= 2) {
      const posts = await searchPosts(searchQuery);
      setSearchedPosts(posts);
    }
  };

  const getHashtagColor = (index: number) => {
    const colors = [
      "bg-gradient-to-r from-pink-500 to-rose-500",
      "bg-gradient-to-r from-purple-500 to-violet-500",
      "bg-gradient-to-r from-blue-500 to-cyan-500",
      "bg-gradient-to-r from-green-500 to-emerald-500",
      "bg-gradient-to-r from-orange-500 to-amber-500",
    ];
    return colors[index % colors.length];
  };

  const hasActiveFilters = filters.minLevel > 1 || filters.hasAvatar || filters.sortBy !== "recent";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="flex items-center justify-between px-4 py-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-display text-xl font-semibold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Découvrir
          </h1>
          <Sheet open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <SlidersHorizontal className="h-5 w-5" />
                {hasActiveFilters && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filtres avancés
                </SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-6">
                {/* Sort By */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Trier par</Label>
                  <Select 
                    value={filters.sortBy} 
                    onValueChange={(value: "recent" | "popular" | "level") => updateFilters({ sortBy: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recent">
                        <span className="flex items-center gap-2">
                          <Clock className="h-4 w-4" /> Plus récent
                        </span>
                      </SelectItem>
                      <SelectItem value="popular">
                        <span className="flex items-center gap-2">
                          <Star className="h-4 w-4" /> Plus populaire
                        </span>
                      </SelectItem>
                      <SelectItem value="level">
                        <span className="flex items-center gap-2">
                          <Trophy className="h-4 w-4" /> Niveau le plus élevé
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Min Level */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Niveau minimum</Label>
                    <Badge variant="secondary">Niv. {filters.minLevel}</Badge>
                  </div>
                  <Slider
                    value={[filters.minLevel]}
                    onValueChange={([value]) => updateFilters({ minLevel: value })}
                    min={1}
                    max={50}
                    step={1}
                    className="w-full"
                  />
                </div>

                {/* Has Avatar */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Avec photo de profil</Label>
                    <p className="text-xs text-muted-foreground">
                      Afficher uniquement les profils avec avatar
                    </p>
                  </div>
                  <Switch
                    checked={filters.hasAvatar}
                    onCheckedChange={(checked) => updateFilters({ hasAvatar: checked })}
                  />
                </div>

                {/* Reset Button */}
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    resetFilters();
                    setIsFiltersOpen(false);
                  }}
                >
                  <X className="h-4 w-4 mr-2" />
                  Réinitialiser les filtres
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Search Bar */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher utilisateurs, hashtags, publications..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (activeCategory === "posts") {
                  handleSearchPosts();
                }
              }}
              className="pl-10 pr-10 bg-muted/50 border-border/50 focus:border-primary"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                onClick={() => setSearchQuery("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Category Pills */}
        <div className="px-4 pb-3 flex gap-2 overflow-x-auto scrollbar-hide">
          {categories.map((category) => {
            const Icon = category.icon;
            const isActive = activeCategory === category.id;
            return (
              <Button
                key={category.id}
                variant={isActive ? "default" : "outline"}
                size="sm"
                className={cn(
                  "shrink-0 gap-2 transition-all",
                  isActive && "shadow-md"
                )}
                onClick={() => setActiveCategory(category.id)}
              >
                <Icon className="h-4 w-4" />
                {category.label}
              </Button>
            );
          })}
        </div>
      </header>

      <main className="pb-24">
        {/* Search Results for Users */}
        <AnimatePresence>
          {searchQuery.length >= 2 && (activeCategory === "all" || activeCategory === "users") && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 border-b border-border/50"
            >
              <h2 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Utilisateurs ({users.length})
              </h2>
              {users.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Aucun utilisateur trouvé
                </p>
              ) : (
                <div className="space-y-2">
                  {users.slice(0, 5).map((user, index) => (
                    <motion.div
                      key={user.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-3 p-3 rounded-xl bg-card/50 hover:bg-card transition-colors cursor-pointer"
                      onClick={() => navigate(`/profile/${user.user_id}`)}
                    >
                      <Avatar className="h-12 w-12 ring-2 ring-primary/20">
                        <AvatarImage src={user.avatar_url || ""} />
                        <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground">
                          {user.display_name?.[0] || user.username?.[0] || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {user.display_name || user.username || "Anonyme"}
                        </p>
                        {user.username && (
                          <p className="text-sm text-muted-foreground truncate">
                            @{user.username}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge variant="secondary" className="shrink-0">
                          Niv. {user.level || 1}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {user.points || 0} pts
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <Tabs value={selectedHashtag ? "hashtag" : "trending"} className="w-full">
          <TabsList className="w-full justify-start px-4 pt-4 bg-transparent">
            <TabsTrigger value="trending" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Tendances
            </TabsTrigger>
            {selectedHashtag && (
              <TabsTrigger value="hashtag" className="flex items-center gap-2">
                <Hash className="h-4 w-4" />
                #{selectedHashtag}
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="trending" className="p-4">
            <div className="space-y-6">
              {/* Trending Hashtags */}
              {(activeCategory === "all" || activeCategory === "hashtags") && (
                <section>
                  <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Hashtags tendance
                  </h2>

                  {loading ? (
                    <div className="space-y-3">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-16 bg-muted/50 rounded-xl animate-pulse" />
                      ))}
                    </div>
                  ) : trendingHashtags.length === 0 ? (
                    <div className="text-center py-8 bg-card/50 rounded-xl border border-border/50">
                      <Hash className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
                      <p className="text-muted-foreground">
                        Aucun hashtag tendance pour le moment
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-3">
                      {trendingHashtags.slice(0, 5).map((item, index) => (
                        <motion.div
                          key={item.hashtag}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={() => handleHashtagClick(item.hashtag)}
                          className="relative overflow-hidden rounded-xl cursor-pointer group"
                        >
                          <div className={`absolute inset-0 ${getHashtagColor(index)} opacity-10 group-hover:opacity-20 transition-opacity`} />
                          <div className="relative p-4 flex items-center justify-between bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-full ${getHashtagColor(index)} flex items-center justify-center text-white font-bold text-sm`}>
                                {index + 1}
                              </div>
                              <div>
                                <p className="font-semibold">#{item.hashtag}</p>
                                <p className="text-sm text-muted-foreground">
                                  {item.count} publication{item.count > 1 ? "s" : ""}
                                </p>
                              </div>
                            </div>
                            <ChevronDown className="h-5 w-5 text-muted-foreground rotate-[-90deg]" />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </section>
              )}

              {/* Recent Posts */}
              {(activeCategory === "all" || activeCategory === "posts") && (
                <section>
                  <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                    <FileText className="h-5 w-5 text-primary" />
                    Publications récentes
                  </h2>

                  {recentPosts.length === 0 ? (
                    <div className="text-center py-8 bg-card/50 rounded-xl border border-border/50">
                      <FileText className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
                      <p className="text-muted-foreground">
                        Aucune publication récente
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {recentPosts.slice(0, 5).map((post, index) => (
                        <motion.div
                          key={post.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="p-4 rounded-xl bg-card border border-border/50 hover:border-primary/30 transition-colors cursor-pointer"
                          onClick={() => navigate(`/feed`)}
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={post.profiles?.avatar_url || ""} />
                              <AvatarFallback className="text-xs">
                                {post.profiles?.display_name?.[0] || "?"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">
                                {post.is_anonymous
                                  ? "Anonyme"
                                  : post.profiles?.display_name || post.profiles?.username || "Utilisateur"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(post.created_at).toLocaleDateString("fr-FR")}
                              </p>
                            </div>
                            {post.profiles?.level && (
                              <Badge variant="outline" className="text-xs">
                                Niv. {post.profiles.level}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm line-clamp-2">{post.content}</p>
                          {post.hashtags && post.hashtags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {post.hashtags.slice(0, 3).map((tag: string) => (
                                <Badge 
                                  key={tag} 
                                  variant="secondary" 
                                  className="text-xs cursor-pointer hover:bg-primary/20"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleHashtagClick(tag.replace("#", ""));
                                  }}
                                >
                                  #{tag.replace("#", "")}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  )}
                </section>
              )}

              {/* Suggested Users Section */}
              {(activeCategory === "all" || activeCategory === "users") && (
                <section>
                  <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                    <Users className="h-5 w-5 text-primary" />
                    Suggestions d'amis
                  </h2>
                  <FriendSuggestions />
                </section>
              )}

              {/* Top Users by Level */}
              {(activeCategory === "all" || activeCategory === "users") && users.length > 0 && searchQuery.length < 2 && (
                <section>
                  <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                    <Trophy className="h-5 w-5 text-primary" />
                    Top utilisateurs
                  </h2>
                  <div className="space-y-2">
                    {users.slice(0, 5).map((user, index) => (
                      <motion.div
                        key={user.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center gap-3 p-3 rounded-xl bg-card/50 hover:bg-card transition-colors cursor-pointer"
                        onClick={() => navigate(`/profile/${user.user_id}`)}
                      >
                        <div className={cn(
                          "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                          index === 0 && "bg-yellow-500 text-white",
                          index === 1 && "bg-gray-400 text-white",
                          index === 2 && "bg-orange-600 text-white",
                          index > 2 && "bg-muted text-muted-foreground"
                        )}>
                          {index + 1}
                        </div>
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.avatar_url || ""} />
                          <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground text-sm">
                            {user.display_name?.[0] || user.username?.[0] || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate text-sm">
                            {user.display_name || user.username || "Anonyme"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {user.points || 0} points
                          </p>
                        </div>
                        <Badge variant="secondary">
                          Niv. {user.level || 1}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </TabsContent>

          {selectedHashtag && (
            <TabsContent value="hashtag" className="p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">
                    Publications avec #{selectedHashtag}
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedHashtag(null)}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Fermer
                  </Button>
                </div>

                {hashtagPosts.length === 0 ? (
                  <div className="text-center py-12 bg-card/50 rounded-xl border border-border/50">
                    <Hash className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
                    <p className="text-muted-foreground">
                      Aucune publication trouvée
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {hashtagPosts.map((post, index) => (
                      <motion.div
                        key={post.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-4 rounded-xl bg-card border border-border/50"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={post.profiles?.avatar_url || ""} />
                            <AvatarFallback>
                              {post.profiles?.display_name?.[0] || "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-medium">
                              {post.is_anonymous
                                ? "Anonyme"
                                : post.profiles?.display_name || post.profiles?.username || "Utilisateur"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(post.created_at).toLocaleDateString("fr-FR")}
                            </p>
                          </div>
                          {post.profiles?.level && (
                            <Badge variant="outline">Niv. {post.profiles.level}</Badge>
                          )}
                        </div>
                        <p className="text-sm">{post.content}</p>
                        {post.media_url && (
                          <img
                            src={post.media_url}
                            alt=""
                            className="mt-3 rounded-lg max-h-48 object-cover w-full"
                          />
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          )}
        </Tabs>
      </main>

      <BottomNav />
    </div>
  );
};

export default Discovery;
