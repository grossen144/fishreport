import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "./models/User";
import { FishingReport } from "./models/FishingReport";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USERNAME || "david.gross",
  password: process.env.DB_PASSWORD || "fishreport123",
  database: process.env.DB_NAME || "fishreport",
  synchronize: false, // Set to false in production
  logging: false,
  entities: [User, FishingReport],
  migrations: [],
  subscribers: [],
});
