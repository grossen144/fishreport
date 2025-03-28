import { Pool } from "pg";

exports.up = async function (pool: Pool) {
  // Create fishing buddies table
  await pool.query(`
    CREATE TABLE fishing_buddies (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      buddy_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      is_accepted BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, buddy_id)
    );
  `);

  // Create fishing report buddies table
  await pool.query(`
    CREATE TABLE fishing_trip_buddies (
      id SERIAL PRIMARY KEY,
      fishing_trip_id INTEGER NOT NULL REFERENCES fishing_trips(id) ON DELETE CASCADE,
      buddy_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(fishing_trip_id, buddy_id)
    );
  `);
};

exports.down = async function (pool: Pool) {
  await pool.query(`DROP TABLE IF EXISTS fishing_trip_buddies;`);
  await pool.query(`DROP TABLE IF EXISTS fishing_buddies;`);
};
