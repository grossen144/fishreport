import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import reportRoutes from "./routes/reports";
import weatherRoutes from "./routes/weather";
import { errorHandler } from "./middleware/error";
import authRoutes from "./routes/auth";
import userRoutes from "./routes/users";

dotenv.config();

const app = express();
const port = process.env.PORT || 3003;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/weather", weatherRoutes);
app.use("/api/users", userRoutes);

// Error handling
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
