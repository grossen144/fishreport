import { Pool } from "pg";
import {
  CreateFishingReportInput,
  UpdateFishingReportInput,
} from "../schemas/fishing-report.schema";

export interface FishingReport {
  id: number;
  user_id: number;
  species: string;
  date: Date;
  location: string;
  hours_fished: number;
  number_of_persons: number;
  number_of_fish: number;
  fish_over_40cm?: number;
  bonus_pike?: number;
  bonus_zander?: number;
  latitude?: number;
  longitude?: number;
  water_temperature?: number;
  bag_total?: number;
  comment?: string;
  air_temperature?: number;
  wind_speed?: number;
  wind_direction?: string;
  weather_condition?: string;
  lunar_phase?: string;
  weather_data?: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

export class FishingReportModel {
  constructor(private pool: Pool) {}

  async create(
    userId: number,
    data: CreateFishingReportInput
  ): Promise<FishingReport> {
    const query = `
      INSERT INTO fishing_trips (
        user_id, species, date, location, hours_fishing,
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
      data.weather_data,
      data.lunar_phase,
    ];
    const result = await this.pool.query(query, values);
    return result.rows[0];
  }

  async findById(id: number): Promise<FishingReport | null> {
    const query = `
      SELECT *
      FROM fishing_trips
      WHERE id = $1
      LIMIT 1
    `;
    const result = await this.pool.query(query, [id]);
    return result.rows[0] || null;
  }

  async findByUserId(userId: number): Promise<FishingReport[]> {
    const query = `
      SELECT *
      FROM fishing_trips
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
      UPDATE fishing_trips
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
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
    const reports = await this.findByUserId(userId);

    const totalReports = reports.length;
    const totalFish = reports.reduce(
      (sum, report) => sum + report.number_of_fish,
      0
    );
    const averageFishPerTrip = totalReports > 0 ? totalFish / totalReports : 0;

    // Count species occurrences
    const speciesCount = reports.reduce((acc, report) => {
      acc[report.species] = (acc[report.species] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostCommonSpecies =
      Object.entries(speciesCount).sort(([, a], [, b]) => b - a)[0]?.[0] ||
      "No reports yet";

    // Count location occurrences
    const locationCount = reports.reduce((acc, report) => {
      acc[report.location] = (acc[report.location] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const bestLocation =
      Object.entries(locationCount).sort(([, a], [, b]) => b - a)[0]?.[0] ||
      "No reports yet";

    return {
      totalReports,
      totalFish,
      averageFishPerTrip,
      mostCommonSpecies,
      bestLocation,
      recentReports: reports.slice(0, 5),
    };
  }
}
