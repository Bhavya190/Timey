"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { demoUsers } from "@/lib/users";
import { initialProjects } from "@/lib/projects";
import { initialTasks } from "@/lib/tasks";
import {
  FolderKanban,
  FolderOpen,
  ArrowRight,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// Week helpers
function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sunday
  const diff = (day + 6) % 7; // Monday as first day
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfWeek(date: Date): Date {
  const start = startOfWeek(date);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}

// Pretty label: Jan 05, 2026 – Jan 11, 2026
function formatPretty(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

function formatPrettyRange(start: Date, end: Date): string {
  return `${formatPretty(start)} \u2013 ${formatPretty(end)}`;
}

export default function EmployeeProjectsPage() {
  const [currentEmployeeId, setCurrentEmployeeId] = useState<number | null>(null);
  const [loadingEmployee, setLoadingEmployee] = useState(true);

  // week range state
  const [weekStart, setWeekStart] = useState<Date>(() => startOfWeek(new Date()));
  const [weekEnd, setWeekEnd] = useState<Date>(() => endOfWeek(new Date()));

  // native date input for picking any date (week will snap around it)
  const [pickerDate, setPickerDate] = useState<string>(() => {
    const d = new Date();
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  });

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

  const employee = currentEmployeeId
    ? demoUsers.find((u) => u.id === currentEmployeeId)
    : undefined;
  const employeeName = employee?.name ?? "Employee";

  // filter tasks by employee and week range
  const employeeTasks = useMemo(() => {
    if (currentEmployeeId == null) return [];

    return initialTasks.filter((t) => {
      if (!t.assigneeIds.includes(currentEmployeeId)) return false;

      // use the existing date field on Task; adjust if your field is named differently
      const taskDateValue = (t as any).date as string | undefined;
      if (!taskDateValue) return false;

      const d = new Date(taskDateValue);
      return d >= weekStart && d <= weekEnd;
    });
  }, [currentEmployeeId, weekStart, weekEnd]);

  const projectIds = useMemo(
    () => new Set(employeeTasks.map((t) => t.projectId)),
    [employeeTasks]
  );

  const employeeProjects = useMemo(
    () => initialProjects.filter((p) => projectIds.has(p.id)),
    [projectIds]
  );

  const setPickerFromRange = (date: Date) => {
    const pad = (n: number) => n.toString().padStart(2, "0");
    const v = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
      date.getDate()
    )}`;
    setPickerDate(v);
  };

  const goToPreviousWeek = () => {
    const prevStart = new Date(weekStart);
    prevStart.setDate(prevStart.getDate() - 7);
    setWeekStart(prevStart);
    setWeekEnd(endOfWeek(prevStart));
    setPickerFromRange(prevStart);
  };

  const goToNextWeek = () => {
    const nextStart = new Date(weekStart);
    nextStart.setDate(nextStart.getDate() + 7);
    setWeekStart(nextStart);
    setWeekEnd(endOfWeek(nextStart));
    setPickerFromRange(nextStart);
  };

  const onChangePickerDate: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const value = e.target.value;
    setPickerDate(value);
    const d = new Date(value);
    const s = startOfWeek(d);
    setWeekStart(s);
    setWeekEnd(endOfWeek(s));
  };

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
    <div className="space-y-4">
      {/* Top bar with title + date range */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Header with icon */}
        <div className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
            <FolderKanban className="h-4 w-4" />
          </span>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">My Projects</h1>
            <p className="text-sm text-muted">
              Projects where {employeeName} has at least one assigned task.
            </p>
          </div>
        </div>

        {/* Week range pill (right side) */}
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-foreground">
            {/* left arrow */}
            <button
              type="button"
              onClick={goToPreviousWeek}
              className="p-1.5 rounded-lg hover:bg-background/80 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {/* range text */}
            <span className="mx-3 whitespace-nowrap text-muted">
              {formatPrettyRange(weekStart, weekEnd)}
            </span>

            {/* calendar icon button with hidden date input */}
            <label className="relative flex h-7 w-7 items-center justify-center rounded-md border border-border/80 bg-background/40 hover:bg-background cursor-pointer">
              <CalendarIcon className="h-4 w-4 text-muted" />
              <input
                type="date"
                value={pickerDate}
                onChange={onChangePickerDate}
                className="absolute inset-0 h-full w-full rounded-md opacity-0 cursor-pointer"
              />
            </label>

            {/* right arrow */}
            <button
              type="button"
              onClick={goToNextWeek}
              className="p-1.5 rounded-lg hover:bg-background/80 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        {/* Top bar with count + icon */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3 text-xs text-muted">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-sky-500/10 text-sky-500">
              <FolderOpen className="h-4 w-4" />
            </span>
            <span className="font-medium text-foreground">
              {employeeProjects.length}
            </span>
            <span>projects</span>
          </div>
          <span className="hidden sm:inline text-[11px]">
            Showing tasks in week {formatPrettyRange(weekStart, weekEnd)}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-xs sm:text-sm">
            <thead className="bg-background/80 text-muted border-b border-border">
              <tr>
                <th className="px-4 py-3 font-medium">Project</th>
                <th className="px-4 py-3 font-medium">Code</th>
                <th className="px-4 py-3 font-medium">Client</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card">
              {employeeProjects.map((project) => (
                <tr key={project.id} className="hover:bg-background/60">
                  <td className="px-4 py-3 text-foreground">
                    {project.name}
                  </td>
                  <td className="px-4 py-3 text-muted">{project.code}</td>
                  <td className="px-4 py-3 text-muted">
                    {project.clientName}
                  </td>
                  <td className="px-4 py-3 text-muted">{project.status}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/employee/projects/${project.id}`}
                      className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-3 py-1.5 text-[11px] text-foreground hover:bg-card"
                    >
                      <span>View details</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </td>
                </tr>
              ))}

              {employeeProjects.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-sm text-muted"
                  >
                    No projects found for your assigned tasks in this week.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
