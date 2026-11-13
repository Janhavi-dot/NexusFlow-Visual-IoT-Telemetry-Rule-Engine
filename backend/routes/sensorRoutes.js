import express from "express";
import SensorReading from "../models/SensorReading.js";

const router = express.Router();

// POST: Receive and save sensor data
router.post("/ingest", async (req, res) => {
  try {
    const {
      sensorId,
      sensorType,
      location,
      temperature,
      humidity,
      value,
      unit,
      status,
    } = req.body;

    // Validate required fields
    if (!sensorId || !sensorType || value === undefined) {
      return res.status(400).json({
        success: false,
        message: "sensorId, sensorType and value are required",
      });
    }

    // Save sensor reading
    const reading = await SensorReading.create({
      metadata: {
        sensorId,
        sensorType,
        location,
      },
      temperature,
      humidity,
      value,
      unit,
      status,
      timestamp: new Date(),
    });

    return res.status(201).json({
      success: true,
      message: "Sensor reading saved successfully",
      data: reading,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
