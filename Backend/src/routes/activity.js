import express from "express";
import { addActivity } from "../controllers/activityController.js";
import Activity from "../models/Activity.js";
const router = express.Router();

router.post("/add", addActivity);

 router.get("/user/:userId", async (req, res) => {
  const acts = await Activity.find({ userId: req.params.userId }).sort({createdAt:-1}).limit(50);
  res.json(acts);
});

export default router;
