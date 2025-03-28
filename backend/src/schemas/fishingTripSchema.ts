import { z } from "zod";
import {
  lunarDataSchema,
  weatherDataSchema,
} from "@fishreport/shared/types/weather";

export const FishSpecies = z.enum(["perch", "pike", "zander"]);
export type FishSpecies = z.infer<typeof FishSpecies>;

// Base schema with fields needed to start a trip
export const startTripSchema = z.object({
  user_id: z.string(),
  target_species: FishSpecies,
  date: z.string().transform((str) => new Date(str)),
  location: z.string().nullable(),
  latitude: z.number().min(-90).max(90).nullable(),
  longitude: z.number().min(-180).max(180).nullable(),
  number_of_persons: z.number().min(1, "At least one person is required"),
  lunar_data: lunarDataSchema.nullable(),
  weather_data: weatherDataSchema.nullable(),
  status: z.enum(["active", "completed"]),
});

// Schema for completing a trip (includes all completion fields)
export const completeTripSchema = startTripSchema.extend({
  hours_fished: z.number().min(0, "Hours fished must be positive"),
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
  water_temperature: z.number().min(-3).max(35),
  bag_total: z.number().min(0).nullable(),
  comment: z.string().max(1000).nullable(),
});

export const addTripBuddiesSchema = z.object({
  fishingTripId: z.number(),
  buddyIds: z
    .array(
      z.number({
        required_error: "Buddy IDs are required",
        invalid_type_error: "Buddy IDs must be numbers",
      })
    )
    .min(1, "At least one buddy must be selected"),
});

export const FishingTripCatchSchema = z.object({
  id: z.number(),
  species: z.string(),
  depth_cm: z.number().nullable(),
  weight_grams: z.number(),
  length_cm: z.number().nullable(),
  latitude: z.number(),
  longitude: z.number(),
  caught_at: z.string(),
});

export type StartTripInput = z.infer<typeof startTripSchema>;
export type FishingTrip = z.infer<typeof completeTripSchema>;
export type AddTripBuddiesInput = z.infer<typeof addTripBuddiesSchema>;
export type FishingTripCatch = z.infer<typeof FishingTripCatchSchema>;
