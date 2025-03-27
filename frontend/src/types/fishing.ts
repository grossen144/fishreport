export type Species = "perch" | "pike" | "zander";

export interface FishingReport {
  id?: number;
  user_id: number;
  species: Species;
  date: string;
  location: string;
  hours_fished: number;
  number_of_persons: number;
  number_of_fish: number;
  fish_over_40cm: number | null;
  bonus_pike: number | null;
  bonus_zander: number | null;
  water_temperature: number | null;
  bag_total: number | null;
  comment: string | null;
  latitude: number | null;
  longitude: number | null;
  weather_data: any | null;
  lunar_phase: any | null;
  created_at?: string;
  updated_at?: string;
}

export interface Catch {
  id?: number;
  trip_id: number;
  species: Species;
  weight_grams: number;
  length_cm: number;
  latitude: number | null;
  longitude: number | null;
  caught_at: string;
  created_at?: string;
  updated_at?: string;
}
