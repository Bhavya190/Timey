import React from "react";
import { notFound } from "next/navigation";
import { initialEmployees, Employee } from "@/lib/employees";
import { initialProjects } from "@/lib/projects";
import { initialTasks } from "@/lib/tasks";
import {
  UserCircle2,
  Briefcase,
  ListChecks,
  Mail,
  BadgeInfo,
  MapPin,
  Building2,
  ToggleRight,
  Clock4,
} from "lucide-react";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EmployeeDetailPage({ params }: Props) {
  const { id } = await params;
  const employeeId = Number(id);

  const employee = initialEmployees.find((e) => e.id === employeeId);
  if (!employee) {
    notFound();
  }

  const employeeProjects = initialProjects.filter(
    (p) => Array.isArray(p.teamMemberIds) && p.teamMemberIds.includes(employeeId)
  );

  const employeeTasks = initialTasks.filter((t) =>
    Array.isArray(t.assigneeIds) ? t.assigneeIds.includes(employeeId) : false
  );

  const detailRows: {
    label: string;
    value: string | number | undefined;
    icon?: React.ReactNode;
  }[] = [
    {
      label: "Name",
      value: employee.name,
      icon: <UserCircle2 className="h-4 w-4 text-emerald-500" />,
    },
    {
      label: "Email",
      value: employee.email,
      icon: <Mail className="h-4 w-4 text-emerald-500" />,
    },
    {
      label: "Code",
      value: (employee as Employee).code,
      icon: <BadgeInfo className="h-4 w-4 text-emerald-500" />,
    },
    {
      label: "Department",
      value: (employee as Employee).department,
      icon: <Building2 className="h-4 w-4 text-emerald-500" />,
    },
    {
      label: "Location",
      value: (employee as Employee).location,
      icon: <MapPin className="h-4 w-4 text-emerald-500" />,
    },
    {
      label: "Status",
      value: (employee as Employee).status,
      icon: <ToggleRight className="h-4 w-4 text-emerald-500" />,
    },
  ];

  return (
    <main className="space-y-6">
      {/* Header */}
      <header className="flex items-center gap-3">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
          <UserCircle2 className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {employee.name}
          </h1>
          <p className="text-sm text-muted">
            Detailed profile, projects and tasks for this employee.
          </p>
        </div>
      </header>

      {/* Employee details */}
      <section className="rounded-xl border border-border bg-card p-4">
        <h2 className="text-sm font-semibold text-foreground mb-3">
          Employee details
        </h2>
        <dl className="grid gap-3 md:grid-cols-2 text-sm">
          {detailRows.map(
            (row) =>
              row.value !== undefined &&
              row.value !== "" && (
                <div key={row.label} className="flex items-center gap-2">
                  {row.icon}
                  <dt className="text-muted text-xs w-24">{row.label}</dt>
                  <dd className="text-foreground text-sm font-medium">
                    {row.label === "Email" ? (
                      <span className="font-mono text-[11px] sm:text-xs">
                        {row.value}
                      </span>
                    ) : (
                      row.value
                    )}
                  </dd>
                </div>
              )
          )}
        </dl>
      </section>

      {/* Projects assigned */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-background text-emerald-500">
            <Briefcase className="h-4 w-4" />
          </div>
          <h2 className="text-sm font-semibold text-foreground">
            Projects assigned
          </h2>
          <span className="text-[11px] text-muted">
            ({employeeProjects.length})
          </span>
        </div>

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          {employeeProjects.length === 0 ? (
            <p className="px-4 py-4 text-sm text-muted">
              No projects assigned to this employee.
            </p>
          ) : (
            <table className="min-w-full text-left text-xs sm:text-sm">
              <thead className="bg-background/80 text-muted border-b border-border">
                <tr>
                  <th className="px-4 py-3 font-medium">Project</th>
                  <th className="px-4 py-3 font-medium">Client</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {employeeProjects.map((p) => (
                  <tr key={p.id} className="hover:bg-background/60">
                    <td className="px-4 py-3 text-foreground">{p.name}</td>
                    <td className="px-4 py-3 text-muted">
                      {p.clientName}
                    </td>
                    <td className="px-4 py-3 text-muted">{p.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* Tasks assigned */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-background text-emerald-500">
            <ListChecks className="h-4 w-4" />
          </div>
          <h2 className="text-sm font-semibold text-foreground">
            Tasks assigned
          </h2>
          <span className="text-[11px] text-muted">
            ({employeeTasks.length})
          </span>
        </div>

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          {employeeTasks.length === 0 ? (
            <p className="px-4 py-4 text-sm text-muted">
              No tasks assigned to this employee.
            </p>
          ) : (
            <table className="min-w-full text-left text-xs sm:text-sm">
              <thead className="bg-background/80 text-muted border-b border-border">
                <tr>
                  <th className="px-4 py-3 font-medium">Task</th>
                  <th className="px-4 py-3 font-medium">Project</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Hours</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {employeeTasks.map((t) => {
                  const project = initialProjects.find(
                    (p) => p.id === t.projectId
                  );
                  return (
                    <tr key={t.id} className="hover:bg-background/60">
                      <td className="px-4 py-3 text-foreground">
                        {t.name}
                      </td>
                      <td className="px-4 py-3 text-muted">
                        {project?.name ?? "-"}
                      </td>
                      <td className="px-4 py-3 text-muted">{t.status}</td>
                      <td className="px-4 py-3 text-muted">{t.date}</td>
                      <td className="px-4 py-3 text-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Clock4 className="h-3.5 w-3.5 text-muted" />
                          {t.workedHours}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </main>
  );
}
