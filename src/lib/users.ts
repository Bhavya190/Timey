export type Role = "admin" | "employee";

export type User = {
  id: number;
  name: string;
  email: string;
  password: string;
  role: Role;
};

export const demoUsers: User[] = [
  {
    id: 1,
    name: "Admin One",
    email: "admin@timey.com",
    password: "admin123",
    role: "admin",
  },
  {
    id: 2,
    name: "Employee One",
    email: "emp1@timey.com",
    password: "emp123",
    role: "employee",
  },
  {
    id: 3,
    name: "Employee Two",
    email: "emp2@timey.com",
    password: "emp123",
    role: "employee",
  },
  {
    id: 4,
    name: "Employee Three",
    email: "emp3@timey.com",
    password: "emp123",
    role: "employee",
  },
  {
    id: 5,
    name: "Employee Four",
    email: "emp4@timey.com",
    password: "emp123",
    role: "employee",
  },
  {
    id: 6,
    name: "Employee Five",
    email: "emp5@timey.com",
    password: "emp123",
    role: "employee",
  },
];
