"use client";

import { useMemo, useState, FormEvent } from "react";
import { Task, initialTasks } from "@/lib/tasks";
import { initialProjects } from "@/lib/projects";
import { demoUsers } from "@/lib/users";
import {
  CalendarRange,
  Clock4,
  FileSpreadsheet,
  FileDown,
  FileText,
  Timer,
  BadgeDollarSign,
  Filter,
  Users,
  Briefcase,
} from "lucide-react";

// If you want real XLSX/PDF, install and import these and replace stubs below:
// import * as XLSX from "xlsx";
// import jsPDF from "jspdf";
// import "jspdf-autotable";

const employeesById = Object.fromEntries(demoUsers.map((u) => [u.id, u]));
const projectsById = Object.fromEntries(initialProjects.map((p) => [p.id, p]));

// Build a pure local date string YYYY-MM-DD
function toLocalISODate(d: Date) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Given any anchor date, compute Monday..Sunday for that week
function getWeekRangeFromAnchor(anchor: Date): {
  days: string[];
  startISO: string;
  endISO: string;
} {
  const base = new Date(anchor.getFullYear(), anchor.getMonth(), anchor.getDate());
  const day = base.getDay(); // 0 Sun .. 6 Sat
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

type DateRangeFilter = "today" | "this_week" | "this_month" | "custom";

export default function AdminTimesheetPage() {
  // Anchor date controls which week is shown (start at today)
  const [currentAnchor, setCurrentAnchor] = useState<Date>(new Date());

  const { days, startISO, endISO } = useMemo(
    () => getWeekRangeFromAnchor(currentAnchor),
    [currentAnchor]
  );
  const todayISO = toLocalISODate(new Date());

  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  // Filters
  const [projectFilter, setProjectFilter] = useState<number | "all">("all");
  const [employeeFilter, setEmployeeFilter] = useState<number | "all">("all");
  const [dateFilter, setDateFilter] = useState<string>(""); // single exact date
  const [dateRangeFilter, setDateRangeFilter] =
    useState<DateRangeFilter>("this_week");
  const [customStart, setCustomStart] = useState<string>("");
  const [customEnd, setCustomEnd] = useState<string>("");
  const [exportFormat, setExportFormat] = useState<"csv" | "xlsx" | "pdf">("csv");

  // Compute active date range from dateRangeFilter
  const { rangeStart, rangeEnd } = useMemo(() => {
    const now = new Date();
    if (dateRangeFilter === "today") {
      const iso = toLocalISODate(now);
      return { rangeStart: iso, rangeEnd: iso };
    }
    if (dateRangeFilter === "this_month") {
      const y = now.getFullYear();
      const m = now.getMonth();
      const start = toLocalISODate(new Date(y, m, 1));
      const end = toLocalISODate(new Date(y, m + 1, 0));
      return { rangeStart: start, rangeEnd: end };
    }
    if (dateRangeFilter === "custom" && customStart && customEnd) {
      return { rangeStart: customStart, rangeEnd: customEnd };
    }
    // default: this_week uses weekly range from anchor
    return { rangeStart: startISO, rangeEnd: endISO };
  }, [dateRangeFilter, customStart, customEnd, startISO, endISO]);

  // Base tasks for current range (not only anchor week now)
  const rawRangeTasks: Task[] = useMemo(
    () => tasks.filter((t) => t.date >= rangeStart && t.date <= rangeEnd),
    [tasks, rangeStart, rangeEnd]
  );

  // Apply filters
  const rangeTasks: Task[] = useMemo(() => {
    return rawRangeTasks.filter((t) => {
      if (projectFilter !== "all" && t.projectId !== projectFilter) return false;
      if (
        employeeFilter !== "all" &&
        !t.assigneeIds.includes(employeeFilter)
      ) {
        return false;
      }
      if (dateFilter && t.date !== dateFilter) return false;
      return true;
    });
  }, [rawRangeTasks, projectFilter, employeeFilter, dateFilter]);

  // For grid, still show the week based on anchor, but data may come from wider range
  const weekTasks = useMemo(
    () => rangeTasks.filter((t) => t.date >= startISO && t.date <= endISO),
    [rangeTasks, startISO, endISO]
  );

  // Hours per task per day (for visible week grid)
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

  const billableHours = rangeTasks
    .filter((t) => t.billingType === "billable")
    .reduce((sum, t) => sum + t.workedHours, 0);

  const nonBillableHours = rangeTasks
    .filter((t) => t.billingType === "non-billable")
    .reduce((sum, t) => sum + t.workedHours, 0);

  const tasksById = Object.values(
    weekTasks.reduce<Record<number, Task>>((acc, t) => {
      acc[t.id] = t;
      return acc;
    }, {})
  );

  // Common data used for all exports (ONLY filtered data)
  const exportRows = useMemo(() => {
    return rangeTasks.map((t) => {
      const assignees = t.assigneeIds
        .map((id) => employeesById[id]?.name)
        .filter(Boolean)
        .join(", ");
      return {
        Date: t.date,
        Project: t.projectName,
        Task: t.name,
        Status: t.status,
        Assignees: assignees,
        WorkedHours: t.workedHours.toFixed(2),
        BillingType: t.billingType,
        Description: t.description ?? "",
      };
    });
  }, [rangeTasks]);

  const handleExportCSV = () => {
    if (exportRows.length === 0) {
      alert("No data to export for current filters.");
      return;
    }
    const header = Object.keys(exportRows[0]);
    const rows = exportRows.map((row) => header.map((key) => (row as any)[key]));
    const csv = [header, ...rows]
      .map((r) =>
        r.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `timesheet_${rangeStart}_${rangeEnd}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportXLSX = () => {
    if (exportRows.length === 0) {
      alert("No data to export for current filters.");
      return;
    }
    // Stub: plug SheetJS here.
    // Example:
    // const ws = XLSX.utils.json_to_sheet(exportRows);
    // const wb = XLSX.utils.book_new();
    // XLSX.utils.book_append_sheet(wb, ws, "Timesheet");
    // XLSX.writeFile(wb, `timesheet_${rangeStart}_${rangeEnd}.xlsx`);
    alert("XLSX export: connect SheetJS here using exportRows.");
  };

  const handleExportPDF = () => {
    if (exportRows.length === 0) {
      alert("No data to export for current filters.");
      return;
    }
    // Stub: plug jsPDF + autotable here.
    // Example:
    // const doc = new jsPDF();
    // const headers = [Object.keys(exportRows[0])];
    // const data = exportRows.map(r => Object.values(r));
    // (doc as any).autoTable({ head: headers, body: data });
    // doc.save(`timesheet_${rangeStart}_${rangeEnd}.pdf`);
    alert("PDF export: connect jsPDF + autotable here using exportRows.");
  };

  const handleExport = () => {
    if (exportFormat === "csv") handleExportCSV();
    else if (exportFormat === "xlsx") handleExportXLSX();
    else handleExportPDF();
  };

  const formatAssignees = (assigneeIds: number[]) => {
    if (assigneeIds.length === 0) return "-";
    const names = assigneeIds
      .map((id) => employeesById[id]?.name)
      .filter(Boolean) as string[];
    if (names.length === 0) return "-";
    if (names.length === 1) return names[0];
    if (names.length === 2) return names.join(", ");
    return `${names[0]}, ${names[1]} +${names.length - 2} more`;
  };

  type EditTarget = {
    taskId: number;
    date: string;
  } | null;

  const [editTarget, setEditTarget] = useState<EditTarget>(null);
  const [editedHours, setEditedHours] = useState<string>("0");
  const [editedDescription, setEditedDescription] =
    useState<string>("");

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

    const matching = tasks.filter(
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

  const projectOptions = initialProjects;
  const employeeOptions = demoUsers.filter((u) => u.role === "employee");

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

  return (
    <main className="space-y-4">
      {/* Header with simpler week navigation */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
            <CalendarRange className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Timesheet
            </h1>
            <p className="text-sm text-slate-400">
              Time entries with flexible filters and export options.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-1.5 text-xs text-slate-100">
            <button
              type="button"
              onClick={goPrevWeek}
              className="px-1.5 py-0.5 rounded-lg hover:bg-slate-800"
            >
              ◀
            </button>
            <span>
              {formatDateShortWithYear(startISO)} –{" "}
              {formatDateShortWithYear(endISO)}
            </span>
            <button
              type="button"
              onClick={goNextWeek}
              className="px-1.5 py-0.5 rounded-lg hover:bg-slate-800"
            >
              ▶
            </button>
          </div>
        </div>
      </div>

      {/* Filters section */}
      <section className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-xs space-y-3">
        <div className="flex items-center gap-2 text-slate-300">
          <Filter className="h-4 w-4 text-emerald-400" />
          <span className="font-semibold text-sm">Filters</span>
          <span className="text-[11px] text-slate-500">
            Narrow down by project, employee, and date range before exporting.
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-4">
          {/* Project filter */}
          <div className="space-y-1">
            <label className="flex items-center gap-1 text-[11px] font-medium text-slate-300">
              <Briefcase className="h-3.5 w-3.5 text-emerald-400" />
              Project
            </label>
            <select
              value={projectFilter === "all" ? "" : String(projectFilter)}
              onChange={(e) =>
                setProjectFilter(
                  e.target.value === " "
                    ? "all"
                    : e.target.value === ""
                    ? "all"
                    : Number(e.target.value)
                )
              }
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-100 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40"
            >
              <option value="">All projects</option>
              {projectOptions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Employee filter */}
          <div className="space-y-1">
            <label className="flex items-center gap-1 text-[11px] font-medium text-slate-300">
              <Users className="h-3.5 w-3.5 text-emerald-400" />
              Employee
            </label>
            <select
              value={employeeFilter === "all" ? "" : String(employeeFilter)}
              onChange={(e) =>
                setEmployeeFilter(
                  e.target.value === ""
                    ? "all"
                    : Number(e.target.value)
                )
              }
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-100 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40"
            >
              <option value="">All employees</option>
              {employeeOptions.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date range filter */}
          <div className="space-y-1">
            <label className="flex items-center gap-1 text-[11px] font-medium text-slate-300">
              <CalendarRange className="h-3.5 w-3.5 text-emerald-400" />
              Date range
            </label>
            <select
              value={dateRangeFilter}
              onChange={(e) =>
                setDateRangeFilter(e.target.value as DateRangeFilter)
              }
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-100 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40"
            >
              <option value="today">Today</option>
              <option value="this_week">This week</option>
              <option value="this_month">This month</option>
              <option value="custom">Custom range</option>
            </select>
          </div>

          {/* Single exact date (optional) */}
          <div className="space-y-1">
            <label className="flex items-center gap-1 text-[11px] font-medium text-slate-300">
              <CalendarRange className="h-3.5 w-3.5 text-emerald-400" />
              Exact date (optional)
            </label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-100 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40"
            />
          </div>
        </div>

        {dateRangeFilter === "custom" && (
          <div className="grid gap-3 sm:grid-cols-2 pt-2">
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-slate-300">
                From
              </label>
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-100 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-slate-300">
                To
              </label>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-100 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40"
              />
            </div>
          </div>
        )}

        {(projectFilter !== "all" ||
          employeeFilter !== "all" ||
          dateFilter ||
          dateRangeFilter !== "this_week" ||
          customStart ||
          customEnd) && (
          <button
            type="button"
            onClick={() => {
              setProjectFilter("all");
              setEmployeeFilter("all");
              setDateFilter("");
              setDateRangeFilter("this_week");
              setCustomStart("");
              setCustomEnd("");
            }}
            className="mt-1 text-[11px] text-emerald-400 hover:underline"
          >
            Clear filters
          </button>
        )}
      </section>

      {/* Stats for current filtered range */}
      <section className="grid gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-xs flex items-center gap-3">
          <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-emerald-400">
            <Clock4 className="h-4 w-4" />
          </div>
          <div>
            <p className="text-slate-400 mb-1">Worked Today</p>
            <p className="text-xl font-semibold text-slate-100">
              {totalWorkedToday.toFixed(2)} h
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-xs flex items-center gap-3">
          <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-emerald-400">
            <Timer className="h-4 w-4" />
          </div>
          <div>
            <p className="text-slate-400 mb-1">Total Range Hours</p>
            <p className="text-xl font-semibold text-slate-100">
              {totalWorkedRange.toFixed(2)} h
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-xs flex items-center gap-3">
          <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-emerald-400">
            <BadgeDollarSign className="h-4 w-4" />
          </div>
          <div>
            <p className="text-slate-400 mb-1">Billable Hours</p>
            <p className="text-xl font-semibold text-slate-100">
              {billableHours.toFixed(2)} h
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-xs flex items-center gap-3">
          <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-slate-300">
            <BadgeDollarSign className="h-4 w-4 opacity-60" />
          </div>
          <div>
            <p className="text-slate-400 mb-1">Non‑Billable Hours</p>
            <p className="text-xl font-semibold text-slate-100">
              {nonBillableHours.toFixed(2)} h
            </p>
          </div>
        </div>
      </section>

      {/* Export */}
      <section className="flex flex-wrap gap-2 items-center">
        <div className="flex items-center gap-2 text-xs text-slate-300">
          <span>Export as</span>
          <select
            value={exportFormat}
            onChange={(e) =>
              setExportFormat(e.target.value as "csv" | "xlsx" | "pdf")
            }
            className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-100 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40"
          >
            <option value="csv">CSV</option>
            <option value="xlsx">XLSX</option>
            <option value="pdf">PDF</option>
          </select>
        </div>

        <button
          onClick={handleExport}
          className="inline-flex items-center gap-1 rounded-lg border border-emerald-600 bg-emerald-500/90 px-3 py-1.5 text-xs font-semibold text-slate-950 shadow-sm shadow-emerald-500/40 hover:bg-emerald-400"
        >
          {exportFormat === "csv" || exportFormat === "xlsx" ? (
            <FileSpreadsheet className="h-3.5 w-3.5" />
          ) : (
            <FileDown className="h-3.5 w-3.5" />
          )}
          <span>Export filtered data</span>
        </button>

        <span className="text-[11px] text-slate-500">
          {exportRows.length} rows will be exported based on current filters and
          date range.
        </span>
      </section>

      {/* Weekly grid (still showing anchor week) */}
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
                    <p className="text-[11px] text-slate-500 inline-flex items-center gap-1 flex-wrap">
                      <span>{task.projectName}</span>
                      <span className="h-1 w-1 rounded-full bg-slate-600" />
                      <span>{task.status}</span>
                      <span className="h-1 w-1 rounded-full bg-slate-600" />
                      <span>{formatAssignees(task.assigneeIds)}</span>
                      <span className="h-1 w-1 rounded-full bg-slate-600" />
                      <span>
                        {task.billingType === "billable"
                          ? "Billable"
                          : "Non‑billable"}
                      </span>
                    </p>
                  </td>
                  {days.map((iso) => {
                    const hours = hoursByTaskDay[task.id]?.[iso] ?? 0;
                    const canEdit = true;
                    return (
                      <td
                        key={iso}
                        className={`px-3 py-3 text-center text-slate-300 ${
                          canEdit
                            ? "cursor-pointer hover:bg-slate-900/70"
                            : ""
                        }`}
                        onClick={() => canEdit && openEditFor(task, iso)}
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
                    No tasks found for this week with current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Edit hours + description modal */}
      {editTarget && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-950 text-slate-100 shadow-2xl border border-slate-800 overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-800 px-5 py-3">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <Clock4 className="h-4 w-4 text-emerald-400" />
                Edit hours
              </h2>
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
                <label className="text-xs font-medium text-slate-300 flex items-center gap-1">
                  <FileText className="h-3.5 w-3.5 text-emerald-400" />
                  Description of work
                </label>
                <textarea
                  value={editedDescription}
                  onChange={(e) =>
                    setEditedDescription(e.target.value)
                  }
                  rows={3}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40 resize-y"
                  placeholder="Briefly describe what was done in this time."
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
                  className="inline-flex items-center gap-1 rounded-lg bg-emerald-500 px-4 py-1.5 text-xs font-semibold text-slate-950 shadow-sm shadow-emerald-500/40 hover:bg-emerald-400"
                >
                  <Clock4 className="h-3.5 w-3.5" />
                  <span>Save</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
