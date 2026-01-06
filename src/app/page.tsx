"use client";

import { useMemo, useState } from "react";
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

type Role = "admin" | "teamLead" | "employee";

export default function HomePage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("employee");
  const [selectedUserId, setSelectedUserId] = useState<number | "">("");

  const admins = useMemo(
    () => demoUsers.filter((u) => u.role === "admin"),
    []
  );
  const teamLeads = useMemo(
    () => demoUsers.filter((u) => u.role === "teamLead"),
    []
  );
  const employees = useMemo(
    () => demoUsers.filter((u) => u.role === "employee"),
    []
  );

  const optionsForRole: Record<Role, typeof demoUsers> = {
    admin: admins,
    teamLead: teamLeads,
    employee: employees,
  };

  const handleLogin = () => {
    if (!selectedUserId) return;

    const user = demoUsers.find((u) => u.id === selectedUserId);
    if (!user) return;

    if (user.role === "employee") {
      window.localStorage.setItem("currentEmployeeId", String(user.id));
    } else {
      window.localStorage.removeItem("currentEmployeeId");
    }

    if (user.role === "admin") {
      router.replace("/admin");
    } else if (user.role === "teamLead") {
      router.replace("/admin"); // team lead → admin dashboard for now
    } else {
      router.replace("/employee");
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col">
      {/* top bar */}
      <header className="flex items-center justify-between px-4 py-4 md:px-10">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-emerald-500">
              Timey
            </p>
            <p className="text-[11px] text-muted">Time & attendance control</p>
          </div>
        </div>
        <ThemeToggle />
      </header>

      {/* center card */}
      <section className="flex-1 flex items-center justify-center px-4 pb-10">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card shadow-xl px-6 py-8 md:px-8 md:py-10">
          <div className="mb-6 text-center">
            <h1 className="text-2xl md:text-3xl font-semibold mb-2">
              Sign in to Timey
            </h1>
            <p className="text-sm text-muted">
              Pick your role and profile to enter the right dashboard.
            </p>
          </div>

          {/* role pills */}
          <div className="mb-5">
            <p className="mb-2 text-xs font-medium text-muted">Role</p>
            <div className="inline-flex w-full rounded-full bg-background/80 border border-border p-1 text-xs">
              {(["admin", "teamLead", "employee"] as Role[]).map((r) => {
                const isActive = r === role;
                const label =
                  r === "admin"
                    ? "Admin"
                    : r === "teamLead"
                    ? "Team lead"
                    : "Employee";
                const Icon = r === "admin" ? Shield : UserCircle2;

                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => {
                      setRole(r);
                      setSelectedUserId("");
                    }}
                    className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-1.5 font-medium transition-colors ${
                      isActive
                        ? "bg-emerald-500 text-slate-950"
                        : "text-muted hover:bg-emerald-500/5"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* profile select */}
          <div className="mb-6 space-y-2">
            <label className="block text-xs font-medium text-muted">
              {role === "admin"
                ? "Admin account"
                : role === "teamLead"
                ? "Team lead account"
                : "Employee account"}
            </label>
            <div className="relative">
              <UserCircle2 className="absolute left-3 top-2.5 h-4 w-4 text-muted" />
              <select
                value={selectedUserId}
                onChange={(e) =>
                  setSelectedUserId(
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
                className="w-full rounded-lg border border-border bg-background pl-9 pr-3 py-2.5 text-xs outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40 transition-colors"
              >
                <option value="">
                  {optionsForRole[role].length === 0
                    ? "No users for this role"
                    : "Choose profile"}
                </option>
                {optionsForRole[role].map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} · {user.email}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* CTA */}
          <button
            type="button"
            onClick={handleLogin}
            disabled={!selectedUserId}
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-sm shadow-emerald-500/40 hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            Continue
            <ArrowRight className="h-4 w-4" />
          </button>

          <p className="mt-4 text-[11px] text-muted text-center">
            Employees are remembered via{" "}
            <span className="font-medium">localStorage</span> so your timesheets
            and shifts load instantly next time.
          </p>

          <div className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-muted">
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
          </div>
        </div>
      </section>
    </main>
  );
}
