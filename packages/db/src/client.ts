import path from "node:path";
import { fileURLToPath } from "node:url";
import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { config } from "dotenv";
import postgres from "postgres";
import * as schema from "./schema";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const rootEnvPath = path.resolve(currentDirectory, "../../../.env");

config({ path: rootEnvPath });

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
