import express from "express";
import axios from "axios";
const router = express.Router();
const PY_URL = process.env.PYTHON_SERVICE_URL || "http://localhost:5000";

router.post("/model1/cluster", async (req,res) => {
  const r=await axios.post(`${PY_URL}/model1/cluster`, req.body);
  res.json(r.data);
});

router.post("/predict_daily_emission", async (req,res) => {
  const r=await axios.post(`${PY_URL}/predict_daily_emission`, req.body);
  res.json(r.data);
});

export default router;
