import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { usePosts } from "@/hooks/usePosts";
import { supabase } from "@/integrations/supabase/client";
import { Image, Video, MapPin, Hash, X, Loader2, EyeOff, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface CreatePostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreatePostModal({ open, onOpenChange }: CreatePostModalProps) {
  const [content, setContent] = useState("");
  const [hashtagInput, setHashtagInput] = useState("");
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [location, setLocation] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video" | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { profile } = useProfile();
  const { createPost } = usePosts();
  const { toast } = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: "image" | "video") => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (50MB max)
    if (file.size > 50 * 1024 * 1024) {
      toast({ title: "Fichier trop volumineux", description: "Maximum 50MB", variant: "destructive" });
      return;
    }

    setMediaFile(file);
    setMediaType(type);
    setMediaPreview(URL.createObjectURL(file));
  };

  const removeMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
    setMediaType(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const addHashtag = () => {
    const tag = hashtagInput.trim().replace(/^#/, "").toLowerCase();
    if (tag && !hashtags.includes(tag) && hashtags.length < 10) {
      setHashtags([...hashtags, tag]);
      setHashtagInput("");
    }
  };

  const removeHashtag = (tag: string) => {
    setHashtags(hashtags.filter(t => t !== tag));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      addHashtag();
    }
  };

  const handleSubmit = async () => {
    if (!content.trim() && !mediaFile) {
      toast({ title: "Contenu requis", description: "Ajoute du texte ou un média", variant: "destructive" });
      return;
    }

    setIsLoading(true);

    try {
      let mediaUrl: string | undefined;

      // Upload media if present
      if (mediaFile && user) {
        const fileExt = mediaFile.name.split(".").pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("posts")
          .upload(fileName, mediaFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("posts")
          .getPublicUrl(fileName);

        mediaUrl = publicUrl;
      }

      const { error } = await createPost(
        content,
        mediaUrl,
        mediaType || "text",
        hashtags.length > 0 ? hashtags : undefined,
        location || undefined,
        isAnonymous
      );

      if (error) throw error;

      toast({ title: "Post créé !", description: "Ton post sera visible pendant 72h" });
      
      // Reset form
      setContent("");
      setHashtags([]);
      setLocation("");
      setIsAnonymous(false);
      removeMedia();
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating post:", error);
      toast({ title: "Erreur", description: "Impossible de créer le post", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const resetAndClose = () => {
    setContent("");
    setHashtags([]);
    setLocation("");
    setIsAnonymous(false);
    removeMedia();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={resetAndClose}>
      <DialogContent className="max-w-lg mx-4 p-0 rounded-3xl overflow-hidden">
        <DialogHeader className="p-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-display">Nouveau post</DialogTitle>
            <Button
              onClick={handleSubmit}
              disabled={isLoading || (!content.trim() && !mediaFile)}
              size="sm"
              className="rounded-full gradient-primary text-white"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4 mr-1" /> Publier</>}
            </Button>
          </div>
        </DialogHeader>

        <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* User info */}
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={isAnonymous ? "" : profile?.avatar_url || ""} />
              <AvatarFallback className="bg-gradient-to-br from-tiwill-pink to-tiwill-purple text-white">
                {isAnonymous ? "?" : (profile?.display_name || "U")[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-sm">{isAnonymous ? "Anonyme" : profile?.display_name || "Utilisateur"}</p>
              <p className="text-xs text-muted-foreground">Visible pendant 72h</p>
            </div>
          </div>

          {/* Content textarea */}
          <Textarea
            placeholder="Quoi de neuf ? 💭"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-24 border-0 resize-none text-base focus-visible:ring-0 p-0"
            maxLength={500}
          />

          {/* Media preview */}
          <AnimatePresence>
            {mediaPreview && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative rounded-2xl overflow-hidden"
              >
                {mediaType === "image" ? (
                  <img src={mediaPreview} alt="Preview" className="w-full max-h-64 object-cover" />
                ) : (
                  <video src={mediaPreview} controls className="w-full max-h-64" />
                )}
                <button
                  onClick={removeMedia}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Hashtags */}
          <div className="space-y-2">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Ajouter un hashtag"
                  value={hashtagInput}
                  onChange={(e) => setHashtagInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="pl-9 rounded-full"
                />
              </div>
              <Button type="button" onClick={addHashtag} variant="outline" size="icon" className="rounded-full shrink-0">
                <span className="text-lg">+</span>
              </Button>
            </div>
            
            {hashtags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {hashtags.map((tag) => (
                  <motion.span
                    key={tag}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm"
                  >
                    #{tag}
                    <button onClick={() => removeHashtag(tag)} className="hover:text-destructive">
                      <X className="w-3 h-3" />
                    </button>
                  </motion.span>
                ))}
              </div>
            )}
          </div>

          {/* Location */}
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Ajouter un lieu"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="pl-9 rounded-full"
            />
          </div>

          {/* Anonymous toggle */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-muted/50">
            <div className="flex items-center gap-3">
              <EyeOff className="w-5 h-5 text-muted-foreground" />
              <div>
                <Label className="font-medium text-sm">Mode anonyme</Label>
                <p className="text-xs text-muted-foreground">Ton identité sera masquée</p>
              </div>
            </div>
            <Switch checked={isAnonymous} onCheckedChange={setIsAnonymous} />
          </div>
        </div>

        {/* Media buttons */}
        <div className="p-4 border-t flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => handleFileSelect(e, "image")}
            className="hidden"
            id="image-input"
          />
          <input
            type="file"
            accept="video/*"
            onChange={(e) => handleFileSelect(e, "video")}
            className="hidden"
            id="video-input"
          />
          
          <Button
            type="button"
            variant="outline"
            onClick={() => document.getElementById("image-input")?.click()}
            className={cn("flex-1 rounded-full", mediaType === "image" && "border-primary text-primary")}
          >
            <Image className="w-5 h-5 mr-2" /> Photo
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => document.getElementById("video-input")?.click()}
            className={cn("flex-1 rounded-full", mediaType === "video" && "border-primary text-primary")}
          >
            <Video className="w-5 h-5 mr-2" /> Vidéo
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
