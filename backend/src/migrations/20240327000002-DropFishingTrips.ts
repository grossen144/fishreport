import { Pool } from "pg";

exports.up = async function (pool: Pool) {
  await pool.query(`DROP TABLE IF EXISTS catches;`);
  await pool.query(`DROP TABLE IF EXISTS fishing_trips;`);
};

exports.down = async function (pool: Pool) {
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
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`
    CREATE TABLE catches (
      id SERIAL PRIMARY KEY,
      fishing_trip_id INTEGER NOT NULL REFERENCES fishing_trips(id),
      species VARCHAR(255) NOT NULL,
      length DECIMAL(5,1),
      weight DECIMAL(5,1),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);
};
