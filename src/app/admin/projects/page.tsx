"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Project, ProjectStatus, initialProjects } from "@/lib/projects";
import ProjectModal from "@/components/ProjectModal";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

function StatusBadge({ status }: { status: ProjectStatus }) {
  const base =
    "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium border";
  if (status === "Active") {
    return (
      <span
        className={`${base} bg-emerald-500/10 text-emerald-500 border-emerald-500/40`}
      >
        Active
      </span>
    );
  }
  if (status === "Completed") {
    return (
      <span
        className={`${base} bg-sky-500/10 text-sky-500 border-sky-500/40`}
      >
        Completed
      </span>
    );
  }
  return (
    <span
      className={`${base} bg-amber-500/10 text-amber-500 border-amber-500/40`}
    >
      On Hold
    </span>
  );
}

type StatusFilter = "All" | ProjectStatus;

const formatDateShortWithYear = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

export default function AdminProjects() {
  const router = useRouter();

  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");

  // weekly range
  const today = new Date();
  const todayDay = today.getDay();
  const mondayDiff = (todayDay + 6) % 7;
  const initialStart = new Date(today);
  initialStart.setDate(today.getDate() - mondayDiff);
  const initialEnd = new Date(initialStart);
  initialEnd.setDate(initialStart.getDate() + 6);

  const [startISO, setStartISO] = useState<string>(
    initialStart.toISOString().slice(0, 10)
  );
  const [endISO, setEndISO] = useState<string>(
    initialEnd.toISOString().slice(0, 10)
  );

  const goPrevWeek = () => {
    const start = new Date(startISO);
    const end = new Date(endISO);
    start.setDate(start.getDate() - 7);
    end.setDate(end.getDate() - 7);
    setStartISO(start.toISOString().slice(0, 10));
    setEndISO(end.toISOString().slice(0, 10));
  };

  const goNextWeek = () => {
    const start = new Date(startISO);
    const end = new Date(endISO);
    start.setDate(start.getDate() + 7);
    end.setDate(end.getDate() + 7);
    setStartISO(start.toISOString().slice(0, 10));
    setEndISO(end.toISOString().slice(0, 10));
  };

  const setWeekFromAnchor = (anchor: Date) => {
    const day = anchor.getDay();
    const mondayDiff = (day + 6) % 7;
    const start = new Date(anchor);
    start.setDate(anchor.getDate() - mondayDiff);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    setStartISO(start.toISOString().slice(0, 10));
    setEndISO(end.toISOString().slice(0, 10));
  };

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

  // SAVE: update list, close modal, clear selection
  const handleSaveProject = (project: Project) => {
    console.log("handleSaveProject called with:", project); // debug
    if (modalMode === "add") {
      setProjects((prev) => [...prev, project]);
    } else {
      setProjects((prev) =>
        prev.map((p) => (p.id === project.id ? project : p))
      );
    }

    setIsModalOpen(false);
    setSelectedProject(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProject(null);
  };

  const nextId =
    projects.length === 0 ? 1 : Math.max(...projects.map((p) => p.id)) + 1;

  const filteredProjects = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return projects.filter((project) => {
      const projectStart =
        project.startDate && project.startDate.length >= 10
          ? project.startDate.slice(0, 10)
          : "0000-01-01";
      const projectEnd =
        project.endDate && project.endDate.length >= 10
          ? project.endDate.slice(0, 10)
          : "9999-12-31";

      const inRange = projectEnd >= startISO && projectStart <= endISO;

      const matchesSearch =
        !term ||
        project.name.toLowerCase().includes(term) ||
        project.code.toLowerCase().includes(term) ||
        project.clientName.toLowerCase().includes(term);

      const matchesStatus =
        statusFilter === "All" ? true : project.status === statusFilter;

      return inRange && matchesSearch && matchesStatus;
    });
  }, [projects, searchTerm, statusFilter, startISO, endISO]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
          <p className="text-sm text-muted">
            Active, on‑hold and completed projects for all clients.
          </p>
        </div>

        <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:gap-3">
          {/* Date range pill */}
          <div className="flex flex-wrap items-center justify-end">
            <div className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-foreground">
              <button
                type="button"
                onClick={goPrevWeek}
                className="p-1.5 rounded-lg hover:bg-background/80 transition-colors"
                title="Previous week"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-2">
                <span>
                  {formatDateShortWithYear(startISO)} –{" "}
                  {formatDateShortWithYear(endISO)}
                </span>
                <div className="relative">
                  <input
                    type="date"
                    value={startISO}
                    onChange={(e) => {
                      if (!e.target.value) return;
                      const selectedDate = new Date(e.target.value);
                      setWeekFromAnchor(selectedDate);
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    aria-label="Select week date"
                  />
                  <div className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border bg-background text-muted hover:bg-card cursor-pointer pointer-events-none">
                    <Calendar className="h-3.5 w-3.5" />
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={goNextWeek}
                className="p-1.5 rounded-lg hover:bg-background/80 transition-colors"
                title="Next week"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Add Project button */}
          <button
            onClick={handleAddProjectClick}
            className="inline-flex items-center justify-center rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-sm shadow-emerald-500/40 hover:bg-emerald-400"
          >
            + Add Project
          </button>
        </div>
      </div>

      {/* Container */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 border-b border-border p-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-xs text-muted">
            <span className="font-medium text-foreground">
              {filteredProjects.length}
            </span>
            <span>projects</span>
            {(searchTerm || statusFilter !== "All") && (
              <span className="text-[11px] text-muted">
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
              <option value="Active">Active</option>
              <option value="On Hold">On Hold</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-xs sm:text-sm">
            <thead className="bg-background/80 text-muted border-b border-border">
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
            <tbody className="divide-y divide-border bg-card">
              {filteredProjects.length > 0 ? (
                filteredProjects.map((project) => (
                  <tr
                    key={project.id}
                    className="hover:bg-background/60 cursor-pointer"
                    onClick={() => handleRowClick(project.id)}
                  >
                    <td className="px-4 py-3 text-foreground">
                      {project.name}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={project.status} />
                    </td>
                    <td className="px-4 py-3 text-muted text-xs">
                      {project.code}
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {project.clientName}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-muted">
                      {project.startDate || "-"}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-muted">
                      {project.endDate || "-"}
                    </td>
                    <td
                      className="relative px-4 py-3 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => toggleMenu(project.id)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background text-foreground hover:bg-card"
                      >
                        ⋮
                      </button>

                      {openMenuId === project.id && (
                        <div className="absolute right-4 top-11 z-10 w-40 rounded-lg border border-border bg-card text-xs shadow-lg">
                          <button
                            onClick={() => handleView(project)}
                            className="block w-full px-3 py-2 text-left hover:bg-background/70"
                          >
                            View details
                          </button>
                          <button
                            onClick={() => handleEdit(project)}
                            className="block w-full px-3 py-2 text-left hover:bg-background/70"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleRemove(project.id)}
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
                    colSpan={7}
                    className="px-4 py-8 text-center text-sm text-muted"
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
        onClose={handleCloseModal}
        onSave={handleSaveProject}
        nextId={nextId}
        project={selectedProject ?? undefined}
      />
    </div>
  );
}
