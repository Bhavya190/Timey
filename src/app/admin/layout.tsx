// src/app/admin/layout.tsx
"use client";

"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Clock4,
  Users,
  Briefcase,
  FolderKanban,
  ClipboardList,
  LogOut,
  Settings,
  User,
  Clock,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { demoUsers } from "@/lib/users";



const adminLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/timesheet", label: "Timesheet", icon: Clock4 },
  { href: "/admin/employees", label: "Employees", icon: Users },
  { href: "/admin/clients", label: "Clients", icon: Briefcase },
  { href: "/admin/projects", label: "Projects", icon: FolderKanban },
  { href: "/admin/tasks", label: "Tasks", icon: ClipboardList },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [currentAdminId, setCurrentAdminId] = useState<number | null>(null);

useEffect(() => {
  const stored = window.localStorage.getItem("currentAdminId");
  if (stored) {
    const parsed = Number(stored);
    if (!Number.isNaN(parsed)) setCurrentAdminId(parsed);
  }
}, []);

const currentAdmin =
  currentAdminId != null
    ? demoUsers.find((u) => u.id === currentAdminId && u.role === "admin") ?? null
    : null;
  const handleLogout = () => {
    router.replace("/");
  };

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  return (
    <div className="h-screen bg-background text-foreground flex">
      {/* Sidebar (desktop) */}
      <aside className="hidden md:flex w-64 flex-col border-r border-border bg-card/95 sticky top-0 h-screen overflow-y-auto">
        <div className="h-16 flex items-center justify-between px-6 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/40">
              {/* Reuse Clock icon for brand consistency */}
              <Clock className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-[10px] font-semibold tracking-[0.25em] text-emerald-500 uppercase mb-0.5">
                Timey
              </p>
              <p className="text-xs text-muted flex items-center gap-1">
                <User className="h-3.5 w-3.5 text-muted" />
                <span className="text-foreground">{currentAdmin?.name ?? "Admin"}</span>
              </p>
            </div>
          </div>
          <ThemeToggle />
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 text-sm">
          {adminLinks.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <button
                key={item.href}
                type="button"
                onClick={() => router.push(item.href)}
                className={`flex items-center gap-2 w-full text-left rounded-lg px-3 py-2 font-medium transition ${
                  active
                    ? "bg-emerald-500 text-slate-950"
                    : "text-muted hover:bg-background/80 hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="px-4 py-4 border-t border-border">
          <button
            type="button"
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
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/40">
              <Clock className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold tracking-[0.2em] uppercase text-emerald-500">
                Timey
              </span>
              <span className="text-[11px] text-muted flex items-center gap-1">
                <User className="h-3 w-3 text-muted" />
                <span className="text-foreground">{currentAdmin?.name ?? "Admin"}</span>
              </span>
            </div>
          </div>
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
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <button
                key={item.href}
                type="button"
                onClick={() => router.push(item.href)}
                className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${
                  active
                    ? "bg-emerald-500 text-slate-950"
                    : "bg-background text-muted"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {item.label}
              </button>
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
