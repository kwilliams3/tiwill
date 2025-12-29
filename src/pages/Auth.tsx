import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Mail, Lock, User, Eye, EyeOff, 
  Sparkles, Heart, Users, Globe 
} from "lucide-react";
import { z } from "zod";

const emailSchema = z.string().email("Email invalide");
const passwordSchema = z.string().min(6, "Minimum 6 caractères");

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user) navigate("/feed");
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      emailSchema.parse(email);
      passwordSchema.parse(password);
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast({ 
          title: "Erreur de validation", 
          description: err.errors[0].message, 
          variant: "destructive" 
        });
        return;
      }
    }

    setIsLoading(true);
    
    const { error } = isLogin 
      ? await signIn(email, password)
      : await signUp(email, password, displayName);

    setIsLoading(false);

    if (error) {
      toast({
        title: "Erreur d'authentification",
        description: error.message.includes("Invalid login") 
          ? "Email ou mot de passe incorrect" 
          : error.message,
        variant: "destructive",
      });
    } else if (!isLogin) {
      navigate("/onboarding");
    }
  };

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Arrière-plan décoratif avec particules animées */}
      <div className="absolute inset-0 bg-gradient-to-br from-tiwill-pink/15 via-tiwill-purple/10 to-tiwill-blue/15" />
      
      {/* Particules décoratives animées */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-tiwill-pink/30 rounded-full"
            initial={{ 
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              scale: 0 
            }}
            animate={{ 
              y: [null, -20, 0],
              scale: [0, 1, 0],
              opacity: [0, 0.5, 0]
            }}
            transition={{
              duration: 3 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 5
            }}
          />
        ))}
      </div>

      <div className="relative min-h-screen flex flex-col md:flex-row">
        {/* Section gauche - Illustration et branding */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="hidden md:flex md:w-1/2 bg-gradient-to-br from-tiwill-pink/20 via-tiwill-purple/10 to-tiwill-blue/20 flex-col justify-center items-center p-12"
        >
          <div className="max-w-md text-center">
            {/* Logo TiWill (desktop) */}
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="mb-8 flex justify-center"
            >
              <div className="relative">
                <div className="w-24 h-24 rounded-2xl flex items-center justify-center shadow-2xl shadow-tiwill-purple/30 bg-white/0">
                  {/* SVG LOGO TW IDENTIQUE À LA HOME, SANS ÉTOILE */}
                  <svg
                    width="96"
                    height="96"
                    viewBox="0 0 128 128"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-24 h-24 font-display"
                  >
                    <defs>
                      <linearGradient
                        id="tiwill-gradient-auth-desktop"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="100%"
                      >
                        <stop offset="0%" stopColor="#FF5EC1" />
                        <stop offset="50%" stopColor="#9B4BFF" />
                        <stop offset="100%" stopColor="#00CFFF" />
                      </linearGradient>
                    </defs>

                    <rect
                      width="128"
                      height="128"
                      rx="32"
                      fill="url(#tiwill-gradient-auth-desktop)"
                    />

                    <text
                      x="50%"
                      y="60%"
                      textAnchor="middle"
                      fontFamily="var(--font-display)"
                      fontWeight="700"
                      fontSize="56"
                      fill="white"
                    >
                      TW
                    </text>
                  </svg>
                </div>
              </div>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-5xl font-display font-bold mb-4 bg-gradient-to-r from-tiwill-pink via-tiwill-purple to-tiwill-blue bg-clip-text text-transparent"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              TiWill
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-xl text-muted-foreground mb-8"
            >
              La plateforme où vos idées prennent vie
            </motion.p>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex justify-center space-x-8 mt-12"
            >
              {[
                { icon: Users, text: "Communauté" },
                { icon: Heart, text: "Passions" },
                { icon: Globe, text: "Partage" }
              ].map((item, idx) => (
                <div key={idx} className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-tiwill-pink/20 to-tiwill-purple/20 flex items-center justify-center mb-2">
                    <item.icon className="w-6 h-6 text-tiwill-purple" />
                  </div>
                  <span className="text-sm font-medium text-foreground">{item.text}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* Section droite - Formulaire */}
        <div className="w-full md:w-1/2 flex flex-col p-6 md:p-12">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate("/")} 
            className="w-10 h-10 rounded-full mb-8 self-start hover:bg-tiwill-pink/10 transition-all duration-300"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full"
          >
            {/* Logo mobile */}
            <div className="flex items-center justify-center mb-8 md:hidden">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg bg-white/0">
                <svg
                  width="64"
                  height="64"
                  viewBox="0 0 128 128"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-16 h-16 font-display"
                >
                  <defs>
                    <linearGradient
                      id="tiwill-gradient-auth-mobile"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="#FF5EC1" />
                      <stop offset="50%" stopColor="#9B4BFF" />
                      <stop offset="100%" stopColor="#00CFFF" />
                    </linearGradient>
                  </defs>

                  <rect
                    width="128"
                    height="128"
                    rx="32"
                    fill="url(#tiwill-gradient-auth-mobile)"
                  />

                  <text
                    x="50%"
                    y="60%"
                    textAnchor="middle"
                    fontFamily="var(--font-display)"
                    fontWeight="700"
                    fontSize="56"
                    fill="white"
                  >
                    TW
                  </text>
                </svg>
              </div>
              <h1 className="text-3xl font-display font-bold ml-4 bg-gradient-to-r from-tiwill-pink to-tiwill-purple bg-clip-text text-transparent">
                TiWill
              </h1>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={isLogin ? "login" : "signup"}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-card/80 backdrop-blur-sm rounded-3xl border border-border/50 p-8 shadow-2xl shadow-tiwill-purple/10"
              >
                <div className="text-center mb-8">
                  <h1 className="text-3xl font-display font-bold gradient-text mb-3">
                    {isLogin ? "Bon retour !" : "Créer un compte"}
                  </h1>
                  <p className="text-muted-foreground">
                    {isLogin 
                      ? "Ravis de vous revoir ! Accédez à votre espace personnel." 
                      : "Rejoignez une communauté créative et passionnée !"}
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {!isLogin && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-2 overflow-hidden"
                    >
                      <Label htmlFor="name" className="text-sm font-medium">
                        Nom d'affichage
                      </Label>
                      <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-tiwill-pink/20 to-tiwill-purple/20 rounded-xl blur-sm group-hover:blur transition-all duration-300 opacity-0 group-hover:opacity-100" />
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
                        <Input 
                          id="name" 
                          placeholder="Votre pseudo créatif" 
                          value={displayName} 
                          onChange={(e) => setDisplayName(e.target.value)} 
                          className="pl-12 h-12 rounded-xl border-2 border-border/50 bg-background/50 backdrop-blur-sm relative z-10 focus:border-tiwill-purple focus:ring-2 focus:ring-tiwill-purple/20 transition-all"
                        />
                      </div>
                    </motion.div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email
                    </Label>
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-tiwill-pink/20 to-tiwill-purple/20 rounded-xl blur-sm group-hover:blur transition-all duration-300 opacity-0 group-hover:opacity-100" />
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="exemple@tiwill.com" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        className="pl-12 h-12 rounded-xl border-2 border-border/50 bg-background/50 backdrop-blur-sm relative z-10 focus:border-tiwill-purple focus:ring-2 focus:ring-tiwill-purple/20 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="password" className="text-sm font-medium">
                        Mot de passe
                      </Label>
                      {isLogin && (
                        <button 
                          type="button" 
                          className="text-xs text-tiwill-purple hover:underline"
                        >
                          Mot de passe oublié ?
                        </button>
                      )}
                    </div>
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-tiwill-pink/20 to-tiwill-purple/20 rounded-xl blur-sm group-hover:blur transition-all duration-300 opacity-0 group-hover:opacity-100" />
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
                      <Input 
                        id="password" 
                        type={showPassword ? "text" : "password"} 
                        placeholder="Votre mot de passe sécurisé" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        className="pl-12 pr-12 h-12 rounded-xl border-2 border-border/50 bg-background/50 backdrop-blur-sm relative z-10 focus:border-tiwill-purple focus:ring-2 focus:ring-tiwill-purple/20 transition-all"
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)} 
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 hover:scale-110 transition-transform"
                      >
                        {showPassword ? 
                          <EyeOff className="w-5 h-5 text-muted-foreground hover:text-tiwill-purple" /> : 
                          <Eye className="w-5 h-5 text-muted-foreground hover:text-tiwill-purple" />
                        }
                      </button>
                    </div>
                    {!isLogin && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Minimum 6 caractères avec chiffres et lettres
                      </p>
                    )}
                  </div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="pt-4"
                  >
                    <Button 
                      type="submit" 
                      disabled={isLoading} 
                      className="w-full h-14 rounded-xl bg-gradient-to-r from-tiwill-pink to-tiwill-purple hover:from-tiwill-pink/90 hover:to-tiwill-purple/90 text-white font-semibold text-lg shadow-lg shadow-tiwill-purple/30 hover:shadow-xl hover:shadow-tiwill-purple/40 transition-all duration-300 relative overflow-hidden group"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                      <span className="relative flex items-center justify-center">
                        {isLoading ? (
                          <>
                            <motion.div 
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-3"
                            />
                            Chargement...
                          </>
                        ) : isLogin ? (
                          <>
                            <Lock className="w-5 h-5 mr-3" />
                            Se connecter
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-5 h-5 mr-3" />
                            S'inscrire gratuitement
                          </>
                        )}
                      </span>
                    </Button>
                  </motion.div>
                </form>

                <div className="mt-8 pt-6 border-t border-border/50">
                  <p className="text-center text-muted-foreground">
                    {isLogin ? "Pas encore de compte ?" : "Déjà un compte ?"}{" "}
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsLogin(!isLogin)} 
                      className="text-primary font-semibold bg-gradient-to-r from-tiwill-pink to-tiwill-purple bg-clip-text text-transparent hover:underline"
                    >
                      {isLogin ? "Créer un compte" : "Se connecter"}
                    </motion.button>
                  </p>
                </div>

                {!isLogin && (
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xs text-center text-muted-foreground mt-6"
                  >
                    En vous inscrivant, vous acceptez nos{" "}
                    <button className="text-tiwill-purple hover:underline">Conditions d'utilisation</button>{" "}
                    et notre{" "}
                    <button className="text-tiwill-purple hover:underline">Politique de confidentialité</button>
                  </motion.p>
                )}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { z } from "zod";

