"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { demoUsers } from "@/lib/users";
import { initialProjects } from "@/lib/projects";
import { initialTasks } from "@/lib/tasks";
import { FolderKanban, FolderOpen, ArrowRight } from "lucide-react";

export default function EmployeeProjectsPage() {
  const [currentEmployeeId, setCurrentEmployeeId] = useState<number | null>(null);
  const [loadingEmployee, setLoadingEmployee] = useState(true);

  // Load employee id from localStorage
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
                  <td className="px-4 py-3 text-muted">{project.clientName}</td>
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
                    No projects found for your assigned tasks.
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
