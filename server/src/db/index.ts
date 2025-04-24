import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import dotenv from "dotenv";

// Import schema
import * as schema from "./schema.js";

// Initialize environment variables
dotenv.config();

// Database connection configuration
const connection = await mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "mindmap",
  ssl: process.env.DB_SSL === "true" ? {} : undefined,
});

// Initialize Drizzle ORM
export const db = drizzle(connection, { schema });

// Export schema for use in other files
export { schema };
