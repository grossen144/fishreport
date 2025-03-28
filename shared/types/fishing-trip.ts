import { z } from "zod";
import { weatherDataSchema, lunarDataSchema } from "./weather";

export const fishSpeciesSchema = z.enum(["perch", "pike", "zander"]);
export type FishSpecies = z.infer<typeof fishSpeciesSchema>;

export const fishingTripSchema = z.object({
  id: z.number().optional(),
  user_id: z.number(),
  target_species: fishSpeciesSchema,
  date: z.string().datetime(),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  location_name: z.string(),
  number_of_persons: z.number().min(1).max(5),
  buddy_ids: z.array(z.number()),
  weather_data: weatherDataSchema.nullable(),
  lunar_data: lunarDataSchema.nullable(),
  status: z.enum(["active", "completed"]),
  hours_fished: z.number().min(0).max(24).nullable(),
  water_temperature: z.number().min(-2).max(30).nullable(),
  wind_speed: z.number().min(0).max(100).nullable(),
  wind_direction: z.string().nullable(),
  cloud_cover: z.number().min(0).max(100).nullable(),
  precipitation: z.number().min(0).max(100).nullable(),
  moon_phase: z.string().nullable(),
  moon_rise: z.string().datetime().nullable(),
  moon_set: z.string().datetime().nullable(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export type FishingTrip = z.infer<typeof fishingTripSchema>;
