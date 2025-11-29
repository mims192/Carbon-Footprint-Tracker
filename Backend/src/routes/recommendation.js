import express from "express";
import UserProfile from "../models/UserProfile.js";
import axios from "axios";

const router = express.Router();
const PY_URL = process.env.PYTHON_SERVICE_URL || "http://localhost:5000";

// Get recommendations based on ML cluster
router.get("/:userId/recommendation", async (req, res) => {
  try {
    const { userId } = req.params;

    // 1️⃣ Fetch all profiles to run clustering
    const profiles = await UserProfile.find().lean();

    // 2️⃣ Send to Python clustering service
    const resp = await axios.post(`${PY_URL}/model3/cluster`, { profiles });

    const { profiles: clusteredProfiles, labels } = resp.data;

    // 3️⃣ Find cluster of current user
    const userData = clusteredProfiles.find((u) => u._id == userId);

    if (!userData) {
      return res.status(404).json({ error: "User not found in clustering results" });
    }

    const userCluster = userData.cluster_label_name;

    // 4️⃣ Recommendations based on cluster type
    const recommendationMap = {
      "Low-Impact / Eco-conscious": [
        "Great job! Keep up your sustainable lifestyle.",
        "Consider sharing your journey to inspire others.",
        "Try composting or solar energy if not already doing."
      ],
      "Moderate Lifestyle": [
        "Try reducing long-distance travel or use public transport.",
        "Switch to energy-efficient appliances.",
        "Reduce purchase frequency and reuse where possible."
      ],
      "High-Impact / Energy Intensive": [
        "Reduce meat consumption and travel emissions.",
        "Reduce electricity use and switch to energy-efficient devices.",
        "Start carbon offsetting or use renewable energy sources."
      ]
    };

    const recommendations = recommendationMap[userCluster] || ["No recommendations available."];

    return res.json({
      userId,
      cluster: userCluster,
      recommendations
    });

  } catch (error) {
    console.error("Recommendation Error:", error);
    return res.status(500).json({ error: error.message });
  }
});

export default router;
