"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Clock4,
  Users,
  Briefcase,
  FolderKanban,
  ClipboardList,
  LogOut,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

const adminLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/timesheet", label: "Timesheet", icon: Clock4 },
  { href: "/admin/employees", label: "Employees", icon: Users },
  { href: "/admin/clients", label: "Clients", icon: Briefcase },
  { href: "/admin/projects", label: "Projects", icon: FolderKanban },
  { href: "/admin/tasks", label: "Tasks", icon: ClipboardList },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    router.replace("/");
  };

  return (
    <div className="h-screen bg-background text-foreground flex">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-border bg-card/95 sticky top-0 h-screen overflow-y-auto">
        <div className="h-16 flex items-center justify-between px-6 border-b border-border">
          <span className="text-lg font-semibold tracking-tight">
            Timey <span className="text-emerald-500">Admin</span>
          </span>
          <ThemeToggle />
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 text-sm">
          {adminLinks.map((item) => {
            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 font-medium transition ${
                  active
                    ? "bg-emerald-500 text-slate-950"
                    : "text-muted hover:bg-background/80 hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-4 py-4 border-t border-border">
          <button
            onClick={handleLogout}
            className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-card"
          >
            <LogOut className="h-3.5 w-3.5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Right side */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <header className="md:hidden h-14 flex items-center justify-between border-b border-border px-4 bg-card/95">
          <span className="text-base font-semibold">
            Timey <span className="text-emerald-500">Admin</span>
          </span>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-3 py-1 text-xs text-foreground hover:bg-card"
            >
              <LogOut className="h-3.5 w-3.5" />
              Logout
            </button>
          </div>
        </header>

        {/* Mobile horizontal nav */}
        <nav className="md:hidden flex gap-2 overflow-x-auto px-3 py-2 border-b border-border bg-card/95">
          {adminLinks.map((item) => {
            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${
                  active
                    ? "bg-emerald-500 text-slate-950"
                    : "bg-background text-muted"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}
