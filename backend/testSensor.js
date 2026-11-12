
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
    sensorId: "sensor-002",
    sensorType: "humidity",
    location: "Lab 2",
  },

  temperature: 25,
  humidity: 65,
  value: 65,
  unit: "%",
  status: "normal",
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
