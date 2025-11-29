// Dashboard.js
import express from "express";
import Activity from "../models/Activity.js";
import UserProfile from "../models/UserProfile.js";
import axios from "axios";

const router = express.Router();
const PY_URL = process.env.PYTHON_SERVICE_URL || "http://localhost:5000";

// Get monthly carbon summary for user
router.get("/:userId/monthly-carbon", async (req, res) => {
  const userId = req.params.userId;
  const { month, year } = req.query;

  if (!month || !year) {
    return res.status(400).json({ error: "Month and Year are required" });
  }

  // Create a date range for the month
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 1); // First day of next month

  const activities = await Activity.find({
    userId,
    createdAt: { $gte: startDate, $lte: endDate }
  }).sort({ createdAt: -1 });

  const monthlyTotal = activities.reduce(
    (sum, a) => sum + (a.co2_kg || a.details?.co2_kg || 0),
    0
  );

  res.json({ monthlyTotal, activities });
});

// Clustering route


export default router;
