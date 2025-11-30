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

    if (!profiles || profiles.length === 0) {
      return res.status(404).json({ 
        error: "No user profiles found. Please create a profile first." 
      });
    }

    // Convert MongoDB ObjectIds to strings for Python
    const profilesWithStringIds = profiles.map(p => ({
      ...p,
      _id: p._id.toString(),
      userId: p.userId.toString()
    }));

    // 2️⃣ Send to Python model3 recommendation service
    const resp = await axios.post(`${PY_URL}/model3/recommend`, { 
      userId: userId,
      profiles: profilesWithStringIds 
    });

    // 3️⃣ Return the recommendations
    return res.json(resp.data);

  } catch (error) {
    console.error("Recommendation Error:", error.response?.data || error.message);
    return res.status(500).json({ 
      error: error.response?.data?.error || error.message 
    });
  }
});

export default router;