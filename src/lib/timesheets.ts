import prisma from "./prisma";
import type { Timesheet } from "@/types";

export async function getTimesheets(): Promise<Timesheet[]> {
    const timesheets = await prisma.$queryRaw<any[]>`SELECT * FROM "Timesheet"`;
    return timesheets.map(ts => ({
        ...ts,
        status: ts.status || "Not Submitted"
    }));
}

export async function getEmployeeTimesheets(employeeId: number): Promise<Timesheet[]> {
    const timesheets = await prisma.$queryRaw<any[]>`
    SELECT * FROM "Timesheet" WHERE "employeeId" = ${employeeId}
  `;
    return timesheets.map(ts => ({
        ...ts,
        status: ts.status || "Not Submitted"
    }));
}

export async function upsertTimesheet(data: Omit<Timesheet, "id">): Promise<Timesheet> {
    const { employeeId, weekStart, status } = data;

    // Try to find existing
    const existing = await prisma.$queryRaw<any[]>`
    SELECT * FROM "Timesheet" 
    WHERE "employeeId" = ${employeeId} AND "weekStart" = ${weekStart}
  `;

    if (existing.length > 0) {
        const updated = await prisma.$queryRaw<any[]>`
      UPDATE "Timesheet"
      SET "status" = ${status}
      WHERE "id" = ${existing[0].id}
      RETURNING *
    `;
        return updated[0];
    } else {
        const created = await prisma.$queryRaw<any[]>`
      INSERT INTO "Timesheet" ("employeeId", "weekStart", "status")
      VALUES (${employeeId}, ${weekStart}, ${status})
      RETURNING *
    `;
        return created[0];
    }
}
