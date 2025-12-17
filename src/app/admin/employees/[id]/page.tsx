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

  // Projects where this employee is in teamMemberIds
  const employeeProjects = initialProjects.filter(
    (p) => Array.isArray(p.teamMemberIds) && p.teamMemberIds.includes(employeeId)
  );

  // Tasks assigned to this employee (assumes tasks have assigneeIds + projectId)
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
      icon: <UserCircle2 className="h-4 w-4 text-emerald-400" />,
    },
    {
      label: "Email",
      value: employee.email,
      icon: <Mail className="h-4 w-4 text-emerald-400" />,
    },
    {
      label: "Code",
      value: (employee as Employee).code,
      icon: <BadgeInfo className="h-4 w-4 text-emerald-400" />,
    },
    {
      label: "Department",
      value: (employee as Employee).department,
      icon: <Building2 className="h-4 w-4 text-emerald-400" />,
    },
    {
      label: "Location",
      value: (employee as Employee).location,
      icon: <MapPin className="h-4 w-4 text-emerald-400" />,
    },
    {
      label: "Status",
      value: (employee as Employee).status,
      icon: <ToggleRight className="h-4 w-4 text-emerald-400" />,
    },
  ];

  return (
    <main className="space-y-6">
      {/* Header */}
      <header className="flex items-center gap-3">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
          <UserCircle2 className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {employee.name}
          </h1>
          <p className="text-sm text-slate-400">
            Detailed profile, projects and tasks for this employee.
          </p>
        </div>
      </header>

      {/* Employee details */}
      <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        <h2 className="text-sm font-semibold text-slate-200 mb-3">
          Employee details
        </h2>
        <dl className="grid gap-3 md:grid-cols-2 text-sm">
          {detailRows.map(
            (row) =>
              row.value !== undefined &&
              row.value !== "" && (
                <div key={row.label} className="flex items-center gap-2">
                  {row.icon}
                  <dt className="text-slate-400 text-xs w-24">{row.label}</dt>
                  <dd className="text-slate-100 text-sm font-medium">
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
          <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-emerald-400">
            <Briefcase className="h-4 w-4" />
          </div>
          <h2 className="text-sm font-semibold text-slate-200">
            Projects assigned
          </h2>
          <span className="text-[11px] text-slate-500">
            ({employeeProjects.length})
          </span>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950/60 overflow-hidden">
          {employeeProjects.length === 0 ? (
            <p className="px-4 py-4 text-sm text-slate-500">
              No projects assigned to this employee.
            </p>
          ) : (
            <table className="min-w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3 font-medium">Project</th>
                  <th className="px-4 py-3 font-medium">Client</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-slate-950/40">
                {employeeProjects.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-900/60">
                    <td className="px-4 py-3 text-slate-100">{p.name}</td>
                    <td className="px-4 py-3 text-slate-300">
                      {p.clientName}
                    </td>
                    <td className="px-4 py-3 text-slate-300">{p.status}</td>
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
          <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-emerald-400">
            <ListChecks className="h-4 w-4" />
          </div>
          <h2 className="text-sm font-semibold text-slate-200">
            Tasks assigned
          </h2>
          <span className="text-[11px] text-slate-500">
            ({employeeTasks.length})
          </span>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950/60 overflow-hidden">
          {employeeTasks.length === 0 ? (
            <p className="px-4 py-4 text-sm text-slate-500">
              No tasks assigned to this employee.
            </p>
          ) : (
            <table className="min-w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3 font-medium">Task</th>
                  <th className="px-4 py-3 font-medium">Project</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Hours</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-slate-950/40">
                {employeeTasks.map((t) => {
                  const project = initialProjects.find((p) => p.id === t.projectId);
                  return (
                    <tr key={t.id} className="hover:bg-slate-900/60">
                      <td className="px-4 py-3 text-slate-100">{t.name}</td>
                      <td className="px-4 py-3 text-slate-300">
                        {project?.name ?? "-"}
                      </td>
                      <td className="px-4 py-3 text-slate-300">{t.status}</td>
                      <td className="px-4 py-3 text-slate-300">{t.date}</td>
                      <td className="px-4 py-3 text-slate-300">
                        <span className="inline-flex items-center gap-1">
                          <Clock4 className="h-3.5 w-3.5 text-slate-500" />
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
