import mongoose from "mongoose";
const activitySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  category: { type: String, required: true }, // Electricity, Transport, Food, Waste, Water, Shopping
  details: { type: mongoose.Schema.Types.Mixed }, // free-form activity payload (distances, bill etc.)
  co2_kg: { type: Number, default: 0 },
  points: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

const Activity=mongoose.model("Activity", activitySchema);
export default Activity;