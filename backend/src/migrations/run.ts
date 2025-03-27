import dotenv from "dotenv";
import { pool } from "../config/database";
import fs from "fs";

// Load environment variables from .env file
dotenv.config();

async function runMigrations() {
  try {
    // Create migrations table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Get list of executed migrations
    const { rows: executedMigrations } = await pool.query(
      "SELECT name FROM migrations ORDER BY id"
    );
    const executedMigrationNames = new Set(
      executedMigrations.map((m) => m.name)
    );

    // Get all migration files
    const migrationFiles = fs
      .readdirSync(__dirname)
      .filter(
        (file) =>
          file.endsWith(".ts") &&
          file !== "run.ts" &&
          file !== "rollback.ts" &&
          file !== "reset.ts"
      )
      .sort();

    // Run each migration in order
    for (const file of migrationFiles) {
      if (!executedMigrationNames.has(file)) {
        console.log(`Running migration: ${file}`);
        const migration = require(`./${file}`);
        await migration.up(pool);
        await pool.query("INSERT INTO migrations (name) VALUES ($1)", [file]);
        console.log(`Completed migration: ${file}`);
      }
    }

    console.log("All migrations completed successfully");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigrations();
