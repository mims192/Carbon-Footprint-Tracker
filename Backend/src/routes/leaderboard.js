import express from "express";
import { getLeaderboard, getUserRank } from "../controllers/leaderboardController.js";

const router = express.Router();

// This will be accessible as /api/leaderboard (base path)
router.get("/", getLeaderboard);

// This will be accessible as /api/leaderboard/rank/:userId
router.get("/rank/:userId", getUserRank);

export default router;