import { Wine, BookOpen, CalendarDays, Star, Sparkles, UtensilsCrossed } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { LanguageToggle } from "@/components/LanguageToggle";
import { ThemeToggle } from "@/components/ThemeToggle";
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
  { titleKey: "nav.favorites", url: "/favorites", icon: Star },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { profile } = useAuth();
  const { t } = useTranslation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg wine-gradient">
            <Wine className="h-4 w-4 text-primary-foreground" />
          </div>
          {!collapsed && (
            <span className="text-heading-3 text-foreground tracking-tight">
              თამადა
            </span>
          )}
        </div>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t("nav.navigation")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={t(item.titleKey)}>
                    <NavLink
                      to={item.url}
                      end
                      className="hover:bg-sidebar-accent/50"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{t(item.titleKey)}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarSeparator />

      <SidebarFooter className="p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center justify-between px-1 mb-2 gap-1">
              <LanguageToggle collapsed={collapsed} />
              <ThemeToggle collapsed={collapsed} />
            </div>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/profile")} tooltip={t("nav.profile")}>
              <NavLink
                to="/profile"
                className="hover:bg-sidebar-accent/50"
                activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
              >
                <Avatar className="h-6 w-6">
                  <AvatarImage src={profile?.avatar_url || undefined} />
                  <AvatarFallback className="text-[10px] bg-primary text-primary-foreground">
                    {(profile?.display_name || profile?.email || "U").charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {!collapsed && (
                  <span className="truncate text-sm">
                    {profile?.display_name || t("nav.profile")}
                  </span>
                )}
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
