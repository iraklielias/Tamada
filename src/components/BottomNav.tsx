import { useState } from "react";
import { NavLink } from "@/components/NavLink";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { SystemIcon, IconName } from "@/components/SystemIcon";

const navItems: { titleKey: string; url: string; icon: IconName }[] = [
  { titleKey: "nav.dashboard", url: "/dashboard", icon: "nav.dashboard" },
  { titleKey: "nav.feasts", url: "/feasts", icon: "nav.feasts" },
  { titleKey: "nav.ai", url: "/ai-generate", icon: "nav.ai" },
  { titleKey: "nav.toasts", url: "/toasts", icon: "nav.toasts" },
];

const moreItems: { titleKey: string; url: string; icon: IconName }[] = [
  { titleKey: "nav.favorites", url: "/favorites", icon: "nav.favorites" },
  { titleKey: "nav.library", url: "/library", icon: "nav.library" },
  { titleKey: "nav.profile", url: "/profile", icon: "nav.profile" },
  { titleKey: "nav.upgrade", url: "/upgrade", icon: "nav.upgrade" },
];

const moreUrls = new Set(moreItems.map((i) => i.url));

export function BottomNav() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [moreOpen, setMoreOpen] = useState(false);

  const { data: activeFeastCount } = useQuery({
    queryKey: ["active-feast-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("feasts")
        .select("*", { count: "exact", head: true })
        .in("status", ["active", "paused"]);
      if (error) return 0;
      return count ?? 0;
    },
    refetchInterval: 30000,
  });

  const isMoreActive = moreUrls.has(location.pathname);

  return (
    <>
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
                {active && (
                  <motion.div
                    layoutId="bottomNavPill"
                    className="absolute inset-0 rounded-xl bg-accent"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <span className="relative">
                  <SystemIcon name={item.icon} size="sm" className="relative z-10" />
                  {item.url === "/feasts" && !!activeFeastCount && activeFeastCount > 0 && (
                    <span className="absolute -top-1 -right-1.5 w-2.5 h-2.5 rounded-full bg-success border-2 border-background z-20 animate-pulse" />
                  )}
                </span>
                <span className="text-[10px] font-semibold leading-none relative z-10">
                  {t(item.titleKey)}
                </span>
              </NavLink>
            );
          })}

          {/* More tab */}
          <button
            onClick={() => setMoreOpen(true)}
            className={`relative flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-colors ${isMoreActive ? "text-primary" : "text-muted-foreground"}`}
          >
            {isMoreActive && (
              <motion.div
                layoutId="bottomNavPill"
                className="absolute inset-0 rounded-xl bg-accent"
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
              />
            )}
            <SystemIcon name="nav.more" size="sm" className="relative z-10" />
            <span className="text-[10px] font-semibold leading-none relative z-10">
              {t("nav.more")}
            </span>
          </button>
        </div>
        <div className="h-[env(safe-area-inset-bottom)]" />
      </nav>

      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl pb-[env(safe-area-inset-bottom)]">
          <SheetHeader className="pb-2">
            <SheetTitle className="text-left font-display">{t("nav.more")}</SheetTitle>
          </SheetHeader>
          <div className="grid grid-cols-3 gap-2 py-3">
            <AnimatePresence>
              {moreItems.map((item, i) => {
                const active = location.pathname === item.url;
                return (
                  <motion.button
                    key={item.url}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => {
                      setMoreOpen(false);
                      navigate(item.url);
                    }}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-colors ${active ? "bg-accent text-primary" : "hover:bg-surface-1 text-foreground"}`}
                  >
                    <SystemIcon name={item.icon} size="md" />
                    <span className="text-xs font-medium">{t(item.titleKey)}</span>
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
