export type ClientStatus = "Active" | "Inactive";

export type Client = {
  id: number;
  name: string;
  nickname?: string;
  email: string;
  country: string;
  status: ClientStatus;
};

export const initialClients: Client[] = [
  {
    id: 1,
    name: "Acme Corporation",
    nickname: "Acme",
    email: "contact@acme.com",
    country: "United States",
    status: "Active",
  },
  {
    id: 2,
    name: "Global Solutions Pvt Ltd",
    nickname: "Global",
    email: "info@globalsolutions.in",
    country: "India",
    status: "Active",
  },
  {
    id: 3,
    name: "Nordic Tech AB",
    nickname: "Nordic",
    email: "hello@nordictech.se",
    country: "Sweden",
    status: "Inactive",
  },
  {
    id: 4,
    name: "BrightStart Education",
    nickname: "BrightStart",
    email: "hello@brightstart.edu",
    country: "United Kingdom",
    status: "Active",
  },
  {
    id: 5,
    name: "FinEdge Capital",
    nickname: "FinEdge",
    email: "accounts@finedgecapital.com",
    country: "United States",
    status: "Active",
  },
  {
    id: 6,
    name: "Inhouse HR",
    nickname: "HR Internal",
    email: "hr@yourcompany.internal",
    country: "India",
    status: "Active",
  },
  {
    id: 7,
    name: "Urban Style Retail",
    nickname: "UrbanStyle",
    email: "support@urbanstyle-retail.com",
    country: "United States",
    status: "Active",
  },
  {
    id: 8,
    name: "HealthSync Clinics",
    nickname: "HealthSync",
    email: "it@healthsyncclinics.com",
    country: "Canada",
    status: "Active",
  },
  {
    id: 9,
    name: "Inhouse Product",
    nickname: "Internal Product",
    email: "product@yourcompany.internal",
    country: "India",
    status: "Active",
  },
  {
    id: 10,
    name: "HelpDesk Plus",
    nickname: "HelpDesk",
    email: "info@helpdeskplus.io",
    country: "United States",
    status: "Active",
  },
];
