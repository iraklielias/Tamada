import { Outlet, useLocation } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { BottomNav } from "@/components/BottomNav";
import { AnimatePresence, motion } from "framer-motion";
import { pageTransition } from "@/lib/animations";

export function AppLayout() {
  const location = useLocation();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />

        <div className="flex-1 flex flex-col min-w-0">
          {/* Top header — desktop only */}
          <header className="sticky top-0 z-40 hidden md:flex h-12 items-center gap-3 border-b border-border glass-nav px-4">
            <SidebarTrigger />
            <div className="h-4 w-px bg-border" />
            <span className="text-caption text-muted-foreground truncate">
              {getPageTitle(location.pathname)}
            </span>
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

/** Simple breadcrumb label from pathname */
function getPageTitle(path: string): string {
  const map: Record<string, string> = {
    "/dashboard": "მთავარი",
    "/feasts": "სუფრები",
    "/feasts/new": "ახალი სუფრა",
    "/toasts": "სადღეგრძელოები",
    "/library": "ბიბლიოთეკა",
    "/ai-generate": "AI გენერატორი",
    "/ai-history": "AI ისტორია",
    "/favorites": "ფავორიტები",
    "/profile": "პროფილი",
    "/upgrade": "განახლება",
    "/admin/telemetry": "ტელემეტრია",
  };
  return map[path] || "";
}
