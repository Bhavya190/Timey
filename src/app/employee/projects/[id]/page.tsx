"use client";

import { use, useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { initialProjects } from "@/lib/projects";
import { initialTasks } from "@/lib/tasks";
import {
  FolderKanban,
  BadgeInfo,
  UserCheck,
  Clock3,
  ListChecks,
} from "lucide-react";

type PageProps = {
  params: Promise<{ id: string }>;
};

const formatHumanDate = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
};

export default function EmployeeProjectDetailsPage({ params }: PageProps) {
  // Unwrap params Promise with React.use
  const { id } = use(params);
  const projectId = Number(id);

  const [currentEmployeeId, setCurrentEmployeeId] = useState<number | null>(null);
  const [loadingEmployee, setLoadingEmployee] = useState(true);

  useEffect(() => {
    try {
      const stored =
        typeof window !== "undefined"
          ? window.localStorage.getItem("currentEmployeeId")
          : null;

      if (stored) {
        const parsed = Number(stored);
        if (!Number.isNaN(parsed)) {
          setCurrentEmployeeId(parsed);
        }
      }
    } finally {
      setLoadingEmployee(false);
    }
  }, []);

  if (Number.isNaN(projectId)) {
    notFound();
  }

  const project = initialProjects.find((p) => p.id === projectId);
  if (!project) {
    notFound();
  }

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

  const employeeTasksForProject = initialTasks.filter(
    (t) =>
      t.projectId === projectId &&
      t.assigneeIds.includes(currentEmployeeId)
  );

  if (employeeTasksForProject.length === 0) {
    notFound();
  }

  return (
    <div className="space-y-4">
      {/* Header with icon */}
      <div className="flex items-center gap-2">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
          <FolderKanban className="h-4 w-4" />
        </span>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {project.name}
          </h1>
          <p className="text-sm text-muted">
            Project details and tasks assigned to you.
          </p>
        </div>
      </div>

      {/* Project info */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4 flex items-start gap-3">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-sky-500/10 text-sky-500">
            <BadgeInfo className="h-4 w-4" />
          </span>
          <div>
            <p className="text-xs text-muted">Project code</p>
            <p className="mt-1 text-sm text-foreground">
              {project.code}
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 flex items-start gap-3">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
            <UserCheck className="h-4 w-4" />
          </span>
          <div>
            <p className="text-xs text-muted">Client</p>
            <p className="mt-1 text-sm text-foreground">
              {project.clientName}
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 flex items-start gap-3">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
            <Clock3 className="h-4 w-4" />
          </span>
          <div>
            <p className="text-xs text-muted">Status</p>
            <p className="mt-1">
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                  project.status === "Active"
                    ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/40"
                    : project.status === "On Hold"
                    ? "bg-amber-500/10 text-amber-500 border border-amber-500/40"
                    : "bg-muted/20 text-foreground border border-muted/40"
                }`}
              >
                {project.status}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Tasks table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-4 py-3 text-xs text-muted">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-purple-500/10 text-purple-500">
              <ListChecks className="h-4 w-4" />
            </span>
            <span className="font-medium text-foreground">
              {employeeTasksForProject.length}
            </span>
            <span>tasks assigned to you</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-xs sm:text-sm">
            <thead className="bg-background/80 text-muted border-b border-border">
              <tr>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Task</th>
                <th className="px-4 py-3 font-medium">Worked Hours</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card">
              {employeeTasksForProject.map((task) => (
                <tr key={task.id} className="hover:bg-background/60">
                  <td className="px-4 py-3 text-muted">
                    {formatHumanDate(task.date)}
                  </td>
                  <td className="px-4 py-3 text-foreground">
                    {task.name}
                  </td>
                  <td className="px-4 py-3 text-foreground">
                    {task.workedHours.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-muted">{task.status}</td>
                </tr>
              ))}

              {employeeTasksForProject.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-8 text-center text-sm text-muted"
                  >
                    No tasks assigned to you for this project.
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
