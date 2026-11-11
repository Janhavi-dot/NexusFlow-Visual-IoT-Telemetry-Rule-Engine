
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
      },
      location: {
        type: String,
        default: "Unknown",
      },
    },

    temperature: {
      type: Number,
    },

    humidity: {
      type: Number,
    },

    value: {
      type: Number,
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
