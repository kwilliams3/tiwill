import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Sparkles, Users, Clock, Heart } from "lucide-react";

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate("/feed");
    }
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-tiwill-pink via-tiwill-purple to-tiwill-blue overflow-hidden">
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_25%_25%,_rgba(255,255,255,0.2)_1px,_transparent_1px)] bg-[length:40px_40px]" />
      
      <div className="relative min-h-screen flex flex-col items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-md"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mb-8"
          >
            <div className="w-24 h-24 mx-auto rounded-3xl bg-white/20 backdrop-blur-lg flex items-center justify-center shadow-2xl">
              <Sparkles className="w-12 h-12 text-white" />
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-5xl font-display font-bold text-white mb-4"
          >
            TiWill
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-white/90 mb-12"
          >
            Le réseau social éphémère et collaboratif
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-3 gap-4 mb-12"
          >
            {[
              { icon: Clock, label: "Éphémère" },
              { icon: Users, label: "Collaboratif" },
              { icon: Heart, label: "Authentique" },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + i * 0.1 }}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/10 backdrop-blur"
              >
                <item.icon className="w-6 h-6 text-white" />
                <span className="text-sm text-white/80">{item.label}</span>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="space-y-4"
          >
            <Button
              onClick={() => navigate("/auth")}
              className="w-full h-14 text-lg font-semibold bg-white text-tiwill-purple hover:bg-white/90 rounded-2xl shadow-xl"
            >
              Commencer
            </Button>
            <p className="text-white/60 text-sm">
              Rejoins des milliers de créateurs
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Index;
