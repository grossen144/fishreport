import { Request, Response } from "express";
import { pool } from "../config/database";
import { z } from "zod";

// Define the response schema
const userResponseSchema = z.array(
  z.object({
    id: z.number(),
    name: z.string(),
    email: z.string().email(),
  })
);

export class UserController {
  async getUsers(req: Request, res: Response) {
    try {
      const query = `
        SELECT id, name, email
        FROM users
        WHERE id != $1
        ORDER BY name
      `;

      const result = await pool.query(query, [req.user?.id]);

      const users = result.rows.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
      }));

      const validatedUsers = userResponseSchema.parse(users);

      return res.json(validatedUsers);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(500)
          .json({ error: "Data validation error", details: error.errors });
      }
      console.error("Error fetching users:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
}
