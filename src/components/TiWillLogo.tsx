import { motion, Easing } from "framer-motion";

interface TiWillLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  animate?: boolean;
  className?: string;
}

const sizeMap = {
  sm: { text: "text-xl", icon: 24 },
  md: { text: "text-3xl", icon: 32 },
  lg: { text: "text-5xl", icon: 48 },
  xl: { text: "text-7xl", icon: 64 },
};

export function TiWillLogo({ size = "md", animate = true, className = "" }: TiWillLogoProps) {
  const { text: textSize, icon: iconSize } = sizeMap[size];

  const letters = "TiWill".split("");

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      {/* Background glow effect */}
      {animate && (
        <motion.div
          className="absolute inset-0 blur-3xl"
          style={{
            background: "linear-gradient(135deg, hsl(var(--tiwill-pink)) 0%, hsl(var(--tiwill-purple)) 50%, hsl(var(--tiwill-blue)) 100%)",
            opacity: 0.3,
          }}
          initial={{ opacity: 0.3, scale: 1 }}
          animate={{ 
            opacity: [0.3, 0.5, 0.3],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut" as Easing,
          }}
        />
      )}

      {/* Sparkles */}
      {animate && [0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            left: `${20 + i * 30}%`,
            top: `${10 + (i % 2) * 60}%`,
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ 
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            delay: i * 0.3 + 1,
            duration: 1.5,
            repeat: Infinity,
            repeatDelay: 2,
          }}
        >
          <svg
            width={iconSize / 3}
            height={iconSize / 3}
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M12 2L13.09 8.26L19 7L14.74 11.26L21 12L14.74 12.74L19 17L13.09 15.74L12 22L10.91 15.74L5 17L9.26 12.74L3 12L9.26 11.26L5 7L10.91 8.26L12 2Z"
              fill="url(#sparkle-gradient)"
            />
            <defs>
              <linearGradient id="sparkle-gradient" x1="3" y1="2" x2="21" y2="22">
                <stop stopColor="hsl(var(--tiwill-pink))" />
                <stop offset="1" stopColor="hsl(var(--tiwill-purple))" />
              </linearGradient>
            </defs>
          </svg>
        </motion.div>
      ))}

      {/* Logo text */}
      <div className={`relative font-display font-black ${textSize} flex items-baseline`}>
        {letters.map((letter, i) => (
          <motion.span
            key={i}
            initial={animate ? { opacity: 0, y: 20 } : undefined}
            animate={animate ? { opacity: 1, y: 0 } : undefined}
            transition={animate ? {
              delay: i * 0.08,
              duration: 0.5,
              ease: "easeOut",
            } : undefined}
            className="inline-block"
            style={{
              background: `linear-gradient(135deg, 
                hsl(var(--tiwill-pink)) 0%, 
                hsl(var(--tiwill-purple)) 50%, 
                hsl(var(--tiwill-blue)) 100%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              textShadow: animate ? "0 0 40px hsl(var(--tiwill-purple) / 0.5)" : "none",
            }}
          >
            {letter}
          </motion.span>
        ))}

        {/* Animated underline */}
        {animate && (
          <motion.div
            className="absolute -bottom-1 left-0 right-0 h-1 rounded-full"
            style={{
              background: "linear-gradient(90deg, hsl(var(--tiwill-pink)), hsl(var(--tiwill-purple)), hsl(var(--tiwill-blue)))",
              transformOrigin: "left",
            }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.6, duration: 0.8, ease: "easeOut" }}
          />
        )}
      </div>

      {/* Floating icon */}
      {animate && (
        <motion.div
          className="ml-2"
          initial={{ opacity: 0, scale: 0, rotate: -180 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ delay: 0.8, duration: 0.6, type: "spring" }}
        >
          <motion.div
            animate={{
              y: [0, -4, 0],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <svg
              width={iconSize}
              height={iconSize}
              viewBox="0 0 48 48"
              fill="none"
            >
              {/* Heart with sparkle */}
              <motion.path
                d="M24 42L21.18 39.42C10.44 29.7 3.6 23.52 3.6 15.96C3.6 9.78 8.52 4.86 14.7 4.86C18.18 4.86 21.54 6.48 24 9.12C26.46 6.48 29.82 4.86 33.3 4.86C39.48 4.86 44.4 9.78 44.4 15.96C44.4 23.52 37.56 29.7 26.82 39.42L24 42Z"
                fill="url(#heart-gradient)"
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{
                  delay: 1,
                  duration: 0.6,
                  repeat: Infinity,
                  repeatDelay: 2,
                }}
              />
              {/* Inner sparkle */}
              <motion.path
                d="M24 16L25.5 21H30.5L26.5 24L28 29L24 26L20 29L21.5 24L17.5 21H22.5L24 16Z"
                fill="white"
                initial={{ opacity: 0.8 }}
                animate={{ opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <defs>
                <linearGradient id="heart-gradient" x1="3.6" y1="4.86" x2="44.4" y2="42">
                  <stop stopColor="hsl(var(--tiwill-pink))" />
                  <stop offset="0.5" stopColor="hsl(var(--tiwill-purple))" />
                  <stop offset="1" stopColor="hsl(var(--tiwill-blue))" />
                </linearGradient>
              </defs>
            </svg>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
