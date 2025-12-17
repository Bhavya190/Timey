"use client";

import { useEffect, useMemo, useState, FormEvent } from "react";
import { Task, initialTasks } from "@/lib/tasks";
import { initialProjects } from "@/lib/projects";
import { demoUsers } from "@/lib/users";
import {
  ClipboardClock,
  CalendarRange,
  Timer,
} from "lucide-react"; // icons for header + summary cards [web:54][web:56]

const employeesById = Object.fromEntries(demoUsers.map((u) => [u.id, u]));
const projectsById = Object.fromEntries(initialProjects.map((p) => [p.id, p]));

function toLocalISODate(d: Date) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getWeekRangeFromDate(base: Date): {
  days: string[];
  startISO: string;
  endISO: string;
} {
  const day = base.getDay(); // 0 Sun – 6 Sat
  const diffToMonday = (day + 6) % 7; // Monday as start
  const monday = new Date(
    base.getFullYear(),
    base.getMonth(),
    base.getDate() - diffToMonday
  );
  const days: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(
      monday.getFullYear(),
      monday.getMonth(),
      monday.getDate() + i
    );
    days.push(toLocalISODate(d));
  }
  return { days, startISO: days[0], endISO: days[6] };
}

function formatDateShortWithYear(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

function formatDateLabel(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const day = date.toLocaleDateString(undefined, { day: "2-digit" });
  const mon = date.toLocaleDateString(undefined, { month: "short" });
  return `${day} ${mon}`;
}

function formatDayName(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date
    .toLocaleDateString(undefined, {
      weekday: "short",
    })
    .toUpperCase();
}

export default function EmployeeTimesheetPage() {
  // 1) All hooks at the top, in a fixed order
  const [currentEmployeeId, setCurrentEmployeeId] = useState<number | null>(null);
  const [loadingEmployee, setLoadingEmployee] = useState(true);
  const [weekOffset, setWeekOffset] = useState(0);
  const [editedTasks, setEditedTasks] = useState<Task[] | null>(null);
  const [editTarget, setEditTarget] = useState<{ taskId: number; date: string } | null>(null);
  const [editedHours, setEditedHours] = useState<string>("0");
  const [editedDescription, setEditedDescription] = useState<string>("");

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
      setLoadingEmployee(false);
    }
  }, []);

  const { days, startISO, endISO } = useMemo(() => {
    const today = new Date();
    const base = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + weekOffset * 7
    );
    return getWeekRangeFromDate(base);
  }, [weekOffset]);

  const baseEmployeeTasks = useMemo<Task[]>(
    () =>
      currentEmployeeId == null
        ? []
        : initialTasks.filter((t) => t.assigneeIds.includes(currentEmployeeId)),
    [currentEmployeeId]
  );

  const effectiveTasks = editedTasks ?? baseEmployeeTasks;

  const weekTasks: Task[] = useMemo(
    () =>
      effectiveTasks.filter(
        (t) => t.date >= startISO && t.date <= endISO
      ),
    [effectiveTasks, startISO, endISO]
  );

  const hoursByTaskDay: Record<number, Record<string, number>> = {};
  for (const t of weekTasks) {
    if (!hoursByTaskDay[t.id]) hoursByTaskDay[t.id] = {};
    hoursByTaskDay[t.id][t.date] =
      (hoursByTaskDay[t.id][t.date] ?? 0) + t.workedHours;
  }

  const totalWorkedWeek = weekTasks.reduce(
    (sum, t) => sum + t.workedHours,
    0
  );

  const tasksById = Object.values(
    weekTasks.reduce<Record<number, Task>>((acc, t) => {
      acc[t.id] = t;
      return acc;
    }, {})
  );

  const employee = currentEmployeeId != null ? employeesById[currentEmployeeId] : undefined;

  // 2) Only now do conditional returns, AFTER all hooks
  if (loadingEmployee) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-400">
        Loading employee...
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

  // 3) Event handlers and rest of component
  const openEditFor = (task: Task, date: string) => {
    setEditTarget({ taskId: task.id, date });
    const cellHours = hoursByTaskDay[task.id]?.[date] ?? 0;
    setEditedHours(cellHours.toString());
    const existing = weekTasks.find(
      (t) => t.id === task.id && t.date === date
    );
    setEditedDescription(existing?.description ?? "");
  };

  const closeEdit = () => {
    setEditTarget(null);
    setEditedHours("0");
    setEditedDescription("");
  };

  const handleSaveEdit = (e: FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;
    const { taskId, date } = editTarget;
    const newHours = Number(editedHours) || 0;
    const desc = editedDescription.trim() || undefined;

    const sourceTasks = editedTasks ?? baseEmployeeTasks;
    const matching = sourceTasks.filter(
      (t) => t.id === taskId && t.date === date
    );
    if (matching.length === 0) {
      closeEdit();
      return;
    }

    const currentTotal = matching.reduce(
      (sum, t) => sum + t.workedHours,
      0
    );
    const factor =
      currentTotal > 0
        ? newHours / currentTotal
        : newHours / matching.length || 0;

    const updated = sourceTasks.map((t) => {
      if (t.id !== taskId || t.date !== date) return t;
      let newWorked = t.workedHours;
      if (matching.length === 1) {
        newWorked = newHours;
      } else if (currentTotal > 0) {
        newWorked = t.workedHours * factor;
      } else {
        newWorked = newHours / matching.length;
      }
      return {
        ...t,
        workedHours: newWorked,
        description: desc,
      };
    });

    setEditedTasks(updated);
    closeEdit();
  };

  return (
    <main className="space-y-4">
      {/* Header with icon */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
            <ClipboardClock className="h-4 w-4" />
          </span>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              My Timesheet
            </h1>
            <p className="text-sm text-slate-400">
              Weekly hours for {employee?.name ?? "this employee"}.
            </p>
          </div>
        </div>

        {/* Compact week range with prev/next arrows + calendar icon */}
        <div className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-1.5 text-xs text-slate-100">
          <button
            type="button"
            onClick={() => setWeekOffset((w) => w - 1)}
            className="px-1 hover:text-emerald-400"
          >
            ◀
          </button>
          <div className="flex items-center gap-2">
            <CalendarRange className="h-4 w-4 text-emerald-400" />
            <span>
              {formatDateShortWithYear(startISO)} –{" "}
              {formatDateShortWithYear(endISO)}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setWeekOffset((w) => w + 1)}
            className="px-1 hover:text-emerald-400"
          >
            ▶
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <section className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-xs flex items-center gap-3">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
            <Timer className="h-4 w-4" />
          </span>
          <div>
            <p className="text-slate-400 mb-1">Total Week Hours</p>
            <p className="text-xl font-semibold text-slate-100">
              {totalWorkedWeek.toFixed(2)} h
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-xs flex items-center gap-3">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-sky-500/10 text-sky-400">
            <CalendarRange className="h-4 w-4" />
          </span>
          <div>
            <p className="text-slate-400 mb-1">Week Range</p>
            <p className="text-sm text-slate-100">
              {formatDateShortWithYear(startISO)} –{" "}
              {formatDateShortWithYear(endISO)}
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-xs flex items-center gap-3">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/10 text-amber-400">
            <ClipboardClock className="h-4 w-4" />
          </span>
          <div>
            <p className="text-slate-400 mb-1">Status</p>
            <p className="text-xl font-semibold text-slate-100">
              Not Submitted
            </p>
          </div>
        </div>
      </section>

      {/* Timesheet table */}
      {/* ...rest of your component stays the same... */}
      {/* (keep everything from the table section down exactly as in your code) */}

      {/* Timesheet table */}
      <section className="rounded-2xl border border-slate-800 bg-slate-950/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-4 py-3 font-medium">Project – Task</th>
                {days.map((iso) => (
                  <th
                    key={iso}
                    className="px-3 py-3 font-medium text-center"
                  >
                    <div>{formatDayName(iso)}</div>
                    <div className="text-[11px] text-slate-500">
                      {formatDateLabel(iso)}
                    </div>
                  </th>
                ))}
                <th className="px-4 py-3 font-medium text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 bg-slate-950/40">
              {tasksById.map((task) => (
                <tr key={task.id}>
                  <td className="px-4 py-3">
                    <p className="text-slate-100">{task.name}</p>
                    <p className="text-[11px] text-slate-500">
                      {projectsById[task.projectId]?.name ??
                        task.projectName}{" "}
                      • {task.status}
                    </p>
                  </td>
                  {days.map((iso) => {
                    const hours = hoursByTaskDay[task.id]?.[iso] ?? 0;
                    return (
                      <td
                        key={iso}
                        className="px-3 py-3 text-center text-slate-300 cursor-pointer hover:bg-slate-900/70"
                        onClick={() => openEditFor(task, iso)}
                      >
                        {hours.toFixed(2)}
                      </td>
                    );
                  })}
                  <td className="px-4 py-3 text-right text-slate-100">
                    {Object.values(hoursByTaskDay[task.id] || {})
                      .reduce((sum, h) => sum + h, 0)
                      .toFixed(2)}
                  </td>
                </tr>
              ))}

              {tasksById.length === 0 && (
                <tr>
                  <td
                    colSpan={days.length + 2}
                    className="px-4 py-8 text-center text-sm text-slate-500"
                  >
                    No tasks found for this week.
                  </td>
                </tr>
              )}
            </tbody>

            <tfoot className="bg-slate-900/80 border-t border-slate-800 text-xs text-slate-300">
              <tr>
                <td className="px-4 py-3 font-medium">TOTAL</td>
                {days.map((iso) => {
                  const dayTotal = weekTasks
                    .filter((t) => t.date === iso)
                    .reduce((sum, t) => sum + t.workedHours, 0);
                  return (
                    <td key={iso} className="px-3 py-3 text-center">
                      {dayTotal.toFixed(2)}
                    </td>
                  );
                })}
                <td className="px-4 py-3 text-right font-semibold text-slate-100">
                  {totalWorkedWeek.toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      {/* Edit modal */}
      {editTarget && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-950 text-slate-100 shadow-2xl border border-slate-800 overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-800 px-5 py-3">
              <h2 className="text-sm font-semibold">Edit hours</h2>
              <button
                onClick={closeEdit}
                className="h-7 w-7 rounded-full border border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={handleSaveEdit}
              className="px-5 py-4 space-y-4 text-sm"
            >
              <div>
                <p className="text-xs text-slate-400 mb-1">Date</p>
                <p className="text-slate-100">
                  {formatDateShortWithYear(editTarget.date)}
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300">
                  Worked hours
                </label>
                <input
                  type="number"
                  min={0}
                  step={0.25}
                  value={editedHours}
                  onChange={(e) => setEditedHours(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300">
                  Description of work
                </label>
                <textarea
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40 resize-y"
                  placeholder="Briefly describe what you did in this time."
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800 mt-2">
                <button
                  type="button"
                  onClick={closeEdit}
                  className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-100 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-500 px-4 py-1.5 text-xs font-semibold text-slate-950 shadow-sm shadow-emerald-500/40 hover:bg-emerald-400"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
