import { Request, Response } from "express";
import { pool } from "../services/dbService";
import { weatherDataSchema } from "@fishreport/shared/types/weather";
import { ZodError } from "zod";
import {
  addTripBuddiesSchema,
  completeTripSchema,
  startTripSchema,
} from "../schemas/fishingTripSchema";
import { FishingTripService } from "../services/fishingTripService";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        name: string;
      };
    }
  }
}

export class TripsController {
  private fishingTripService: FishingTripService;

  constructor() {
    this.fishingTripService = new FishingTripService(pool);
  }

  startFishingTrip = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const validatedTrip = startTripSchema.parse(req.body);
      const trip = await this.fishingTripService.startTrip(
        userId,
        validatedTrip
      );
      return res.status(201).json(trip);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(500).json({ error: "Internal server error" });
    }
  };

  completeFishingTrip = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const validatedTrip = completeTripSchema.parse(req.body);
      const trip = await this.fishingTripService.createTrip(
        userId,
        validatedTrip
      );
      return res.status(201).json(trip);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(500).json({ error: "Internal server error" });
    }
  };

  getFishingTrips = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const trips = await this.fishingTripService.findByUserId(userId);
      return res.json(trips);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(500).json({ error: "Internal server error" });
    }
  };

  getFishingTripById = async (req: Request, res: Response) => {
    const reportId = Number(req.params.id);

    if (isNaN(reportId)) {
      return res
        .status(400)
        .json({ error: "Invalid report ID: must be a number" });
    }

    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const fishingTrip = await this.fishingTripService.findById(reportId);
      if (!fishingTrip) {
        return res.status(404).json({ error: "Report not found" });
      }

      if (Number(fishingTrip.user_id) !== userId) {
        return res.status(403).json({ error: "Forbidden" });
      }

      return res.json(fishingTrip);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(500).json({ error: "Failed to fetch trip" });
    }
  };

  updateFishingTrip = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const trip = await this.fishingTripService.findById(
        parseInt(req.params.id)
      );
      if (!trip) {
        return res.status(404).json({ error: "Trip not found" });
      }

      if (Number(trip.user_id) !== userId) {
        return res.status(403).json({ error: "Forbidden" });
      }

      const updatedTrip = await this.fishingTripService.update(
        parseInt(req.params.id),
        req.body
      );
      return res.json(updatedTrip);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(500).json({ error: "Internal server error" });
    }
  };

  deleteFishingTrip = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const trip = await this.fishingTripService.findById(
        parseInt(req.params.id)
      );
      if (!trip) {
        return res.status(404).json({ error: "Trip not found" });
      }

      if (Number(trip.user_id) !== userId) {
        return res.status(403).json({ error: "Forbidden" });
      }

      await this.fishingTripService.delete(parseInt(req.params.id));
      return res.status(204).send();
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(500).json({ error: "Internal server error" });
    }
  };

  getStats = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const stats = await this.fishingTripService.getStats(userId);
      return res.json(stats);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(500).json({ error: "Internal server error" });
    }
  };

  getWeatherData = async (req: Request, res: Response) => {
    try {
      const { lat, lon, date } = req.query;
      const apiKey = process.env.OPENWEATHER_API_KEY;

      if (!apiKey) {
        return res
          .status(500)
          .json({ error: "OpenWeather API key not configured" });
      }

      if (!lat || !lon || !date) {
        return res.status(400).json({ error: "Missing required parameters" });
      }

      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&dt=${Math.floor(
          new Date(date as string).getTime() / 1000
        )}&appid=${apiKey}&units=metric`
      );

      if (!response.ok) {
        return res
          .status(response.status)
          .json({ error: "Failed to fetch weather data" });
      }

      const data = await response.json();
      const parsedData = weatherDataSchema.parse(data);
      return res.json(parsedData);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(500).json({ error: "Internal server error" });
    }
  };

  getLunarPhase = async (req: Request, res: Response) => {
    try {
      const { date } = req.query;
      const response = await fetch(
        `https://api.farmsense.net/v1/moonphases/?d=${Math.floor(
          new Date(date as string).getTime() / 1000
        )}`
      );
      const data = await response.json();
      return res.json(data);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(500).json({ error: "Internal server error" });
    }
  };

  addFishingTripBuddies = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const tripId = parseInt(req.params.id);
      if (isNaN(tripId)) {
        return res.status(400).json({ error: "Invalid trip ID" });
      }

      const trip = await this.fishingTripService.findById(tripId);
      if (!trip) {
        return res.status(404).json({ error: "Trip not found" });
      }

      if (Number(trip.user_id) !== userId) {
        return res.status(403).json({ error: "Forbidden" });
      }

      const { buddyIds } = req.body;
      if (!Array.isArray(buddyIds)) {
        return res.status(400).json({ error: "buddyIds must be an array" });
      }

      const validatedFishingTripBuddies = addTripBuddiesSchema.parse({
        fishingTripId: tripId,
        buddyIds,
      });

      await this.fishingTripService.addFishingTripBuddies(
        validatedFishingTripBuddies
      );
      return res.status(201).json({ message: "Buddies added successfully" });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(500).json({ error: "Internal server error" });
    }
  };

  hasActiveFishingTrip = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const trip = await this.fishingTripService.findActiveTrip(userId);
      if (!trip) {
        return res.status(404).json({ error: "No active trip found" });
      }

      return res.json(trip);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(500).json({ error: "Internal server error" });
    }
  };

  addCatch = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const tripId = parseInt(req.params.id);
      if (isNaN(tripId)) {
        return res.status(400).json({ error: "Invalid trip ID" });
      }

      const trip = await this.fishingTripService.findById(tripId);
      if (!trip) {
        return res.status(404).json({ error: "Trip not found" });
      }

      if (Number(trip.user_id) !== userId) {
        return res.status(403).json({ error: "Forbidden" });
      }

      const catchData = {
        trip_id: tripId,
        species: req.body.species,
        weight_grams: req.body.weight_grams,
        length_cm: req.body.length_cm,
        latitude: req.body.latitude,
        longitude: req.body.longitude,
        caught_at: req.body.caught_at,
      };

      const newCatch = await this.fishingTripService.addCatch(catchData);
      return res.status(201).json(newCatch);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(500).json({ error: "Internal server error" });
    }
  };

  getCatches = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const tripId = parseInt(req.params.id);
      if (isNaN(tripId)) {
        return res.status(400).json({ error: "Invalid trip ID" });
      }

      const trip = await this.fishingTripService.findById(tripId);
      if (!trip) {
        return res.status(404).json({ error: "Trip not found" });
      }

      if (Number(trip.user_id) !== userId) {
        return res.status(403).json({ error: "Forbidden" });
      }

      const catches = await this.fishingTripService.getCatches(tripId);
      return res.json(catches);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(500).json({ error: "Internal server error" });
    }
  };
}
