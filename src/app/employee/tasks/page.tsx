"use client";

import { useEffect, useMemo, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { demoUsers } from "@/lib/users";
import { initialTasks, type Task } from "@/lib/tasks";

const employeesById = Object.fromEntries(demoUsers.map((u) => [u.id, u]));

function formatHumanDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

export default function EmployeeTasksPage() {
  const router = useRouter();

  // Get current employee from localStorage
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

  // Tasks for this employee
  const employeeInitialTasks = useMemo(
    () =>
      currentEmployeeId == null
        ? []
        : initialTasks.filter((t) => t.assigneeIds.includes(currentEmployeeId)),
    [currentEmployeeId]
  );

  const [tasks, setTasks] = useState<Task[]>(employeeInitialTasks);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editedHours, setEditedHours] = useState<string>("0");
  const [editedDescription, setEditedDescription] = useState<string>("");

  // When employeeInitialTasks changes (e.g., when ID loads), sync local state
  useEffect(() => {
    setTasks(employeeInitialTasks);
  }, [employeeInitialTasks]);

  const toggleMenu = (id: number) => {
    setOpenMenuId((prev) => (prev === id ? null : id));
  };

  const handleViewProject = (task: Task) => {
    router.push(`/employee/projects/${task.projectId}`);
    setOpenMenuId(null);
  };

  const handleOpenEdit = (task: Task) => {
    setEditingTask(task);
    setEditedHours(String(task.workedHours));
    setEditedDescription(task.description ?? "");
    setIsEditOpen(true);
    setOpenMenuId(null);
  };

  const handleCloseEdit = () => {
    setIsEditOpen(false);
    setEditingTask(null);
    setEditedHours("0");
    setEditedDescription("");
  };

  const handleSaveEdit = (e: FormEvent) => {
    e.preventDefault();
    if (!editingTask) return;
    const hours = Number(editedHours) || 0;
    const desc = editedDescription.trim() || undefined;

    const updated: Task = {
      ...editingTask,
      workedHours: hours,
      description: desc,
    };

    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    handleCloseEdit();
  };

  const formatAssignees = (assigneeIds: number[]) => {
    if (currentEmployeeId == null || !assigneeIds.includes(currentEmployeeId))
      return "-";
    const emp = employeesById[currentEmployeeId];
    return emp ? emp.name : "-";
  };

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
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            My Tasks
          </h1>
          <p className="text-sm text-slate-400">
            Tasks assigned to you, from all projects.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-950/60 overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-slate-800 p-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="font-medium text-slate-200">
              {tasks.length}
            </span>
            <span>tasks</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Task</th>
                <th className="px-4 py-3 font-medium">Project</th>
                <th className="px-4 py-3 font-medium">Worked Hours</th>
                <th className="px-4 py-3 font-medium">Assigned To</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 bg-slate-950/40">
              {tasks.map((task) => (
                <tr key={task.id} className="hover:bg-slate-900/60">
                  <td className="px-4 py-3 text-slate-300">
                    {formatHumanDate(task.date)}
                  </td>
                  <td className="px-4 py-3 text-slate-100">
                    {task.name}
                  </td>
                  <td className="px-4 py-3 text-slate-300">
                    {task.projectName}
                  </td>
                  <td className="px-4 py-3 text-slate-300">
                    {task.workedHours.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-slate-300">
                    {formatAssignees(task.assigneeIds)}
                  </td>
                  <td className="px-4 py-3 text-slate-300">
                    {task.status}
                  </td>
                  <td
                    className="relative px-4 py-3 text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => toggleMenu(task.id)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-700 bg-slate-900/70 text-slate-300 hover:bg-slate-800"
                    >
                      ⋮
                    </button>

                    {openMenuId === task.id && (
                      <div className="absolute right-4 top-11 z-10 w-44 rounded-lg border border-slate-800 bg-slate-950/95 text-xs shadow-lg">
                        <button
                          onClick={() => handleViewProject(task)}
                          className="block w-full px-3 py-2 text-left hover:bg-slate-900"
                        >
                          View project
                        </button>
                        <button
                          onClick={() => handleOpenEdit(task)}
                          className="block w-full px-3 py-2 text-left hover:bg-slate-900"
                        >
                          Edit hours
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}

              {tasks.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-sm text-slate-500"
                  >
                    No tasks assigned to you.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isEditOpen && editingTask && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-950 text-slate-100 shadow-2xl border border-slate-800 overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-800 px-5 py-3">
              <h2 className="text-sm font-semibold">Edit worked hours</h2>
              <button
                onClick={handleCloseEdit}
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
                <p className="text-xs text-slate-400 mb-1">Task</p>
                <p className="text-slate-100">{editingTask.name}</p>
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
                  onClick={handleCloseEdit}
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
    </div>
  );
}
