"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { demoUsers } from "@/lib/users";
import {
  UserCircle2,
  Shield,
  Users,
  HelpCircle,
  ArrowRight,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

type Role = "admin" | "employee";

export default function HomePage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("employee");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | "">("");

  const admin = demoUsers.find((u) => u.role === "admin");
  const employees = demoUsers.filter((u) => u.role === "employee");

  const handleAdminClick = () => {
    if (!admin) return;
    window.localStorage.removeItem("currentEmployeeId");
    router.replace("/admin");
  };

  const handleEmployeeLogin = () => {
    if (!selectedEmployeeId) return;

    window.localStorage.setItem(
      "currentEmployeeId",
      String(selectedEmployeeId)
    );
    router.replace("/employee");
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-background text-foreground">
      <div className="w-full max-w-5xl rounded-3xl border border-border bg-card shadow-2xl px-8 py-10 md:px-12 md:py-14">
        {/* top row: logo + toggle */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-xs font-semibold tracking-[0.25em] text-emerald-500 uppercase">
            Timey
          </p>
          <ThemeToggle />
        </div>

        {/* Header */}
        <header className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-semibold mb-3">
            Welcome to Timey
          </h1>
          <p className="text-sm md:text-base text-muted max-w-2xl mx-auto">
            Track time, manage schedules, and keep your team in sync with a
            simple, focused dashboard.
          </p>
        </header>

        <section className="grid gap-6 md:grid-cols-[1.1fr,0.9fr]">
          {/* Employee portal */}
          <div className="rounded-2xl border border-border bg-card px-6 py-6">
            <div className="flex items-center gap-3 mb-5">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                <Users className="h-6 w-6" />
              </span>
              <div>
                <h2 className="text-lg font-semibold">Employee Portal</h2>
                <p className="text-xs text-muted">
                  Choose your profile and jump into your personal dashboard.
                </p>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <label className="block text-xs text-muted mb-1">
                Select employee
              </label>
              <div className="relative">
                <UserCircle2 className="absolute left-3 top-2.5 h-4 w-4 text-muted" />
                <select
                  value={selectedEmployeeId}
                  onChange={(e) =>
                    setSelectedEmployeeId(
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                  className="w-full rounded-lg border border-border bg-background pl-9 pr-3 py-2 text-xs outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40"
                >
                  <option value="">Choose employee</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} (id {emp.id})
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={handleEmployeeLogin}
                disabled={!selectedEmployeeId}
                className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-sm shadow-emerald-500/40 hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Login as employee
                <ArrowRight className="h-4 w-4" />
              </button>

              <p className="text-[11px] text-muted">
                Timey stores the selected employee id in localStorage so your
                dashboard can load the correct data for that user.
              </p>
            </div>
          </div>

          {/* Admin card */}
          <button
            type="button"
            onClick={handleAdminClick}
            className="group flex flex-col items-start justify-between rounded-2xl border border-border bg-card px-6 py-6 text-left hover:border-emerald-500 hover:bg-card/90 transition-colors"
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                <Shield className="h-6 w-6" />
              </span>
              <div>
                <h2 className="text-lg font-semibold">Admin Dashboard</h2>
                <p className="text-xs text-muted">
                  Manage employees, tasks, and schedules across the team.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between w-full">
              <span className="text-[11px] text-muted">
                Logs you in as the Timey admin account.
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-500 group-hover:text-emerald-400">
                Go to admin
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </button>
        </section>

        {/* Footer help */}
        <footer className="mt-8 flex items-center justify-center gap-1.5 text-xs text-muted">
          <HelpCircle className="h-3.5 w-3.5" />
          <span>
            Need help with Timey?{" "}
            <button
              type="button"
              className="text-emerald-500 hover:text-emerald-400 underline underline-offset-2"
            >
              Contact support
            </button>
          </span>
        </footer>
      </div>
    </main>
  );
}
