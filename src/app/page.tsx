// src/app/page.tsx
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

    // Save selected employee in localStorage
    window.localStorage.setItem(
      "currentEmployeeId",
      String(selectedEmployeeId)
    );

    // Go to employee dashboard route
    router.replace("/employee");
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-slate-950">
      <div className="w-full max-w-5xl rounded-3xl bg-slate-900/70 border border-slate-800 shadow-2xl shadow-slate-950/40 px-8 py-10 md:px-12 md:py-14">
        {/* Header */}
        <header className="text-center mb-10">
          <p className="text-xs font-semibold tracking-[0.25em] text-emerald-400 uppercase mb-2">
            Timey
          </p>
          <h1 className="text-3xl md:text-4xl font-semibold text-slate-50 mb-3">
            Welcome to Timey
          </h1>
          <p className="text-sm md:text-base text-slate-400 max-w-2xl mx-auto">
            Track time, manage schedules, and keep your team in sync with a
            simple, focused dashboard.
          </p>
        </header>

        <section className="grid gap-6 md:grid-cols-[1.1fr,0.9fr]">
          {/* Employee portal – with mandatory employee select */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 px-6 py-6">
            <div className="flex items-center gap-3 mb-5">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
                <Users className="h-6 w-6" />
              </span>
              <div>
                <h2 className="text-lg font-semibold text-slate-50">
                  Employee Portal
                </h2>
                <p className="text-xs text-slate-400">
                  Choose your profile and jump into your personal dashboard.
                </p>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <label className="block text-xs text-slate-400 mb-1">
                Select employee
              </label>
              <div className="relative">
                <UserCircle2 className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <select
                  value={selectedEmployeeId}
                  onChange={(e) =>
                    setSelectedEmployeeId(
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 pl-9 pr-3 py-2 text-xs outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40"
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

              <p className="text-[11px] text-slate-500">
                Timey stores the selected employee id in localStorage so your
                dashboard can load the correct data for that user.
              </p>
            </div>
          </div>

          {/* Admin card – separate, single click */}
          <button
            type="button"
            onClick={handleAdminClick}
            className="group flex flex-col items-start justify-between rounded-2xl border border-slate-800 bg-slate-900/80 px-6 py-6 text-left hover:border-emerald-500 hover:bg-slate-900 transition-colors"
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
                <Shield className="h-6 w-6" />
              </span>
              <div>
                <h2 className="text-lg font-semibold text-slate-50">
                  Admin Dashboard
                </h2>
                <p className="text-xs text-slate-400">
                  Manage employees, tasks, and schedules across the team.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between w-full">
              <span className="text-[11px] text-slate-500">
                Logs you in as the Timey admin account.
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-400 group-hover:text-emerald-300">
                Go to admin
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </button>
        </section>

        {/* Footer help */}
        <footer className="mt-8 flex items-center justify-center gap-1.5 text-xs text-slate-500">
          <HelpCircle className="h-3.5 w-3.5" />
          <span>
            Need help with Timey?{" "}
            <button
              type="button"
              className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2"
            >
              Contact support
            </button>
          </span>
        </footer>
      </div>
    </main>
  );
}
