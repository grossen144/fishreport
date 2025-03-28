import { Router } from "express";
import { TripsController } from "../controllers/tripsController";

const router = Router();
const tripController = new TripsController();

// Get weather data
router.get("/", tripController.getWeatherData);
router.get("/lunar", tripController.getLunarPhase);
export default router;
