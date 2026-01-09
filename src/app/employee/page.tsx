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
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
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

// Status colors (match admin)
const STATUS_COLORS: Record<string, string> = {
  Active: "#22c55e",        // green
  "On Hold": "#eab308",     // yellow
  Completed: "#f97316",     // orange
  "Not Started": "#ef4444", // red
  "In Progress": "#ef4444", // red
};

const legendProps = {
  verticalAlign: "bottom" as const,
  align: "left" as const,
  iconType: "circle" as const,
  wrapperStyle: { fontSize: 11, paddingTop: 8 },
};

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

function addDaysISO(iso: string, days: number) {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, m - 1, d + days);
  return toLocalISODate(dt);
}

export default function EmployeeDashboardPage() {
  const router = useRouter();

  const [currentEmployeeId, setCurrentEmployeeId] = useState<number | null>(null);
  const [hydrated, setHydrated] = useState(false);

  const initialWeek = getWeekRangeFromDate(new Date());
  const [weekStartISO, setWeekStartISO] = useState<string>(initialWeek.startISO);
  const [weekEndISO, setWeekEndISO] = useState<string>(initialWeek.endISO);

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

  const employee =
    currentEmployeeId != null
      ? demoUsers.find((u) => u.id === currentEmployeeId)
      : undefined;
  const employeeName = employee?.name ?? "Employee";

  const employeeTasks = useMemo(
    () =>
      currentEmployeeId == null
        ? []
        : initialTasks.filter((t) => t.assigneeIds.includes(currentEmployeeId)),
    [currentEmployeeId]
  );

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

  const weekTasks = useMemo(
    () =>
      employeeTasks.filter(
        (t) => t.date >= weekStartISO && t.date <= weekEndISO
      ),
    [employeeTasks, weekStartISO, weekEndISO]
  );

  const thisWeekHours = weekTasks.reduce((sum, t) => sum + t.workedHours, 0);

  const projectsByStatus = useMemo(() => {
    const map: Record<string, number> = {};
    for (const p of employeeProjects) {
      map[p.status] = (map[p.status] ?? 0) + 1;
    }
    return Object.entries(map).map(([status, value]) => ({ name: status, value }));
  }, [employeeProjects]);

  const tasksByStatus = useMemo(() => {
    const map: Record<string, number> = {};
    for (const t of weekTasks) {
      map[t.status] = (map[t.status] ?? 0) + 1;
    }
    return Object.entries(map).map(([status, value]) => ({ name: status, value }));
  }, [weekTasks]);

  const tasksByDate = useMemo(() => {
    const map: Record<string, number> = {};
    for (const t of weekTasks) {
      map[t.date] = (map[t.date] ?? 0) + 1;
    }
    return Object.entries(map)
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([date, count]) => ({ date, count }));
  }, [weekTasks]);

  const timesheetByDate = useMemo(() => {
    const map: Record<
      string,
      { total: number; billable: number; nonBillable: number }
    > = {};

    for (const t of weekTasks) {
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
  }, [weekTasks]);

  const totalAllTimeHours = useMemo(() => {
    const map: Record<string, number> = {};
    for (const t of employeeTasks) {
      map[t.date] = (map[t.date] ?? 0) + t.workedHours;
    }
    return Object.values(map).reduce((sum, v) => sum + v, 0);
  }, [employeeTasks]);

  const weekRangeLabel = `${weekStartISO} – ${weekEndISO}`;

  const goToPreviousWeek = () => {
    setWeekStartISO((prev) => addDaysISO(prev, -7));
    setWeekEndISO((prev) => addDaysISO(prev, -7));
  };

  const goToNextWeek = () => {
    setWeekStartISO((prev) => addDaysISO(prev, 7));
    setWeekEndISO((prev) => addDaysISO(prev, 7));
  };

  const handleWeekPickerChange = (value: string) => {
    if (!value) return;
    const { startISO, endISO } = getWeekRangeFromDate(new Date(value));
    setWeekStartISO(startISO);
    setWeekEndISO(endISO);
  };

  if (!hydrated) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background text-muted">
        Loading dashboard...
      </main>
    );
  }

  if (currentEmployeeId === null) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background text-muted">
        No employee selected. Please go back and log in as an employee.
      </main>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with week selector on right */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-muted text-xs mb-1">
            <LayoutDashboard className="h-4 w-4" />
            <span>Employee Dashboard</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome back, {employeeName}
          </h1>
          <p className="text-sm text-muted">
            Overview of your projects, tasks, and time tracking.
          </p>
        </div>

        {/* Week range card with prev/next and date picker icon */}
        <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs text-muted">
          <button
            type="button"
            onClick={goToPreviousWeek}
            className="p-1.5 rounded-lg hover:bg-background/80 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="flex flex-col items-start px-2">
            <span className="font-medium">{weekRangeLabel}</span>
          </div>

          <button
            type="button"
            className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border hover:bg-muted/40 relative"
          >
            <CalendarIcon className="h-3.5 w-3.5" />
            <input
              type="date"
              className="absolute inset-0 opacity-0 cursor-pointer"
              value={weekStartISO}
              onChange={(e) => handleWeekPickerChange(e.target.value)}
            />
          </button>

          <button
            type="button"
            onClick={goToNextWeek}
            className="p-1.5 rounded-lg hover:bg-background/80 transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <button
          type="button"
          onClick={() => router.push("/employee/projects")}
          className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-left hover:border-emerald-500 hover:bg-card/90 transition"
        >
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
            <FolderKanban className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs text-muted mb-0.5">Total Projects</p>
            <p className="text-xl font-semibold underline decoration-emerald-500 underline-offset-4">
              {totalProjects}
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => router.push("/employee/tasks")}
          className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-left hover:border-emerald-500 hover:bg-card/90 transition"
        >
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-sky-500/10 text-sky-500">
            <CheckSquare className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs text-muted mb-0.5">Total Tasks</p>
            <p className="text-xl font-semibold underline decoration-emerald-500 underline-offset-4">
              {totalTasks}
            </p>
          </div>
        </button>

        <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
            <Clock4 className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs text-muted mb-0.5">
              Timesheet (selected week)
            </p>
            <p className="text-xl font-semibold">
              {thisWeekHours.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Today's hours */}
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
            <Clock4 className="h-5 w-5" />
          </span>
          <div className="flex flex-col">
            <p className="text-xs text-muted mb-0.5">Today&apos;s logged hours</p>
            <p className="text-xl font-semibold">
              {todayHours.toFixed(2)}
            </p>
          </div>
        </div>

        {/* All‑time hours */}
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
            <Clock4 className="h-5 w-5" />
          </span>
          <div className="flex flex-col">
            <p className="text-xs text-muted mb-0.5">
              Total logged hours (all time)
            </p>
            <p className="text-xl font-semibold">
              {totalAllTimeHours.toFixed(2)}
            </p>
          </div>
        </div>
      </section>

      {/* Charts: projects/tasks */}
      <section className="grid gap-4 xl:grid-cols-3">
        {/* Projects by status */}
        <div className="rounded-2xl border border-border bg-card p-4 flex flex-col">
          <div className="flex items-center mb-3 gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
              <PieIcon className="h-4 w-4" />
            </span>
            <div>
              <p className="text-xs text-muted">Projects</p>
              <p className="text-sm font-semibold">By status</p>
            </div>
          </div>
          <div className="flex-1">
            {projectsByStatus.length === 0 ? (
              <p className="text-xs text-muted text-center mt-6">
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
                    {projectsByStatus.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={STATUS_COLORS[entry.name] ?? "#6b7280"}
                      />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                  <Legend {...legendProps} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Tasks by status */}
        <div className="rounded-2xl border border-border bg-card p-4 flex flex-col">
          <div className="flex items-center mb-3 gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-sky-500/10 text-sky-500">
              <PieIcon className="h-4 w-4" />
            </span>
            <div>
              <p className="text-xs text-muted">Tasks</p>
              <p className="text-sm font-semibold">By status</p>
            </div>
          </div>
          <div className="flex-1">
            {tasksByStatus.length === 0 ? (
              <p className="text-xs text-muted text-center mt-6">
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
                    {tasksByStatus.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={STATUS_COLORS[entry.name] ?? "#6b7280"}
                      />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                  <Legend {...legendProps} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Task count by date */}
        <div className="rounded-2xl border border-border bg-card p-4 flex flex-col">
          <div className="flex items-center mb-3 gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-purple-500/10 text-purple-500">
              <BarChart3 className="h-4 w-4" />
            </span>
            <div>
              <p className="text-xs text-muted">Tasks</p>
              <p className="text-sm font-semibold">Task count by date</p>
            </div>
          </div>
          <div className="flex-1">
            {tasksByDate.length === 0 ? (
              <p className="text-xs text-muted text-center mt-6">
                No task data available.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={tasksByDate}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2933" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend {...legendProps} />
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
        <div className="rounded-2xl border border-border bg-card p-4 flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
              <LineIcon className="h-4 w-4" />
            </span>
            <div>
              <p className="text-xs text-muted">Timesheet</p>
              <p className="text-sm font-semibold">Hours by date</p>
            </div>
          </div>
          <div className="flex-1">
            {timesheetByDate.length === 0 ? (
              <p className="text-xs text-muted text-center mt-6">
                No timesheet data available.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={timesheetByDate}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2933" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend {...legendProps} />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="#22c55e"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Billable hours by date */}
        <div className="rounded-2xl border border-border bg-card p-4 flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
              <LineIcon className="h-4 w-4" />
            </span>
            <div>
              <p className="text-xs text-muted">Timesheet</p>
              <p className="text-sm font-semibold">Billable hours by date</p>
            </div>
          </div>
          <div className="flex-1">
            {timesheetByDate.length === 0 ? (
              <p className="text-xs text-muted text-center mt-6">
                No billable data available.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={timesheetByDate}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2933" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend {...legendProps} />
                  <Line
                    type="monotone"
                    dataKey="billable"
                    stroke="#eab308"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Non‑billable hours by date */}
        <div className="rounded-2xl border border-border bg-card p-4 flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-rose-500/10 text-rose-500">
              <LineIcon className="h-4 w-4" />
            </span>
            <div>
              <p className="text-xs text-muted">Timesheet</p>
              <p className="text-sm font-semibold">Non‑billable hours by date</p>
            </div>
          </div>
          <div className="flex-1">
            {timesheetByDate.length === 0 ? (
              <p className="text-xs text-muted text-center mt-6">
                No non‑billable data available.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={timesheetByDate}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2933" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend {...legendProps} />
                  <Line
                    type="monotone"
                    dataKey="nonBillable"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
