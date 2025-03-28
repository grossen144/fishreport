import { Router } from "express";
import { authenticateToken } from "../middleware/auth";
import { TripsController } from "../controllers/tripsController";

const router = Router();
const tripController = new TripsController();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Create a new trip
router.post("/start", tripController.startFishingTrip);
router.post("/complete", tripController.completeFishingTrip);

// Get all trips for the authenticated user
router.get("/", tripController.getFishingTrips);

// Get fishing statistics
router.get("/stats", tripController.getStats);

// Get active trip for the current user
router.get("/active", tripController.hasActiveFishingTrip);

// Get a specific report by ID
router.get("/:id", tripController.getFishingTripById);

// Update a trip
router.put("/:id", tripController.updateFishingTrip);
router.patch("/:id", tripController.updateFishingTrip);

// Delete a trip
router.delete("/:id", tripController.deleteFishingTrip);

// Add this line with the other routes
router.post("/:id/buddies", tripController.addFishingTripBuddies);

// Add catch to a trip
router.post("/:id/catches", tripController.addCatch);

// Get catches for a trip
router.get("/:id/catches", tripController.getCatches);

export default router;
