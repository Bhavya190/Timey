"use client";

import { useEffect, useMemo, useState, FormEvent } from "react";
import { Task, initialTasks } from "@/lib/tasks";
import { initialProjects } from "@/lib/projects";
import { demoUsers } from "@/lib/users";
import {
  ClipboardClock,
  CalendarRange,
  Timer,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  PencilLine,
  FileInput,
} from "lucide-react";

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
  const day = base.getDay();
  const diffToMonday = (day + 6) % 7;
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

// Helper to build a stable key per week (for submission lock)
function getWeekKey(startISO: string, endISO: string) {
  return `${startISO}_${endISO}`;
}

export default function EmployeeTimesheetPage() {
  const [currentEmployeeId, setCurrentEmployeeId] = useState<number | null>(null);
  const [loadingEmployee, setLoadingEmployee] = useState(true);

  const [weekOffset, setWeekOffset] = useState(0);

  const [editedTasks, setEditedTasks] = useState<Task[] | null>(null);
  const [editTarget, setEditTarget] = useState<{
    taskId: number;
    date: string;
  } | null>(null);
  const [editedHours, setEditedHours] = useState<string>("0");
  const [editedDescription, setEditedDescription] = useState<string>("");

  // Track submitted weeks (by weekKey)
  const [submittedWeeks, setSubmittedWeeks] = useState<Record<string, boolean>>(
    {}
  );

  // Date-picker state (simple native input)
  const [pickerDate, setPickerDate] = useState<string>("");

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

  const weekKey = getWeekKey(startISO, endISO);
  const isSubmitted = submittedWeeks[weekKey] === true;

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

  const employee =
    currentEmployeeId != null ? employeesById[currentEmployeeId] : undefined;

  if (loadingEmployee) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background text-muted">
        Loading employee...
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

  const openEditFor = (taskId: number, date: string) => {
    if (isSubmitted) return; // lock week if submitted

    setEditTarget({ taskId, date });

    const matching = weekTasks.filter(
      (t) => t.id === taskId && t.date === date
    );
    const cellHours = matching.reduce((sum, t) => sum + t.workedHours, 0);
    setEditedHours(cellHours.toString());
    const existing = matching[0];
    setEditedDescription(existing?.description ?? "");
  };

  const closeEdit = () => {
    setEditTarget(null);
    setEditedHours("0");
    setEditedDescription("");
  };

  const handleSaveEdit = (e: FormEvent) => {
    e.preventDefault();
    if (!editTarget || isSubmitted) return;
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

  const handleJumpToDate = (iso: string) => {
    if (!iso) return;
    const selected = new Date(iso);
    const today = new Date();
    const thisWeek = getWeekRangeFromDate(today);
    const targetWeek = getWeekRangeFromDate(selected);

    // compute difference in days between Mondays, then weekOffset
    const baseMonday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const currentMonday = new Date(
      baseMonday.getFullYear(),
      baseMonday.getMonth(),
      baseMonday.getDate() - ((baseMonday.getDay() + 6) % 7)
    );
    const targetMonday = new Date(
      selected.getFullYear(),
      selected.getMonth(),
      selected.getDate() - ((selected.getDay() + 6) % 7)
    );

    const diffMs = targetMonday.getTime() - currentMonday.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
    const offset = diffDays / 7;
    setWeekOffset(offset);
  };

  const handleSubmitWeek = () => {
    if (isSubmitted) return;
    setSubmittedWeeks((prev) => ({
      ...prev,
      [weekKey]: true,
    }));
  };

  // If there are no tasks in this week, show 3 placeholder rows with Edit
  const rowsToRender =
    tasksById.length > 0
      ? tasksById.map((task) => ({
          type: "task" as const,
          task,
        }))
      : Array.from({ length: 3 }).map((_, index) => ({
          type: "placeholder" as const,
          placeholderId: -(index + 1),
        }));

  return (
    <main className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
            <ClipboardClock className="h-4 w-4" />
          </span>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              My Timesheet
            </h1>
            <p className="text-sm text-muted">
              Weekly hours for {employee?.name ?? "this employee"}.
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          {/* Date range + picker */}
          <div className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-muted">
            <button
              type="button"
              onClick={() => setWeekOffset((w) => w - 1)}
              className="inline-flex h-7 w-7 items-center justify-center rounded-full hover:bg-background/80 text-foreground"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-2">
              <CalendarRange className="h-4 w-4 text-emerald-500" />
              <span>
                {formatDateShortWithYear(startISO)} –{" "}
                {formatDateShortWithYear(endISO)}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setWeekOffset((w) => w + 1)}
              className="inline-flex h-7 w-7 items-center justify-center rounded-full hover:bg-background/80 text-foreground"
            >
              <ChevronRight className="h-4 w-4" />
            </button>

            {/* Date picker icon + hidden native date input */}
            <label className="relative inline-flex items-center gap-1 cursor-pointer text-foreground">
              <CalendarDays className="h-4 w-4 text-sky-500" />
              <span className="hidden sm:inline text-[11px]">
                Pick week
              </span>
              <input
                type="date"
                value={pickerDate}
                onChange={(e) => {
                  setPickerDate(e.target.value);
                  handleJumpToDate(e.target.value);
                }}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </label>
          </div>

          {/* Submit weekly timesheet */}
          <button
            type="button"
            onClick={handleSubmitWeek}
            disabled={isSubmitted}
            className={`inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-semibold shadow-sm ${
              isSubmitted
                ? "bg-emerald-500/10 text-emerald-500 cursor-default"
                : "bg-emerald-500 text-slate-950 hover:bg-emerald-400"
            }`}
          >
            <FileInput className="h-3.5 w-3.5" />
            {isSubmitted ? "Week Submitted" : "Submit Week"}
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <section className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card px-4 py-3 text-xs flex items-center gap-3">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
            <Timer className="h-4 w-4" />
          </span>
          <div>
            <p className="text-muted mb-1">Total Week Hours</p>
            <p className="text-xl font-semibold">
              {totalWorkedWeek.toFixed(2)} h
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card px-4 py-3 text-xs flex items-center gap-3">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-sky-500/10 text-sky-500">
            <CalendarRange className="h-4 w-4" />
          </span>
          <div>
            <p className="text-muted mb-1">Week Range</p>
            <p className="text-sm">
              {formatDateShortWithYear(startISO)} –{" "}
              {formatDateShortWithYear(endISO)}
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card px-4 py-3 text-xs flex items-center gap-3">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
            <ClipboardClock className="h-4 w-4" />
          </span>
          <div>
            <p className="text-muted mb-1">Status</p>
            <p className="text-xl font-semibold">
              {isSubmitted ? "Submitted" : "Not Submitted"}
            </p>
          </div>
        </div>
      </section>

      {/* Timesheet table */}
      <section className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-xs sm:text-sm">
            <thead className="bg-background/80 text-muted border-b border-border">
              <tr>
                <th className="px-4 py-3 font-medium">Project – Task</th>
                {days.map((iso) => (
                  <th
                    key={iso}
                    className="px-3 py-3 font-medium text-center"
                  >
                    <div>{formatDayName(iso)}</div>
                    <div className="text-[11px] text-muted">
                      {formatDateLabel(iso)}
                    </div>
                  </th>
                ))}
                <th className="px-2 py-3 font-medium text-center">
                  Edit
                </th>
                <th className="px-4 py-3 font-medium text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card">
              {rowsToRender.map((row) => {
                if (row.type === "task") {
                  const task = row.task;
                  return (
                    <tr key={task.id}>
                      <td className="px-4 py-3">
                        <p className="text-foreground">{task.name}</p>
                        <p className="text-[11px] text-muted">
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
                            className={`px-3 py-3 text-center text-foreground ${
                              isSubmitted
                                ? "cursor-default"
                                : "cursor-pointer hover:bg-background/70"
                            }`}
                            onClick={() =>
                              !isSubmitted && openEditFor(task.id, iso)
                            }
                          >
                            {hours.toFixed(2)}
                          </td>
                        );
                      })}
                      <td className="px-2 py-3 text-center">
                        <button
                          type="button"
                          disabled={isSubmitted}
                          onClick={() =>
                            !isSubmitted &&
                            openEditFor(task.id, days[0])
                          }
                          className={`inline-flex h-7 w-7 items-center justify-center rounded-full border text-muted hover:bg-background ${
                            isSubmitted
                              ? "opacity-60 cursor-not-allowed"
                              : "border-border"
                          }`}
                          title="Edit in timesheet"
                        >
                          <PencilLine className="h-3.5 w-3.5" />
                        </button>
                      </td>
                      <td className="px-4 py-3 text-right text-foreground">
                        {Object.values(hoursByTaskDay[task.id] || {})
                          .reduce((sum, h) => sum + h, 0)
                          .toFixed(2)}
                      </td>
                    </tr>
                  );
                }

                // Placeholder rows: no tasks in this week
                return (
                  <tr key={row.placeholderId}>
                    <td className="px-4 py-3">
                      <p className="text-foreground text-sm">
                        No task assigned
                      </p>
                      <p className="text-[11px] text-muted">
                        Use edit to add hours.
                      </p>
                    </td>
                    {days.map((iso) => (
                      <td
                        key={iso}
                        className="px-3 py-3 text-center text-muted"
                      >
                        0.00
                      </td>
                    ))}
                    <td className="px-2 py-3 text-center">
                      <button
                        type="button"
                        disabled={isSubmitted}
                        onClick={() =>
                          !isSubmitted &&
                          openEditFor(row.placeholderId, days[0])
                        }
                        className={`inline-flex h-7 w-7 items-center justify-center rounded-full border text-muted hover:bg-background ${
                          isSubmitted
                            ? "opacity-60 cursor-not-allowed"
                            : "border-border"
                        }`}
                        title="Edit in timesheet"
                      >
                        <PencilLine className="h-3.5 w-3.5" />
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right text-foreground">
                      0.00
                    </td>
                  </tr>
                );
              })}
            </tbody>

            <tfoot className="bg-background/80 border-t border-border text-xs text-muted">
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
                <td className="px-2 py-3" />
                <td className="px-4 py-3 text-right font-semibold text-foreground">
                  {totalWorkedWeek.toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      {/* Edit modal */}
      {editTarget && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-background/80 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-2xl bg-card text-foreground shadow-2xl border border-border overflow-hidden">
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
              <h2 className="text-sm font-semibold">Edit hours</h2>
              <button
                onClick={closeEdit}
                className="h-7 w-7 rounded-full border border-border text-muted hover:bg-background"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={handleSaveEdit}
              className="px-5 py-4 space-y-4 text-sm"
            >
              <div>
                <p className="text-xs text-muted mb-1">Date</p>
                <p className="text-foreground">
                  {formatDateShortWithYear(editTarget.date)}
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">
                  Worked hours
                </label>
                <input
                  type="number"
                  min={0}
                  step={0.25}
                  value={editedHours}
                  onChange={(e) => setEditedHours(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40"
                  required
                  disabled={isSubmitted}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">
                  Description of work
                </label>
                <textarea
                  value={editedDescription}
                  onChange={(e) =>
                    setEditedDescription(e.target.value)
                  }
                  rows={3}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40 resize-y"
                  placeholder="Briefly describe what you did in this time."
                  disabled={isSubmitted}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border mt-2">
                <button
                  type="button"
                  onClick={closeEdit}
                  className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground hover:bg-card"
                >
                  Cancel
                </button>
                {!isSubmitted && (
                  <button
                    type="submit"
                    className="rounded-lg bg-emerald-500 px-4 py-1.5 text-xs font-semibold text-slate-950 shadow-sm shadow-emerald-500/40 hover:bg-emerald-400"
                  >
                    Save
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
