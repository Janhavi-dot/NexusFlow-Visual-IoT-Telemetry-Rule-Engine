
import mongoose from "mongoose";

const sensorReadingSchema = new mongoose.Schema(
  {
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
    },

    metadata: {
      sensorId: {
        type: String,
        required: true,
      },

      sensorType: {
        type: String,
        required: true,
        enum: ["temperature", "humidity", "motion", "light", "generic"],
      },

      location: {
        type: String,
        default: "Unknown",
      },
    },

    temperature: Number,

    humidity: Number,

    value: {
      type: Number,
      required: true,
    },

    unit: {
      type: String,
      default: "unit",
    },

    status: {
      type: String,
      enum: ["normal", "warning", "critical"],
      default: "normal",
    },
  },
  {
    versionKey: false,
  }
);

const SensorReading = mongoose.model(
  "SensorReading",
  sensorReadingSchema,
  "sensor_readings"
);

export default SensorReading;
