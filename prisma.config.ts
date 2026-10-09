import { config } from "dotenv";
import { defineConfig } from "prisma/config";

config({ path: [".env.local", ".env"], quiet: true });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations", seed: "tsx prisma/seed.ts" },
  // generate não precisa de URL; migrate/seed exigem DIRECT_URL (porta 5432).
  datasource: { url: process.env.DIRECT_URL ?? "" },
});
