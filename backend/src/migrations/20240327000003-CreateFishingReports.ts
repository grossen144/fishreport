import { Pool } from "pg";

exports.up = async function (pool: Pool) {
  await pool.query(`
    CREATE TABLE fishing_reports (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id),
      species VARCHAR(255) NOT NULL,
      date DATE NOT NULL,
      location VARCHAR(255) NOT NULL,
      hours_fished DECIMAL(4,1) NOT NULL,
      number_of_persons INTEGER NOT NULL,
      number_of_fish INTEGER NOT NULL,
      fish_over_40cm INTEGER,
      bonus_pike INTEGER,
      bonus_zander INTEGER,
      water_temperature DECIMAL(4,1),
      bag_total DECIMAL(6,2),
      comment TEXT,
      latitude DECIMAL(10,8),
      longitude DECIMAL(11,8),
      weather_data JSONB,
      lunar_phase JSONB,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);
};

exports.down = async function (pool: Pool) {
  await pool.query(`DROP TABLE IF EXISTS fishing_reports;`);
};
