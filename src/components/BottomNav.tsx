import { Wine, BookOpen, CalendarDays, Star, Sparkles } from "lucide-react";
import { NavLink } from "@/components/NavLink";

const navItems = [
  { title: "მთავარი", url: "/dashboard", icon: CalendarDays },
  { title: "სადღეგრძელო", url: "/toasts", icon: Wine },
  { title: "AI", url: "/ai-generate", icon: Sparkles },
  { title: "რჩეულები", url: "/favorites", icon: Star },
  { title: "ბიბლიოთეკა", url: "/library", icon: BookOpen },
];

export function BottomNav() {
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
            <span className="text-[10px] font-medium leading-none">{item.title}</span>
          </NavLink>
        ))}
      </div>
      {/* Safe area padding for iOS */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
