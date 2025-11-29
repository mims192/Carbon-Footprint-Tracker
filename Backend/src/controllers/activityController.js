import Activity from "../models/Activity.js";
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

    const activity = new Activity({
      userId,
      category,
      details,
      co2_kg: co2,
      points,
    });

    await activity.save();

    return res.json({ success: true, activity });

  } catch (err) {
    console.error("Add Activity Error:", err);
    return res.status(500).json({ error: err.message });
  }
};
