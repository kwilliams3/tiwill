import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Users, Clock, Heart } from "lucide-react";

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate("/feed");
    }
  }, [user, loading, navigate]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-tiwill-pink via-tiwill-purple to-tiwill-blue">
      {/* Motif radial */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_25%_25%,_rgba(255,255,255,0.2)_1px,_transparent_1px)] bg-[length:40px_40px]" />

      {/* Particules légères */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: [0, 1, 0], y: -200 }}
            transition={{
              duration: 6 + i,
              repeat: Infinity,
              delay: i * 0.4,
              ease: "easeInOut",
            }}
            className="absolute bottom-0 left-1/2 w-1 h-1 rounded-full bg-white/40"
            style={{ marginLeft: `${i * 10 - 100}px` }}
          />
        ))}
      </div>

      {/* Contenu principal */}
      <div className="relative min-h-screen flex flex-col items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-md"
        >
          {/* LOGO ULTRA RECONNAISSABLE TiWill */}
          <motion.div
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 120 }}
            className="relative mb-10"
          >
            {/* Halo lumineux */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
              className="absolute inset-0 rounded-[32px] bg-gradient-to-tr from-white/30 via-white/10 to-white/30 blur-xl"
            />

            {/* Bloc principal du logo */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="relative w-28 h-28 mx-auto rounded-[32px]
                bg-white/15 backdrop-blur-xl
                flex items-center justify-center
                shadow-[0_20px_60px_rgba(255,255,255,0.25)]"
            >
              {/* SVG LOGO TW AVEC LA MÊME POLICE QUE TiWill */}
              <svg
                width="64"
                height="64"
                viewBox="0 0 128 128"
                xmlns="http://www.w3.org/2000/svg"
                className="w-16 h-16 font-display"
              >
                <defs>
                  <linearGradient
                    id="tiwill-gradient"
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

                {/* Fond carré arrondi */}
                <rect
                  width="128"
                  height="128"
                  rx="32"
                  fill="url(#tiwill-gradient)"
                />

                {/* Texte TW avec la même font que TiWill */}
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

                {/* Étincelle */}
                <circle cx="96" cy="32" r="8" fill="white" />
              </svg>
            </motion.div>
          </motion.div>

          {/* TITRE */}
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-6xl font-display font-bold text-white mb-4 tracking-tight"
          >
            Ti<span className="text-white/80">Will</span>
          </motion.h1>

          {/* SOUS-TITRE */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-white/90 mb-12"
          >
            Le réseau social éphémère et collaboratif
          </motion.p>

          {/* FEATURES */}
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

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1 }}
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
