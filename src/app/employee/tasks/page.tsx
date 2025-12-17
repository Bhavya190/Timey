"use client";

import { useEffect, useMemo, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { demoUsers } from "@/lib/users";
import { initialTasks, type Task } from "@/lib/tasks";
import {
  MoreVertical,
  Eye,
  Pencil,
  X,
  Clock,
  User,
  CheckCircle2,
  CircleDot,
} from "lucide-react";

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

  const renderStatus = (status: Task["status"]) => {
    if (status === "Completed") {
      return (
        <span className="inline-flex items-center gap-1 text-emerald-500">
          <CheckCircle2 className="h-4 w-4" />
          {status}
        </span>
      );
    }
    if (status === "In Progress") {
      return (
        <span className="inline-flex items-center gap-1 text-sky-500">
          <CircleDot className="h-4 w-4" />
          {status}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-muted">
        <CircleDot className="h-4 w-4" />
        {status}
      </span>
    );
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
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <Clock className="h-5 w-5 text-emerald-500" />
            My Tasks
          </h1>
          <p className="text-sm text-muted flex items-center gap-1">
            <User className="h-4 w-4 text-muted" />
            Tasks assigned to you, from all projects.
          </p>
        </div>
      </div>

      {/* Table wrapper */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-border p-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-xs text-muted">
            <span className="font-medium text-foreground">{tasks.length}</span>
            <span>tasks</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-xs sm:text-sm">
            <thead className="bg-background/80 text-muted border-b border-border">
              <tr>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Task</th>
                <th className="px-4 py-3 font-medium">Project</th>
                <th className="px-4 py-3 font-medium">Worked Hours</th>
                <th className="px-4 py-3 font-medium">Assigned To</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card">
              {tasks.map((task) => (
                <tr key={task.id} className="hover:bg-background/60">
                  <td className="px-4 py-3 text-foreground">
                    {formatHumanDate(task.date)}
                  </td>
                  <td className="px-4 py-3 text-foreground">{task.name}</td>
                  <td className="px-4 py-3 text-muted">{task.projectName}</td>
                  <td className="px-4 py-3 text-foreground">
                    {task.workedHours.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {formatAssignees(task.assigneeIds)}
                  </td>
                  <td className="px-4 py-3">{renderStatus(task.status)}</td>
                  <td
                    className="relative px-4 py-3 text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => toggleMenu(task.id)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background text-foreground hover:bg-card"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>

                    {openMenuId === task.id && (
                      <div className="absolute right-4 top-11 z-10 w-44 rounded-lg border border-border bg-card text-xs shadow-lg">
                        <button
                          onClick={() => handleViewProject(task)}
                          className="flex items-center gap-2 w-full px-3 py-2 text-left hover:bg-background/70"
                        >
                          <Eye className="h-4 w-4 text-muted" />
                          <span>View project</span>
                        </button>
                        <button
                          onClick={() => handleOpenEdit(task)}
                          className="flex items-center gap-2 w-full px-3 py-2 text-left hover:bg-background/70"
                        >
                          <Pencil className="h-4 w-4 text-muted" />
                          <span>Edit hours</span>
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
                    className="px-4 py-8 text-center text-sm text-muted"
                  >
                    No tasks assigned to you.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit modal */}
      {isEditOpen && editingTask && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-background/80 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-2xl bg-card text-foreground shadow-2xl border border-border overflow-hidden">
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <Pencil className="h-4 w-4 text-emerald-500" />
                Edit worked hours
              </h2>
              <button
                onClick={handleCloseEdit}
                className="h-7 w-7 flex items-center justify-center rounded-full border border-border text-muted hover:bg-background"
              >
                <X className="h-3 w-3" />
              </button>
            </div>

            <form
              onSubmit={handleSaveEdit}
              className="px-5 py-4 space-y-4 text-sm"
            >
              <div>
                <p className="text-xs text-muted mb-1">Task</p>
                <p className="text-foreground">{editingTask.name}</p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3 text-muted" />
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
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">
                  Description of work
                </label>
                <textarea
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40 resize-y"
                  placeholder="Briefly describe what you did in this time."
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border mt-2">
                <button
                  type="button"
                  onClick={handleCloseEdit}
                  className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground hover:bg-card"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1 rounded-lg bg-emerald-500 px-4 py-1.5 text-xs font-semibold text-slate-950 shadow-sm shadow-emerald-500/40 hover:bg-emerald-400"
                >
                  <CheckCircle2 className="h-3 w-3" />
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
