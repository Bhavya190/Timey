"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { demoUsers } from "@/lib/users";
import {
  LayoutDashboard,
  Clock,
  FolderKanban,
  ListTodo,
  LogOut,
  User,
} from "lucide-react";

export default function EmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [currentEmployeeId, setCurrentEmployeeId] = useState<number | null>(
    null
  );
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem("currentEmployeeId");
    if (stored) {
      const parsed = Number(stored);
      if (!Number.isNaN(parsed)) {
        setCurrentEmployeeId(parsed);
      }
    }
    setHydrated(true);
  }, []);

  const currentEmployee =
    currentEmployeeId != null
      ? demoUsers.find(
          (u) => u.id === currentEmployeeId && u.role === "employee"
        ) ?? null
      : null;

  const handleLogout = () => {
    window.localStorage.removeItem("currentEmployeeId");
    router.replace("/");
  };

  if (!hydrated) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 px-6 py-5 text-center max-w-md">
          <h1 className="text-lg font-semibold text-slate-50 mb-2">
            Loading your profile...
          </h1>
          <p className="text-sm text-slate-400">
            Please wait while your employee profile is loaded.
          </p>
        </div>
      </main>
    );
  }

  if (!currentEmployee) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 px-6 py-5 text-center max-w-md">
          <h1 className="text-lg font-semibold text-slate-50 mb-2">
            Select an employee to continue
          </h1>
          <p className="text-sm text-slate-400">
            Please go back to the login screen and choose an employee profile.
          </p>
          <button
            type="button"
            onClick={() => router.replace("/")}
            className="mt-4 inline-flex items-center justify-center rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400"
          >
            Go to login
          </button>
        </div>
      </main>
    );
  }

  const isActive = (href: string) => {
    if (href === "/employee") return pathname === "/employee";
    return pathname.startsWith(href);
  };

  // Layout: fixed/sticky sidebar, right side scrollable
  return (
    <div className="h-screen w-screen bg-slate-950 text-slate-50 flex">
      {/* Sidebar stays fixed on the left */}
      <aside className="w-64 border-r border-slate-800 bg-slate-900/80 p-4 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/40">
              <Clock className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-[10px] font-semibold tracking-[0.25em] text-emerald-400 uppercase mb-0.5">
                Timey
              </p>
              <p className="text-sm text-slate-300 flex items-center gap-1">
                <User className="h-4 w-4 text-slate-400" />
                {currentEmployee.name}
              </p>
            </div>
          </div>

          <nav className="space-y-1 text-sm">
            <button
              type="button"
              onClick={() => router.push("/employee")}
              className={`flex items-center gap-2 w-full text-left rounded-md px-3 py-2 ${
                isActive("/employee")
                  ? "bg-emerald-500 text-slate-900"
                  : "hover:bg-slate-800"
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Dashboard</span>
            </button>
            <button
              type="button"
              onClick={() => router.push("/employee/timesheet")}
              className={`flex items-center gap-2 w-full text-left rounded-md px-3 py-2 ${
                isActive("/employee/timesheet")
                  ? "bg-emerald-500 text-slate-900"
                  : "hover:bg-slate-800"
              }`}
            >
              <Clock className="h-4 w-4" />
              <span>Timesheet</span>
            </button>
            <button
              type="button"
              onClick={() => router.push("/employee/projects")}
              className={`flex items-center gap-2 w-full text-left rounded-md px-3 py-2 ${
                isActive("/employee/projects")
                  ? "bg-emerald-500 text-slate-900"
                  : "hover:bg-slate-800"
              }`}
            >
              <FolderKanban className="h-4 w-4" />
              <span>My Projects</span>
            </button>
            <button
              type="button"
              onClick={() => router.push("/employee/tasks")}
              className={`flex items-center gap-2 w-full text-left rounded-md px-3 py-2 ${
                isActive("/employee/tasks")
                  ? "bg-emerald-500 text-slate-900"
                  : "hover:bg-slate-800"
              }`}
            >
              <ListTodo className="h-4 w-4" />
              <span>My Tasks</span>
            </button>
          </nav>
        </div>

        <div className="pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-slate-800 px-3 py-2 text-sm hover:bg-slate-700"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Right side scrolls independently */}
      <div className="flex-1 h-screen overflow-y-auto">
        <main className="p-6">
          {React.isValidElement(children)
            ? React.cloneElement(children as React.ReactElement<any>, {
                currentEmployeeId: currentEmployee.id,
              })
            : children}
        </main>
      </div>
    </div>
  );
}
