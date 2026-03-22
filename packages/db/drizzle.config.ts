import { defineConfig } from "drizzle-kit";

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

