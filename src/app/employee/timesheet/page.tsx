"use client";

import { useMemo, useState, useEffect, FormEvent } from "react";
import { Task, initialTasks } from "@/lib/tasks";
import { initialProjects } from "@/lib/projects";
import { demoUsers } from "@/lib/users";
import {
  CalendarRange,
  Clock4,
  FileText,
  Timer,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Plus,
  Edit3,
  Trash2,
  Save,
  ClipboardClock,
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

function getWeekRangeFromAnchor(anchor: Date): {
  days: string[];
  startISO: string;
  endISO: string;
} {
  const base = new Date(anchor.getFullYear(), anchor.getMonth(), anchor.getDate());
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

type EditTarget = {
  taskId: number;
  date: string;
} | null;

type RowDraft = {
  projectId: number | null;
  taskId: number | null;
  rowId: number | null;
};

type PlaceholderState = Record<string, number[]>;

export default function EmployeeTimesheetPage() {
  const [currentEmployeeId, setCurrentEmployeeId] = useState<number | null>(null);
  const [loadingEmployee, setLoadingEmployee] = useState(true);

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

  const [currentAnchor, setCurrentAnchor] = useState<Date>(new Date());

  const { days, startISO, endISO } = useMemo(
    () => getWeekRangeFromAnchor(currentAnchor),
    [currentAnchor]
  );
  const weekKey = startISO;
  const todayISO = toLocalISODate(new Date());

  const [submittedWeeks, setSubmittedWeeks] = useState<Record<string, boolean>>(
    {}
  );
  const isSubmitted = submittedWeeks[weekKey] === true;

  const [tasks, setTasks] = useState<Task[]>(() => {
    if (currentEmployeeId == null) return [];
    return initialTasks.filter((t) => t.assigneeIds.includes(currentEmployeeId));
  });

  useEffect(() => {
    if (currentEmployeeId == null) return;
    setTasks(
      initialTasks.filter((t) => t.assigneeIds.includes(currentEmployeeId))
    );
  }, [currentEmployeeId]);

  const rangeStart = startISO;
  const rangeEnd = endISO;

  const rangeTasks: Task[] = useMemo(
    () => tasks.filter((t) => t.date >= rangeStart && t.date <= rangeEnd),
    [tasks, rangeStart, rangeEnd]
  );

  const weekTasks = useMemo(
    () => rangeTasks.filter((t) => t.date >= startISO && t.date <= endISO),
    [rangeTasks, startISO, endISO]
  );

  const displayTasks = useMemo(() => {
    if (weekTasks.length > 0) {
      return weekTasks.reduce<Record<number, Task>>((acc, t) => {
        acc[t.id] = t;
        return acc;
      }, {});
    }
    return {};
  }, [weekTasks]);

  const hoursByTaskDay: Record<number, Record<string, number>> = {};
  for (const t of weekTasks) {
    if (!hoursByTaskDay[t.id]) hoursByTaskDay[t.id] = {};
    hoursByTaskDay[t.id][t.date] =
      (hoursByTaskDay[t.id][t.date] ?? 0) + t.workedHours;
  }

  const totalWorkedToday = rangeTasks
    .filter((t) => t.date === todayISO)
    .reduce((sum, t) => sum + t.workedHours, 0);

  const totalWorkedRange = rangeTasks.reduce(
    (sum, t) => sum + t.workedHours,
    0
  );

  const tasksById = Object.values(displayTasks);

  const [editTarget, setEditTarget] = useState<EditTarget>(null);
  const [editedHours, setEditedHours] = useState<string>("0");
  const [editedDescription, setEditedDescription] = useState<string>("");

  const openEditFor = (task: Task, date: string) => {
    if (isSubmitted) return;
    const cellHours = hoursByTaskDay[task.id]?.[date] ?? 0;
    setEditTarget({ taskId: task.id, date });
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
    if (!editTarget || isSubmitted) return;
    const { taskId, date } = editTarget;
    const newHours = Number(editedHours) || 0;
    const desc = editedDescription.trim() || undefined;

    const matching = tasks.filter(
      (t) => t.id === taskId && t.date === date
    );
    if (matching.length === 0) {
      const anyTask = tasks.find((t) => t.id === taskId);
      if (!anyTask) {
        closeEdit();
        return;
      }
      const created: Task = {
        ...anyTask,
        date,
        workedHours: newHours,
        description: desc,
      };
      setTasks((prev) => [...prev, created]);
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

    const updatedTasks = tasks.map((t) => {
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

    setTasks(updatedTasks);
    closeEdit();
  };

  const [placeholderRowsByWeek, setPlaceholderRowsByWeek] =
    useState<PlaceholderState>({});

  const currentPlaceholderRowIds = placeholderRowsByWeek[weekKey] ?? [1, 2, 3];

  const [rowDraft, setRowDraft] = useState<RowDraft>({
    projectId: null,
    taskId: null,
    rowId: null,
  });
  const [showRowEditor, setShowRowEditor] = useState(false);

  const setWeekPlaceholders = (
    week: string,
    updater: (prev: number[]) => number[]
  ) => {
    setPlaceholderRowsByWeek((prev) => {
      const prevRows = prev[week] ?? [1, 2, 3];
      return {
        ...prev,
        [week]: updater(prevRows),
      };
    });
  };

  const removePlaceholderRow = (id: number) => {
    setWeekPlaceholders(weekKey, (prev) => prev.filter((r) => r !== id));
  };

  const openRowEditor = (rowId: number | null) => {
    if (isSubmitted) return;
    if (rowId === null) {
      const newId = Date.now();
      setWeekPlaceholders(weekKey, (prev) => [...prev, newId]);
      setRowDraft({ projectId: null, taskId: null, rowId: newId });
    } else {
      setRowDraft({ projectId: null, taskId: null, rowId });
    }
    setShowRowEditor(true);
  };

  const groupKey = (t: Task) => `${t.projectId}::${t.name}`;

  const existingGroupKeysThisWeek = useMemo(() => {
    const keys = new Set<string>();
    weekTasks.forEach((t) => {
      keys.add(groupKey(t));
    });
    return keys;
  }, [weekTasks]);

  const handleSaveRowDraft = () => {
    if (!rowDraft.projectId || !rowDraft.taskId || currentEmployeeId == null)
      return;

    const project = projectsById[rowDraft.projectId];
    const sourceTask = initialTasks.find((t) => t.id === rowDraft.taskId);

    const key = `${project.id}::${sourceTask?.name ?? "New task"}`;
    if (existingGroupKeysThisWeek.has(key)) {
      setShowRowEditor(false);
      return;
    }

    const baseId = Date.now();

    const newTasks: Task[] = days.map((iso) => ({
      id: baseId,
      name: sourceTask?.name ?? "New task",
      projectId: project.id,
      projectName: project.name,
      assigneeIds: [currentEmployeeId],
      status: "Completed",
      billingType: "billable",
      date: iso,
      workedHours: 0,
      description: "",
    }));

    setTasks((prev) => [...prev, ...newTasks]);
    setShowRowEditor(false);

    if (rowDraft.rowId !== null) {
      setWeekPlaceholders(weekKey, (prev) =>
        prev.filter((id) => id !== rowDraft.rowId)
      );
    }
  };

  const hasAnyTasksThisWeek = tasksById.length > 0;
  const hasAnyTasksInRange = rangeTasks.length > 0;
  const hasPlaceholdersThisWeek = currentPlaceholderRowIds.length > 0;

  const goPrevWeek = () => {
    const d = new Date(currentAnchor);
    d.setDate(d.getDate() - 7);
    setCurrentAnchor(d);
  };

  const goNextWeek = () => {
    const d = new Date(currentAnchor);
    d.setDate(d.getDate() + 7);
    setCurrentAnchor(d);
  };

  const handleSubmitWeek = () => {
    if (isSubmitted) return;
    setSubmittedWeeks((prev) => ({
      ...prev,
      [weekKey]: true,
    }));
  };

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

  return (
    <main className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary-500/10 text-primary-500">
            <ClipboardClock className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              My Timesheet
            </h1>
            <p className="text-sm text-muted">
              Weekly hours for {employee?.name ?? "this employee"}.
            </p>
          </div>
        </div>

        {/* Week nav */}
        <div className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-foreground">
          <button
            type="button"
            onClick={goPrevWeek}
            className="p-1.5 rounded-lg hover:bg-background/80 transition-colors"
            title="Previous week"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-2">
            <span>
              {formatDateShortWithYear(startISO)} –{" "}
              {formatDateShortWithYear(endISO)}
            </span>
            <div className="relative">
              <input
                type="date"
                value={startISO}
                onChange={(e) => {
                  if (!e.target.value) return;
                  const selectedDate = new Date(e.target.value);
                  setCurrentAnchor(selectedDate);
                }}
                className="absolute inset-0 opacity-0 cursor-pointer"
                aria-label="Select week date"
              />
              <div className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border bg-background text-muted hover:bg-card cursor-pointer pointer-events-none">
                <Calendar className="h-3.5 w-3.5" />
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={goNextWeek}
            className="p-1.5 rounded-lg hover:bg-background/80 transition-colors"
            title="Next week"
          >
            <ChevronRight className="h-4 w-4" />
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
              {totalWorkedRange.toFixed(2)} 
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

      {/* Weekly grid with header toolbar (Add row + Submit week) */}
      <section className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="border-b border-border px-4 py-2 bg-background/60 flex justify-between items-center">
          <span className="text-xs text-muted">
            Manage your timesheet rows for this week.
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => openRowEditor(null)}
              disabled={isSubmitted}
              className={`inline-flex items-center gap-1 rounded-lg border border-dashed border-border px-3 py-1.5 text-xs ${
                isSubmitted
                  ? "text-muted opacity-60 cursor-not-allowed"
                  : "text-muted hover:bg-card"
              }`}
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Task</span>
            </button>

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
              {isSubmitted ? "Week Submitted" : "Submit week"}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-xs sm:text-sm">
            <thead className="bg-background/80 text-muted border-b border-border">
              <tr>
                <th className="px-4 py-3 font-medium w-64">Project – Task</th>
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
                <th className="px-4 py-3 font-medium text-right w-20">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card">
              {tasksById.map((task) => (
                <tr key={task.id}>
                  <td className="px-4 py-3">
                    <p className="text-foreground font-medium">{task.name}</p>
                    <p className="text-[11px] text-muted inline-flex items-center gap-1 flex-wrap">
                      <span>
                        {projectsById[task.projectId]?.name ??
                          task.projectName}
                      </span>
                      <span className="h-1 w-1 rounded-full bg-border" />
                      <span>{task.status}</span>
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
                        onClick={() => !isSubmitted && openEditFor(task, iso)}
                      >
                        {hours.toFixed(2)}
                      </td>
                    );
                  })}
                  <td className="px-4 py-3 text-right text-foreground font-medium">
                    {Object.values(hoursByTaskDay[task.id] || {})
                      .reduce((sum, h) => sum + h, 0)
                      .toFixed(2)}
                  </td>
                </tr>
              ))}

              {!hasAnyTasksThisWeek &&
                hasPlaceholdersThisWeek &&
                currentPlaceholderRowIds.map((rowId) => (
                  <tr key={rowId} className="border-t border-border">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openRowEditor(rowId)}
                          disabled={isSubmitted}
                          className={`inline-flex h-7 w-7 items-center justify-center rounded-full border text-muted ${
                            isSubmitted
                              ? "opacity-60 cursor-not-allowed border-border"
                              : "border-border hover:bg-background"
                          }`}
                          title="Edit row"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            !isSubmitted && removePlaceholderRow(rowId)
                          }
                          disabled={isSubmitted}
                          className={`inline-flex h-7 w-7 items-center justify-center rounded-full border text-muted ${
                            isSubmitted
                              ? "opacity-60 cursor-not-allowed border-border"
                              : "border-border hover:bg-background"
                          }`}
                          title="Delete row"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                        <span className="text-xs text-muted">
                          &lt; No project selected &gt;
                        </span>
                      </div>
                    </td>
                    {days.map((iso) => (
                      <td key={iso} className="px-3 py-3">
                        <div className="h-8 w-full rounded-lg border border-border bg-background" />
                      </td>
                    ))}
                    <td className="px-4 py-3" />
                  </tr>
                ))}

              {!hasAnyTasksInRange && !hasPlaceholdersThisWeek && (
                <tr>
                  <td
                    className="px-4 py-6 text-center text-xs text-muted"
                    colSpan={days.length + 2}
                  >
                    no tasks found
                  </td>
                </tr>
              )}
            </tbody>

            {tasksById.length > 0 && (
              <tfoot className="bg-background/80 border-t border-border text-xs text-muted">
                <tr>
                  <td className="px-4 py-3 font-medium">TOTAL HOURS</td>
                  {days.map((iso) => {
                    const dayTotal = tasksById.reduce((sum, task) => {
                      const h = hoursByTaskDay[task.id]?.[iso] ?? 0;
                      return sum + h;
                    }, 0);
                    return (
                      <td key={iso} className="px-3 py-3 text-center">
                        {dayTotal.toFixed(2)}
                      </td>
                    );
                  })}
                  <td className="px-4 py-3 text-right font-semibold text-foreground">
                    {Object.values(hoursByTaskDay)
                      .reduce((sumTask, dayMap) => {
                        const taskTotal = Object.values(dayMap).reduce(
                          (s, h) => s + h,
                          0
                        );
                        return sumTask + taskTotal;
                      }, 0)
                      .toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </section>

      {/* Edit hours modal */}
      {editTarget && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-background/80 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-2xl bg-card text-foreground shadow-2xl border border-border overflow-hidden">
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <Clock4 className="h-4 w-4 text-primary-500" />
                Edit hours
              </h2>
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
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/40"
                  required
                  disabled={isSubmitted}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground flex items-center gap-1">
                  <FileText className="h-3.5 w-3.5 text-primary-500" />
                  Description of work
                </label>
                <textarea
                  value={editedDescription}
                  onChange={(e) =>
                    setEditedDescription(e.target.value)
                  }
                  rows={3}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/40 resize-y"
                  placeholder="Briefly describe what was done in this time."
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
                    className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-4 py-1.5 text-xs text-foreground hover:bg-card"
                  >
                    <Clock4 className="h-3.5 w-3.5" />
                    <span>Save</span>
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Timesheet (row editor) */}
      {showRowEditor && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-background/80 backdrop-blur-sm px-4">
          <div className="w-full max-w-lg rounded-2xl bg-card text-foreground shadow-2xl border border-border overflow-hidden">
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
              <h2 className="text-sm font-semibold">Select Projects And Tasks</h2>
              <button
                type="button"
                onClick={() => setShowRowEditor(false)}
                className="h-7 w-7 rounded-full border border-border text-muted hover:bg-background"
              >
                ×
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveRowDraft();
              }}
            >
              <div className="px-5 py-4 space-y-4 text-sm">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">
                    Project Name
                  </label>
                  <select
                    value={rowDraft.projectId ?? ""}
                    onChange={(e) =>
                      setRowDraft((prev) => ({
                        ...prev,
                        projectId: e.target.value
                          ? Number(e.target.value)
                          : null,
                        taskId: null,
                      }))
                    }
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/40"
                    required
                  >
                    <option value="">Select Project</option>
                    {initialProjects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">
                    Task Name
                  </label>
                  <select
                    value={rowDraft.taskId ?? ""}
                    onChange={(e) =>
                      setRowDraft((prev) => ({
                        ...prev,
                        taskId: e.target.value
                          ? Number(e.target.value)
                          : null,
                      }))
                    }
                    disabled={rowDraft.projectId === null}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none disabled:opacity-60 focus:border-primary-500 focus:ring-1 focus:ring-primary-500/40"
                    required
                  >
                    <option value="">Select Task</option>
                    {rowDraft.projectId !== null &&
                      initialTasks
                        .filter(
                          (t) => t.projectId === rowDraft.projectId
                        )
                        .map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name}
                          </option>
                        ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-border bg-background/60 px-5 py-3">
                <button
                  type="submit"
                  disabled={isSubmitted}
                  className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-4 py-1.5 text-xs text-foreground hover:bg-card disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>Save</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowRowEditor(false)}
                  className="rounded-lg border border-border bg-background px-4 py-1.5 text-xs text-foreground hover:bg-card"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
