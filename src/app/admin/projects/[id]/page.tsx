import React from "react";
import { notFound } from "next/navigation";
import { initialProjects } from "@/lib/projects";
import { initialTasks } from "@/lib/tasks";
import { demoUsers } from "@/lib/users";
import {
  FolderKanban,
  Hash,
  Briefcase,
  BadgeCheck,
  CalendarDays,
  FileText,
  ListChecks,
  Clock4,
  Users,
  Banknote,
  Timer,
} from "lucide-react";

type Props = {
  params: Promise<{ id: string }>;
};

const employeesById = Object.fromEntries(demoUsers.map((u) => [u.id, u]));

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

export default async function ProjectDetailPage({ params }: Props) {
  const { id } = await params;
  const projectId = Number(id);
  const project = initialProjects.find((p) => p.id === projectId);

  if (!project) notFound();

  const projectTasks = initialTasks.filter((t) => t.projectId === projectId);
  const totalHours = projectTasks.reduce((sum, t) => sum + t.workedHours, 0);
  const teamSize = Array.isArray(project.teamMemberIds)
    ? project.teamMemberIds.length
    : 0;

  return (
    <main className="space-y-6">
      {/* Header – same structure, with icon */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
            <FolderKanban className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Project: {project.name}
            </h1>
            <p className="text-sm text-slate-400">
              Key project details plus tasks, assignees, and worked hours.
            </p>
          </div>
        </div>

        {/* Grid layout for details (like before) */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-2 text-sm">
            <p className="flex items-center gap-2">
              <Hash className="h-4 w-4 text-emerald-400" />
              <span className="font-medium text-slate-300">Code:</span>
              <span className="text-slate-100">{project.code}</span>
            </p>
            <p className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-emerald-400" />
              <span className="font-medium text-slate-300">Client:</span>
              <span className="text-slate-100">{project.clientName}</span>
            </p>
            <p className="flex items-center gap-2">
              <BadgeCheck className="h-4 w-4 text-emerald-400" />
              <span className="font-medium text-slate-300">Status:</span>
              <span className="text-slate-100">{project.status}</span>
            </p>
            <p className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-emerald-400" />
              <span className="font-medium text-slate-300">Start Date:</span>
              <span className="text-slate-100">
                {project.startDate || "-"}
              </span>
            </p>
            <p className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-emerald-400" />
              <span className="font-medium text-slate-300">End Date:</span>
              <span className="text-slate-100">{project.endDate || "-"}</span>
            </p>
            <p className="flex items-center gap-2">
              <Banknote className="h-4 w-4 text-emerald-400" />
              <span className="font-medium text-slate-300">Billing:</span>
              <span className="text-slate-100">
                {project.billingType
                  ? project.billingType === "hourly"
                    ? `Hourly • ${project.defaultBillingRate ?? "-"} /hr`
                    : `Fixed • ${project.fixedCost ?? "-"}`
                  : "-"}
              </span>
            </p>
            {(project.estimatedCost || project.duration) && (
              <p className="flex items-center gap-2">
                <Timer className="h-4 w-4 text-emerald-400" />
                <span className="font-medium text-slate-300">Estimate:</span>
                <span className="text-slate-100">
                  {project.estimatedCost
                    ? `Cost ${project.estimatedCost}`
                    : ""}
                  {project.estimatedCost && project.duration ? " • " : ""}
                  {project.duration ? `Duration ${project.duration}` : ""}
                </span>
              </p>
            )}
            <p className="flex items-center gap-2">
              <Users className="h-4 w-4 text-emerald-400" />
              <span className="font-medium text-slate-300">Team size:</span>
              <span className="text-slate-100">
                {teamSize > 0 ? `${teamSize} member${teamSize > 1 ? "s" : ""}` : "Not set"}
              </span>
            </p>
            {project.description && (
              <p className="flex items-start gap-2 text-slate-300">
                <FileText className="h-4 w-4 mt-0.5 text-emerald-400" />
                <span>
                  <span className="font-medium text-slate-300">
                    Description:{" "}
                  </span>
                  {project.description}
                </span>
              </p>
            )}
          </div>
          {/* second column free for future use if needed */}
        </div>
      </section>

      {/* Tasks for this project – unchanged layout, just icons in headers */}
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold tracking-tight">
            Tasks for this project
          </h2>
          <p className="text-xs text-slate-400 flex items-center gap-2">
            <span>{projectTasks.length} tasks</span>
            <span className="h-1 w-1 rounded-full bg-slate-600" />
            <span className="inline-flex items-center gap-1">
              <Clock4 className="h-3.5 w-3.5 text-slate-500" />
              Total worked hours:
              <span className="font-semibold text-slate-100">
                {totalHours.toFixed(2)}
              </span>
            </span>
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950/60 overflow-hidden">
          {projectTasks.length === 0 ? (
            <p className="px-4 py-6 text-sm text-slate-500">
              No tasks have been added for this project yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3 font-medium">Task</th>
                    <th className="px-4 py-3 font-medium">
                      <span className="inline-flex items-center gap-1">
                        <Clock4 className="h-3.5 w-3.5" />
                        Worked Hours
                      </span>
                    </th>
                    <th className="px-4 py-3 font-medium">
                      <span className="inline-flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        Assigned To
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 bg-slate-950/40">
                  {projectTasks.map((task) => (
                    <tr key={task.id} className="hover:bg-slate-900/60">
                      <td className="px-4 py-3 text-slate-100">
                        {task.name}
                      </td>
                      <td className="px-4 py-3 text-slate-300">
                        {task.workedHours.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-slate-300">
                        {formatAssignees(task.assigneeIds)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
