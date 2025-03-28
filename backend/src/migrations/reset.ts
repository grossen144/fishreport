import dotenv from "dotenv";
import { pool } from "../config/database";

// Load environment variables from .env file
dotenv.config();

async function resetDatabase() {
  try {
    // Drop all tables
    await pool.query(`
      DROP TABLE IF EXISTS migrations CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
      DROP TABLE IF EXISTS fishing_trips CASCADE;
      DROP TABLE IF EXISTS trip_catches CASCADE;
      DROP TABLE IF EXISTS fishing_trip_buddies CASCADE;
      DROP TABLE IF EXISTS fishing_buddies CASCADE;
    `);

    console.log("Database reset completed successfully");
  } catch (error) {
    console.error("Database reset failed:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

resetDatabase();
