import { z } from "zod";
import {
  lunarDataSchema,
  weatherSchema,
} from "@fishreport/shared/types/weather";

export const FishSpecies = z.enum(["perch", "pike", "zander"]);
export type FishSpecies = z.infer<typeof FishSpecies>;

export const fishingTripSchema = z.object({
  user_id: z.string(),
  target_species: FishSpecies,
  date: z.string().transform((str) => new Date(str)),
  location: z.string().nullable(),
  latitude: z.number().min(-90).max(90).nullable(),
  longitude: z.number().min(-180).max(180).nullable(),
  hours_fished: z.number().min(0, "Hours fished must be positive"),
  number_of_persons: z.number().min(1, "At least one person is required"),
  number_of_fish: z.number().min(0, "Number of fish must be positive"),
  perch_over_40: z
    .number()
    .min(0, "Number of fish over 40 cm must be positive")
    .nullable(),
  number_of_bonus_pike: z
    .number()
    .min(0, "Number of bonus pike must be positive")
    .nullable(),
  number_of_bonus_zander: z
    .number()
    .min(0, "Number of bonus zander must be positive")
    .nullable(),
  number_of_bonus_perch: z
    .number()
    .min(0, "Number of bonus perch must be positive")
    .nullable(),
  water_temperature: z.number().min(-3).max(35).nullable(),
  bag_total: z.number().min(0).nullable(),
  comment: z.string().max(1000).nullable(),
  lunar_data: lunarDataSchema.nullable(),
  weather_data: weatherSchema.nullable(),
  buddy_ids: z.array(z.number()),
});
export type FishingTrip = z.infer<typeof fishingTripSchema>;

export const updateFishingTripSchema = fishingTripSchema.partial();

export type CreateFishingTripInput = z.infer<typeof fishingTripSchema>;
export type UpdateFishingTripInput = z.infer<typeof updateFishingTripSchema>;
