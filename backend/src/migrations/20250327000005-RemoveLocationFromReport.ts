import { Pool } from "pg";

exports.up = async function (pool: Pool) {
  await pool.query(`
    ALTER TABLE fishing_reports
    DROP COLUMN location;
  `);
};

exports.down = async function (pool: Pool) {
  await pool.query(`
    ALTER TABLE fishing_reports
    ADD COLUMN location VARCHAR(255);
  `);
};
