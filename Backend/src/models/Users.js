import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: String,
  passwordHash: String,
  points: { type: Number, default: 0 },
  streak:{type:Number,default:0},
  level: { type: Number, default: 1 },
  lastActivityDate: { type: Date },
  createdAt: { type: Date, default: Date.now }
});
export default mongoose.model("User", userSchema);
