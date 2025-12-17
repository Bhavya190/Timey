// src/app/employee/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { initialProjects } from "@/lib/projects";
import { initialTasks } from "@/lib/tasks";
import { demoUsers } from "@/lib/users";
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  PieChart as PieIcon,
  BarChart3,
  LineChart as LineIcon,
  Clock4,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  Legend,
} from "recharts";

// Colors chosen to match your global dashboard:
// green, yellow, red, blue, purple.
const SEGMENT_COLORS = ["#22c55e", "#eab308", "#ef4444", "#0ea5e9", "#a855f7"];

function toLocalISODate(d: Date) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getWeekRangeFromDate(base: Date): { startISO: string; endISO: string } {
  const day = base.getDay(); // 0 = Sun
  const diffToMonday = (day + 6) % 7;
  const monday = new Date(
    base.getFullYear(),
    base.getMonth(),
    base.getDate() - diffToMonday
  );
  const startISO = toLocalISODate(monday);
  const endISO = toLocalISODate(
    new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 6)
  );
  return { startISO, endISO };
}

export default function EmployeeDashboardPage() {
  const router = useRouter();

  // 1) Hooks at top
  const [currentEmployeeId, setCurrentEmployeeId] = useState<number | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored =
        typeof window !== "undefined"
          ? window.localStorage.getItem("currentEmployeeId")
          : null;

      if (stored) {
        const id = Number(stored);
        if (!Number.isNaN(id)) {
          setCurrentEmployeeId(id);
        }
      }
    } finally {
      setHydrated(true);
    }
  }, []);

  // 2) Derived data

  const employee =
    currentEmployeeId != null
      ? demoUsers.find((u) => u.id === currentEmployeeId)
      : undefined;
  const employeeName = employee?.name ?? "Employee";

  // Tasks only for this employee
  const employeeTasks = useMemo(
    () =>
      currentEmployeeId == null
        ? []
        : initialTasks.filter((t) => t.assigneeIds.includes(currentEmployeeId)),
    [currentEmployeeId]
  );

  // Projects where this employee has at least one task
  const projectIds = useMemo(
    () => new Set(employeeTasks.map((t) => t.projectId)),
    [employeeTasks]
  );

  const employeeProjects = useMemo(
    () => initialProjects.filter((p) => projectIds.has(p.id)),
    [projectIds]
  );

  const totalProjects = employeeProjects.length;
  const totalTasks = employeeTasks.length;

  const todayISO = toLocalISODate(new Date());
  const todayHours = employeeTasks
    .filter((t) => t.date === todayISO)
    .reduce((sum, t) => sum + t.workedHours, 0);

  const { startISO, endISO } = useMemo(() => {
    const today = new Date();
    return getWeekRangeFromDate(today);
  }, []);

  const thisWeekTasks = useMemo(
    () =>
      employeeTasks.filter(
        (t) => t.date >= startISO && t.date <= endISO
      ),
    [employeeTasks, startISO, endISO]
  );

  const thisWeekHours = thisWeekTasks.reduce(
    (sum, t) => sum + t.workedHours,
    0
  );

  // Projects by status
  const projectsByStatus = useMemo(() => {
    const map: Record<string, number> = {};
    for (const p of employeeProjects) {
      map[p.status] = (map[p.status] ?? 0) + 1;
    }
    return Object.entries(map).map(([status, value]) => ({ name: status, value }));
  }, [employeeProjects]);

  // Tasks by status
  const tasksByStatus = useMemo(() => {
    const map: Record<string, number> = {};
    for (const t of employeeTasks) {
      map[t.status] = (map[t.status] ?? 0) + 1;
    }
    return Object.entries(map).map(([status, value]) => ({ name: status, value }));
  }, [employeeTasks]);

  // Task count by date
  const tasksByDate = useMemo(() => {
    const map: Record<string, number> = {};
    for (const t of employeeTasks) {
      map[t.date] = (map[t.date] ?? 0) + 1;
    }
    return Object.entries(map)
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([date, count]) => ({ date, count }));
  }, [employeeTasks]);

  // Timesheet aggregation using billingType: "billable" | "non-billable"
  const timesheetByDate = useMemo(() => {
    const map: Record<
      string,
      { total: number; billable: number; nonBillable: number }
    > = {};

    for (const t of employeeTasks) {
      if (!map[t.date]) {
        map[t.date] = { total: 0, billable: 0, nonBillable: 0 };
      }
      const bucket = map[t.date];
      bucket.total += t.workedHours;

      const billingType = (t as any).billingType as
        | "billable"
        | "non-billable"
        | undefined;

      if (billingType === "billable") {
        bucket.billable += t.workedHours;
      } else if (billingType === "non-billable") {
        bucket.nonBillable += t.workedHours;
      } else {
        // if missing, count as non-billable
        bucket.nonBillable += t.workedHours;
      }
    }

    return Object.entries(map)
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([date, v]) => ({
        date,
        total: v.total,
        billable: v.billable,
        nonBillable: v.nonBillable,
      }));
  }, [employeeTasks]);

  const totalAllTimeHours = timesheetByDate.reduce(
    (sum, d) => sum + d.total,
    0
  );

  // 3) Conditional returns after hooks

  if (!hydrated) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-400">
        Loading dashboard...
      </main>
    );
  }

  if (currentEmployeeId === null) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-400">
        No employee selected. Please go back and log in as an employee.
      </main>
    );
  }

  // 4) UI

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
            <LayoutDashboard className="h-4 w-4" />
            <span>Employee Dashboard</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome back, {employeeName}
          </h1>
          <p className="text-sm text-slate-400">
            Overview of your projects, tasks, and time tracking.
          </p>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-900/70 px-4 py-2 text-xs text-slate-300">
          <p className="mb-0.5 text-slate-400">Today&apos;s logged hours</p>
          <p className="text-lg font-semibold text-emerald-400">
            {todayHours.toFixed(2)} h
          </p>
        </div>
      </div>

      {/* Summary cards */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <button
          type="button"
          onClick={() => router.push("/employee/projects")}
          className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-left hover:border-emerald-500 hover:bg-slate-900 transition"
        >
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
            <FolderKanban className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs text-slate-400 mb-0.5">Total Projects</p>
            <p className="text-xl font-semibold text-slate-100">
              {totalProjects}
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => router.push("/employee/tasks")}
          className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-left hover:border-emerald-500 hover:bg-slate-900 transition"
        >
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-sky-500/10 text-sky-400">
            <CheckSquare className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs text-slate-400 mb-0.5">Total Tasks</p>
            <p className="text-xl font-semibold text-slate-100">
              {totalTasks}
            </p>
          </div>
        </button>

        <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10 text-amber-400">
            <Clock4 className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs text-slate-400 mb-0.5">
              Timesheet (this week)
            </p>
            <p className="text-xl font-semibold text-slate-100">
              {thisWeekHours.toFixed(2)} h
            </p>
          </div>
        </div>
      </section>

      {/* Charts: projects/tasks */}
      <section className="grid gap-4 xl:grid-cols-3">
        {/* Projects by status */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 flex flex-col">
          <div className="flex items-center mb-3 gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
              <PieIcon className="h-4 w-4" />
            </span>
            <div>
              <p className="text-xs text-slate-400">Projects</p>
              <p className="text-sm font-semibold text-slate-100">
                By status
              </p>
            </div>
          </div>
          <div className="flex-1">
            {projectsByStatus.length === 0 ? (
              <p className="text-xs text-slate-500 text-center mt-6">
                No project data available.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={projectsByStatus}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={80}
                    paddingAngle={2}
                  >
                    {projectsByStatus.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={SEGMENT_COLORS[index % SEGMENT_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Tasks by status */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 flex flex-col">
          <div className="flex items-center mb-3 gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-sky-500/10 text-sky-400">
              <PieIcon className="h-4 w-4" />
            </span>
            <div>
              <p className="text-xs text-slate-400">Tasks</p>
              <p className="text-sm font-semibold text-slate-100">
                By status
              </p>
            </div>
          </div>
          <div className="flex-1">
            {tasksByStatus.length === 0 ? (
              <p className="text-xs text-slate-500 text-center mt-6">
                No task data available.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={tasksByStatus}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={80}
                    paddingAngle={2}
                  >
                    {tasksByStatus.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={SEGMENT_COLORS[index % SEGMENT_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Task count by date */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 flex flex-col">
          <div className="flex items-center mb-3 gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-purple-500/10 text-purple-400">
              <BarChart3 className="h-4 w-4" />
            </span>
            <div>
              <p className="text-xs text-slate-400">Tasks</p>
              <p className="text-sm font-semibold text-slate-100">
                Task count by date
              </p>
            </div>
          </div>
          <div className="flex-1">
            {tasksByDate.length === 0 ? (
              <p className="text-xs text-slate-500 text-center mt-6">
                No task data available.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={tasksByDate}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis />
                  <RechartsTooltip />
                  <Bar dataKey="count" fill="#22c55e" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </section>

      {/* Time charts */}
      <section className="grid gap-4 xl:grid-cols-3">
        {/* Total hours by date */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
              <LineIcon className="h-4 w-4" />
            </span>
            <div>
              <p className="text-xs text-slate-400">Timesheet</p>
              <p className="text-sm font-semibold text-slate-100">
                Hours by date
              </p>
            </div>
          </div>
          <div className="flex-1">
            {timesheetByDate.length === 0 ? (
              <p className="text-xs text-slate-500 text-center mt-6">
                No timesheet data available.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={timesheetByDate}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis />
                  <RechartsTooltip />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="#22c55e"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Billable hours by date */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/10 text-amber-400">
              <LineIcon className="h-4 w-4" />
            </span>
            <div>
              <p className="text-xs text-slate-400">Timesheet</p>
              <p className="text-sm font-semibold text-slate-100">
                Billable hours by date
              </p>
            </div>
          </div>
          <div className="flex-1">
            {timesheetByDate.length === 0 ? (
              <p className="text-xs text-slate-500 text-center mt-6">
                No billable data available.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={timesheetByDate}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis />
                  <RechartsTooltip />
                  <Line
                    type="monotone"
                    dataKey="billable"
                    stroke="#eab308"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Non‑billable hours by date */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-rose-500/10 text-rose-400">
              <LineIcon className="h-4 w-4" />
            </span>
            <div>
              <p className="text-xs text-slate-400">Timesheet</p>
              <p className="text-sm font-semibold text-slate-100">
                Non‑billable hours by date
              </p>
            </div>
          </div>
          <div className="flex-1">
            {timesheetByDate.length === 0 ? (
              <p className="text-xs text-slate-500 text-center mt-6">
                No non‑billable data available.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={timesheetByDate}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis />
                  <RechartsTooltip />
                  <Line
                    type="monotone"
                    dataKey="nonBillable"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </section>

      <p className="text-[11px] text-slate-500">
        Total logged hours (all time): {totalAllTimeHours.toFixed(2)} h
      </p>
    </div>
  );
}
