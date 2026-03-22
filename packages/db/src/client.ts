import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

let database: PostgresJsDatabase<typeof schema> | null = null;

export function createDatabaseClient(connectionString = process.env.DATABASE_URL) {
  if (!connectionString) {
    throw new Error("DATABASE_URL is required to create the PostgreSQL client.");
  }

  const client = postgres(connectionString, {
    max: 1,
    prepare: false
  });

  return drizzle(client, { schema });
}

export function getDatabaseClient() {
  if (!database) {
    database = createDatabaseClient();
  }

  return database;
}

