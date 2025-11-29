import express from "express";
import Activity from "../models/Activity.js";
import UserProfile from "../models/UserProfile.js";
import axios from "axios";

const router = express.Router();
const PY_URL = process.env.PYTHON_SERVICE_URL || "http://localhost:5000";

// get monthly carbon summary for user
router.get("/:userId/monthly-carbon", async (req, res) => {
  const userId = req.params.userId;
  const { month, year } = req.query; // if needed
  const from = new Date(); // compute proper date range in prod
  const activities = await Activity.find({ userId }).sort({createdAt:-1}).limit(1000);
  const monthlyTotal = activities.reduce((s, a) => s + (a.details?.co2_kg || 0), 0);
  res.json({ monthlyTotal, activities });
});

// run clustering model on user_profiles or retrieve cluster for a user
router.get("/:userId/cluster", async (req, res) => {
  // fetch user_profiles from DB or pass to python model
  const profiles = await UserProfile.find().lean();
  const resp = await axios.post(`${PY_URL}/model1/cluster`, { profiles });
  return res.json(resp.data);
});

export default router;
