import prisma from "./prisma";

export type ProjectStatus = "Active" | "On Hold" | "Completed";

export type Project = {
  id: number;
  name: string;
  code: string;
  clientId: number;
  clientName: string;
  teamLeadId: number | null;
  managerId: number | null;
  teamMemberIds?: number[]; // employee ids
  defaultBillingRate?: string;
  billingType?: "fixed" | "hourly";
  fixedCost?: string;
  startDate?: string;
  endDate?: string;
  invoiceFileName?: string;
  description?: string;
  duration?: string;
  estimatedCost?: string;
  budget?: string;
  totalHours?: number;
  status: ProjectStatus;
};

export async function getProjects(): Promise<Project[]> {
  const projects = await prisma.$queryRaw<any[]>`SELECT * FROM "Project"`;
  const relations = await prisma.$queryRaw<any[]>`SELECT * FROM "_TeamMembers"`;

  return projects.map(p => ({
    ...p,
    status: p.status as ProjectStatus,
    billingType: p.billingType as "fixed" | "hourly" | undefined,
    teamMemberIds: relations.filter(r => r.B === p.id).map(r => r.A),
    defaultBillingRate: p.defaultBillingRate ?? undefined,
    fixedCost: p.fixedCost ?? undefined,
    startDate: p.startDate ?? undefined,
    endDate: p.endDate ?? undefined,
    invoiceFileName: p.invoiceFileName ?? undefined,
    description: p.description ?? undefined,
    duration: p.duration ?? undefined,
    estimatedCost: p.estimatedCost ?? undefined,
    budget: p.estimatedCost ?? undefined,
    totalHours: 0, // Placeholder
  }));
}

export async function createProject(data: Omit<Project, "id">): Promise<Project> {
  const { teamMemberIds, ...rest } = data;

  const result = await prisma.$queryRaw<any[]>`
    INSERT INTO "Project" ("name", "code", "clientId", "clientName", "teamLeadId", "managerId", "defaultBillingRate", "billingType", "fixedCost", "startDate", "endDate", "invoiceFileName", "description", "duration", "estimatedCost", "status")
    VALUES (${rest.name}, ${rest.code}, ${rest.clientId}, ${rest.clientName}, ${rest.teamLeadId}, ${rest.managerId}, ${rest.defaultBillingRate || null}, ${rest.billingType || null}, ${rest.fixedCost || null}, ${rest.startDate || null}, ${rest.endDate || null}, ${rest.invoiceFileName || null}, ${rest.description || null}, ${rest.duration || null}, ${rest.estimatedCost || null}, ${rest.status})
    RETURNING *
  `;
  const project = result[0];

  if (teamMemberIds && teamMemberIds.length > 0) {
    for (const empId of teamMemberIds) {
      await prisma.$executeRaw`
        INSERT INTO "_TeamMembers" ("A", "B") VALUES (${empId}, ${project.id})
      `;
    }
  }

  return {
    ...project,
    status: project.status as ProjectStatus,
    billingType: project.billingType as "fixed" | "hourly" | undefined,
    teamMemberIds: teamMemberIds || [],
    defaultBillingRate: project.defaultBillingRate ?? undefined,
    fixedCost: project.fixedCost ?? undefined,
    startDate: project.startDate ?? undefined,
    endDate: project.endDate ?? undefined,
    invoiceFileName: project.invoiceFileName ?? undefined,
    description: project.description ?? undefined,
    duration: project.duration ?? undefined,
    estimatedCost: project.estimatedCost ?? undefined,
    budget: project.estimatedCost ?? undefined,
    totalHours: 0,
  };
}

export async function updateProject(id: number, data: Partial<Project>): Promise<Project> {
  const { teamMemberIds, ...rest } = data;

  const result = await prisma.$queryRaw<any[]>`
    UPDATE "Project"
    SET 
      "name" = COALESCE(${rest.name || null}, "name"),
      "code" = COALESCE(${rest.code || null}, "code"),
      "clientId" = COALESCE(${rest.clientId || null}, "clientId"),
      "clientName" = COALESCE(${rest.clientName || null}, "clientName"),
      "teamLeadId" = COALESCE(${rest.teamLeadId || null}, "teamLeadId"),
      "managerId" = COALESCE(${rest.managerId || null}, "managerId"),
      "defaultBillingRate" = COALESCE(${rest.defaultBillingRate || null}, "defaultBillingRate"),
      "billingType" = COALESCE(${rest.billingType || null}, "billingType"),
      "fixedCost" = COALESCE(${rest.fixedCost || null}, "fixedCost"),
      "startDate" = COALESCE(${rest.startDate || null}, "startDate"),
      "endDate" = COALESCE(${rest.endDate || null}, "endDate"),
      "invoiceFileName" = COALESCE(${rest.invoiceFileName || null}, "invoiceFileName"),
      "description" = COALESCE(${rest.description || null}, "description"),
      "duration" = COALESCE(${rest.duration || null}, "duration"),
      "estimatedCost" = COALESCE(${rest.estimatedCost || null}, "estimatedCost"),
      "status" = COALESCE(${rest.status || null}, "status")
    WHERE "id" = ${id}
    RETURNING *
  `;
  const project = result[0];

  if (teamMemberIds) {
    await prisma.$executeRaw`DELETE FROM "_TeamMembers" WHERE "B" = ${id}`;
    for (const empId of teamMemberIds) {
      await prisma.$executeRaw`
        INSERT INTO "_TeamMembers" ("A", "B") VALUES (${empId}, ${id})
      `;
    }
  }

  const currentRelations = await prisma.$queryRaw<any[]>`SELECT "A" FROM "_TeamMembers" WHERE "B" = ${id}`;

  return {
    ...project,
    status: project.status as ProjectStatus,
    billingType: project.billingType as "fixed" | "hourly" | undefined,
    teamMemberIds: currentRelations.map(r => r.A),
    defaultBillingRate: project.defaultBillingRate ?? undefined,
    fixedCost: project.fixedCost ?? undefined,
    startDate: project.startDate ?? undefined,
    endDate: project.endDate ?? undefined,
    invoiceFileName: project.invoiceFileName ?? undefined,
    description: project.description ?? undefined,
    duration: project.duration ?? undefined,
    estimatedCost: project.estimatedCost ?? undefined,
    budget: project.estimatedCost ?? undefined,
    totalHours: 0,
  };
}

export async function deleteProject(id: number): Promise<void> {
  // Manual cleanup of many-to-many relationship
  await prisma.$executeRaw`DELETE FROM "_TeamMembers" WHERE "B" = ${id}`;
  // Delete the project
  await prisma.$executeRaw`DELETE FROM "Project" WHERE "id" = ${id}`;
}

// initialProjects export removed, use fetchProjectsAction instead
