import { Pool } from "pg";

exports.up = async function (pool: Pool) {
  await pool.query(`
    CREATE TABLE fishing_trips (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id),
      target_species VARCHAR(255) NOT NULL DEFAULT 'perch',
      location text,
      latitude DECIMAL(10,8),
      longitude DECIMAL(11,8),
      date DATE NOT NULL,
      water_temperature DECIMAL(4,1),
      hours_fished DECIMAL(4,1),
      number_of_persons INTEGER,
      number_of_fish INTEGER,
      bag_total DECIMAL(6,2),
      number_of_bonus_zander INTEGER,
      number_of_bonus_pike INTEGER,
      number_of_bonus_perch INTEGER,
      perch_over_40 INTEGER,
      comment TEXT,
      weather_data JSONB,
      lunar_data JSONB,
      status VARCHAR(20) NOT NULL DEFAULT 'active',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);
};

exports.down = async function (pool: Pool) {
  await pool.query(`DROP TABLE IF EXISTS fishing_trips;`);
};
