import { Pool } from "pg";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

export const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  user: process.env.DB_USERNAME || "david.gross",
  password: process.env.DB_PASSWORD || "fishreport123",
  database: process.env.DB_NAME || "fishreport",
});

export const db = {
  query: (text: string, params?: any[]) => pool.query(text, params),
};
