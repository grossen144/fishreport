import { Pool } from "pg";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";

// Validation schemas
const userSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export class UserService {
  constructor(private pool: Pool) {}

  async verifyPassword(user: any, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.password);
  }

  async createUser(userData: z.infer<typeof userSchema>) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const query = `
      INSERT INTO users (name, email, password)
      VALUES ($1, $2, $3)
      RETURNING id, name, email
    `;
    const result = await this.pool.query(query, [
      userData.name,
      userData.email,
      hashedPassword,
    ]);
    return result.rows[0];
  }

  async login(credentials: z.infer<typeof loginSchema>) {
    const query = `
      SELECT id, name, email, password
      FROM users
      WHERE email = $1
      LIMIT 1
    `;
    const result = await this.pool.query(query, [credentials.email]);
    const user = result.rows[0];

    if (!user || !(await this.verifyPassword(user, credentials.password))) {
      throw new Error("Invalid email or password");
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, name: user.name },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "24h" }
    );

    return { token, user: { id: user.id, name: user.name, email: user.email } };
  }

  async getUserById(id: number) {
    const query = `
      SELECT id, name, email
      FROM users
      WHERE id = $1
      LIMIT 1
    `;
    const result = await this.pool.query(query, [id]);
    return result.rows[0];
  }

  async updateUser(id: number, userData: Partial<z.infer<typeof userSchema>>) {
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (userData.name) {
      updates.push(`name = $${paramCount}`);
      values.push(userData.name);
      paramCount++;
    }

    if (userData.email) {
      updates.push(`email = $${paramCount}`);
      values.push(userData.email);
      paramCount++;
    }

    if (userData.password) {
      updates.push(`password = $${paramCount}`);
      values.push(await bcrypt.hash(userData.password, 10));
      paramCount++;
    }

    if (updates.length === 0) {
      return this.getUserById(id);
    }

    values.push(id);
    const query = `
      UPDATE users
      SET ${updates.join(", ")}, updated_at = NOW()
      WHERE id = $${paramCount}
      RETURNING id, name, email
    `;
    const result = await this.pool.query(query, values);
    return result.rows[0];
  }

  async deleteUser(id: number) {
    const query = `
      DELETE FROM users
      WHERE id = $1
      RETURNING id
    `;
    const result = await this.pool.query(query, [id]);
    return result.rows[0];
  }

  async getUserByEmail(email: string) {
    const query = `
      SELECT id, name, email, password
      FROM users
      WHERE email = $1
      LIMIT 1
    `;
    const result = await this.pool.query(query, [email]);
    return result.rows[0];
  }
}
