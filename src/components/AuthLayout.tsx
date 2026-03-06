import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import HornIcon from "@/components/icons/HornIcon";
import { ArrowLeft } from "lucide-react";

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex bg-background">
      {/* ─── Left decorative panel — hidden on mobile ─── */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 wine-gradient" />

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

        <div className="absolute inset-0 grapevine-bg opacity-10 pointer-events-none" />

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
              {t("landing.heroSubtitleKa")}
            </motion.p>

            <motion.p
              className="text-base opacity-60 leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              transition={{ delay: 0.7, duration: 0.5 }}
            >
              {t("landing.heroSubtitleEn")}
            </motion.p>
          </motion.div>
        </div>
      </div>

      {/* ─── Right content panel ─── */}
      <div className="flex-1 flex flex-col p-6 md:p-10">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("auth.backToHome")}
        </Link>

        <div className="flex-1 flex items-center justify-center">
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
    </div>
  );
};

export default AuthLayout;
