import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, TrendingUp, Users, Hash, ArrowLeft, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDiscovery } from "@/hooks/useDiscovery";
import { BottomNav } from "@/components/BottomNav";

const Discovery = () => {
  const navigate = useNavigate();
  const { users, trendingHashtags, loading, searchQuery, setSearchQuery, searchByHashtag } = useDiscovery();
  const [selectedHashtag, setSelectedHashtag] = useState<string | null>(null);
  const [hashtagPosts, setHashtagPosts] = useState<any[]>([]);

  const handleHashtagClick = async (hashtag: string) => {
    setSelectedHashtag(hashtag);
    const posts = await searchByHashtag(hashtag);
    setHashtagPosts(posts);
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
          <div className="w-10" />
        </div>

        {/* Search Bar */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher des utilisateurs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-muted/50 border-border/50 focus:border-primary"
            />
          </div>
        </div>
      </header>

      <main className="pb-24">
        {/* Search Results */}
        <AnimatePresence>
          {searchQuery.length >= 2 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 border-b border-border/50"
            >
              <h2 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Résultats de recherche
              </h2>
              {users.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Aucun utilisateur trouvé
                </p>
              ) : (
                <div className="space-y-2">
                  {users.map((user, index) => (
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
                      <Badge variant="secondary" className="shrink-0">
                        Niv. {user.level || 1}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabs for Trending/Hashtag Posts */}
        <Tabs defaultValue="trending" className="w-full">
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
            <div className="space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
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
                <div className="text-center py-12">
                  <Hash className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">
                    Aucun hashtag tendance pour le moment
                  </p>
                  <p className="text-sm text-muted-foreground/70 mt-1">
                    Créez des posts avec des hashtags pour les voir ici !
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {trendingHashtags.map((item, index) => (
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
                          <div className={`w-10 h-10 rounded-full ${getHashtagColor(index)} flex items-center justify-center text-white font-bold`}>
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-semibold text-lg">#{item.hashtag}</p>
                            <p className="text-sm text-muted-foreground">
                              {item.count} publication{item.count > 1 ? "s" : ""}
                            </p>
                          </div>
                        </div>
                        <div className={`px-3 py-1 rounded-full ${getHashtagColor(index)} text-white text-sm font-medium`}>
                          Voir
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Suggested Users Section */}
              <div className="mt-8">
                <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                  <Users className="h-5 w-5 text-primary" />
                  Suggestions
                </h2>
                <p className="text-sm text-muted-foreground text-center py-8">
                  Les suggestions d'amis arrivent bientôt ! 🎉
                </p>
              </div>
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
                    Fermer
                  </Button>
                </div>

                {hashtagPosts.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    Aucune publication trouvée
                  </p>
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
                          <div>
                            <p className="font-medium">
                              {post.is_anonymous
                                ? "Anonyme"
                                : post.profiles?.display_name || post.profiles?.username || "Utilisateur"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(post.created_at).toLocaleDateString("fr-FR")}
                            </p>
                          </div>
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
