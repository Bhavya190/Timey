"use client";

import { FormEvent, useEffect, useState } from "react";
import type { Task, TaskStatus, TaskBillingType } from "@/lib/tasks";
import { initialProjects } from "@/lib/projects";
import { demoUsers } from "@/lib/users";

type Mode = "add" | "edit";

type Props = {
  open: boolean;
  mode: Mode;
  onClose: () => void;
  onSave: (task: Task) => void;
  nextId: number;
  task?: Task | null;
};

const projectOptions = initialProjects;
const employeeOptions = demoUsers.filter((u) => u.role === "employee");

function todayISO() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function TaskModal({
  open,
  mode,
  onClose,
  onSave,
  nextId,
  task,
}: Props) {
  const isEdit = mode === "edit";

  const [projectId, setProjectId] = useState<number | null>(null);
  const [taskName, setTaskName] = useState("");
  const [workedHours, setWorkedHours] = useState<string>("0");
  const [assigneeIds, setAssigneeIds] = useState<number[]>([]);
  const [date, setDate] = useState<string>("");
  const [status, setStatus] = useState<TaskStatus>("Not Started");
  const [billingType, setBillingType] = useState<TaskBillingType>("billable");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;

    if (isEdit && task) {
      setProjectId(task.projectId);
      setTaskName(task.name);
      setWorkedHours(String(task.workedHours));
      setAssigneeIds(task.assigneeIds);
      setDate(task.date);
      setStatus(task.status);
      setBillingType(task.billingType ?? "billable");
      setError("");
    } else {
      setProjectId(null);
      setTaskName("");
      setWorkedHours("0");
      setAssigneeIds([]);
      setDate(todayISO());
      setStatus("Not Started");
      setBillingType("billable");
      setError("");
    }
  }, [open, isEdit, task]);

  if (!open) return null;

  const handleAssigneeToggle = (id: number) => {
    setAssigneeIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError("");

    const hours = Number(workedHours) || 0;

    if (projectId == null || !taskName.trim() || !date) {
      setError(
        projectOptions.length === 0
          ? "No projects found. Please create a project before adding tasks."
          : "Project, task name and date are required."
      );
      return;
    }

    const project = projectOptions.find((p) => p.id === projectId);
    if (!project) {
      setError("Selected project not found.");
      return;
    }

    const newTask: Task = {
      id: isEdit && task ? task.id : nextId,
      projectId: project.id,
      projectName: project.name,
      name: taskName.trim(),
      workedHours: hours,
      assigneeIds,
      date,
      status,
      billingType,
    };

    onSave(newTask);
    onClose();
  };

  const resetAndClose = () => {
    setError("");
    onClose();
  };

  const getEmployeeName = (id: number) =>
    employeeOptions.find((e) => e.id === id)?.name ?? "Unknown";

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm px-4">
      <div className="relative w-full max-w-2xl rounded-2xl bg-slate-950 text-slate-100 shadow-2xl border border-slate-800 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <h2 className="text-lg font-semibold">
            {isEdit ? "Edit Task" : "Add Task"}
          </h2>
          <button
            onClick={resetAndClose}
            className="h-7 w-7 rounded-full border border-slate-700 text-slate-300 hover:bg-slate-800"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-6 py-4 space-y-4"
        >
          {/* Project select */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">
              Project<span className="text-red-400">*</span>
            </label>
            <select
              value={projectId == null ? "" : String(projectId)}
              onChange={(e) =>
                setProjectId(
                  e.target.value === "" ? null : Number(e.target.value)
                )
              }
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40"
              required
              disabled={projectOptions.length === 0}
            >
              <option value="">
                {projectOptions.length === 0
                  ? "No projects available. Add a project first."
                  : "Select project"}
              </option>
              {projectOptions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Task name */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">
              Task Name<span className="text-red-400">*</span>
            </label>
            <input
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40"
              required
            />
          </div>

          {/* Date */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">
              Date<span className="text-red-400">*</span>
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full max-w-xs rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40"
              required
            />
          </div>

          {/* Status */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
              className="w-full max-w-xs rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40"
            >
              <option value="Not Started">Not Started</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          {/* Billing type */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">
              Billing type
            </label>
            <select
              value={billingType}
              onChange={(e) =>
                setBillingType(e.target.value as TaskBillingType)
              }
              className="w-full max-w-xs rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40"
            >
              <option value="billable">Billable</option>
              <option value="non-billable">Non‑billable</option>
            </select>
            <p className="text-[11px] text-slate-500">
              Billable hours are included in invoices; non‑billable are for
              internal tracking only.
            </p>
          </div>

          {/* Worked hours */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">
              Worked Hours
            </label>
            <input
              type="number"
              min={0}
              step={0.25}
              value={workedHours}
              onChange={(e) => setWorkedHours(e.target.value)}
              className="w-full max-w-xs rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40"
            />
            <p className="text-[11px] text-slate-500">
              These hours will be used in the timesheet and billing reports.
            </p>
          </div>

          {/* Assignees */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-300">
              Assigned to
            </label>
            <p className="text-[11px] text-slate-500">
              Select one or more employees who worked on this task.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {employeeOptions.map((emp) => {
                const checked = assigneeIds.includes(emp.id);
                return (
                  <label
                    key={emp.id}
                    className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs cursor-pointer ${
                      checked
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-200"
                        : "border-slate-700 bg-slate-900/60 text-slate-200"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleAssigneeToggle(emp.id)}
                      className="h-4 w-4 rounded border-slate-600 bg-slate-900"
                    />
                    <span>{emp.name}</span>
                  </label>
                );
              })}
            </div>
            {assigneeIds.length > 0 && (
              <p className="text-[11px] text-slate-500">
                Selected: {assigneeIds.map(getEmployeeName).join(", ")}
              </p>
            )}
          </div>

          {error && (
            <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-md px-3 py-2">
              {error}
            </p>
          )}
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-800 px-6 py-3">
          <button
            type="button"
            onClick={resetAndClose}
            className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-100 hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={(e) => {
              const form =
                (e.currentTarget.parentElement
                  ?.previousElementSibling as HTMLFormElement) || null;
              form?.requestSubmit();
            }}
            className="rounded-lg bg-emerald-500 px-5 py-2 text-sm font-semibold text-slate-950 shadow-sm shadow-emerald-500/40 hover:bg-emerald-400"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
