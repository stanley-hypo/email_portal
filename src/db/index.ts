import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
    throw new Error(
        "DATABASE_URL environment variable is not set. Please check your .env file."
    );
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// Handle pool errors
pool.on("error", (err) => {
    console.error("Unexpected database pool error:", err);
    // Don't exit the process, just log the error
    // The next query will attempt to reconnect
});

// Test connection on startup
pool.query("SELECT NOW()", (err) => {
    if (err) {
        console.error("Failed to connect to database:", err.message);
        console.error("Please verify your DATABASE_URL is correct");
    } else {
        console.log("Database connection established successfully");
    }
});

export const db = drizzle(pool, { schema });
