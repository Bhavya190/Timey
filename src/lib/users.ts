// users.ts (or employees.ts)
import prisma from "./prisma";

// Auth / basic user
export type Role = "admin" | "employee" | "teamLead";

export type User = {
  id: number;
  name: string;
  email: string;
  password: string;
  role: Role;
};

// Full employee profile
export type Employee = {
  id: number;
  code: string;
  email: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  password: string;
  role: Role;
  department: string;
  location: string;
  shift: "day" | "evening" | "night";

  // Details
  address: string;
  city: string;
  stateRegion: string;
  country: string;
  zip: string;
  phone: string;
  hireDate: string;
  terminationDate?: string;

  // Billing
  workType: "standard" | "overtime";
  billingType: "hourly" | "monthly";
  employeeRate: string;
  employeeCurrency: string;
  billingRateType: "fixed" | "hourly";
  billingCurrency: string;
  billingStart: string;
  billingEnd: string;
  avatarUrl?: string;
  emailNotifications?: boolean;
  weeklyReport?: boolean;
  securityAlerts?: boolean;
};

export async function getUsers(): Promise<User[]> {
  const employees = await prisma.employee.findMany();
  return employees.map(emp => ({
    id: emp.id,
    name: `${emp.firstName} ${emp.lastName}`,
    email: emp.email,
    password: emp.password,
    role: emp.role as Role,
  }));
}

export async function getEmployees(): Promise<Employee[]> {
  // @ts-ignore - Prisma return types might need mapping to match components exactly
  return await prisma.employee.findMany();
}

export async function createEmployee(data: Omit<Employee, "id">): Promise<Employee> {
  // @ts-ignore
  return await prisma.employee.create({
    data
  });
}

export async function updateEmployeeProfile(id: number, data: Partial<Employee>): Promise<Employee> {
  // @ts-ignore
  return await prisma.employee.update({
    where: { id },
    data
  });
}

export async function deleteEmployee(id: number): Promise<void> {
  await prisma.employee.delete({
    where: { id }
  });
}

// Temporary exports removed as all components are now updated to use server actions
