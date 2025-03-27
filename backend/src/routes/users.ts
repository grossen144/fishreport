import { Router } from "express";
import { authenticateToken } from "../middleware/auth";
import { UserController } from "../controllers/userController";

const router = Router();
const userController = new UserController();

router.use(authenticateToken);

router.get("/", userController.getUsers);

export default router;
