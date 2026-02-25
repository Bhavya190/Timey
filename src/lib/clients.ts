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
  const clients = await prisma.$queryRaw<any[]>`SELECT * FROM "Client"`;
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
  const result = await prisma.$queryRaw<any[]>`
    INSERT INTO "Client" ("name", "nickname", "email", "country", "address", "city", "stateRegion", "zip", "contactNumber", "defaultRate", "fixedBidMode", "status")
    VALUES (${data.name}, ${data.nickname || null}, ${data.email}, ${data.country}, ${data.address || null}, ${data.city || null}, ${data.stateRegion || null}, ${data.zip || null}, ${data.contactNumber || null}, ${data.defaultRate || null}, ${data.fixedBidMode}, ${data.status})
    RETURNING *
  `;
  const client = result[0];
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
  const result = await prisma.$queryRaw<any[]>`
    UPDATE "Client"
    SET 
      "name" = COALESCE(${data.name || null}, "name"),
      "nickname" = COALESCE(${data.nickname || null}, "nickname"),
      "email" = COALESCE(${data.email || null}, "email"),
      "country" = COALESCE(${data.country || null}, "country"),
      "address" = COALESCE(${data.address || null}, "address"),
      "city" = COALESCE(${data.city || null}, "city"),
      "stateRegion" = COALESCE(${data.stateRegion || null}, "stateRegion"),
      "zip" = COALESCE(${data.zip || null}, "zip"),
      "contactNumber" = COALESCE(${data.contactNumber || null}, "contactNumber"),
      "defaultRate" = COALESCE(${data.defaultRate || null}, "defaultRate"),
      "fixedBidMode" = COALESCE(${data.fixedBidMode ?? null}, "fixedBidMode"),
      "status" = COALESCE(${data.status || null}, "status")
    WHERE "id" = ${id}
    RETURNING *
  `;
  const client = result[0];
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

// initialClients export removed, use fetchClientsAction instead
