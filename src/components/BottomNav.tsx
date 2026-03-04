import { Wine, CalendarDays, Star, Sparkles, UtensilsCrossed } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

const navItems = [
  { titleKey: "nav.dashboard", url: "/dashboard", icon: CalendarDays },
  { titleKey: "nav.feasts", url: "/feasts", icon: UtensilsCrossed },
  { titleKey: "nav.ai", url: "/ai-generate", icon: Sparkles },
  { titleKey: "nav.toasts", url: "/toasts", icon: Wine },
  { titleKey: "nav.favorites", url: "/favorites", icon: Star },
];

export function BottomNav() {
  const { t } = useTranslation();
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border glass-nav md:hidden">
      <div className="flex items-center justify-around py-1.5 px-1 relative">
        {navItems.map((item) => {
          const active = location.pathname === item.url ||
            (item.url !== "/dashboard" && location.pathname.startsWith(item.url));

          return (
            <NavLink
              key={item.url}
              to={item.url}
              className="relative flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl text-muted-foreground transition-colors"
              activeClassName="text-primary"
            >
              {/* Active pill background */}
              {active && (
                <motion.div
                  layoutId="bottomNavPill"
                  className="absolute inset-0 rounded-xl bg-accent"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <item.icon className="h-5 w-5 relative z-10" />
              <span className="text-[10px] font-semibold leading-none relative z-10">
                {t(item.titleKey)}
              </span>
            </NavLink>
          );
        })}
      </div>
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
