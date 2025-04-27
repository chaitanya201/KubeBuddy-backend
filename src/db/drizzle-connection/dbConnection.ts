import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import appConfig from "../../config/appConfig";
import * as schema from "../schema/schema";

const neonClient = neon(appConfig.POSTGRES_URL);
const db = drizzle({ logger: true, schema, client: neonClient });

export default db;
