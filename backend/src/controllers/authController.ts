import { Request, Response } from "express";
import { UserService } from "../services/userService";
import { CreateUserInput, LoginInput } from "../schemas/userSchema";
import jwt from "jsonwebtoken";

export class AuthController {
  constructor(private userService: UserService) {}

  async register(req: Request<{}, {}, CreateUserInput>, res: Response) {
    try {
      const existingUser = await this.userService.getUserByEmail(
        req.body.email
      );
      if (existingUser) {
        return res.status(400).json({
          status: "error",
          message: "Email already registered",
        });
      }

      const user = await this.userService.createUser(req.body);
      const token = this.generateToken(user.id);

      const { password, ...userWithoutPassword } = user;

      return res.status(201).json({
        status: "success",
        data: {
          user: userWithoutPassword,
          token,
        },
      });
    } catch (error) {
      console.error("Registration error:", error);
      return res.status(500).json({
        status: "error",
        message: "Failed to register user",
      });
    }
  }

  async login(req: Request<{}, {}, LoginInput>, res: Response) {
    try {
      const user = await this.userService.getUserByEmail(req.body.email);
      if (!user) {
        return res.status(401).json({
          status: "error",
          message: "Invalid credentials",
        });
      }

      const isValidPassword = await this.userService.verifyPassword(
        user,
        req.body.password
      );
      if (!isValidPassword) {
        return res.status(401).json({
          status: "error",
          message: "Invalid credentials",
        });
      }

      const token = this.generateToken(user.id);
      const { password, ...userWithoutPassword } = user;

      return res.json({
        status: "success",
        data: {
          user: userWithoutPassword,
          token,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({
        status: "error",
        message: "Failed to login",
      });
    }
  }

  async verify(req: Request, res: Response) {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) {
        return res.status(401).json({
          status: "error",
          message: "No token provided",
        });
      }

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "your-secret-key"
      ) as {
        userId: number;
      };

      const user = await this.userService.getUserById(decoded.userId);
      if (!user) {
        return res.status(401).json({
          status: "error",
          message: "Invalid token",
        });
      }

      const { password, ...userWithoutPassword } = user;
      return res.json({
        status: "success",
        data: {
          user: userWithoutPassword,
        },
      });
    } catch (error) {
      console.error("Token verification error:", error);
      return res.status(401).json({
        status: "error",
        message: "Invalid token",
      });
    }
  }

  private generateToken(userId: number): string {
    return jwt.sign({ userId }, process.env.JWT_SECRET || "your-secret-key", {
      expiresIn: "24h",
    });
  }
}
