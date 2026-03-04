import React from "react";
import { motion } from "framer-motion";
import HornIcon from "@/components/icons/HornIcon";
import WineGlassIcon from "@/components/icons/WineGlassIcon";
import QvevriIcon from "@/components/icons/QvevriIcon";

interface AuthLayoutProps {
  children: React.ReactNode;
}

/* Floating decorative elements for the left panel */
const FloatingOrb = ({
  className,
  delay = 0,
}: {
  className?: string;
  delay?: number;
}) => (
  <motion.div
    className={`absolute rounded-full pointer-events-none ${className}`}
    initial={{ opacity: 0, scale: 0.6 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay: 0.3 + delay, duration: 1, ease: [0, 0, 0.2, 1] }}
  >
    <motion.div
      animate={{ y: [0, -10, 0], x: [0, 4, 0] }}
      transition={{
        duration: 5 + delay * 2,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className="w-full h-full"
    />
  </motion.div>
);

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => (
  <div className="min-h-screen flex bg-background">
    {/* ─── Left decorative panel — hidden on mobile ─── */}
    <div className="hidden lg:flex lg:w-[45%] xl:w-1/2 relative overflow-hidden">
      {/* Base gradient */}
      <div className="absolute inset-0 wine-gradient" />

      {/* Animated gradient overlay */}
      <motion.div
        className="absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(ellipse at 30% 20%, hsla(43,53%,55%,0.3) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, hsla(350,60%,45%,0.4) 0%, transparent 50%)",
          backgroundSize: "200% 200%",
        }}
        animate={{
          backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 grapevine-bg opacity-10 pointer-events-none" />

      {/* Floating decorative icons */}
      <motion.div
        className="absolute top-[15%] left-[10%] opacity-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.15 }}
        transition={{ delay: 0.6, duration: 1 }}
      >
        <motion.div
          animate={{ y: [0, -12, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          <WineGlassIcon size={48} className="text-primary-foreground" />
        </motion.div>
      </motion.div>

      <motion.div
        className="absolute bottom-[20%] right-[12%] opacity-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.12 }}
        transition={{ delay: 0.9, duration: 1 }}
      >
        <motion.div
          animate={{ y: [0, -8, 0], rotate: [0, -5, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        >
          <QvevriIcon size={56} className="text-primary-foreground" />
        </motion.div>
      </motion.div>

      <motion.div
        className="absolute top-[55%] left-[65%] opacity-15"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.1 }}
        transition={{ delay: 1.2, duration: 1 }}
      >
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="w-3 h-3 rounded-full bg-primary-foreground/30" />
        </motion.div>
      </motion.div>

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center w-full p-12">
        <motion.div
          className="text-center text-primary-foreground max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6, ease: [0, 0, 0.2, 1] }}
        >
          <motion.div
            className="w-20 h-20 rounded-3xl bg-white/10 backdrop-blur-sm flex items-center justify-center mx-auto mb-8 border border-white/10"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5, type: "spring", stiffness: 200 }}
          >
            <HornIcon size={40} className="text-primary-foreground" />
          </motion.div>

          <motion.h1
            className="font-display text-5xl font-bold mb-4 tracking-tight"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            TAMADA
          </motion.h1>

          <motion.p
            className="text-xl font-medium opacity-90 mb-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.9 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            შენი ციფრული თამადა
          </motion.p>

          <motion.p
            className="text-base opacity-60 leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            Plan, manage, and lead unforgettable Georgian feasts with
            intelligence and tradition.
          </motion.p>
        </motion.div>
      </div>
    </div>

    {/* ─── Right content panel ─── */}
    <div className="flex-1 flex items-center justify-center p-6 md:p-10">
      <motion.div
        className="w-full max-w-[420px]"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0, 0, 0.2, 1] }}
      >
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center justify-center gap-3 mb-10">
          <div className="w-11 h-11 rounded-xl wine-gradient flex items-center justify-center shadow-wine">
            <HornIcon size={22} className="text-primary-foreground" />
          </div>
          <span className="font-display text-2xl font-bold text-foreground tracking-tight">
            TAMADA
          </span>
        </div>
        {children}
      </motion.div>
    </div>
  </div>
);

export default AuthLayout;
