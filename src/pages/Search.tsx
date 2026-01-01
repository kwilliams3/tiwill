import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useFriendSuggestions } from "@/hooks/useFriendSuggestions";
import { useFollow } from "@/hooks/useFollow";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search as SearchIcon, Users, UserPlus, UserMinus, Sparkles, 
  TrendingUp, Clock, X, ArrowLeft, Star, Heart
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { BottomNav } from "@/components/BottomNav";

interface UserResult {
  id: string;
  user_id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  level: number | null;
  commonInterests?: number;
}

const UserCard = ({ user, showCommonInterests = false }: { user: UserResult; showCommonInterests?: boolean }) => {
  const navigate = useNavigate();
  const { isFollowing, actionLoading, toggleFollow } = useFollow(user.user_id);
  const { user: currentUser } = useAuth();
  
  const isCurrentUser = currentUser?.id === user.user_id;

  const handleFollowClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await toggleFollow();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ scale: 1.01 }}
      onClick={() => navigate(`/profile/${user.user_id}`)}
      className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-card to-card/80 border border-border/50 cursor-pointer hover:shadow-lg hover:border-primary/20 transition-all duration-300"
    >
      <div className="relative flex-shrink-0">
        <Avatar className="w-16 h-16 border-2 border-primary/20">
          <AvatarImage src={user.avatar_url || ""} />
          <AvatarFallback className="bg-gradient-to-br from-primary to-primary/60 text-primary-foreground text-xl">
            {(user.display_name || user.username || "U")[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>
        {user.level && user.level > 5 && (
          <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500">
            <Star className="w-3 h-3 text-white fill-white" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-foreground truncate">
            {user.display_name || "Utilisateur"}
          </p>
          {user.level && (
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-gradient-to-r from-primary/20 to-primary/10 text-primary">
              Nv.{user.level}
            </span>
          )}
        </div>
        {user.username && (
          <p className="text-sm text-muted-foreground truncate">@{user.username}</p>
        )}
        {user.bio && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{user.bio}</p>
        )}
        {showCommonInterests && user.commonInterests && user.commonInterests > 0 && (
          <div className="flex items-center gap-1 mt-2">
            <Heart className="w-3 h-3 text-pink-500" />
            <span className="text-xs text-pink-500 font-medium">
              {user.commonInterests} intérêt{user.commonInterests > 1 ? "s" : ""} en commun
            </span>
          </div>
        )}
      </div>

      {!isCurrentUser && (
        <Button
          size="sm"
          variant={isFollowing ? "outline" : "default"}
          onClick={handleFollowClick}
          disabled={actionLoading}
          className={cn(
            "rounded-full gap-2 transition-all duration-300 flex-shrink-0",
            isFollowing 
              ? "hover:bg-destructive/10 hover:text-destructive hover:border-destructive" 
              : "bg-gradient-to-r from-primary to-primary/80"
          )}
        >
          {actionLoading ? (
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : isFollowing ? (
            <>
              <UserMinus className="w-4 h-4" />
              <span className="hidden sm:inline">Suivi</span>
            </>
          ) : (
            <>
              <UserPlus className="w-4 h-4" />
              <span className="hidden sm:inline">Suivre</span>
            </>
          )}
        </Button>
      )}
    </motion.div>
  );
};

const Search = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { suggestions, loading: loadingSuggestions } = useFriendSuggestions();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<UserResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState("suggestions");

  // Load recent searches from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("recentSearches");
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored));
      } catch (e) {
        console.error("Error loading recent searches");
      }
    }
  }, []);

  // Save to recent searches
  const addToRecentSearches = (userResult: UserResult) => {
    const updated = [userResult, ...recentSearches.filter(u => u.user_id !== userResult.user_id)].slice(0, 10);
    setRecentSearches(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
  };

  // Clear recent searches
  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem("recentSearches");
  };

  // Search users
  const searchUsers = useCallback(async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, user_id, username, display_name, avatar_url, bio, level")
        .or(`display_name.ilike.%${query}%,username.ilike.%${query}%`)
        .neq("user_id", user?.id || "")
        .limit(20);

      if (error) throw error;
      setSearchResults(data || []);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [user?.id]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        searchUsers(searchQuery);
        setActiveTab("results");
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, searchUsers]);

  const handleUserClick = (userResult: UserResult) => {
    addToRecentSearches(userResult);
    navigate(`/profile/${userResult.user_id}`);
  };

  const EmptyState = ({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <div className="p-6 rounded-full bg-gradient-to-br from-muted to-muted/50 mb-4">
        <Icon className="w-12 h-12 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-xs text-sm">{description}</p>
    </motion.div>
  );

  const LoadingState = () => (
    <div className="space-y-4">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="flex items-center gap-4 p-4 rounded-2xl bg-muted/50 animate-pulse"
        >
          <div className="w-16 h-16 rounded-full bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-32 bg-muted rounded" />
            <div className="h-3 w-24 bg-muted rounded" />
            <div className="h-3 w-48 bg-muted rounded" />
          </div>
          <div className="h-9 w-24 bg-muted rounded-full" />
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 pb-24">
      {/* Header with prominent search */}
      <div className="sticky top-0 z-50 bg-gradient-to-b from-primary/10 via-background to-background backdrop-blur-xl">
        <div className="px-4 pt-6 pb-4 safe-top">
          {/* Title row */}
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="rounded-xl hover:bg-background/50 flex-shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Trouver des amis
            </h1>
            <div className="w-10" /> {/* Spacer for centering */}
          </div>
          
          {/* Prominent search bar */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 rounded-2xl blur-xl" />
            <div className="relative bg-background/90 backdrop-blur-sm rounded-2xl border-2 border-primary/30 shadow-lg shadow-primary/10 overflow-hidden">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-primary" />
              <Input
                type="text"
                placeholder="Rechercher par nom ou @username..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="pl-14 pr-12 h-14 text-base bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/70"
              />
              {searchQuery ? (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-xl hover:bg-primary/10 text-primary"
                >
                  <X className="w-5 h-5" />
                </Button>
              ) : (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <Users className="w-5 h-5 text-muted-foreground/50" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 mt-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-3 h-12 p-1 bg-muted/50 rounded-2xl mb-6">
            <TabsTrigger
              value="suggestions"
              className="rounded-xl h-full text-xs font-semibold data-[state=active]:bg-background data-[state=active]:shadow-lg transition-all duration-300"
            >
              <Sparkles className="w-4 h-4 mr-1" />
              Suggestions
            </TabsTrigger>
            <TabsTrigger
              value="results"
              className="rounded-xl h-full text-xs font-semibold data-[state=active]:bg-background data-[state=active]:shadow-lg transition-all duration-300"
            >
              <TrendingUp className="w-4 h-4 mr-1" />
              Résultats
            </TabsTrigger>
            <TabsTrigger
              value="recent"
              className="rounded-xl h-full text-xs font-semibold data-[state=active]:bg-background data-[state=active]:shadow-lg transition-all duration-300"
            >
              <Clock className="w-4 h-4 mr-1" />
              Récents
            </TabsTrigger>
          </TabsList>

          {/* Suggestions Tab */}
          <TabsContent value="suggestions" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Personnes que vous pourriez connaître
              </h2>
            </div>
            
            <AnimatePresence mode="wait">
              {loadingSuggestions ? (
                <LoadingState />
              ) : suggestions.length === 0 ? (
                <EmptyState
                  icon={Users}
                  title="Aucune suggestion"
                  description="Ajoutez des centres d'intérêt pour voir des suggestions personnalisées"
                />
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-3"
                >
                  {suggestions.map((suggestion) => (
                    <div key={suggestion.user_id} onClick={() => handleUserClick({
                      ...suggestion,
                      commonInterests: suggestion.commonInterestCount
                    })}>
                      <UserCard user={{
                        ...suggestion,
                        commonInterests: suggestion.commonInterestCount
                      }} showCommonInterests />
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>

          {/* Search Results Tab */}
          <TabsContent value="results" className="space-y-4">
            <AnimatePresence mode="wait">
              {isSearching ? (
                <LoadingState />
              ) : searchQuery.length < 2 ? (
                <EmptyState
                  icon={SearchIcon}
                  title="Rechercher des amis"
                  description="Tapez au moins 2 caractères pour rechercher"
                />
              ) : searchResults.length === 0 ? (
                <EmptyState
                  icon={Users}
                  title="Aucun résultat"
                  description={`Aucun utilisateur trouvé pour "${searchQuery}"`}
                />
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-3"
                >
                  <p className="text-sm text-muted-foreground mb-4">
                    {searchResults.length} résultat{searchResults.length > 1 ? "s" : ""} pour "{searchQuery}"
                  </p>
                  {searchResults.map((result) => (
                    <div key={result.user_id} onClick={() => handleUserClick(result)}>
                      <UserCard user={result} />
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>

          {/* Recent Searches Tab */}
          <TabsContent value="recent" className="space-y-4">
            <AnimatePresence mode="wait">
              {recentSearches.length === 0 ? (
                <EmptyState
                  icon={Clock}
                  title="Aucune recherche récente"
                  description="Vos recherches récentes apparaîtront ici"
                />
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                      <Clock className="w-5 h-5 text-muted-foreground" />
                      Recherches récentes
                    </h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearRecentSearches}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl"
                    >
                      Effacer tout
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    {recentSearches.map((recentUser) => (
                      <div key={recentUser.user_id} onClick={() => handleUserClick(recentUser)}>
                        <UserCard user={recentUser} />
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>
        </Tabs>
      </div>

      <BottomNav />
    </div>
  );
};

export default Search;
