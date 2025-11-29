import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api";

import RecentActivityss from "../Components/RecentActvityss";
import QuickAddActivity from "../Components/QuickAddActivity";
import Navbar from "../Components/Navbar";
import Leaderboard from "../Components/Leaderboard";
export default function Dashboard() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ monthlyTotal: 0, activities: [] });

  useEffect(()=> {
    if (!userId) {
      // not logged in - redirect to login
      navigate("/login");
      return;
    }
    loadUser();
    loadStats();
  }, [userId]);

  async function loadUser(){
    try {
      const res = await API.get(`/auth/${userId}`);
      setUser(res.data.user);
    } catch (err) {
      console.error(err);
    }
  }

  async function loadStats(){
    try {
      const { data } = await API.get(`/dashboard/${userId}/monthly-carbon`);
      setStats(data);
    } catch (err) {
      console.error(err);
    }
  }

  // Calculate total points from all activities
  const totalPoints = stats.activities.reduce((sum, activity) => sum + (activity.points || 0), 0);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <Navbar />
      
      <div className="p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold">Welcome{user ? `, ${user.username}` : ""}</h2>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-slate-800 p-4 rounded">
            <div className="text-slate-400 text-sm mb-1">Monthly Carbon</div>
            <span className="text-2xl font-bold">{stats.monthlyTotal.toFixed(3)} kg</span>
          </div>
          <div className="bg-slate-800 p-4 rounded">
            <div className="text-slate-400 text-sm mb-1">Total Points</div>
            <span className="text-2xl font-bold text-green-400">{totalPoints}</span>
          </div>
        </div>

        <div className="mb-8">
          <QuickAddActivity userId={userId} onAdded={loadStats}/>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 bg-slate-800 p-6 rounded">
            <h2 className="text-xl mb-4">Recent Activities</h2>
            <RecentActivityss activities={stats.activities} />
          </div>
          <div className="bg-slate-800 p-6 rounded">
            <h2 className="text-xl">Eco Tips</h2>
            <p className="mt-4 text-slate-300 border-b border-slate-700 pb-2">Switch to LED bulbs to reduce electricity consumption by up to 75%.</p>
            <p className="mt-4 text-slate-300 border-b border-slate-700 pb-2">Use public transport instead of driving to reduce carbon emissions.</p>
            <p className="mt-4 text-slate-300 border-b border-slate-700 pb-2">Reduce, reuse, and recycle to reduce waste.</p>
            <p className="mt-4 text-slate-300 border-b border-slate-700 pb-2">Use a reusable water bottle instead of a plastic one.</p>
          </div>
      
        </div>
        <Leaderboard />
      </div>
    </div>
  );
}