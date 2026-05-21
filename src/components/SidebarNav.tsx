import { Link, useLocation } from "@tanstack/react-router";
import { LayoutDashboard, Briefcase, CreditCard, ChevronRight, LogOut } from "lucide-react";
import { useState } from "react";
import { ROLES, Role, useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { ZkPassLogo } from "@/components/ZkPassLogo";

const items = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/projects", label: "Projects", icon: Briefcase },
  { to: "/billing", label: "Billing & Invoices", icon: CreditCard },
] as const;

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const { role, setRole } = useStore();
  const [open, setOpen] = useState(false);
  const loc = useLocation();
  const current = ROLES[role];

  return (
    <>
      <div className="px-4 sm:px-6 py-6">
        <ZkPassLogo size="md" />
      </div>
      <div className="px-6 mt-2 text-[10px] tracking-[0.2em] text-muted-foreground">MAIN MENU</div>
      <nav className="px-3 mt-3 space-y-1 flex-1">
        {items.map(({ to, label, icon: Icon }) => {
          const active = loc.pathname === to || (to === "/billing" && loc.pathname === "/project-cost");
          return (
            <Link
              key={to}
              to={to}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                active
                  ? "bg-neon text-black shadow-neon"
                  : "text-foreground/80 hover:bg-sidebar-accent hover:text-foreground",
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 relative">
        {open && (
          <div className="absolute bottom-full left-3 right-3 mb-2 panel p-2 shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-200">
            {(Object.keys(ROLES) as Role[]).map((r) => {
              const info = ROLES[r];
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => {
                    setRole(r);
                    setOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-secondary transition",
                    role === r && "bg-secondary",
                  )}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ background: info.color, color: "#0a0a0a" }}
                  >
                    {info.initials}
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-foreground">{info.name}</div>
                    <div className="text-[11px] text-muted-foreground">{info.title}</div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="w-full panel p-3 flex items-center gap-3 hover:border-neon/40 transition-all"
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold relative"
            style={{ background: current.color, color: "#0a0a0a" }}
          >
            {current.initials}
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-neon border-2 border-card" />
          </div>
          <div className="flex-1 text-left">
            <div className="text-sm font-semibold text-foreground">{current.name}</div>
            <div className="text-[11px] text-muted-foreground">{current.title}</div>
          </div>
          <ChevronRight className={cn("w-4 h-4 text-muted-foreground transition-transform", open && "rotate-90")} />
        </button>
        <button
          type="button"
          className="w-full mt-2 px-3 py-2 text-xs text-muted-foreground hover:text-foreground flex items-center gap-2 transition"
        >
          <LogOut className="w-3 h-3" /> Sign out
        </button>
      </div>
    </>
  );
}
