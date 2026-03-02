import { Wine, CalendarDays, Star, Sparkles, UtensilsCrossed } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useTranslation } from "react-i18next";

const navItems = [
  { titleKey: "nav.dashboard", url: "/dashboard", icon: CalendarDays },
  { titleKey: "nav.feasts", url: "/feasts", icon: UtensilsCrossed },
  { titleKey: "nav.ai", url: "/ai-generate", icon: Sparkles },
  { titleKey: "nav.toasts", url: "/toasts", icon: Wine },
  { titleKey: "nav.favorites", url: "/favorites", icon: Star },
];

export function BottomNav() {
  const { t } = useTranslation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-md md:hidden">
      <div className="flex items-center justify-around py-1.5 px-1">
        {navItems.map((item) => (
          <NavLink
            key={item.url}
            to={item.url}
            className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg text-muted-foreground transition-colors"
            activeClassName="text-primary"
          >
            <item.icon className="h-5 w-5" />
            <span className="text-[10px] font-medium leading-none">{t(item.titleKey)}</span>
          </NavLink>
        ))}
      </div>
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
