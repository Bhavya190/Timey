"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Project, ProjectStatus, initialProjects } from "@/lib/projects";
import ProjectModal from "@/components/ProjectModal";

function StatusBadge({ status }: { status: ProjectStatus }) {
  const base =
    "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium";
  if (status === "Active") {
    return (
      <span
        className={`${base} bg-emerald-500/10 text-emerald-400 border border-emerald-500/40`}
      >
        Active
      </span>
    );
  }
  if (status === "Completed") {
    return (
      <span
        className={`${base} bg-sky-500/10 text-sky-300 border border-sky-500/40`}
      >
        Completed
      </span>
    );
  }
  return (
    <span
      className={`${base} bg-amber-500/10 text-amber-300 border border-amber-500/40`}
    >
      On Hold
    </span>
  );
}

type StatusFilter = "All" | ProjectStatus;

export default function AdminProjects() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");

  const handleRowClick = (id: number) => {
    router.push(`/admin/projects/${id}`);
  };

  const toggleMenu = (id: number) => {
    setOpenMenuId((prev) => (prev === id ? null : id));
  };

  const handleRemove = (id: number) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    setOpenMenuId(null);
  };

  const handleView = (project: Project) => {
    router.push(`/admin/projects/${project.id}`);
    setOpenMenuId(null);
  };

  const handleEdit = (project: Project) => {
    setSelectedProject(project);
    setModalMode("edit");
    setIsModalOpen(true);
    setOpenMenuId(null);
  };

  const handleAddProjectClick = () => {
    setSelectedProject(null);
    setModalMode("add");
    setIsModalOpen(true);
  };

  const handleSaveProject = (project: Project) => {
    if (modalMode === "add") {
      setProjects((prev) => [...prev, project]);
    } else {
      setProjects((prev) =>
        prev.map((p) => (p.id === project.id ? project : p))
      );
    }
  };

  const nextId =
    projects.length === 0 ? 1 : Math.max(...projects.map((p) => p.id)) + 1;

  const filteredProjects = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return projects.filter((project) => {
      const matchesSearch =
        !term ||
        project.name.toLowerCase().includes(term) ||
        project.code.toLowerCase().includes(term) ||
        project.clientName.toLowerCase().includes(term);

      const matchesStatus =
        statusFilter === "All" ? true : project.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [projects, searchTerm, statusFilter]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
          <p className="text-sm text-slate-400">
            Active, on‑hold and completed projects for all clients.
          </p>
        </div>

        <button
          onClick={handleAddProjectClick}
          className="inline-flex items-center justify-center rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-sm shadow-emerald-500/40 hover:bg-emerald-400"
        >
          + Add Project
        </button>
      </div>

      {/* Container */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950/60 overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 border-b border-slate-800 p-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="font-medium text-slate-200">
              {filteredProjects.length}
            </span>
            <span>projects</span>
            {(searchTerm || statusFilter !== "All") && (
              <span className="text-[11px] text-slate-500">
                (filtered from {projects.length})
              </span>
            )}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search projects"
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
              <option value="On Hold">On Hold</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-4 py-3 font-medium">Project</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Code</th>
                <th className="px-4 py-3 font-medium">Client</th>
                <th className="px-4 py-3 font-medium hidden md:table-cell">
                  Start Date
                </th>
                <th className="px-4 py-3 font-medium hidden md:table-cell">
                  End Date
                </th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 bg-slate-950/40">
              {filteredProjects.length > 0 ? (
                filteredProjects.map((project) => (
                  <tr
                    key={project.id}
                    className="hover:bg-slate-900/60 cursor-pointer"
                    onClick={() => handleRowClick(project.id)}
                  >
                    <td className="px-4 py-3 text-slate-100">
                      {project.name}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={project.status} />
                    </td>
                    <td className="px-4 py-3 text-slate-300 text-xs">
                      {project.code}
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {project.clientName}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-slate-300">
                      {project.startDate || "-"}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-slate-300">
                      {project.endDate || "-"}
                    </td>
                    <td
                      className="relative px-4 py-3 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => toggleMenu(project.id)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-700 bg-slate-900/70 text-slate-300 hover:bg-slate-800"
                      >
                        ⋮
                      </button>

                      {openMenuId === project.id && (
                        <div className="absolute right-4 top-11 z-10 w-40 rounded-lg border border-slate-800 bg-slate-950/95 text-xs shadow-lg">
                          <button
                            onClick={() => handleView(project)}
                            className="block w-full px-3 py-2 text-left hover:bg-slate-900"
                          >
                            View details
                          </button>
                          <button
                            onClick={() => handleEdit(project)}
                            className="block w-full px-3 py-2 text-left hover:bg-slate-900"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleRemove(project.id)}
                            className="block w-full px-3 py-2 text-left text-red-400 hover:bg-red-500/10"
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
                    colSpan={7}
                    className="px-4 py-8 text-center text-sm text-slate-500"
                  >
                    No matching projects.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Project Modal */}
      <ProjectModal
        open={isModalOpen}
        mode={modalMode}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProject}
        nextId={nextId}
        project={selectedProject ?? undefined}
      />
    </div>
  );
}
