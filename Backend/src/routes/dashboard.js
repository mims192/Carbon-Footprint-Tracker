// dashboard.js - Enhanced with RF prediction
import express from "express";
import Activity from "../models/Activity.js";
import UserProfile from "../models/UserProfile.js";
import axios from "axios";

const router = express.Router();
const PY_URL = process.env.PYTHON_SERVICE_URL || "http://localhost:5000";

// Get monthly carbon summary for user
router.get("/:userId/monthly-carbon", async (req, res) => {
  try {
    const userId = req.params.userId;
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({ error: "Month and Year are required" });
    }

    // Create a date range for the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    const activities = await Activity.find({
      userId,
      createdAt: { $gte: startDate, $lt: endDate },
    }).sort({ createdAt: -1 });

    const monthlyTotal = activities.reduce(
      (sum, a) => sum + (a.co2_kg || 0),
      0
    );

    // Calculate category breakdown
    const breakdown = {};
    activities.forEach((a) => {
      const cat = a.category.toLowerCase();
      breakdown[cat] = (breakdown[cat] || 0) + a.co2_kg;
    });

    res.json({
      monthlyTotal: Math.round(monthlyTotal * 100) / 100,
      activities,
      breakdown,
    });
  } catch (err) {
    console.error("Monthly Carbon Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Calculate user profile averages
router.post("/:userId/calculate-profile", async (req, res) => {
  try {
    const userId = req.params.userId;
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({ error: "Month and Year are required" });
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    const activities = await Activity.find({
      userId,
      createdAt: { $gte: startDate, $lt: endDate },
    });

    // Calculate averages
    const daysInMonth = new Date(year, month, 0).getDate();
    
    let totalTravel = 0;
    let totalElectricity = 0;
    let totalLpg = 0;
    let totalNonvegMeals = 0;
    let totalItems = 0;

    activities.forEach((a) => {
      const cat = a.category.toLowerCase();
      const details = a.details || {};

      if (cat === "transport") {
        totalTravel += details.distance_km || 0;
      } else if (cat === "electricity") {
        totalElectricity += details.kwh || 0;
      } else if (cat === "lpg") {
        totalLpg += details.kg || 0;
      } else if (cat === "food") {
        totalNonvegMeals += details.nonveg_meals || 0;
      } else if (cat === "shopping") {
        totalItems += details.items || 0;
      }
    });

    const profile = {
      userId,
      avg_daily_travel_km: totalTravel / daysInMonth,
      avg_electricity_kwh: totalElectricity,
      avg_lpg_kg: totalLpg,
      avg_nonveg_meals: totalNonvegMeals,
      avg_items_purchased: totalItems,
    };

    // Update or create user profile
    await UserProfile.findOneAndUpdate(
      { userId },
      profile,
      { upsert: true, new: true }
    );

    res.json({ success: true, profile });
  } catch (err) {
    console.error("Calculate Profile Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Get carbon prediction for next month
router.get("/:userId/predict-next-month", async (req, res) => {
  try {
    const userId = req.params.userId;
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({ error: "Month and Year are required" });
    }

    // Get user profile
    const userProfile = await UserProfile.findOne({ userId });
    if (!userProfile) {
      return res.status(404).json({
        error: "User profile not found. Please calculate profile first.",
      });
    }

    // Get last month's total emission
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    const activities = await Activity.find({
      userId,
      createdAt: { $gte: startDate, $lt: endDate },
    });

    const lastMonthEmission = activities.reduce(
      (sum, a) => sum + (a.co2_kg || 0),
      0
    );

    // Call Python ML service for prediction
    const predictionData = {
      avg_daily_travel_km: userProfile.avg_daily_travel_km || 0,
      avg_electricity_kwh: userProfile.avg_electricity_kwh || 0,
      avg_lpg_kg: userProfile.avg_lpg_kg || 0,
      avg_nonveg_meals: userProfile.avg_nonveg_meals || 0,
      avg_items_purchased: userProfile.avg_items_purchased || 0,
      last_month_emission: lastMonthEmission,
    };

    const mlResponse = await axios.post(
      `${PY_URL}/predict_carbon_emission`,
      predictionData
    );

    res.json({
      success: true,
      prediction: mlResponse.data,
      lastMonthEmission: Math.round(lastMonthEmission * 100) / 100,
      userProfile: predictionData,
    });
  } catch (err) {
    console.error("Prediction Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Get comprehensive dashboard data
router.get("/:userId/dashboard", async (req, res) => {
  try {
    const userId = req.params.userId;
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    // Get current month data
    const startDate = new Date(currentYear, currentMonth - 1, 1);
    const endDate = new Date(currentYear, currentMonth, 1);

    const activities = await Activity.find({
      userId,
      createdAt: { $gte: startDate, $lt: endDate },
    }).sort({ createdAt: -1 });

    const currentMonthTotal = activities.reduce(
      (sum, a) => sum + (a.co2_kg || 0),
      0
    );

    // Get prediction for next month
    const userProfile = await UserProfile.findOne({ userId });
    let prediction = null;

    if (userProfile && currentMonthTotal > 0) {
      try {
        const predictionData = {
          avg_daily_travel_km: userProfile.avg_daily_travel_km || 0,
          avg_electricity_kwh: userProfile.avg_electricity_kwh || 0,
          avg_lpg_kg: userProfile.avg_lpg_kg || 0,
          avg_nonveg_meals: userProfile.avg_nonveg_meals || 0,
          avg_items_purchased: userProfile.avg_items_purchased || 0,
          last_month_emission: currentMonthTotal,
        };

        const mlResponse = await axios.post(
          `${PY_URL}/predict_carbon_emission`,
          predictionData
        );
        prediction = mlResponse.data;
      } catch (mlError) {
        console.error("ML Prediction Error:", mlError.message);
      }
    }

    res.json({
      currentMonth: {
        month: currentMonth,
        year: currentYear,
        totalEmission: Math.round(currentMonthTotal * 100) / 100,
        activities: activities.slice(0, 10), // Latest 10 activities
      },
      prediction,
      hasProfile: !!userProfile,
    });
  } catch (err) {
    console.error("Dashboard Error:", err);
    res.status(500).json({ error: err.message });
  }
});
// Add this test endpoint
router.get("/test-python-connection", async (req, res) => {
  try {
    console.log("Testing connection to:", PY_URL);
    const response = await axios.post(`${PY_URL}/predict_carbon_emission`, {
      avg_daily_travel_km: 20,
      avg_electricity_kwh: 150,
      avg_lpg_kg: 20,
      avg_nonveg_meals: 12,
      avg_items_purchased: 8,
      last_month_emission: 200
    });
    res.json({ success: true, data: response.data });
  } catch (err) {
    console.error("Connection error:", err.message);
    res.status(500).json({ 
      error: err.message,
      pyUrl: PY_URL 
    });
  }
});
export default router;