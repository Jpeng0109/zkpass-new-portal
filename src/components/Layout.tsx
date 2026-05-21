import { ReactNode, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { SidebarNav } from "./SidebarNav";
import { TopUpModal } from "./TopUpModal";
import { ZkPassLogo } from "./ZkPassLogo";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function Layout({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen min-h-[100dvh] bg-background text-foreground">
      <Sidebar />

      <div className="flex flex-1 flex-col min-w-0">
        <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between gap-3 px-4 py-3 border-b border-border bg-background/95 backdrop-blur-md">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                className="w-10 h-10 panel flex items-center justify-center hover:border-neon/40 transition"
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[min(100vw,280px)] p-0 bg-sidebar border-sidebar-border flex flex-col">
              <SidebarNav onNavigate={() => setMobileOpen(false)} />
            </SheetContent>
          </Sheet>

          <Link to="/dashboard">
            <ZkPassLogo size="sm" />
          </Link>

          <div className="w-10" />
        </header>

        <main className="flex-1 min-w-0 neon-glow-bg overflow-x-hidden">{children}</main>
      </div>

      <TopUpModal />
    </div>
  );
}
