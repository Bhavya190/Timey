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
  status: TaskStatus;
  description?: string;
  billingType: TaskBillingType; // NEW
};

export const initialTasks: Task[] = [
  // Project 1: Website Redesign
  {
    id: 1,
    projectId: 1,
    projectName: "Website Redesign",
    name: "Create homepage layout",
    workedHours: 2,
    assigneeIds: [2],
    date: "2025-12-15",
    status: "Completed",
    description: "Created initial homepage wireframe and sections structure.",
    billingType: "billable",
  },
  {
    id: 2,
    projectId: 1,
    projectName: "Website Redesign",
    name: "Implement responsive styles",
    workedHours: 3,
    assigneeIds: [2, 3],
    date: "2025-12-16",
    status: "In Progress",
    description: "Added responsive breakpoints for header and hero section.",
    billingType: "billable",
  },
  {
    id: 3,
    projectId: 1,
    projectName: "Website Redesign",
    name: "Set up design system",
    workedHours: 1.5,
    assigneeIds: [3],
    date: "2025-12-17",
    status: "In Progress",
    description: "Defined color tokens and typography scale in Figma.",
    billingType: "non-billable",
  },
  {
    id: 4,
    projectId: 1,
    projectName: "Website Redesign",
    name: "Integrate CMS content",
    workedHours: 2.75,
    assigneeIds: [2, 4],
    date: "2025-12-18",
    status: "Not Started",
    billingType: "billable",
  },

  // Project 2: Mobile App
  {
    id: 5,
    projectId: 2,
    projectName: "Mobile App",
    name: "Set up authentication flow",
    workedHours: 4,
    assigneeIds: [3],
    date: "2025-12-15",
    status: "Completed",
    description: "Implemented login, logout and session handling.",
    billingType: "billable",
  },
  {
    id: 6,
    projectId: 2,
    projectName: "Mobile App",
    name: "Build dashboard screen",
    workedHours: 2.5,
    assigneeIds: [3, 5],
    date: "2025-12-16",
    status: "In Progress",
    description: "Created cards layout and basic navigation.",
    billingType: "billable",
  },
  {
    id: 7,
    projectId: 2,
    projectName: "Mobile App",
    name: "API error handling",
    workedHours: 1,
    assigneeIds: [5],
    date: "2025-12-17",
    status: "Not Started",
    billingType: "non-billable",
  },

  // Project 3: Internal Tools
  {
    id: 8,
    projectId: 3,
    projectName: "Internal Tools",
    name: "Employee list page",
    workedHours: 2,
    assigneeIds: [4],
    date: "2025-12-15",
    status: "Completed",
    description: "Implemented table with pagination and basic filters.",
    billingType: "billable",
  },
  {
    id: 9,
    projectId: 3,
    projectName: "Internal Tools",
    name: "Timesheet summary API",
    workedHours: 3.25,
    assigneeIds: [4, 6],
    date: "2025-12-16",
    status: "In Progress",
    description: "Aggregated hours per employee and per project.",
    billingType: "billable",
  },
  {
    id: 10,
    projectId: 3,
    projectName: "Internal Tools",
    name: "Permissions and roles",
    workedHours: 1.5,
    assigneeIds: [6],
    date: "2025-12-18",
    status: "Not Started",
    billingType: "non-billable",
  },

  // Project 4: Marketing Site
  {
    id: 11,
    projectId: 4,
    projectName: "Marketing Site",
    name: "Landing page hero section",
    workedHours: 2.25,
    assigneeIds: [2],
    date: "2025-12-19",
    status: "In Progress",
    description: "Added headline, CTA button, and background illustration.",
    billingType: "billable",
  },
  {
    id: 12,
    projectId: 4,
    projectName: "Marketing Site",
    name: "SEO meta tags and sitemap",
    workedHours: 1.75,
    assigneeIds: [5],
    date: "2025-12-19",
    status: "Not Started",
    billingType: "billable",
  },

  // Project 5: Client Portal
  {
    id: 13,
    projectId: 5,
    projectName: "Client Portal",
    name: "Client dashboard widgets",
    workedHours: 3.5,
    assigneeIds: [3, 4],
    date: "2025-12-20",
    status: "In Progress",
    description:
      "Implemented cards for invoices, tasks, and support tickets.",
    billingType: "billable",
  },
  {
    id: 14,
    projectId: 5,
    projectName: "Client Portal",
    name: "Notification settings page",
    workedHours: 2,
    assigneeIds: [6],
    date: "2025-12-20",
    status: "Not Started",
    billingType: "non-billable",
  },

  // Extra tasks
  {
    id: 15,
    projectId: 1,
    projectName: "Website Redesign",
    name: "Bug fixes from QA",
    workedHours: 1.25,
    assigneeIds: [2],
    date: "2025-12-21",
    status: "In Progress",
    description: "Fixed spacing and alignment issues on mobile.",
    billingType: "billable",
  },
  {
    id: 16,
    projectId: 2,
    projectName: "Mobile App",
    name: "Refactor state management",
    workedHours: 2,
    assigneeIds: [3],
    date: "2025-12-21",
    status: "Not Started",
    billingType: "non-billable",
  },
];
