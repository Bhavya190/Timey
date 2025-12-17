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
} from "lucide-react"; // project + info + tasks icons [web:33]

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

  // Load employee id from localStorage
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
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
          <FolderKanban className="h-4 w-4" />
        </span>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {project.name}
          </h1>
          <p className="text-sm text-slate-400">
            Project details and tasks assigned to you.
          </p>
        </div>
      </div>

      {/* Project info */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 flex items-start gap-3">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-sky-500/10 text-sky-400">
            <BadgeInfo className="h-4 w-4" />
          </span>
          <div>
            <p className="text-xs text-slate-400">Project code</p>
            <p className="mt-1 text-sm text-slate-100">
              {project.code}
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 flex items-start gap-3">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
            <UserCheck className="h-4 w-4" />
          </span>
          <div>
            <p className="text-xs text-slate-400">Client</p>
            <p className="mt-1 text-sm text-slate-100">
              {project.clientName}
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 flex items-start gap-3">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-amber-500/10 text-amber-400">
            <Clock3 className="h-4 w-4" />
          </span>
          <div>
            <p className="text-xs text-slate-400">Status</p>
            <p className="mt-1">
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                  project.status === "Active"
                    ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/40"
                    : project.status === "On Hold"
                    ? "bg-amber-500/10 text-amber-300 border border-amber-500/40"
                    : "bg-slate-700/40 text-slate-200 border border-slate-600/60"
                }`}
              >
                {project.status}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Tasks table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950/60 overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-purple-500/10 text-purple-400">
              <ListChecks className="h-4 w-4" />
            </span>
            <span className="font-medium text-slate-200">
              {employeeTasksForProject.length}
            </span>
            <span>tasks assigned to you</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Task</th>
                <th className="px-4 py-3 font-medium">Worked Hours</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 bg-slate-950/40">
              {employeeTasksForProject.map((task) => (
                <tr key={task.id} className="hover:bg-slate-900/60">
                  <td className="px-4 py-3 text-slate-300">
                    {formatHumanDate(task.date)}
                  </td>
                  <td className="px-4 py-3 text-slate-100">
                    {task.name}
                  </td>
                  <td className="px-4 py-3 text-slate-300">
                    {task.workedHours.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-slate-300">
                    {task.status}
                  </td>
                </tr>
              ))}

              {employeeTasksForProject.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-8 text-center text-sm text-slate-500"
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
