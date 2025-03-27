import { Knex } from "knex";
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
  constructor(private knex: Knex) {}

  async verifyPassword(user: any, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.password);
  }

  async createUser(userData: z.infer<typeof userSchema>) {
    const validatedData = userSchema.parse(userData);
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    const [user] = await this.knex("users")
      .insert({
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
      })
      .returning(["id", "name", "email", "created_at"]);

    return user;
  }

  async login(credentials: z.infer<typeof loginSchema>) {
    const validatedData = loginSchema.parse(credentials);

    const [user] = await this.knex("users")
      .where({ email: validatedData.email })
      .select("*");

    if (!user) {
      throw new Error("Invalid email or password");
    }

    const isValidPassword = await bcrypt.compare(
      validatedData.password,
      user.password
    );

    if (!isValidPassword) {
      throw new Error("Invalid email or password");
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || "your_secret_key_here",
      { expiresIn: "24h" }
    );

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  }

  async getUserById(id: number) {
    const [user] = await this.knex("users")
      .where({ id })
      .select(["id", "name", "email", "created_at"]);

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }

  async updateUser(id: number, userData: Partial<z.infer<typeof userSchema>>) {
    const validatedData = userSchema.partial().parse(userData);

    if (validatedData.password) {
      validatedData.password = await bcrypt.hash(validatedData.password, 10);
    }

    const [user] = await this.knex("users")
      .where({ id })
      .update(validatedData)
      .returning(["id", "name", "email", "created_at"]);

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }

  async deleteUser(id: number) {
    const [user] = await this.knex("users")
      .where({ id })
      .del()
      .returning(["id", "name", "email"]);

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }

  async getUserByEmail(email: string) {
    const [user] = await this.knex("users").where({ email }).select("*");
    return user;
  }
}
