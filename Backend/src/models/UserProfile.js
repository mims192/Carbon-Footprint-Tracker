import mongoose from "mongoose";
const schema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  avg_daily_travel_km: Number,
  avg_electricity_kwh: Number,
  avg_lpg_kg: Number,
  avg_nonveg_meals: Number,
  avg_items_purchased: Number,
  cluster_label: Number,
  cluster_name: String
});
export default mongoose.model("UserProfile", schema);
