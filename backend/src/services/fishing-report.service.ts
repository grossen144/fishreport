import { Pool } from "pg";
import {
  CreateFishingReportInput,
  UpdateFishingReportInput,
} from "../schemas/fishing-report.schema";
import { z } from "zod";
import {
  lunarDataSchema,
  weatherSchema,
} from "@fishreport/shared/types/weather";

export const FishingReportSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  species: z.string(),
  date: z.date(),
  location: z.string(),
  hours_fished: z.number(),
  number_of_persons: z.number(),
  number_of_fish: z.number(),
  fish_over_40cm: z.number().optional(),
  bonus_pike: z.number().optional(),
  bonus_zander: z.number().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  water_temperature: z.number().optional(),
  bag_total: z.number().optional(),
  comment: z.string().optional(),
  weather_data: weatherSchema.optional(),
  lunar_phase: lunarDataSchema.optional(),
  created_at: z.date(),
  updated_at: z.date(),
});

export type FishingReport = z.infer<typeof FishingReportSchema>;

export class FishingReportService {
  constructor(private pool: Pool) {}

  async create(
    userId: number,
    data: CreateFishingReportInput
  ): Promise<FishingReport> {
    const query = `
      INSERT INTO fishing_reports (
        user_id, species, date, location, hours_fished,
        number_of_persons, number_of_fish, fish_over_40cm,
        bonus_pike, bonus_zander, water_temperature,
        bag_total, comment, latitude, longitude,
        weather_data, lunar_phase
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING *
    `;

    const values = [
      userId,
      data.species,
      data.date,
      data.location,
      data.hours_fished,
      data.number_of_persons,
      data.number_of_fish,
      data.fish_over_40cm,
      data.bonus_pike,
      data.bonus_zander,
      data.water_temperature,
      data.bag_total,
      data.comment,
      data.latitude,
      data.longitude,
      JSON.stringify(data.weather_data),
      JSON.stringify(data.lunar_phase),
    ];

    const result = await this.pool.query(query, values);
    return result.rows[0];
  }

  async findById(id: number): Promise<FishingReport | null> {
    const query = `
      SELECT *
      FROM fishing_reports
      WHERE id = $1
      LIMIT 1
    `;

    const result = await this.pool.query(query, [id]);
    return result.rows[0] || null;
  }

  async findByUserId(userId: number): Promise<FishingReport[]> {
    const query = `
      SELECT *
      FROM fishing_reports
      WHERE user_id = $1
      ORDER BY date DESC
    `;

    const result = await this.pool.query(query, [userId]);
    return result.rows;
  }

  async update(
    id: number,
    data: UpdateFishingReportInput
  ): Promise<FishingReport | null> {
    const keys = Object.keys(data);
    const setClause = keys
      .map((key, index) => `${key} = $${index + 1}`)
      .join(", ");

    const query = `
      UPDATE fishing_reports
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
      DELETE FROM fishing_reports
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
            SELECT species
            FROM (
              SELECT species, COUNT(*) as count
              FROM fishing_reports
              WHERE user_id = $1
              GROUP BY species
              ORDER BY count DESC
              LIMIT 1
            ) as species_count
          ) as most_common_species,
          (
            SELECT location
            FROM (
              SELECT location, COUNT(*) as count
              FROM fishing_reports
              WHERE user_id = $1
              GROUP BY location
              ORDER BY count DESC
              LIMIT 1
            ) as location_count
          ) as best_location
        FROM fishing_reports
        WHERE user_id = $1
      ),
      recent_reports AS (
        SELECT *
        FROM fishing_reports
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
}
