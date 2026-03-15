import prisma from "./prisma";
import type { Timesheet } from "@/types";

export async function getTimesheets(): Promise<Timesheet[]> {
    const timesheets = await prisma.timesheet.findMany();
    return timesheets.map(ts => ({
        ...ts,
        status: ts.status || "Not Submitted"
    }));
}

export async function getEmployeeTimesheets(employeeId: number): Promise<Timesheet[]> {
    const timesheets = await prisma.timesheet.findMany({
        where: { employeeId }
    });
    return timesheets.map(ts => ({
        ...ts,
        status: ts.status || "Not Submitted"
    }));
}

export async function upsertTimesheet(data: Omit<Timesheet, "id">): Promise<Timesheet> {
    const { employeeId, weekStart, status } = data;

    return await prisma.timesheet.upsert({
        where: {
            employeeId_weekStart: {
                employeeId,
                weekStart
            }
        },
        update: {
            status
        },
        create: {
            employeeId,
            weekStart,
            status
        }
    });
}
