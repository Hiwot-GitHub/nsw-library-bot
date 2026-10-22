import "temporal-polyfill/full/global";
import "dotenv/config";
import postgres from "@prisma/orm-postgres/runtime";
import contractJson from "../prisma/contract.json" with { type: "json" };

const globalForPrisma = globalThis as unknown as {
  db: ReturnType<typeof postgres> | undefined;
};

export const db =
  globalForPrisma.db ??
  postgres({
    contractJson,
    url: process.env["DATABASE_URL"]!,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.db = db;
}