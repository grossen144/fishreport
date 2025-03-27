import { Router } from "express";
import { ReportController } from "../controllers/reportController";

const router = Router();
const reportController = new ReportController();

// Get weather data
router.get("/", reportController.getWeatherData);
router.get("/lunar", reportController.getLunarPhase);
export default router;
