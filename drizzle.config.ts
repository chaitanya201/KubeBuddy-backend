import { defineConfig, Config } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema/*",
  out: "./drizzle",
  verbose: true,
  strict: true,

  dbCredentials: {
    url: process.env.POSTGRES_URL!,
  },
}) satisfies Config;
