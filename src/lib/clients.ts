export type ClientStatus = 'Active' | 'Inactive';

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
    name: 'Acme Corporation',
    nickname: 'Acme',
    email: 'contact@acme.com',
    country: 'United States',
    status: 'Active',
  },
  {
    id: 2,
    name: 'Global Solutions Pvt Ltd',
    nickname: 'Global',
    email: 'info@globalsolutions.in',
    country: 'India',
    status: 'Active',
  },
  {
    id: 3,
    name: 'Nordic Tech AB',
    nickname: 'Nordic',
    email: 'hello@nordictech.se',
    country: 'Sweden',
    status: 'Inactive',
  },
];
