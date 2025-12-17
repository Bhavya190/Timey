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
      {/* Header */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
            <FolderKanban className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Project: {project.name}
            </h1>
            <p className="text-sm text-muted">
              Key project details plus tasks, assignees, and worked hours.
            </p>
          </div>
        </div>

        {/* Details grid */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-4 space-y-2 text-sm">
            <p className="flex items-center gap-2">
              <Hash className="h-4 w-4 text-emerald-500" />
              <span className="font-medium text-foreground">Code:</span>
              <span className="text-foreground">{project.code}</span>
            </p>
            <p className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-emerald-500" />
              <span className="font-medium text-foreground">Client:</span>
              <span className="text-foreground">{project.clientName}</span>
            </p>
            <p className="flex items-center gap-2">
              <BadgeCheck className="h-4 w-4 text-emerald-500" />
              <span className="font-medium text-foreground">Status:</span>
              <span className="text-foreground">{project.status}</span>
            </p>
            <p className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-emerald-500" />
              <span className="font-medium text-foreground">Start Date:</span>
              <span className="text-foreground">
                {project.startDate || "-"}
              </span>
            </p>
            <p className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-emerald-500" />
              <span className="font-medium text-foreground">End Date:</span>
              <span className="text-foreground">
                {project.endDate || "-"}
              </span>
            </p>
            <p className="flex items-center gap-2">
              <Banknote className="h-4 w-4 text-emerald-500" />
              <span className="font-medium text-foreground">Billing:</span>
              <span className="text-foreground">
                {project.billingType
                  ? project.billingType === "hourly"
                    ? `Hourly • ${project.defaultBillingRate ?? "-"} /hr`
                    : `Fixed • ${project.fixedCost ?? "-"}`
                  : "-"}
              </span>
            </p>
            {(project.estimatedCost || project.duration) && (
              <p className="flex items-center gap-2">
                <Timer className="h-4 w-4 text-emerald-500" />
                <span className="font-medium text-foreground">Estimate:</span>
                <span className="text-foreground">
                  {project.estimatedCost
                    ? `Cost ${project.estimatedCost}`
                    : ""}
                  {project.estimatedCost && project.duration ? " • " : ""}
                  {project.duration ? `Duration ${project.duration}` : ""}
                </span>
              </p>
            )}
            <p className="flex items-center gap-2">
              <Users className="h-4 w-4 text-emerald-500" />
              <span className="font-medium text-foreground">Team size:</span>
              <span className="text-foreground">
                {teamSize > 0
                  ? `${teamSize} member${teamSize > 1 ? "s" : ""}`
                  : "Not set"}
              </span>
            </p>
            {project.description && (
              <p className="flex items-start gap-2 text-muted">
                <FileText className="h-4 w-4 mt-0.5 text-emerald-500" />
                <span>
                  <span className="font-medium text-foreground">
                    Description:{" "}
                  </span>
                  {project.description}
                </span>
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Tasks */}
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold tracking-tight">
            Tasks for this project
          </h2>
          <p className="text-xs text-muted flex items-center gap-2">
            <span>{projectTasks.length} tasks</span>
            <span className="h-1 w-1 rounded-full bg-border" />
            <span className="inline-flex items-center gap-1">
              <Clock4 className="h-3.5 w-3.5 text-muted" />
              Total worked hours:
              <span className="font-semibold text-foreground">
                {totalHours.toFixed(2)}
              </span>
            </span>
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          {projectTasks.length === 0 ? (
            <p className="px-4 py-6 text-sm text-muted">
              No tasks have been added for this project yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-xs sm:text-sm">
                <thead className="bg-background/80 text-muted border-b border-border">
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
                <tbody className="divide-y divide-border bg-card">
                  {projectTasks.map((task) => (
                    <tr key={task.id} className="hover:bg-background/60">
                      <td className="px-4 py-3 text-foreground">
                        {task.name}
                      </td>
                      <td className="px-4 py-3 text-foreground">
                        {task.workedHours.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-muted">
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
