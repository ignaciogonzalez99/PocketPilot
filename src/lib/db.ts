import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function createPrismaClient() {
  let connectionString = process.env.DATABASE_URL ?? "";

  // pg v8 treats sslmode=require as verify-full; use uselibpqcompat for standard SSL without strict cert checking
  if (connectionString.includes("db.prisma.io") && !connectionString.includes("uselibpqcompat")) {
    const sep = connectionString.includes("?") ? "&" : "?";
    connectionString += `${sep}uselibpqcompat=true`;
  }

  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