const emailSchema = z.string().email("Email invalide");
const passwordSchema = z.string().min(6, "Minimum 6 caractères");

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user) navigate("/feed");
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      emailSchema.parse(email);
      passwordSchema.parse(password);
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast({ title: "Erreur", description: err.errors[0].message, variant: "destructive" });
        return;
      }
    }

    setIsLoading(true);
    
    const { error } = isLogin 
      ? await signIn(email, password)
      : await signUp(email, password, displayName);

    setIsLoading(false);

    if (error) {
      toast({
        title: "Erreur",
        description: error.message.includes("Invalid login") ? "Email ou mot de passe incorrect" : error.message,
        variant: "destructive",
      });
    } else if (!isLogin) {
      navigate("/onboarding");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="absolute inset-0 bg-gradient-to-br from-tiwill-pink/10 via-tiwill-purple/5 to-tiwill-blue/10" />
      
      <div className="relative min-h-screen flex flex-col px-6 py-8">
        <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="w-10 h-10 rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </Button>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-display font-bold gradient-text mb-2">
              {isLogin ? "Bon retour !" : "Créer un compte"}
            </h1>
            <p className="text-muted-foreground">
              {isLogin ? "Connecte-toi pour continuer" : "Rejoins la communauté TiWill"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name">Nom d'affichage</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input id="name" placeholder="Ton pseudo" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="pl-10 h-12 rounded-xl input-glow" />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input id="email" type="email" placeholder="ton@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10 h-12 rounded-xl input-glow" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 pr-10 h-12 rounded-xl input-glow" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">
                  {showPassword ? <EyeOff className="w-5 h-5 text-muted-foreground" /> : <Eye className="w-5 h-5 text-muted-foreground" />}
                </button>
              </div>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full h-12 rounded-xl gradient-primary text-white font-semibold text-lg mt-6">
              {isLoading ? "Chargement..." : isLogin ? "Se connecter" : "S'inscrire"}
            </Button>
          </form>

          <p className="text-center mt-6 text-muted-foreground">
            {isLogin ? "Pas encore de compte ?" : "Déjà un compte ?"}{" "}
            <button onClick={() => setIsLogin(!isLogin)} className="text-primary font-semibold hover:underline">
              {isLogin ? "S'inscrire" : "Se connecter"}
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
