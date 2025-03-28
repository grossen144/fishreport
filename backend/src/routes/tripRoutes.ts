import { Router } from "express";
import { authenticateToken } from "../middleware/auth";
import { TripsController } from "../controllers/tripsController";

const router = Router();
const tripController = new TripsController();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Create a new report
router.post("/start", tripController.startTrip);
router.post("/complete", tripController.completeTrip);

// Get all reports for the authenticated user
router.get("/", tripController.getReports);

// Get fishing statistics
router.get("/stats", tripController.getStats);

// Get active trip for the current user
router.get("/active", tripController.getActiveTrip);

// Get a specific report by ID
router.get("/:id", tripController.getReportById);

// Update a report
router.put("/:id", tripController.updateReport);

// Delete a report
router.delete("/:id", tripController.deleteReport);

// Add this line with the other routes
router.post("/:id/buddies", tripController.addFishingTripBuddies);

export default router;
