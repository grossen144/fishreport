import { Router } from "express";
import { UserService } from "../services/user.service";
import { pool } from "../services/db.service";
import jwt from "jsonwebtoken";
import { authenticateToken } from "../middleware/auth";

const router = Router();
const userService = new UserService(pool);

// Register new user
router.post("/register", async (req, res) => {
  try {
    const user = await userService.createUser(req.body);
    const token = jwt.sign(
      { userId: user.id, email: user.email, name: user.name },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "24h" }
    );

    res.status(201).json({
      token,
      user: {
        id: String(user.id),
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

// Login user
router.post("/login", async (req, res) => {
  try {
    const result = await userService.login(req.body);
    res.json({
      token: result.token,
      user: {
        id: String(result.user.id),
        name: result.user.name,
        email: result.user.email,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(401).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

// Verify token and get user data
router.get("/verify", authenticateToken, async (req, res) => {
  try {
    const user = await userService.getUserById(req.user!.id);
    res.json({
      user: {
        id: String(user.id),
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(401).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

export default router;
