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
  startDate: string; // YYYY-MM-DD
  dueDate?: string;
  reportedTo?: string;
  status: TaskStatus;
  description?: string;
  billingType: TaskBillingType;
};

export async function getTasks(): Promise<Task[]> {
  const tasks = await prisma.$queryRaw<any[]>`SELECT * FROM "Task"`;
  const relations = await prisma.$queryRaw<any[]>`SELECT * FROM "_AssigneeTasks"`;

  return tasks.map(t => ({
    ...t,
    status: t.status as TaskStatus,
    billingType: t.billingType as TaskBillingType,
    assigneeIds: relations.filter(r => r.B === t.id).map(r => r.A),
    description: t.description ?? undefined,
  }));
}

export async function createTask(data: Omit<Task, "id">): Promise<Task> {
  const { assigneeIds, ...rest } = data;

  const result = await prisma.$queryRaw<any[]>`
    INSERT INTO "Task" (
      "projectId", "projectName", "name", "workedHours", 
      "startDate", "dueDate", "reportedTo", "status", "description", "billingType"
    ) VALUES (
      ${rest.projectId}, ${rest.projectName}, ${rest.name}, ${rest.workedHours}, 
      ${rest.startDate}, ${rest.dueDate || null}, ${rest.reportedTo || null}, ${rest.status}, ${rest.description || null}, ${rest.billingType}
    ) RETURNING *
  `;
  const task = result[0];

  if (assigneeIds && assigneeIds.length > 0) {
    for (const empId of assigneeIds) {
      await prisma.$executeRaw`
        INSERT INTO "_AssigneeTasks" ("A", "B") VALUES (${empId}, ${task.id})
      `;
    }
  }

  return {
    ...task,
    status: task.status as TaskStatus,
    billingType: task.billingType as TaskBillingType,
    assigneeIds: assigneeIds ?? [],
    description: task.description ?? undefined,
  };
}

export async function updateTask(id: number, data: Partial<Task>): Promise<Task> {
  const { assigneeIds, ...rest } = data;

  const result = await prisma.$queryRaw<any[]>`
    UPDATE "Task"
    SET 
      "projectId" = COALESCE(${rest.projectId || null}, "projectId"),
      "projectName" = COALESCE(${rest.projectName || null}, "projectName"),
      "name" = COALESCE(${rest.name || null}, "name"),
      "workedHours" = COALESCE(${rest.workedHours ?? null}, "workedHours"),
      "startDate" = COALESCE(${rest.startDate || null}, "startDate"),
      "dueDate" = COALESCE(${rest.dueDate || null}, "dueDate"),
      "reportedTo" = COALESCE(${rest.reportedTo || null}, "reportedTo"),
      "status" = COALESCE(${rest.status || null}, "status"),
      "description" = COALESCE(${rest.description || null}, "description"),
      "billingType" = COALESCE(${rest.billingType || null}, "billingType")
    WHERE "id" = ${id}
    RETURNING *
  `;
  const task = result[0];

  if (assigneeIds) {
    await prisma.$executeRaw`DELETE FROM "_AssigneeTasks" WHERE "B" = ${id}`;
    for (const empId of assigneeIds) {
      await prisma.$executeRaw`
        INSERT INTO "_AssigneeTasks" ("A", "B") VALUES (${empId}, ${id})
      `;
    }
  }

  const currentRelations = await prisma.$queryRaw<any[]>`SELECT "A" FROM "_AssigneeTasks" WHERE "B" = ${id}`;

  return {
    ...task,
    status: task.status as TaskStatus,
    billingType: task.billingType as TaskBillingType,
    assigneeIds: currentRelations.map(r => r.A),
    description: task.description ?? undefined,
  };
}

export async function deleteTask(id: number): Promise<void> {
  await prisma.$executeRaw`DELETE FROM "_AssigneeTasks" WHERE "B" = ${id}`;
  await prisma.$executeRaw`DELETE FROM "Task" WHERE "id" = ${id}`;
}

// initialTasks export removed, use fetchTasksAction instead
