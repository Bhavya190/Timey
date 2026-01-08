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
    name: "Royal Bank of Canada",
    nickname: "RBC",
    email: "contact@rbc.com",
    country: "Canada",
    status: "Active",
  },
  {
    id: 2,
    name: "Toronto-Dominion Bank",
    nickname: "TD Bank",
    email: "info@td.com",
    country: "Canada",
    status: "Active",
  },
  {
    id: 3,
    name: "Alimentation Couche-Tard",
    nickname: "Couche-Tard",
    email: "hello@couche-tard.com",
    country: "Canada",
    status: "Inactive",
  },
  {
    id: 4,
    name: "Shopify Inc.",
    nickname: "Shopify",
    email: "hello@shopify.com",
    country: "Canada",
    status: "Active",
  },
  {
    id: 5,
    name: "Enbridge Inc.",
    nickname: "Enbridge",
    email: "accounts@enbridge.com",
    country: "Canada",
    status: "Active",
  },
  {
    id: 6,
    name: "TELUS Corporation",
    nickname: "TELUS",
    email: "hr@telus.internal",
    country: "Canada",
    status: "Active",
  },
  {
    id: 7,
    name: "Amazon Canada",
    nickname: "Amazon CA",
    email: "support@amazon.ca",
    country: "Canada",
    status: "Inactive",
  },
  {
    id: 8,
    name: "Walmart Canada",
    nickname: "Walmart CA",
    email: "it@walmart.ca",
    country: "Canada",
    status: "Active",
  },
  {
    id: 9,
    name: "Grupo Bimbo de Mexico",
    nickname: "Bimbo",
    email: "product@bimbo.mx",
    country: "Mexico",
    status: "Active",
  },
  {
    id: 10,
    name: "CEMEX SAB de CV",
    nickname: "CEMEX",
    email: "info@cemex.com",
    country: "Mexico",
    status: "Active",
  },
];
