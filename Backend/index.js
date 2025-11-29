import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

import activityRoutes from "./src/routes/activity.js";
import dashboardRoutes from "./src/routes/dashboard.js";
import modelProxy from "./src/routes/modelProxy.js";
import authRoutes from "./src/routes/auth.js"
import recommendationroutes from "./src/routes/recommendation.js"

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true, // if you need cookies
  
}));


app.options("*", cors());

app.use("/api/auth", authRoutes);

app.use("/api/activity", activityRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/model", modelProxy);
app.use("/api/recommend", recommendationroutes);


const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URI, { })
  .then(()=> {
    console.log("Mongo connected");
    app.listen(PORT, ()=> console.log("Server listening", PORT));
  }).catch(err=>console.error(err));
