import { demoUsers } from './users';

export type EmployeeStatus = 'Active' | 'Inactive';

export type Employee = {
  id: number;
  name: string;
  email: string;
  department: string;
  location: string;
  code: string;
  status: EmployeeStatus;
};

export const initialEmployees: Employee[] = demoUsers
  .filter((u) => u.role === 'employee')
  .map((u, index) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    department: 'Default Department',
    location: 'Default Location',
    code: String(index + 1).padStart(3, '0'),
    status: 'Active' as const,
  }));
