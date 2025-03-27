import { z } from "zod";
import {
  lunarDataSchema,
  weatherSchema,
} from "@fishreport/shared/types/weather";

export const FishSpecies = z.enum(["perch", "pike", "zander"]);
export type FishSpecies = z.infer<typeof FishSpecies>;

export const fishingReportSchema = z.object({
  species: FishSpecies,
  date: z.string().transform((str) => new Date(str)),
  location: z.string().min(1, "Location is required"),
  hours_fished: z.number().min(0, "Hours fished must be positive"),
  number_of_persons: z.number().min(1, "At least one person is required"),
  number_of_fish: z.number().min(0, "Number of fish must be positive"),
  fish_over_40cm: z
    .number()
    .min(0, "Number of fish over 40cm must be positive")
    .optional(),
  bonus_pike: z
    .number()
    .min(0, "Number of bonus pike must be positive")
    .optional(),
  bonus_zander: z
    .number()
    .min(0, "Number of bonus zander must be positive")
    .optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  water_temperature: z.number().min(-10).max(40).optional(),
  bag_total: z.number().min(0).optional(),
  comment: z.string().max(1000).optional(),
  air_temperature: z.number().min(-50).max(50).optional(),
  wind_speed: z.number().min(0).max(200).optional(),
  wind_direction: z.string().optional(),
  weather_condition: z.string().optional(),
  lunar_phase: lunarDataSchema.optional(),
  weather_data: weatherSchema.optional(),
});

export const updateFishingReportSchema = fishingReportSchema.partial();

export type CreateFishingReportInput = z.infer<typeof fishingReportSchema>;
export type UpdateFishingReportInput = z.infer<
  typeof updateFishingReportSchema
>;
