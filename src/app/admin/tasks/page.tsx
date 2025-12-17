"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Task, TaskStatus, TaskBillingType, initialTasks } from "@/lib/tasks";
import { initialProjects } from "@/lib/projects";
import { demoUsers } from "@/lib/users";
import TaskModal from "@/components/TaskModal";

const hasProjects = initialProjects.length > 0;
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

function StatusBadge({ status }: { status: TaskStatus }) {
  const base =
    "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium border";
  if (status === "Completed") {
    return (
      <span
        className={`${base} bg-emerald-500/10 text-emerald-500 border-emerald-500/40`}
      >
        Completed
      </span>
    );
  }
  if (status === "In Progress") {
    return (
      <span
        className={`${base} bg-sky-500/10 text-sky-500 border-sky-500/40`}
      >
        In Progress
      </span>
    );
  }
  return (
    <span
      className={`${base} bg-amber-500/10 text-amber-500 border-amber-500/40`}
    >
      Not Started
    </span>
  );
}

function BillingBadge({ billingType }: { billingType: TaskBillingType }) {
  const base =
    "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium border";
  if (billingType === "billable") {
    return (
      <span
        className={`${base} bg-emerald-500/10 text-emerald-500 border-emerald-500/40`}
      >
        Billable
      </span>
    );
  }
  return (
    <span
      className={`${base} bg-muted text-muted-foreground border-border`}
    >
      Non‑billable
    </span>
  );
}

type StatusFilter = "All" | TaskStatus;

export default function AdminTasks() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");

  const toggleMenu = (id: number) => {
    setOpenMenuId((prev) => (prev === id ? null : id));
  };

  const handleAddTaskClick = () => {
    if (!hasProjects) return;
    setSelectedTask(null);
    setModalMode("add");
    setIsModalOpen(true);
  };

  const handleEdit = (task: Task) => {
    setSelectedTask(task);
    setModalMode("edit");
    setIsModalOpen(true);
    setOpenMenuId(null);
  };

  const handleRemove = (id: number) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    setOpenMenuId(null);
  };

  const handleView = (task: Task) => {
    const project = initialProjects.find((p) => p.id === task.projectId);
    if (project) {
      router.push(`/admin/projects/${project.id}`);
    }
    setOpenMenuId(null);
  };

  const handleSaveTask = (task: Task) => {
    if (modalMode === "add") {
      setTasks((prev) => [...prev, task]);
    } else {
      setTasks((prev) => prev.map((t) => (t.id === task.id ? task : t)));
    }
  };

  const nextId =
    tasks.length === 0 ? 1 : Math.max(...tasks.map((t) => t.id)) + 1;

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

  const filteredTasks = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return tasks.filter((task) => {
      const matchesSearch =
        !term ||
        task.name.toLowerCase().includes(term) ||
        task.projectName.toLowerCase().includes(term) ||
        formatAssignees(task.assigneeIds).toLowerCase().includes(term) ||
        task.billingType.toLowerCase().includes(term);
      const matchesStatus =
        statusFilter === "All" ? true : task.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [tasks, searchTerm, statusFilter]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tasks</h1>
          <p className="text-sm text-muted">
            Tasks grouped by project, with worked hours for timesheet and
            billing.
          </p>
        </div>

        <button
          onClick={handleAddTaskClick}
          disabled={!hasProjects}
          className={`inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold shadow-sm ${
            hasProjects
              ? "bg-emerald-500 text-slate-950 shadow-emerald-500/40 hover:bg-emerald-400"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          }`}
        >
          {hasProjects ? "+ Add Task" : "Add a project first"}
        </button>
      </div>

      {/* Container */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 border-b border-border p-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-xs text-muted">
            <span className="font-medium text-foreground">
              {filteredTasks.length}
            </span>
            <span>tasks</span>
            {(searchTerm || statusFilter !== "All") && (
              <span className="text-[11px] text-muted">
                (filtered from {tasks.length})
              </span>
            )}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search tasks, projects, assignees, billing"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-56 rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40"
            />
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as StatusFilter)
              }
              className="hidden sm:block rounded-lg border border-border bg-background px-2 py-1.5 text-xs text-foreground outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40"
            >
              <option value="All">All</option>
              <option value="Not Started">Not Started</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-xs sm:text-sm">
            <thead className="bg-background/80 text-muted border-b border-border">
              <tr>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Task</th>
                <th className="px-4 py-3 font-medium">Project</th>
                <th className="px-4 py-3 font-medium">Worked Hours</th>
                <th className="px-4 py-3 font-medium">Assigned To</th>
                <th className="px-4 py-3 font-medium">Billing</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card">
              {filteredTasks.length > 0 ? (
                filteredTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-background/60">
                    <td className="px-4 py-3 text-muted">
                      {formatHumanDate(task.date)}
                    </td>
                    <td className="px-4 py-3 text-foreground">
                      {task.name}
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {task.projectName}
                    </td>
                    <td className="px-4 py-3 text-foreground">
                      {task.workedHours.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {formatAssignees(task.assigneeIds)}
                    </td>
                    <td className="px-4 py-3">
                      <BillingBadge billingType={task.billingType} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={task.status} />
                    </td>
                    <td
                      className="relative px-4 py-3 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => toggleMenu(task.id)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background text-foreground hover:bg-card"
                      >
                        ⋮
                      </button>

                      {openMenuId === task.id && (
                        <div className="absolute right-4 top-11 z-10 w-40 rounded-lg border border-border bg-card text-xs shadow-lg">
                          <button
                            onClick={() => handleView(task)}
                            className="block w-full px-3 py-2 text-left hover:bg-background/70"
                          >
                            View project
                          </button>
                          <button
                            onClick={() => handleEdit(task)}
                            className="block w-full px-3 py-2 text-left hover:bg-background/70"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleRemove(task.id)}
                            className="block w-full px-3 py-2 text-left text-red-500 hover:bg-red-500/10"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-8 text-center text-sm text-muted"
                  >
                    No matching tasks.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Task Modal */}
      <TaskModal
        open={isModalOpen}
        mode={modalMode}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTask}
        nextId={nextId}
        task={selectedTask ?? undefined}
      />
    </div>
  );
}
