"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Client, initialClients } from "@/lib/clients";
import ClientModal from "@/components/ClientModal";

function StatusBadge({ status }: { status: Client["status"] }) {
  const isActive = status === "Active";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
        isActive
          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/40"
          : "bg-slate-600/20 text-slate-300 border border-slate-500/40"
      }`}
    >
      {status}
    </span>
  );
}

type StatusFilter = "All" | "Active" | "Inactive";

export default function AdminClients() {
  const router = useRouter();

  const [clients, setClients] = useState<Client[]>(initialClients);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");

  const handleRowClick = (id: number) => {
    router.push(`/admin/clients/${id}`);
  };

  const toggleMenu = (id: number) => {
    setOpenMenuId((prev) => (prev === id ? null : id));
  };

  const handleRemove = (id: number) => {
    setClients((prev) => prev.filter((c) => c.id !== id));
    setOpenMenuId(null);
  };

  const handleView = (client: Client) => {
    router.push(`/admin/clients/${client.id}`);
    setOpenMenuId(null);
  };

  const handleEdit = (client: Client) => {
    setSelectedClient(client);
    setModalMode("edit");
    setIsModalOpen(true);
    setOpenMenuId(null);
  };

  const handleAddClientClick = () => {
    setSelectedClient(null);
    setModalMode("add");
    setIsModalOpen(true);
  };

  const handleSaveClient = (client: Client) => {
    if (modalMode === "add") {
      setClients((prev) => [...prev, client]);
    } else {
      setClients((prev) =>
        prev.map((c) => (c.id === client.id ? client : c))
      );
    }
  };

  const nextId =
    clients.length === 0 ? 1 : Math.max(...clients.map((c) => c.id)) + 1;

  // search + status filter
  const filteredClients = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return clients.filter((client) => {
      const matchesSearch =
        !term ||
        client.name.toLowerCase().includes(term) ||
        (client.nickname ?? "").toLowerCase().includes(term) ||
        client.email.toLowerCase().includes(term) ||
        client.country.toLowerCase().includes(term);

      const matchesStatus =
        statusFilter === "All" ? true : client.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [clients, searchTerm, statusFilter]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Clients</h1>
          <p className="text-sm text-slate-400">
            All active and inactive clients managed by the admin.
          </p>
        </div>

        <button
          onClick={handleAddClientClick}
          className="inline-flex items-center justify-center rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-sm shadow-emerald-500/40 hover:bg-emerald-400"
        >
          + Add Client
        </button>
      </div>

      {/* Container */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950/60 overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 border-b border-slate-800 p-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="font-medium text-slate-200">
              {filteredClients.length}
            </span>
            <span>clients</span>
            {(searchTerm || statusFilter !== "All") && (
              <span className="text-[11px] text-slate-500">
                (filtered from {clients.length})
              </span>
            )}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search by name, email, country..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-56 rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-1.5 text-xs text-slate-100 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40"
            />
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as StatusFilter)
              }
              className="hidden sm:block rounded-lg border border-slate-700 bg-slate-900/70 px-2 py-1.5 text-xs text-slate-100 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40"
            >
              <option value="All">All</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-4 py-3 font-medium">Client</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Nickname</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Country</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 bg-slate-950/40">
              {filteredClients.map((client) => (
                <tr
                  key={client.id}
                  className="hover:bg-slate-900/60 cursor-pointer"
                  onClick={() => handleRowClick(client.id)}
                >
                  <td className="px-4 py-3 text-slate-100">{client.name}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={client.status} />
                  </td>
                  <td className="px-4 py-3 text-slate-300">
                    {client.nickname || "-"}
                  </td>
                  <td className="px-4 py-3 text-slate-300">
                    <span className="font-mono text-[11px] sm:text-xs">
                      {client.email}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-300">
                    {client.country}
                  </td>
                  <td
                    className="relative px-4 py-3 text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => toggleMenu(client.id)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-700 bg-slate-900/70 text-slate-300 hover:bg-slate-800"
                    >
                      ⋮
                    </button>

                    {openMenuId === client.id && (
                      <div className="absolute right-4 top-11 z-10 w-40 rounded-lg border border-slate-800 bg-slate-950/95 text-xs shadow-lg">
                        <button
                          onClick={() => handleView(client)}
                          className="block w-full px-3 py-2 text-left hover:bg-slate-900"
                        >
                          View details
                        </button>
                        <button
                          onClick={() => handleEdit(client)}
                          className="block w-full px-3 py-2 text-left hover:bg-slate-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleRemove(client.id)}
                          className="block w-full px-3 py-2 text-left text-red-400 hover:bg-red-500/10"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}

              {filteredClients.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-sm text-slate-500"
                  >
                    No clients found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Client Modal */}
      <ClientModal
        open={isModalOpen}
        mode={modalMode}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveClient}
        nextId={nextId}
        client={selectedClient ?? undefined}
      />
    </div>
  );
}
