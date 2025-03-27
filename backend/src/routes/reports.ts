import { Router } from "express";
import { ReportController } from "../controllers/reportController";
import { authenticateToken } from "../middleware/auth";

const router = Router();
const reportController = new ReportController();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Create a new report
router.post("/", reportController.createReport);

// Get all reports for the authenticated user
router.get("/", reportController.getReports);

// Get fishing statistics
router.get("/stats", reportController.getStats);

// Get a specific report by ID
router.get("/:id", reportController.getReportById);

// Update a report
router.put("/:id", reportController.updateReport);

// Delete a report
router.delete("/:id", reportController.deleteReport);

export default router;
