import dotenv from "dotenv";
import { pool } from "../config/database";
import fs from "fs";

// Load environment variables from .env file
dotenv.config();

async function rollbackMigrations() {
  try {
    // Get list of executed migrations in reverse order
    const { rows: executedMigrations } = await pool.query(
      "SELECT name FROM migrations ORDER BY id DESC"
    );

    // Rollback each migration
    for (const migration of executedMigrations) {
      console.log(`Rolling back migration: ${migration.name}`);
      const migrationModule = require(`./${migration.name}`);
      await migrationModule.down(pool);
      await pool.query("DELETE FROM migrations WHERE name = $1", [
        migration.name,
      ]);
      console.log(`Completed rollback: ${migration.name}`);
    }

    console.log("All migrations rolled back successfully");
  } catch (error) {
    console.error("Rollback failed:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

rollbackMigrations();
