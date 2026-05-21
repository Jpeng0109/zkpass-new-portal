import { SidebarNav } from "./SidebarNav";

export function Sidebar() {
  return (
    <aside className="hidden lg:flex w-64 shrink-0 bg-sidebar border-r border-sidebar-border flex-col min-h-screen">
      <SidebarNav />
    </aside>
  );
}
