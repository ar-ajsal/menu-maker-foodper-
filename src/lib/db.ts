
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

// Allow running without a database for development
const hasDbUrl = !!process.env.DATABASE_URL;
export const hasMongo = !!process.env.MONGODB_URI;

if (!hasDbUrl && !hasMongo) {
    console.warn("WARNING: No database configured (DATABASE_URL or MONGODB_URI). Application will run in memory-only mode.");
}

export const pool = hasDbUrl ? new Pool({ connectionString: process.env.DATABASE_URL }) : null;
export const db = hasDbUrl ? drizzle(pool!, { schema }) : null;
