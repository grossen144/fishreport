import { Pool } from "pg";

exports.up = async function (pool: Pool) {
  await pool.query(`
    CREATE TABLE trip_catches (
      id SERIAL PRIMARY KEY,
      trip_id INTEGER NOT NULL REFERENCES fishing_trips(id) ON DELETE CASCADE,
      species VARCHAR(255) NOT NULL,
      weight_grams DECIMAL(10,2) NOT NULL,
      length_cm DECIMAL(10,2) NOT NULL,
      latitude DECIMAL(10,8),
      longitude DECIMAL(11,8),
      caught_at TIMESTAMP WITH TIME ZONE NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);
};

exports.down = async function (pool: Pool) {
  await pool.query(`DROP TABLE IF EXISTS trip_catches;`);
};
