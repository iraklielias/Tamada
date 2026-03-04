import {
  Wine,
  BookOpen,
  CalendarDays,
  Star,
  Sparkles,
  UtensilsCrossed,
  Activity,
  History,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { LanguageToggle } from "@/components/LanguageToggle";
import { ThemeToggle } from "@/components/ThemeToggle";
import HornIcon from "@/components/icons/HornIcon";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const mainNav = [
  { titleKey: "nav.dashboard", url: "/dashboard", icon: CalendarDays },
  { titleKey: "nav.feasts", url: "/feasts", icon: UtensilsCrossed },
  { titleKey: "nav.toasts", url: "/toasts", icon: Wine },
  { titleKey: "nav.library", url: "/library", icon: BookOpen },
  { titleKey: "nav.aiGenerator", url: "/ai-generate", icon: Sparkles },
  { titleKey: "nav.aiHistory", url: "/ai-history", icon: History },
  { titleKey: "nav.favorites", url: "/favorites", icon: Star },
  { titleKey: "nav.telemetry", url: "/admin/telemetry", icon: Activity },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { profile } = useAuth();
  const { t } = useTranslation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      {/* ─── Header ─── */}
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl wine-gradient shadow-wine shrink-0">
            <HornIcon size={18} className="text-primary-foreground" />
          </div>
          {!collapsed && (
            <span className="font-display text-lg font-bold text-foreground tracking-tight">
              TAMADA
            </span>
          )}
        </div>
      </SidebarHeader>

      <SidebarSeparator />

      {/* ─── Main nav ─── */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-caption text-muted-foreground uppercase tracking-wider">
            {t("nav.navigation")}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => {
                const active = isActive(item.url);
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={t(item.titleKey)}
                    >
                      <NavLink
                        to={item.url}
                        end
                        className="relative rounded-lg transition-all duration-150 hover:bg-accent/60"
                        activeClassName="bg-accent text-accent-foreground font-semibold shadow-card"
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        {!collapsed && (
                          <span className="truncate">{t(item.titleKey)}</span>
                        )}
                        {/* Active indicator dot */}
                        {active && !collapsed && (
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary" />
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarSeparator />

      {/* ─── Footer ─── */}
      <SidebarFooter className="p-3">
        <SidebarMenu>
          {/* Controls row */}
          <SidebarMenuItem>
            <div className="flex items-center justify-between px-1 mb-2 gap-1">
              <LanguageToggle collapsed={collapsed} />
              <ThemeToggle collapsed={collapsed} />
            </div>
          </SidebarMenuItem>

          {/* Profile link */}
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive("/profile")}
              tooltip={t("nav.profile")}
            >
              <NavLink
                to="/profile"
                className="rounded-lg transition-all duration-150 hover:bg-accent/60"
                activeClassName="bg-accent text-accent-foreground font-semibold shadow-card"
              >
                <Avatar className="h-7 w-7 shrink-0">
                  <AvatarImage src={profile?.avatar_url || undefined} />
                  <AvatarFallback className="text-[10px] font-bold bg-primary text-primary-foreground">
                    {(profile?.display_name || profile?.email || "U")
                      .charAt(0)
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {!collapsed && (
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {profile?.display_name || t("nav.profile")}
                    </p>
                    {profile?.email && (
                      <p className="truncate text-[10px] text-muted-foreground leading-tight">
                        {profile.email}
                      </p>
                    )}
                  </div>
                )}
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
