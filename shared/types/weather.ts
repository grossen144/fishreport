import { z } from "zod";

export const weatherSchema = z.object({
  weather: z.array(
    z.object({
      main: z.string(),
      description: z.string(),
    })
  ),
  main: z.object({
    temp: z.number(),
    feels_like: z.number(),
    temp_min: z.number(),
    temp_max: z.number(),
    pressure: z.number(),
    humidity: z.number(),
    sea_level: z.number(),
    grnd_level: z.number(),
  }),
  visibility: z.number(),
  wind: z.object({
    speed: z.number(),
    deg: z.number(),
  }),
  clouds: z.object({
    all: z.number(),
  }),
  sys: z.object({
    country: z.string(),
    sunrise: z.number(),
    sunset: z.number(),
  }),
});

export type WeatherData = z.infer<typeof weatherSchema>;

export const lunarDataSchema = z.array(
  z.object({
    Moon: z.array(z.string()),
    Index: z.number(),
    Age: z.number(),
    Phase: z.string(),
    Distance: z.number(),
    Illumination: z.number(),
    AngularDiameter: z.number(),
    DistanceToSun: z.number(),
    SunAngularDiameter: z.number(),
  })
);

export type LunarData = z.infer<typeof lunarDataSchema>;
