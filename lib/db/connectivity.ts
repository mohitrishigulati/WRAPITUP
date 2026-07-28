import "server-only";

import { db } from "@/lib/db";

export async function isDatabaseReachable(): Promise<boolean> {
  if (!process.env.DATABASE_URL?.trim()) return false;
  try {
    await db.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}

export class DatabaseUnavailableError extends Error {
  constructor(message = "Database is unavailable") {
    super(message);
    this.name = "DatabaseUnavailableError";
  }
}
