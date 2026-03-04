import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const connectionString = process.env.DATABASE_URL;

let prisma: PrismaClient;

if (globalForPrisma.prisma) {
    prisma = globalForPrisma.prisma;
} else {
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    prisma = new PrismaClient({ adapter, log: ["query"] });
}

export { prisma };

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
