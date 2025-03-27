import { Pool } from "pg";

exports.up = async function (pool: Pool) {
  await pool.query(`
    ALTER TABLE fishing_reports
    ADD COLUMN location text;
  `);
};

exports.down = async function (pool: Pool) {
  await pool.query(`
    ALTER TABLE fishing_reports
    DROP COLUMN location;
  `);
};
