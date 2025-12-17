import React from "react";
import { notFound } from "next/navigation";
import { initialClients } from "@/lib/clients";
import { initialProjects } from "@/lib/projects";
import {
  UserCircle2,
  Mail,
  Globe2,
  BadgeInfo,
  Briefcase,
} from "lucide-react";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ClientDetailPage({ params }: Props) {
  const { id } = await params;
  const clientId = Number(id);

  const client = initialClients.find((c) => c.id === clientId);
  if (!client) notFound();

  const clientProjects = initialProjects.filter(
    (p) => p.clientName === client.name
  );

  return (
    <main className="space-y-6">
      {/* Header */}
      <header className="flex items-center gap-3">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
          <UserCircle2 className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {client.name}
          </h1>
          <p className="text-sm text-muted">
            Client profile and projects created for this customer.
          </p>
        </div>
      </header>

      {/* Client details */}
      <section className="rounded-xl border border-border bg-card p-4">
        <h2 className="text-sm font-semibold text-foreground mb-3">
          Client details
        </h2>
        <dl className="grid gap-3 md:grid-cols-2 text-sm">
          <div className="flex items-center gap-2">
            <BadgeInfo className="h-4 w-4 text-emerald-500" />
            <dt className="text-muted text-xs w-24">Nickname</dt>
            <dd className="text-foreground text-sm font-medium">
              {client.nickname || "-"}
            </dd>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-emerald-500" />
            <dt className="text-muted text-xs w-24">Email</dt>
            <dd className="text-foreground text-sm font-medium">
              <span className="font-mono text-[11px] sm:text-xs">
                {client.email}
              </span>
            </dd>
          </div>
          <div className="flex items-center gap-2">
            <Globe2 className="h-4 w-4 text-emerald-500" />
            <dt className="text-muted text-xs w-24">Country</dt>
            <dd className="text-foreground text-sm font-medium">
              {client.country}
            </dd>
          </div>
          <div className="flex items-center gap-2">
            <BadgeInfo className="h-4 w-4 text-emerald-500" />
            <dt className="text-muted text-xs w-24">Status</dt>
            <dd className="text-foreground text-sm font-medium">
              {client.status}
            </dd>
          </div>
        </dl>
      </section>

      {/* Projects for this client */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-background text-emerald-500">
            <Briefcase className="h-4 w-4" />
          </div>
          <h2 className="text-sm font-semibold text-foreground">
            Projects for this client
          </h2>
          <span className="text-[11px] text-muted">
            ({clientProjects.length})
          </span>
        </div>

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          {clientProjects.length === 0 ? (
            <p className="px-4 py-4 text-sm text-muted">
              No projects have been created for this client yet.
            </p>
          ) : (
            <table className="min-w-full text-left text-xs sm:text-sm">
              <thead className="bg-background/80 text-muted border-b border-border">
                <tr>
                  <th className="px-4 py-3 font-medium">Project</th>
                  <th className="px-4 py-3 font-medium">Code</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Start date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {clientProjects.map((p) => (
                  <tr key={p.id} className="hover:bg-background/60">
                    <td className="px-4 py-3 text-foreground">{p.name}</td>
                    <td className="px-4 py-3 text-muted">{p.code}</td>
                    <td className="px-4 py-3 text-muted">{p.status}</td>
                    <td className="px-4 py-3 text-muted">
                      {p.startDate || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </main>
  );
}
