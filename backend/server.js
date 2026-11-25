import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import sensorRoutes from "./routes/sensorRoutes.js";
import { createServer } from "http";
import { Server } from "socket.io";

dotenv.config();

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 5000;

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.set("io", io);

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
    status: "Backend is running",
  });
});

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "NexusFlow server is healthy",
  });
});

// Socket.IO connection
io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

// Start server
const startServer = async () => {
  await connectDB();

  server.listen(PORT, () => {
    console.log(`NexusFlow backend running on port ${PORT}`);
  });
};

startServer();