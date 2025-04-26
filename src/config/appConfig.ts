import { z } from "zod";
import dotenv from "dotenv";
dotenv.config();
// dotenv.config() loads environment variables from a .env file into process.env

const appSchema = z.object({
  PORT: z.coerce.number(),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  BASE_URL: z.string(),
  REDIS_URL: z.string(),
  JWT_ACCESS_SECRETE: z.string(),
  JWT_REFRESH_SECRETE: z.string(),
  CLIENT_URL: z.string(),
  POSTGRES_URL: z.string(),
});

const appConfig = appSchema.parse(process.env);

export default appConfig;
