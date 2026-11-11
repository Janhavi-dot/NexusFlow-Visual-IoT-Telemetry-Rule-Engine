
import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "./config/db.js";
import SensorReading from "./models/SensorReading.js";

dotenv.config();

const testSensorReading = async () => {
  try {
    await connectDB();

    const reading = await SensorReading.create({
      timestamp: new Date(),

      metadata: {
        sensorId: "sensor-001",
        sensorType: "temperature",
        location: "Lab 1",
      },

      temperature: 26.5,
      humidity: 60,
      value: 26.5,
    });

    console.log("Sensor reading saved successfully!");

    const savedReading = await SensorReading.findById(reading._id);

    console.log("Retrieved sensor reading:");
    console.log(savedReading);

  } catch (error) {
    console.error("Test failed:", error.message);
  } finally {
    await mongoose.connection.close();
  }
};

testSensorReading();
