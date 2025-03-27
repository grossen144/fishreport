import { Request, Response } from "express";
import { FishingReportService } from "../services/fishing-report.service";
import { pool } from "../services/db.service";
import { weatherSchema } from "@fishreport/shared/types/weather";
import { ZodError } from "zod";

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

export class ReportController {
  private fishingReportService: FishingReportService;

  constructor() {
    this.fishingReportService = new FishingReportService(pool);
  }

  createReport = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const report = await this.fishingReportService.create(userId, req.body);
      return res.status(201).json(report);
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

  getReports = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const reports = await this.fishingReportService.findByUserId(userId);
      return res.json(reports);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(500).json({ error: "Internal server error" });
    }
  };

  getReportById = async (req: Request, res: Response) => {
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

      const report = await this.fishingReportService.findById(reportId);
      if (!report) {
        return res.status(404).json({ error: "Report not found" });
      }

      if (report.user_id !== userId) {
        return res.status(403).json({ error: "Forbidden" });
      }

      return res.json(report);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(500).json({ error: "Failed to fetch report" });
    }
  };

  updateReport = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const report = await this.fishingReportService.findById(
        parseInt(req.params.id)
      );
      if (!report) {
        return res.status(404).json({ error: "Report not found" });
      }

      if (report.user_id !== userId) {
        return res.status(403).json({ error: "Forbidden" });
      }

      const updatedReport = await this.fishingReportService.update(
        parseInt(req.params.id),
        req.body
      );
      return res.json(updatedReport);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(500).json({ error: "Internal server error" });
    }
  };

  deleteReport = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const report = await this.fishingReportService.findById(
        parseInt(req.params.id)
      );
      if (!report) {
        return res.status(404).json({ error: "Report not found" });
      }

      if (report.user_id !== userId) {
        return res.status(403).json({ error: "Forbidden" });
      }

      await this.fishingReportService.delete(parseInt(req.params.id));
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

      const stats = await this.fishingReportService.getStats(userId);
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
      const parsedData = weatherSchema.parse(data);
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
}
