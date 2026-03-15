import prisma from "./prisma";

export type ClientStatus = "Active" | "Inactive";

export type Client = {
  id: number;
  name: string;
  nickname?: string;
  email: string;
  country: string;
  address?: string;
  city?: string;
  stateRegion?: string;
  zip?: string;
  contactNumber?: string;
  defaultRate?: string;
  fixedBidMode: boolean;
  status: ClientStatus;
};

export async function getClients(): Promise<Client[]> {
  const clients = await prisma.client.findMany();
  return clients.map((c: any) => ({
    ...c,
    status: c.status as ClientStatus,
    nickname: c.nickname ?? undefined,
    address: c.address ?? undefined,
    city: c.city ?? undefined,
    stateRegion: c.stateRegion ?? undefined,
    zip: c.zip ?? undefined,
    contactNumber: c.contactNumber ?? undefined,
    defaultRate: c.defaultRate ?? undefined,
    fixedBidMode: c.fixedBidMode,
  }));
}

export async function createClient(data: Omit<Client, "id">): Promise<Client> {
  const client = await prisma.client.create({
    data
  });
  return {
    ...client,
    status: client.status as ClientStatus,
    nickname: client.nickname ?? undefined,
    address: client.address ?? undefined,
    city: client.city ?? undefined,
    stateRegion: client.stateRegion ?? undefined,
    zip: client.zip ?? undefined,
    contactNumber: client.contactNumber ?? undefined,
    defaultRate: client.defaultRate ?? undefined,
    fixedBidMode: client.fixedBidMode,
  };
}

export async function updateClient(id: number, data: Partial<Client>): Promise<Client> {
  const client = await prisma.client.update({
    where: { id },
    data
  });
  return {
    ...client,
    status: client.status as ClientStatus,
    nickname: client.nickname ?? undefined,
    address: client.address ?? undefined,
    city: client.city ?? undefined,
    stateRegion: client.stateRegion ?? undefined,
    zip: client.zip ?? undefined,
    contactNumber: client.contactNumber ?? undefined,
    defaultRate: client.defaultRate ?? undefined,
    fixedBidMode: client.fixedBidMode,
  };
}

export async function deleteClient(id: number): Promise<void> {
  await prisma.client.delete({
    where: { id }
  });
}
