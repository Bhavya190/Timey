"use client";

import { FormEvent, useEffect, useState } from "react";
import type { Project, ProjectStatus } from "@/lib/projects";
import { demoUsers } from "@/lib/users";
import { initialClients } from "@/lib/clients";

type Mode = "add" | "edit";
type TabKey = "basic" | "team" | "billing" | "advanced";

type Props = {
  open: boolean;
  mode: Mode;
  onClose: () => void;
  onSave: (project: Project) => void;
  nextId: number;
  project?: Project | null;
};

const employeeOptions = demoUsers.filter((u) => u.role === "employee");
const clientOptions = initialClients;

export default function ProjectModal({
  open,
  mode,
  onClose,
  onSave,
  nextId,
  project,
}: Props) {
  const isEdit = mode === "edit";

  const [activeTab, setActiveTab] = useState<TabKey>("basic");

  // Basic
  const [name, setName] = useState("");
  const [clientId, setClientId] = useState<number | null>(null);
  const [clientName, setClientName] = useState("");
  const [teamLeadId, setTeamLeadId] = useState<number | null>(null);
  const [managerId, setManagerId] = useState<number | null>(null);
  const [code, setCode] = useState("");

  // Team
  const [teamMemberIds, setTeamMemberIds] = useState<number[]>([]);

  // Billing
  const [defaultBillingRate, setDefaultBillingRate] = useState("");
  const [billingType, setBillingType] = useState<"fixed" | "hourly">("hourly");
  const [fixedCost, setFixedCost] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);

  // Advanced
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [estimatedCost, setEstimatedCost] = useState("");
  const [status, setStatus] = useState<ProjectStatus>("Active");

  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;

    if (isEdit && project) {
      setName(project.name);
      setClientId(project.clientId);
      setClientName(project.clientName);
      setCode(project.code);
      setTeamLeadId(project.teamLeadId ?? null);
      setManagerId(project.managerId ?? null);
      setTeamMemberIds(project.teamMemberIds ?? []);
      setDefaultBillingRate(project.defaultBillingRate ?? "");
      setBillingType(project.billingType ?? "hourly");
      setFixedCost(project.fixedCost ?? "");
      setStartDate(project.startDate ?? "");
      setEndDate(project.endDate ?? "");
      setDescription(project.description ?? "");
      setDuration(project.duration ?? "");
      setEstimatedCost(project.estimatedCost ?? "");
      setStatus(project.status);
      setInvoiceFile(null);
      setActiveTab("basic");
      setError("");
    } else {
      setName("");
      setClientId(null);
      setClientName("");
      setCode("");
      setTeamLeadId(null);
      setManagerId(null);
      setTeamMemberIds([]);
      setDefaultBillingRate("");
      setBillingType("hourly");
      setFixedCost("");
      setStartDate("");
      setEndDate("");
      setInvoiceFile(null);
      setDescription("");
      setDuration("");
      setEstimatedCost("");
      setStatus("Active");
      setActiveTab("basic");
      setError("");
    }
  }, [open, isEdit, project]);

  if (!open) return null;

  const handleTeamToggle = (id: number) => {
    setTeamMemberIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError("");

    const selectedClient =
      clientId == null ? null : clientOptions.find((c) => c.id === clientId);

    if (!name || !code || teamLeadId === null || !selectedClient) {
      setError(
        clientOptions.length === 0
          ? "No clients found. Please add a client before creating a project."
          : "Project name, client, code and team lead are required."
      );
      return;
    }

    const newProject: Project = {
      id: isEdit && project ? project.id : nextId,
      name,
      code,
      clientId: selectedClient.id,
      clientName: selectedClient.name,
      teamLeadId,
      managerId,
      teamMemberIds,
      defaultBillingRate,
      billingType,
      fixedCost,
      startDate,
      endDate,
      invoiceFileName: invoiceFile?.name,
      description,
      duration,
      estimatedCost,
      status,
    };

    onSave(newProject);
    onClose();
  };

  const resetAndClose = () => {
    setError("");
    onClose();
  };

  const tabs: { key: TabKey; label: string }[] = [
    { key: "basic", label: "Basic" },
    { key: "team", label: "Team" },
    { key: "billing", label: "Billing" },
    { key: "advanced", label: "Advance" },
  ];

  const getEmployeeName = (id: number) =>
    employeeOptions.find((e) => e.id === id)?.name ?? "Unknown";

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-background/80 backdrop-blur-sm px-4">
      <div className="relative w-full max-w-4xl rounded-2xl bg-card text-foreground shadow-2xl border border-border max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-lg font-semibold">
            {isEdit ? "Edit Project" : "Add Project"}
          </h2>
          <button
            type="button"
            onClick={resetAndClose}
            className="h-7 w-7 rounded-full border border-border text-muted hover:bg-muted"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border px-6">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`relative px-3 py-3 text-sm font-medium ${
                activeTab === tab.key
                  ? "text-emerald-500"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {tab.label}
              {activeTab === tab.key && (
                <span className="absolute inset-x-0 -bottom-px h-0.5 bg-emerald-500" />
              )}
            </button>
          ))}
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-6 py-4 space-y-4"
        >
          {activeTab === "basic" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Project Name */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">
                  Project Name<span className="text-red-500">*</span>
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40"
                  required
                />
              </div>

              {/* Client dropdown */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">
                  Client<span className="text-red-500">*</span>
                </label>
                <select
                  value={clientId == null ? "" : String(clientId)}
                  onChange={(e) => {
                    const id =
                      e.target.value === "" ? null : Number(e.target.value);
                    setClientId(id);
                    const found =
                      id == null
                        ? null
                        : clientOptions.find((c) => c.id === id);
                    setClientName(found?.name ?? "");
                  }}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40"
                  required
                  disabled={clientOptions.length === 0}
                >
                  <option value="">
                    {clientOptions.length === 0
                      ? "No clients available. Add a client first."
                      : "Select client"}
                  </option>
                  {clientOptions.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Team Lead */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">
                  Team Lead<span className="text-red-500">*</span>
                </label>
                <select
                  value={teamLeadId === null ? "" : String(teamLeadId)}
                  onChange={(e) =>
                    setTeamLeadId(
                      e.target.value === "" ? null : Number(e.target.value)
                    )
                  }
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40"
                  required
                >
                  <option value="">Select team lead</option>
                  {employeeOptions.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Project Manager */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">
                  Project Manager
                </label>
                <select
                  value={managerId === null ? "" : String(managerId)}
                  onChange={(e) =>
                    setManagerId(
                      e.target.value === "" ? null : Number(e.target.value)
                    )
                  }
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40"
                >
                  <option value="">Select manager</option>
                  {employeeOptions.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Project Code */}
              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-medium text-foreground">
                  Project Code<span className="text-red-500">*</span>
                </label>
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="PRJ-001"
                  className="w-full max-w-xs rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40"
                  required
                />
              </div>
            </div>
          )}

          {activeTab === "team" && (
            <div className="space-y-3">
              <p className="text-xs text-muted">
                Select one or more employees to assign them to this project
                team.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {employeeOptions.map((emp) => {
                  const checked = teamMemberIds.includes(emp.id);
                  return (
                    <label
                      key={emp.id}
                      className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs cursor-pointer ${
                        checked
                          ? "border-emerald-500 bg-emerald-500/10 text-emerald-500"
                          : "border-border bg-muted text-foreground"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => handleTeamToggle(emp.id)}
                        className="h-4 w-4 rounded border-border bg-background"
                      />
                      <span>{emp.name}</span>
                    </label>
                  );
                })}
              </div>
              {teamMemberIds.length > 0 && (
                <p className="text-xs text-muted">
                  Selected: {teamMemberIds.map(getEmployeeName).join(", ")}
                </p>
              )}
            </div>
          )}

          {activeTab === "billing" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">
                  Default Billing Rate
                </label>
                <input
                  type="number"
                  value={defaultBillingRate}
                  onChange={(e) => setDefaultBillingRate(e.target.value)}
                  placeholder="0.00"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">
                  Project billing type
                </label>
                <select
                  value={billingType}
                  onChange={(e) =>
                    setBillingType(e.target.value as "fixed" | "hourly")
                  }
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40"
                >
                  <option value="fixed">Fixed bid</option>
                  <option value="hourly">Per hour</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">
                  Fixed cost
                </label>
                <input
                  type="number"
                  value={fixedCost}
                  onChange={(e) => setFixedCost(e.target.value)}
                  placeholder="0.00"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40"
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-medium text-foreground">
                  Invoice (pdf)
                </label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) =>
                    setInvoiceFile(e.target.files?.[0] ?? null)
                  }
                  className="block w-full text-xs text-muted file:mr-3 file:rounded-md file:border-0 file:bg-muted file:px-3 file:py-2 file:text-xs file:font-medium file:text-foreground hover:file:bg-muted/80"
                />
              </div>
            </div>
          )}

          {activeTab === "advanced" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-medium text-foreground">
                  Project Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">
                  Duration
                </label>
                <input
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="e.g. 3 months"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">
                  Estimated Cost
                </label>
                <input
                  type="number"
                  value={estimatedCost}
                  onChange={(e) => setEstimatedCost(e.target.value)}
                  placeholder="0.00"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">
                  Project Status
                </label>
                <select
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value as ProjectStatus)
                  }
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40"
                >
                  <option value="Active">Active</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>
          )}

          {error && (
            <p className="text-xs text-red-500 bg-red-500/10 border border-red-500/30 rounded-md px-3 py-2">
              {error}
            </p>
          )}
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-border px-6 py-3">
          <button
            type="button"
            onClick={resetAndClose}
            className="rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground hover:bg-muted"
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
