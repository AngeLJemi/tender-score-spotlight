import { Link } from "@tanstack/react-router";
import {
  ChevronsUpDown,
  Database,
  FileText,
  LayoutGrid,
  Settings,
  Stethoscope,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", icon: LayoutGrid, to: "/dashboard" as const, accent: "primary" as const },
  { label: "Tenders", icon: FileText, to: "/" as const, accent: "primary" as const },
  {
    label: "Tenders Library",
    icon: Database,
    to: "/library" as const,
    accent: "library" as const,
  },
  { label: "Settings", icon: Settings, to: "/settings" as const, accent: "primary" as const },
];

export function Sidebar() {
  return (
    <aside className="hidden w-56 shrink-0 flex-col justify-between border-r border-sidebar-border bg-sidebar p-3.5 lg:flex">
      <div>
        <div className="flex items-center gap-2.5 px-2 py-2">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/12 text-primary">
            <Stethoscope className="size-5" />
          </span>
          <span className="font-display text-lg font-semibold italic">Equip Medical</span>
        </div>

        <nav className="mt-3 space-y-1">
          {navItems.map((item) => {
            const inactive =
              "text-sidebar-foreground hover:bg-sidebar-accent" as const;
            const base =
              "flex w-full items-center gap-3 rounded-full px-4 py-2.5 text-sm font-medium transition-colors";
            if (item.to === "/settings") {
              return (
                <span key={item.label} className={cn(base, inactive, "cursor-default opacity-70")}>
                  <item.icon className="size-4 shrink-0" />
                  {item.label}
                </span>
              );
            }
            const activeClass =
              item.accent === "library"
                ? "bg-library text-library-foreground hover:bg-library"
                : "bg-primary text-primary-foreground hover:bg-primary";
            return (
              <Link
                key={item.label}
                to={item.to}
                activeOptions={{ exact: true, includeSearch: false }}
                className={cn(base, inactive)}
                activeProps={{ className: activeClass }}
              >
                <item.icon className="size-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-xl px-2 py-2 hover:bg-sidebar-accent">
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
          CN
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-medium">Angel</span>
          <span className="block truncate text-xs text-muted-foreground">angel@inextlabs.com</span>
        </span>
        <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
      </div>
    </aside>
  );
}
