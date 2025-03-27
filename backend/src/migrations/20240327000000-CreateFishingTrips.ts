import { Pool } from "pg";

exports.up = async function (pool: Pool) {
  await pool.query(`
    CREATE TABLE fishing_trips (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id),
      name VARCHAR(255) NOT NULL,
      date DATE NOT NULL,
      water_temperature DECIMAL(4,1),
      hours_fishing DECIMAL(4,1),
      number_of_persons INTEGER,
      total_fish INTEGER,
      bag_total DECIMAL(6,2),
      bonus_zander INTEGER,
      fish_over_40 INTEGER,
      comment TEXT,
      weather_data JSONB,
      lunar_phase JSONB,
      target_species VARCHAR(255) NOT NULL DEFAULT 'perch',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`
    CREATE TABLE catches (
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
  await pool.query(`DROP TABLE IF EXISTS catches;`);
  await pool.query(`DROP TABLE IF EXISTS fishing_trips;`);
};
