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
  const projects = await prisma.project.findMany({
    include: {
      teamMembers: {
        select: { id: true }
      }
    }
  });

  return projects.map(p => ({
    ...p,
    status: p.status as ProjectStatus,
    billingType: p.billingType as "fixed" | "hourly" | undefined,
    teamMemberIds: p.teamMembers.map(tm => tm.id),
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
  const { teamMemberIds, budget, totalHours, ...rest } = data;

  const project = await prisma.project.create({
    data: {
      ...rest,
      estimatedCost: budget || rest.estimatedCost, // Map budget to estimatedCost
      teamMembers: teamMemberIds ? {
        connect: teamMemberIds.map(id => ({ id }))
      } : undefined
    },
    include: {
      teamMembers: {
        select: { id: true }
      }
    }
  });

  return {
    ...project,
    status: project.status as ProjectStatus,
    billingType: project.billingType as "fixed" | "hourly" | undefined,
    teamMemberIds: project.teamMembers.map(tm => tm.id),
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
  const { teamMemberIds, budget, totalHours, ...rest } = data;

  const project = await prisma.project.update({
    where: { id },
    data: {
      ...rest,
      estimatedCost: budget || rest.estimatedCost,
      teamMembers: teamMemberIds ? {
        set: teamMemberIds.map(id => ({ id }))
      } : undefined
    },
    include: {
      teamMembers: {
        select: { id: true }
      }
    }
  });

  return {
    ...project,
    status: project.status as ProjectStatus,
    billingType: project.billingType as "fixed" | "hourly" | undefined,
    teamMemberIds: project.teamMembers.map(tm => tm.id),
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
  await prisma.project.delete({
    where: { id }
  });
}
