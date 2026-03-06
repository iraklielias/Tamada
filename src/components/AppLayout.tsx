import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { BottomNav } from "@/components/BottomNav";
import { AnimatePresence, motion } from "framer-motion";
import { pageTransition } from "@/lib/animations";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { SystemIcon } from "@/components/SystemIcon";

export function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const pageTitle = getPageTitle(location.pathname, t);
  const headerAction = getHeaderAction(location.pathname, t, navigate);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />

        <div className="flex-1 flex flex-col min-w-0">
          {/* Top header — desktop only */}
          <header className="sticky top-0 z-40 hidden md:flex h-12 items-center gap-3 border-b border-border glass-nav px-4">
            <SidebarTrigger />
            <div className="h-4 w-px bg-border" />
            <span className="text-caption text-muted-foreground truncate flex-1">
              {pageTitle}
            </span>
            {headerAction}
          </header>

          {/* Main content area with page transitions */}
          <main className="flex-1 pb-20 md:pb-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                variants={pageTransition}
                initial="initial"
                animate="animate"
                exit="exit"
                className="h-full"
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </main>
        </div>

        {/* Bottom nav — mobile only */}
        <BottomNav />
      </div>
    </SidebarProvider>
  );
}

function getHeaderAction(
  path: string,
  t: (key: string) => string,
  navigate: (path: string) => void,
): React.ReactNode {
  if (path === "/feasts") {
    return (
      <Button size="sm" variant="wine" className="h-7 text-xs" onClick={() => navigate("/feasts/new")}>
        <SystemIcon name="action.add" size="sm" className="mr-1" /> {t("feasts.newFeast")}
      </Button>
    );
  }
  return null;
}

function getPageTitle(path: string, t: (key: string) => string): string {
  const map: Record<string, string> = {
    "/dashboard": t("nav.dashboard"),
    "/feasts": t("nav.feasts"),
    "/feasts/new": t("feasts.newFeast"),
    "/toasts": t("nav.toasts"),
    "/library": t("nav.library"),
    "/ai-generate": t("nav.aiGenerator"),
    "/favorites": t("nav.favorites"),
    "/profile": t("nav.profile"),
    "/upgrade": t("upgrade.title"),
    "/api-testing": t("nav.apiTesting"),
  };

  if (map[path]) return map[path];

  if (/^\/feasts\/[^/]+\/live$/.test(path)) return t("live.currentToast");
  if (/^\/feasts\/[^/]+$/.test(path)) return t("feastDetail.detailsTab");

  return "";
}
