import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import sensorRoutes from "./routes/sensorRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use("/api/sensors", sensorRoutes);

// Default route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to NexusFlow API!",
    project: "Visual IoT Telemetry & Rule Engine",
    status: "Backend is running"
  });
});

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "NexusFlow server is healthy"
  });
});

// Start server
const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`NexusFlow backend running on port ${PORT}`);
  });
};

startServer();
