import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { BottomNav } from "@/components/BottomNav";

export function AppLayout() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />

        <div className="flex-1 flex flex-col min-w-0">
          {/* Top header with sidebar trigger — desktop only */}
          <header className="sticky top-0 z-40 hidden md:flex h-12 items-center gap-2 border-b border-border bg-background/95 backdrop-blur-md px-4">
            <SidebarTrigger />
          </header>

          {/* Main content area */}
          <main className="flex-1 pb-20 md:pb-0">
            <Outlet />
          </main>
        </div>

        {/* Bottom nav — mobile only */}
        <BottomNav />
      </div>
    </SidebarProvider>
  );
}
