"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Employee, initialEmployees } from "@/lib/employees";

function AvatarCircle({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-500 text-xs font-semibold text-white">
      {initials}
    </div>
  );
}

function StatusBadge({ status }: { status: Employee["status"] }) {
  const isActive = status === "Active";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium border ${
        isActive
          ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/40"
          : "bg-muted text-muted-foreground border-border"
      }`}
    >
      {status}
    </span>
  );
}

type StatusFilter = "all" | "Active" | "Inactive";

export default function AdminEmployees() {
  const router = useRouter();

  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const handleRowClick = (id: number) => {
    router.push(`/admin/employees/${id}`);
  };

  const toggleMenu = (id: number) => {
    setOpenMenuId((prev) => (prev === id ? null : id));
  };

  const handleRemove = (id: number) => {
    setEmployees((prev) => prev.filter((e) => e.id !== id));
    setOpenMenuId(null);
  };

  const handleView = (emp: Employee) => {
    router.push(`/admin/employees/${emp.id}`);
    setOpenMenuId(null);
  };

  const handleEdit = (emp: Employee) => {
    setSelectedEmployee(emp);
    setModalMode("edit");
    setIsModalOpen(true);
    setOpenMenuId(null);
  };

  const handleAddEmployeeClick = () => {
    setSelectedEmployee(null);
    setModalMode("add");
    setIsModalOpen(true);
  };

  const handleSaveEmployee = (emp: Employee) => {
    if (modalMode === "add") {
      setEmployees((prev) => [...prev, emp]);
    } else {
      setEmployees((prev) => prev.map((e) => (e.id === emp.id ? emp : e)));
    }
  };

  const nextCode = String(employees.length + 1).padStart(3, "0");

  const filteredEmployees = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return employees.filter((emp) => {
      const matchesSearch =
        !term ||
        emp.name.toLowerCase().includes(term) ||
        emp.email.toLowerCase().includes(term) ||
        emp.department.toLowerCase().includes(term) ||
        emp.code.toLowerCase().includes(term);

      const matchesStatus =
        statusFilter === "all" ? true : emp.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [employees, searchTerm, statusFilter]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Employees</h1>
          <p className="text-sm text-muted">
            All registered employees visible to the admin.
          </p>
        </div>

        <button
          onClick={handleAddEmployeeClick}
          className="inline-flex items-center justify-center rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-sm shadow-emerald-500/40 hover:bg-emerald-400"
        >
          + Add Employee
        </button>
      </div>

      {/* Container */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 border-b border-border p-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-xs text-muted">
            <span className="font-medium text-foreground">
              {filteredEmployees.length}
            </span>
            <span>employees</span>
            {searchTerm || statusFilter !== "all" ? (
              <span className="text-[11px] text-muted">
                (filtered from {employees.length})
              </span>
            ) : null}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email, code..."
              className="w-full sm:w-56 rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40"
            />
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as StatusFilter)
              }
              className="rounded-lg border border-border bg-background px-2 py-1.5 text-xs text-foreground outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40"
            >
              <option value="all">All</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-xs sm:text-sm">
            <thead className="bg-background/80 text-muted border-b border-border">
              <tr>
                <th className="px-4 py-3 font-medium">Employee</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Code</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium hidden lg:table-cell">
                  Department
                </th>
                <th className="px-4 py-3 font-medium hidden lg:table-cell">
                  Location
                </th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card">
              {filteredEmployees.map((emp) => (
                <tr
                  key={emp.id}
                  className="hover:bg-background/60 cursor-pointer"
                  onClick={() => handleRowClick(emp.id)}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <AvatarCircle name={emp.name} />
                      <div className="space-y-0.5">
                        <p className="text-sm font-medium text-foreground">
                          {emp.name}
                        </p>
                        <p className="text-[11px] text-muted lg:hidden">
                          {emp.department}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={emp.status} />
                  </td>
                  <td className="px-4 py-3 text-muted text-xs">
                    {emp.code}
                  </td>
                  <td className="px-4 py-3 text-muted">
                    <span className="font-mono text-[11px] sm:text-xs">
                      {emp.email}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-muted">
                    {emp.department}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-muted">
                    {emp.location}
                  </td>
                  <td
                    className="relative px-4 py-3 text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => toggleMenu(emp.id)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background text-foreground hover:bg-card"
                    >
                      ⋮
                    </button>

                    {openMenuId === emp.id && (
                      <div className="absolute right-4 top-11 z-10 w-40 rounded-lg border border-border bg-card text-xs shadow-lg">
                        <button
                          onClick={() => handleView(emp)}
                          className="block w-full px-3 py-2 text-left hover:bg-background/70"
                        >
                          View details
                        </button>
                        <button
                          onClick={() => handleEdit(emp)}
                          className="block w-full px-3 py-2 text-left hover:bg-background/70"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleRemove(emp.id)}
                          className="block w-full px-3 py-2 text-left text-red-500 hover:bg-red-500/10"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}

              {filteredEmployees.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-sm text-muted"
                  >
                    No employees found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* You can plug your Add/Edit Employee modal here, similar to other admin pages */}
    </div>
  );
}
