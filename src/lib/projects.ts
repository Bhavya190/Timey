export type ProjectStatus = "Active" | "On Hold" | "Completed";

export type Project = {
  id: number;
  name: string;
  code: string;
  clientId: number;          // ← added
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
  status: ProjectStatus;
};

export const initialProjects: Project[] = [
  {
    id: 1,
    name: "Website Redesign",
    code: "PRJ-001",
    clientId: 1,
    clientName: "Acme Corporation",
    status: "Active",
    startDate: "2025-01-10",
    teamLeadId: null,
    managerId: null,
    billingType: "hourly",
    defaultBillingRate: "60",
    description:
      "Modernize the corporate marketing site and improve conversion.",
    // Employees assigned to this project (example: 2 & 3)
    teamMemberIds: [2, 3],
  },
  {
    id: 2,
    name: "Mobile App MVP",
    code: "PRJ-002",
    clientId: 2,
    clientName: "Global Solutions Pvt Ltd",
    status: "On Hold",
    startDate: "2025-02-01",
    teamLeadId: null,
    managerId: null,
    billingType: "fixed",
    fixedCost: "18000",
    description:
      "Initial MVP for Android and iOS to validate product-market fit.",
    teamMemberIds: [2, 4],
  },
  {
    id: 3,
    name: "Analytics Dashboard",
    code: "PRJ-003",
    clientId: 3,
    clientName: "Nordic Tech AB",
    status: "Completed",
    startDate: "2024-11-15",
    endDate: "2025-01-30",
    teamLeadId: null,
    managerId: null,
    billingType: "hourly",
    defaultBillingRate: "75",
    description: "Executive analytics dashboard with real-time KPIs.",
    teamMemberIds: [3, 5],
  },

  // New projects
  {
    id: 4,
    name: "Marketing Site Refresh",
    code: "PRJ-004",
    clientId: 4,
    clientName: "BrightStart Education",
    status: "Active",
    startDate: "2025-03-05",
    teamLeadId: null,
    managerId: null,
    billingType: "fixed",
    fixedCost: "12000",
    estimatedCost: "10000",
    description:
      "Landing pages and SEO improvements for new product launch.",
    teamMemberIds: [2],
  },
  {
    id: 5,
    name: "Client Self‑Service Portal",
    code: "PRJ-005",
    clientId: 5,
    clientName: "FinEdge Capital",
    status: "Active",
    startDate: "2025-04-12",
    teamLeadId: null,
    managerId: null,
    billingType: "hourly",
    defaultBillingRate: "85",
    description:
      "Portal for clients to view invoices, reports, and support tickets.",
    teamMemberIds: [4, 5],
  },
  {
    id: 6,
    name: "HR Internal Tools",
    code: "PRJ-006",
    clientId: 6,
    clientName: "Inhouse HR",
    status: "On Hold",
    startDate: "2025-05-01",
    teamLeadId: null,
    managerId: null,
    billingType: "hourly",
    defaultBillingRate: "55",
    description:
      "Timesheet, leave management, and approvals for internal teams.",
    teamMemberIds: [3],
  },
  {
    id: 7,
    name: "E‑commerce Upgrade",
    code: "PRJ-007",
    clientId: 7,
    clientName: "Urban Style Retail",
    status: "Active",
    startDate: "2025-06-10",
    teamLeadId: null,
    managerId: null,
    billingType: "fixed",
    fixedCost: "25000",
    description:
      "Upgrade checkout, introduce wishlist, and improve performance.",
    teamMemberIds: [2, 5],
  },
  {
    id: 8,
    name: "Data Migration Project",
    code: "PRJ-008",
    clientId: 8,
    clientName: "HealthSync Clinics",
    status: "Completed",
    startDate: "2024-09-01",
    endDate: "2025-01-05",
    teamLeadId: null,
    managerId: null,
    billingType: "hourly",
    defaultBillingRate: "90",
    description:
      "Migrate legacy patient data to new cloud platform.",
    teamMemberIds: [4],
  },
  {
    id: 9,
    name: "Support & Maintenance",
    code: "PRJ-009",
    clientId: 1,
    clientName: "Acme Corporation",
    status: "Active",
    startDate: "2025-07-01",
    teamLeadId: null,
    managerId: null,
    billingType: "hourly",
    defaultBillingRate: "50",
    description:
      "Ongoing maintenance and minor enhancements for existing systems.",
    teamMemberIds: [2],
  },
  {
    id: 10,
    name: "Internal Design System",
    code: "PRJ-010",
    clientId: 9,
    clientName: "Inhouse Product",
    status: "On Hold",
    startDate: "2025-03-20",
    teamLeadId: null,
    managerId: null,
    billingType: "hourly",
    defaultBillingRate: "65",
    description:
      "Shared design system and component library for all apps.",
    teamMemberIds: [3, 4],
  },
];
