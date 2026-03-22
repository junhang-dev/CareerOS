import path from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const rootEnvPath = path.resolve(currentDirectory, "../../.env");

config({ path: rootEnvPath });

const connectionString = process.env.DATABASE_URL ?? "";

if (!connectionString) {
  console.warn("DATABASE_URL is not set. drizzle-kit commands will require it.");
}

export default defineConfig({
  out: "./migrations/generated",
  schema: "./src/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: connectionString
  }
});
