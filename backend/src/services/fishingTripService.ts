import { Pool } from "pg";
import {
  AddTripBuddiesInput,
  FishingTrip,
  StartTripInput,
} from "../schemas/fishingTripSchema";

export class FishingTripService {
  constructor(private pool: Pool) {}

  async startTrip(userId: number, data: StartTripInput): Promise<FishingTrip> {
    const query = `
      INSERT INTO fishing_trips (
        user_id, target_species, date, location, 
        number_of_persons,  lunar_data, weather_data,
        latitude, longitude, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;

    const values = [
      userId,
      data.target_species,
      data.date,
      data.location,
      data.number_of_persons,
      JSON.stringify(data.weather_data),
      JSON.stringify(data.lunar_data),
      data.latitude,
      data.longitude,
      "active",
    ];

    const result = await this.pool.query(query, values);
    return result.rows[0];
  }

  async createTrip(userId: number, data: FishingTrip): Promise<FishingTrip> {
    const query = `
      INSERT INTO fishing_trips (
        user_id, target_species, date, location, hours_fished,
        number_of_persons, number_of_fish, perch_over_40,
        number_of_bonus_pike, number_of_bonus_zander, water_temperature,
        bag_total, comment, latitude, longitude,
        weather_data, lunar_data
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING *
    `;

    const values = [
      userId,
      data.target_species,
      data.date,
      data.location,
      data.hours_fished,
      data.number_of_persons,
      data.number_of_fish,
      data.perch_over_40,
      data.number_of_bonus_pike,
      data.number_of_bonus_zander,
      data.water_temperature,
      data.bag_total,
      data.comment,
      data.latitude,
      data.longitude,
      JSON.stringify(data.weather_data),
      JSON.stringify(data.lunar_data),
    ];

    const result = await this.pool.query(query, values);
    return result.rows[0];
  }

  async findById(id: number): Promise<FishingTrip | null> {
    const query = `
      SELECT ft.user_id, ft.target_species, ft.date, ft.location, ft.hours_fished, 
      ft.water_temperature, ft.hours_fished, ft.number_of_persons, 
      ft.number_of_fish, ft.perch_over_40, ft.number_of_bonus_pike, ft.number_of_bonus_zander, 
      ft.bag_total, ft.comment, ft.latitude, ft.longitude,
      COALESCE(array_agg(u.id), '{}') as buddy_ids
      FROM fishing_trips ft
      LEFT JOIN fishing_trip_buddies ftb ON ft.id = ftb.fishing_trip_id
      LEFT JOIN users u ON ftb.buddy_id = u.id
      WHERE ft.id = $1
      GROUP BY ft.id, ft.user_id, ft.target_species, ft.date, ft.location, ft.hours_fished, 
      ft.water_temperature, ft.number_of_persons, ft.number_of_fish, ft.perch_over_40, 
      ft.number_of_bonus_pike, ft.number_of_bonus_zander, ft.bag_total, ft.comment, 
      ft.latitude, ft.longitude
      LIMIT 1
    `;

    const result = await this.pool.query(query, [id]);
    return result.rows[0] || null;
  }

  async findByUserId(userId: number): Promise<FishingTrip[]> {
    const query = `
      SELECT *
      FROM fishing_trips
      WHERE user_id = $1
      ORDER BY date DESC
    `;

    const result = await this.pool.query(query, [userId]);
    return result.rows;
  }

  async update(id: number, data: FishingTrip): Promise<FishingTrip | null> {
    const keys = Object.keys(data);
    const setClause = keys
      .map((key, index) => `${key} = $${index + 1}`)
      .join(", ");

    const query = `
      UPDATE fishing_trips
      SET ${setClause}, updated_at = NOW()
      WHERE id = $${keys.length + 1}
      RETURNING *
    `;

    const values = [...Object.values(data), id];
    const result = await this.pool.query(query, values);
    return result.rows[0] || null;
  }

  async delete(id: number): Promise<boolean> {
    const query = `
      DELETE FROM fishing_trips
      WHERE id = $1
      RETURNING id
    `;

    const result = await this.pool.query(query, [id]);
    return result.rows.length > 0;
  }

  async getStats(userId: number) {
    const query = `
      WITH stats AS (
        SELECT
          COUNT(*) as total_reports,
          COALESCE(SUM(number_of_fish), 0) as total_fish,
          CASE 
            WHEN COUNT(*) > 0 THEN COALESCE(SUM(number_of_fish)::float / COUNT(*), 0)
            ELSE 0
          END as avg_fish_per_trip,
          (
            SELECT target_species
            FROM (
              SELECT target_species, COUNT(*) as count
              FROM fishing_trips
              WHERE user_id = $1
              GROUP BY target_species
              ORDER BY count DESC
              LIMIT 1
            ) as species_count
          ) as most_common_species,
          (
            SELECT location
            FROM (
              SELECT location, COUNT(*) as count
              FROM fishing_trips
              WHERE user_id = $1
              GROUP BY location
              ORDER BY count DESC
              LIMIT 1
            ) as location_count
          ) as best_location
        FROM fishing_trips
        WHERE user_id = $1
      ),
      recent_reports AS (
        SELECT *
        FROM fishing_trips
        WHERE user_id = $1
        ORDER BY date DESC
        LIMIT 5
      )
      SELECT
        COALESCE(stats.total_reports, 0) as total_reports,
        COALESCE(stats.total_fish, 0) as total_fish,
        COALESCE(stats.avg_fish_per_trip, 0) as avg_fish_per_trip,
        COALESCE(stats.most_common_species, 'No reports yet') as most_common_species,
        COALESCE(stats.best_location, 'No reports yet') as best_location,
        COALESCE(json_agg(recent_reports.*), '[]'::json) as recent_reports
      FROM stats, recent_reports
      GROUP BY
        stats.total_reports,
        stats.total_fish,
        stats.avg_fish_per_trip,
        stats.most_common_species,
        stats.best_location
    `;

    const result = await this.pool.query(query, [userId]);
    const stats = result.rows[0] || {
      total_reports: 0,
      total_fish: 0,
      avg_fish_per_trip: 0,
      most_common_species: "No reports yet",
      best_location: "No reports yet",
      recent_reports: [],
    };

    return {
      totalReports: stats.total_reports,
      totalFish: stats.total_fish,
      averageFishPerTrip: stats.avg_fish_per_trip,
      mostCommonSpecies: stats.most_common_species,
      bestLocation: stats.best_location,
      recentReports: stats.recent_reports,
    };
  }

  async addFishingTripBuddies(data: AddTripBuddiesInput) {
    const query = `
      INSERT INTO fishing_trip_buddies (fishing_trip_id, buddy_id)
      VALUES ($1, $2)
      ON CONFLICT (fishing_trip_id, buddy_id) DO NOTHING
    `;

    for (const buddyId of data.buddyIds) {
      await this.pool.query(query, [data.fishingTripId, buddyId]);
    }
  }

  async findActiveTrip(userId: number): Promise<FishingTrip | null> {
    const result = await this.pool.query(
      "SELECT * FROM fishing_trips WHERE user_id = $1 AND status = $2 LIMIT 1",
      [userId, "active"]
    );
    return result.rows[0] || null;
  }
}
