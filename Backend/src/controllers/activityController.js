import Activity from "../models/Activity.js";
import User from "../models/Users.js";
import axios from "axios";

const PY_URL = process.env.PYTHON_SERVICE_URL || "http://localhost:5000";

export const addActivity = async (req, res) => {
  try {
    const userId = req.body.userId;
    const { category, details } = req.body;

    const modelResp = await axios.post(`${PY_URL}/predict_daily_emission`, {
      category,
      details
    });

    const co2 = modelResp.data.total_emission_kgCO2 || 0;
    const points = Math.max(1, Math.round(100 - Math.min(90, co2)));

    // Save Activity
    const activity = new Activity({
      userId,
      category,
      details,
      co2_kg: co2,
      points,
    });

    await activity.save();

    // -----------------------------
    //   UPDATE USER STREAK + LEVEL
    // -----------------------------
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const last = user.lastActivityDate
      ? new Date(user.lastActivityDate)
      : null;

    if (!last) {
      user.streak = 1; // first ever activity
    } else {
      last.setHours(0, 0, 0, 0);

      const diffDays = Math.floor((today - last) / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        // Already added today → streak stays same
      } else if (diffDays === 1) {
        user.streak += 1; // consecutive day
      } else {
        user.streak = 1; // missed days → reset
      }
    }

    user.lastActivityDate = today;

    // Add points
    user.points += points;

    // LEVEL SYSTEM (change formula if you want)
    user.level = Math.floor(user.points / 500) + 1;

    await user.save();

    return res.json({
      success: true,
      activity,
      streak: user.streak,
      level: user.level,
      points: user.points
    });

  } catch (err) {
    console.error("Add Activity Error:", err);
    return res.status(500).json({ error: err.message });
  }
};
