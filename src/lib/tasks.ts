import prisma from "./prisma";

export type TaskStatus = "Not Started" | "In Progress" | "Completed";
export type TaskBillingType = "billable" | "non-billable";

export type Task = {
  id: number;
  projectId: number;
  projectName: string;
  name: string;
  workedHours: number;
  assigneeIds: number[];
  date: string; // YYYY-MM-DD
  dueDate?: string;
  reportedTo?: string;
  status: TaskStatus;
  description?: string;
  billingType: TaskBillingType;
};

export async function getTasks(): Promise<Task[]> {
  const tasks = await prisma.task.findMany({
    include: {
      assignees: {
        select: { id: true }
      }
    }
  });

  return tasks.map(t => ({
    id: t.id,
    projectId: t.projectId,
    projectName: t.projectName,
    name: t.name,
    workedHours: t.workedHours,
    date: t.startDate,
    dueDate: t.dueDate ?? undefined,
    reportedTo: t.reportedTo ?? undefined,
    status: t.status as TaskStatus,
    description: t.description ?? undefined,
    billingType: t.billingType as TaskBillingType,
    assigneeIds: t.assignees.map(a => a.id),
  }));
}

export async function createTask(data: Omit<Task, "id">): Promise<Task> {
  const { assigneeIds, date, ...rest } = data;

  const task = await prisma.task.create({
    data: {
      ...rest,
      startDate: date,
      assignees: assigneeIds ? {
        connect: assigneeIds.map(id => ({ id }))
      } : undefined
    },
    include: {
      assignees: {
        select: { id: true }
      }
    }
  });

  return {
    id: task.id,
    projectId: task.projectId,
    projectName: task.projectName,
    name: task.name,
    workedHours: task.workedHours,
    date: task.startDate,
    dueDate: task.dueDate ?? undefined,
    reportedTo: task.reportedTo ?? undefined,
    status: task.status as TaskStatus,
    description: task.description ?? undefined,
    billingType: task.billingType as TaskBillingType,
    assigneeIds: task.assignees.map(a => a.id),
  };
}

export async function updateTask(id: number, data: Partial<Task>): Promise<Task> {
  const { assigneeIds, date, ...rest } = data;

  const task = await prisma.task.update({
    where: { id },
    data: {
      ...rest,
      startDate: date,
      assignees: assigneeIds ? {
        set: assigneeIds.map(id => ({ id }))
      } : undefined
    },
    include: {
      assignees: {
        select: { id: true }
      }
    }
  });

  return {
    id: task.id,
    projectId: task.projectId,
    projectName: task.projectName,
    name: task.name,
    workedHours: task.workedHours,
    date: task.startDate,
    dueDate: task.dueDate ?? undefined,
    reportedTo: task.reportedTo ?? undefined,
    status: task.status as TaskStatus,
    description: task.description ?? undefined,
    billingType: task.billingType as TaskBillingType,
    assigneeIds: task.assignees.map(a => a.id),
  };
}

export async function deleteTask(id: number): Promise<void> {
  await prisma.task.delete({
    where: { id }
  });
}
