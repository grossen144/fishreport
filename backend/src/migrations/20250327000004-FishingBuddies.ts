import { Pool } from "pg";

exports.up = async function (pool: Pool) {
  await pool.query(`
    CREATE TABLE fishing_report_buddies (
      id SERIAL PRIMARY KEY,
      report_id INTEGER NOT NULL REFERENCES fishing_reports(id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(report_id, user_id)
    );
  `);
};

exports.down = async function (pool: Pool) {
  await pool.query(`DROP TABLE IF EXISTS fishing_report_buddies;`);
};
