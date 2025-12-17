"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { demoUsers } from "@/lib/users";
import { initialProjects } from "@/lib/projects";
import { initialTasks } from "@/lib/tasks";

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

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          My Projects
        </h1>
        <p className="text-sm text-slate-400">
          Projects where {employeeName} has at least one assigned task.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-950/60 overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-200">
              {employeeProjects.length}
            </span>
            <span>projects</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-4 py-3 font-medium">Project</th>
                <th className="px-4 py-3 font-medium">Code</th>
                <th className="px-4 py-3 font-medium">Client</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 bg-slate-950/40">
              {employeeProjects.map((project) => (
                <tr key={project.id} className="hover:bg-slate-900/60">
                  <td className="px-4 py-3 text-slate-100">
                    {project.name}
                  </td>
                  <td className="px-4 py-3 text-slate-300">
                    {project.code}
                  </td>
                  <td className="px-4 py-3 text-slate-300">
                    {project.clientName}
                  </td>
                  <td className="px-4 py-3 text-slate-300">
                    {project.status}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/employee/projects/${project.id}`}
                      className="inline-flex items-center rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-1.5 text-[11px] text-slate-100 hover:bg-slate-800"
                    >
                      View details
                    </Link>
                  </td>
                </tr>
              ))}

              {employeeProjects.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-sm text-slate-500"
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
