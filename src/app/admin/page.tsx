"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { demoUsers } from "@/lib/users";
import { initialProjects } from "@/lib/projects";
import { initialClients } from "@/lib/clients";
import { initialTasks, TaskStatus } from "@/lib/tasks";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import {
  BarChart3,
  Users,
  Briefcase,
  ClipboardList,
  CalendarRange,
  Filter,
} from "lucide-react";

const COLORS = ["#22c55e", "#ef4444", "#eab308", "#3b82f6", "#a855f7"];

const employees = demoUsers.filter((u) => u.role === "employee");

type ProjectStatus = (typeof initialProjects)[number]["status"];
type ClientStatus = (typeof initialClients)[number]["status"];

// simple YYYY-MM-DD sort helper
const sortByDate = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);

export default function AdminDashboard() {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | "all">(
    "all"
  );
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const isWithinRange = (date: string) => {
    if (startDate && date < startDate) return false;
    if (endDate && date > endDate) return false;
    return true;
  };

  // Filtered tasks (employee + date)
  const filteredTasks = useMemo(
    () =>
      initialTasks.filter((t) => {
        const byEmployee =
          selectedEmployeeId === "all"
            ? true
            : t.assigneeIds.includes(selectedEmployeeId as number);
        const byDate = isWithinRange(t.date);
        return byEmployee && byDate;
      }),
    [selectedEmployeeId, startDate, endDate]
  );

  // Project count by status (global)
  const projectStatusData = useMemo(() => {
    const map = new Map<ProjectStatus, number>();
    initialProjects.forEach((p) => {
      map.set(p.status, (map.get(p.status) ?? 0) + 1);
    });
    return Array.from(map.entries()).map(([status, count]) => ({
      name: status,
      value: count,
    }));
  }, []);

  // Client count by status (global)
  const clientStatusData = useMemo(() => {
    const map = new Map<ClientStatus, number>();
    initialClients.forEach((c) => {
      map.set(c.status, (map.get(c.status) ?? 0) + 1);
    });
    return Array.from(map.entries()).map(([status, count]) => ({
      name: status,
      value: count,
    }));
  }, []);

  // Tasks by status (filtered)
  const tasksByStatusData = useMemo(() => {
    const map = new Map<TaskStatus, number>();
    filteredTasks.forEach((t) => {
      map.set(t.status, (map.get(t.status) ?? 0) + 1);
    });
    const ALL_STATUSES: TaskStatus[] = ["Not Started", "In Progress", "Completed"];
    return ALL_STATUSES.map((status) => ({
      name: status,
      value: map.get(status) ?? 0,
    }));
  }, [filteredTasks]);

  // Tasks per date (filtered)
  const tasksByDateData = useMemo(() => {
    const map = new Map<string, number>();
    filteredTasks.forEach((t) => {
      map.set(t.date, (map.get(t.date) ?? 0) + 1);
    });
    return Array.from(map.entries())
      .sort(([a], [b]) => sortByDate(a, b))
      .map(([date, count]) => ({ date, count }));
  }, [filteredTasks]);

  // Hours per date (filtered)
  const hoursByDateData = useMemo(() => {
    const map = new Map<string, number>();
    filteredTasks.forEach((t) => {
      map.set(t.date, (map.get(t.date) ?? 0) + t.workedHours);
    });
    return Array.from(map.entries())
      .sort(([a], [b]) => sortByDate(a, b))
      .map(([date, hours]) => ({ date, hours }));
  }, [filteredTasks]);

  // Totals
  const totalEmployees = employees.length;
  const activeProjects = initialProjects.filter((p) => p.status === "Active").length;
  const openTasks = filteredTasks.filter((t) => t.status !== "Completed").length;

  const selectedEmployeeName =
    selectedEmployeeId === "all"
      ? "All employees"
      : employees.find((e) => e.id === selectedEmployeeId)?.name ?? "Unknown";

  const dateLabel =
    startDate || endDate ? `${startDate || "…"} – ${endDate || "…"}` : "all dates";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
            <p className="text-sm text-slate-400">
              Visual overview of employees, projects, clients, tasks and
              timesheet hours.
            </p>
          </div>
        </div>
      </div>

      {/* Filters section (separate block) */}
      <section className="rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-3 md:px-5 md:py-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Filter className="h-4 w-4 text-emerald-400" />
          <span>Filters</span>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs">
          {/* Employee filter */}
          <div className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-slate-500" />
            <span className="text-slate-400">Employee:</span>
            <select
              value={selectedEmployeeId}
              onChange={(e) =>
                setSelectedEmployeeId(
                  e.target.value === "all" ? "all" : Number(e.target.value)
                )
              }
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-slate-100 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40"
            >
              <option value="all">All employees</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date filter */}
          <div className="flex items-center gap-1.5">
            <CalendarRange className="h-3.5 w-3.5 text-slate-500" />
            <span className="text-slate-400">Date:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-1.5 text-xs text-slate-100 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40"
            />
            <span className="text-slate-500">–</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-1.5 text-xs text-slate-100 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40"
            />
          </div>
        </div>
      </section>

      {/* Summary cards – now hyperlinks */}
      <div className="grid gap-4 md:grid-cols-3">
        <Link
          href="/admin/employees"
          className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 flex items-center justify-between hover:border-emerald-500 hover:bg-slate-900 transition-colors"
        >
          <div>
            <p className="text-xs text-slate-400">Total employees</p>
            <p className="mt-2 text-2xl font-semibold underline decoration-emerald-500/70 decoration-2 underline-offset-4">
              {totalEmployees}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Click to view the employees list.
            </p>
          </div>
          <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-emerald-400">
            <Users className="h-4 w-4" />
          </div>
        </Link>

        <Link
          href="/admin/projects"
          className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 flex items-center justify-between hover:border-emerald-500 hover:bg-slate-900 transition-colors"
        >
          <div>
            <p className="text-xs text-slate-400">Active projects</p>
            <p className="mt-2 text-2xl font-semibold underline decoration-emerald-500/70 decoration-2 underline-offset-4">
              {activeProjects}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Click to manage projects.
            </p>
          </div>
          <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-emerald-400">
            <Briefcase className="h-4 w-4" />
          </div>
        </Link>

        <Link
          href="/admin/tasks"
          className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 flex items-center justify-between hover:border-emerald-500 hover:bg-slate-900 transition-colors"
        >
          <div>
            <p className="text-xs text-slate-400">Open tasks</p>
            <p className="mt-2 text-2xl font-semibold underline decoration-emerald-500/70 decoration-2 underline-offset-4">
              {openTasks}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Click to see filtered tasks.
            </p>
          </div>
          <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-emerald-400">
            <ClipboardList className="h-4 w-4" />
          </div>
        </Link>
      </div>

      {/* Charts – unchanged from your version */}
      {/* Projects by status */}
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 flex flex-col">
          <p className="text-xs text-slate-400 mb-2">Projects by status</p>
          <div className="flex-1 min-h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={projectStatusData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  labelLine={false}
                >
                  {projectStatusData.map((_, index) => (
                    <Cell
                      key={`p-proj-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-3 space-y-1 text-[11px] text-slate-300">
            {projectStatusData.map((s, i) => (
              <li key={s.name} className="flex items-center gap-2">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: COLORS[i % COLORS.length] }}
                />
                <span>{s.name}</span>
                <span className="ml-auto text-slate-400">{s.value}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Clients by status */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 flex flex-col">
          <p className="text-xs text-slate-400 mb-2">Clients by status</p>
          <div className="flex-1 min-h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={clientStatusData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  labelLine={false}
                >
                  {clientStatusData.map((_, index) => (
                    <Cell
                      key={`p-client-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-3 space-y-1 text-[11px] text-slate-300">
            {clientStatusData.map((s, i) => (
              <li key={s.name} className="flex items-center gap-2">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: COLORS[i % COLORS.length] }}
                />
                <span>{s.name}</span>
                <span className="ml-auto text-slate-400">{s.value}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Tasks by status (filtered) */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 flex flex-col">
          <p className="text-xs text-slate-400 mb-1">Tasks by status</p>
          <p className="text-[11px] text-slate-500 mb-2">
            {selectedEmployeeName}, {dateLabel}
          </p>
          <div className="flex-1 min-h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={tasksByStatusData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  labelLine={false}
                >
                  {tasksByStatusData.map((_, index) => (
                    <Cell
                      key={`p-task-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-3 space-y-1 text-[11px] text-slate-300">
            {tasksByStatusData.map((s, i) => (
              <li key={s.name} className="flex items-center gap-2">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: COLORS[i % COLORS.length] }}
                />
                <span>{s.name}</span>
                <span className="ml-auto text-slate-400">{s.value}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Tasks per date */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 flex flex-col xl:col-span-2">
          <p className="text-xs text-slate-400 mb-1">Tasks count by date</p>
          <p className="text-[11px] text-slate-500 mb-2">
            {selectedEmployeeName}, {dateLabel}
          </p>
          <div className="flex-1 min-h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tasksByDateData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: "#9ca3af" }}
                />
                <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} />
                <Tooltip />
                <Bar dataKey="count" fill="#22c55e" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Hours per date */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 flex flex-col">
          <p className="text-xs text-slate-400 mb-1">
            Timesheet hours by date
          </p>
          <p className="text-[11px] text-slate-500 mb-2">
            {selectedEmployeeName}, {dateLabel}
          </p>
          <div className="flex-1 min-h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={hoursByDateData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: "#9ca3af" }}
                />
                <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="hours"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
