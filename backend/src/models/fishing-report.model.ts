import { Knex } from "knex";
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
  constructor(private knex: Knex) {}

  async create(
    userId: number,
    data: CreateFishingReportInput
  ): Promise<FishingReport> {
    const [report] = await this.knex("fishing_reports")
      .insert({
        user_id: userId,
        ...data,
      })
      .returning("*");
    return report;
  }

  async findById(id: number): Promise<FishingReport | null> {
    const [report] = await this.knex("fishing_reports")
      .where({ id })
      .select("*");
    return report || null;
  }

  async findByUserId(userId: number): Promise<FishingReport[]> {
    return this.knex("fishing_reports")
      .where({ user_id: userId })
      .orderBy("date", "desc")
      .select("*");
  }

  async update(
    id: number,
    data: UpdateFishingReportInput
  ): Promise<FishingReport | null> {
    const [report] = await this.knex("fishing_reports")
      .where({ id })
      .update({
        ...data,
        updated_at: this.knex.fn.now(),
      })
      .returning("*");
    return report || null;
  }

  async delete(id: number): Promise<boolean> {
    const count = await this.knex("fishing_reports").where({ id }).delete();
    return count > 0;
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
