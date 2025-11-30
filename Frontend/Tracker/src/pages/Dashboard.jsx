import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import API from "../api";
import RecentActivityss from "../Components/RecentActvityss";
import QuickAddActivity from "../Components/QuickAddActivity";
import Navbar from "../Components/Navbar";
import Leaderboard from "../Components/Leaderboard";
import Recommendations from "./Recommendations";

export default function Dashboard() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const now = new Date();
  const [month, setMonth] = useState(Number(searchParams.get("month")) || now.getMonth() + 1);
  const [year, setYear] = useState(Number(searchParams.get("year")) || now.getFullYear());
  
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ monthlyTotal: 0, activities: [] });
  const [previousMonthTotal, setPreviousMonthTotal] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loadingPrediction, setLoadingPrediction] = useState(false);

  useEffect(() => {
    if (!userId) return navigate("/login");
    loadUser();
    loadStats();
    loadPrediction();
  }, [userId, month, year]);

  async function loadUser() {
    try {
      const res = await API.get(`/auth/${userId}`);
      setUser(res.data.user);
    } catch (err) {
      console.error(err);
    }
  }

  async function loadStats() {
    try {
      setSearchParams({ month, year });
      const { data } = await API.get(`/dashboard/${userId}/monthly-carbon`, {
        params: { month, year },
      });
      setStats(data);

      const prevMonth = month === 1 ? 12 : month - 1;
      const prevYear = month === 1 ? year - 1 : year;
      const prevResp = await API.get(`/dashboard/${userId}/monthly-carbon`, {
        params: { month: prevMonth, year: prevYear },
      });
      setPreviousMonthTotal(prevResp.data.monthlyTotal);
    } catch (err) {
      console.log(err);
    }
  }

  async function loadPrediction() {
    try {
      setLoadingPrediction(true);
      
      // First, calculate the profile for current month
      await API.post(`/dashboard/${userId}/calculate-profile?month=${month}&year=${year}`);
      
      // Then get the prediction
      const { data } = await API.get(`/dashboard/${userId}/predict-next-month`, {
        params: { month, year },
      });
      
      setPrediction(data);
    } catch (err) {
      console.error("Prediction error:", err);
      setPrediction(null);
    } finally {
      setLoadingPrediction(false);
    }
  }

  async function handleActivityAdded() {
    await loadUser();
    await loadStats();
    await loadPrediction(); // Reload prediction when new activity added
  }

  let comparisonText = "No previous data";
  let comparisonClass = "";
  if (previousMonthTotal !== null) {
    if (stats.monthlyTotal < previousMonthTotal) {
      comparisonText = `▼ Improved from ${previousMonthTotal.toFixed(2)} kg`;
      comparisonClass = "text-green-400";
    } else if (stats.monthlyTotal > previousMonthTotal) {
      comparisonText = `▲ Higher than ${previousMonthTotal.toFixed(2)} kg`;
      comparisonClass = "text-red-400";
    } else {
      comparisonText = "No change";
      comparisonClass = "text-yellow-400";
    }
  }

  const totalPoints = stats.activities.reduce(
    (sum, a) => sum + (a.points || 0),
    0
  );
 
  // Get next month name
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  const nextMonthName = new Date(nextYear, nextMonth - 1).toLocaleString("default", { month: "long" });
  
   const handleLogout = () => {
    // Clear stored auth/user data
    localStorage.removeItem("userId");
    localStorage.removeItem("token");

    // Redirect to login page
    navigate("/login");
  };
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <Navbar onLogout={handleLogout} />
      <div className="p-8">
        <h2 className="text-2xl font-semibold mb-6">
          Welcome{user ? `, ${user.username}` : ""}
        </h2>

        {/* PREDICTION CARD - Featured at Top */}
        {loadingPrediction ? (
  <div className="bg-gradient-to-r from-blue-900 to-purple-900 p-6 rounded-lg mb-8 border-2 border-blue-500 animate-pulse">
    <div className="text-center">
      <div className="text-lg">Loading prediction...</div>
    </div>
  </div>
) : prediction?.prediction ? (
  <div className="bg-gradient-to-r from-blue-900 to-purple-900 p-6 rounded-lg mb-8 border-2 border-blue-500">
    <div className="flex items-center justify-between mb-4">
      <div>
        <h3 className="text-sm text-blue-300 uppercase tracking-wide">Next Month Prediction</h3>
        <p className="text-xs text-slate-400">{nextMonthName} {nextYear}</p>
      </div>

      <div className="text-right">
        <div className="text-4xl font-bold text-white">
          {prediction?.prediction?.predicted_emission_kgCO2}
          <span className="text-lg text-slate-400 ml-2">kg CO₂</span>
        </div>
      </div>
    </div>
  </div>
) : null}


            

        {/* STATS CARDS */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800 p-4 rounded border-2 border-green-500">
            <div className="text-slate-400 text-sm mb-1">
              Carbon for {new Date(year, month - 1).toLocaleString("default", { month: "long" })}{" "}
              {year}
            </div>
            <span className="text-2xl font-bold">{stats.monthlyTotal.toFixed(2)} kg</span>
            <p className={`mt-2 text-sm font-semibold ${comparisonClass}`}>
              {comparisonText}
            </p>
          </div>

          <div className="bg-slate-800 p-4 rounded border-2 border-blue-500">
            <div className="text-slate-400 text-sm mb-1">Total Points</div>
            <span className="text-2xl font-bold text-blue-400">{totalPoints}</span>
            <p className="mt-2 text-xs text-slate-400">
              Keep it up!
            </p>
          </div>

          <div className="bg-slate-800 p-4 rounded border-2 border-yellow-500">
            <div className="text-slate-400 text-sm mb-1">Daily Streak</div>
            <span className="text-2xl font-bold text-yellow-300">
              {user?.streak || 0} 🔥
            </span>
            <p className="mt-2 text-xs text-slate-400">
              Keep it going!
            </p>
          </div>

          <div className="bg-slate-800 p-4 rounded border-2 border-purple-500">
            <div className="text-slate-400 text-sm mb-1">Level</div>
            <span className="text-2xl font-bold text-purple-300">
              {user?.level || 1}
            </span>
            <p className="mt-2 text-xs text-slate-400">
              Next: {((user?.level || 1) * 500) - (user?.points || 0)} pts
            </p>
          </div>
        </div>

        {/* Month selection */}
        <div className="flex gap-4 mb-6">
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="bg-slate-800 px-4 py-2 rounded w-[50%]"
          >
            {[...Array(12)].map((_, i) => (
              <option key={i} value={i + 1}>
                {new Date(0, i).toLocaleString("default", { month: "long" })}
              </option>
            ))}
          </select>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="bg-slate-800 px-4 py-2 rounded w-[50%]"
          >
            {[2023, 2024, 2025, 2026].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <button
            onClick={() => {
              loadStats();
              loadPrediction();
            }}
            className="bg-green-500 px-6 py-2 rounded font-semibold hover:bg-green-600 transition-colors"
          >
            View
          </button>
        </div>

        <QuickAddActivity userId={userId} onAdded={handleActivityAdded} />

        {/* MAIN GRID LAYOUT */}
        <div className="grid grid-cols-3 gap-6 mt-8">
          <div className="col-span-2 bg-slate-800 p-6 rounded">
            <h2 className="text-xl mb-4">Recent Activities</h2>
            <RecentActivityss activities={stats.activities} />
          </div>

          <div className="flex flex-col gap-6">
            <Recommendations userId={userId} />
            
            <div className="bg-slate-800 p-6 rounded">
              <h2 className="text-xl mb-4">Eco Tips</h2>
              <div className="space-y-2">
                <p className="border-b border-slate-700 pb-2 text-slate-300">💡 Use LED bulbs</p>
                <p className="border-b border-slate-700 pb-2 text-slate-300">🚶 Walk or use public transport</p>
                <p className="border-b border-slate-700 pb-2 text-slate-300">♻️ Recycle</p>
                <p className="border-b border-slate-700 pb-2 text-slate-300">🔄 Use reusable items</p>
                <p className="border-b border-slate-700 pb-2 text-slate-300">⚡ Choose energy-efficient appliances</p>
                <p className="border-b border-slate-700 pb-2 text-slate-300">🚰 Carry your own water bottle</p>
                <p className="border-b border-slate-700 pb-2 text-slate-300">🚫 Avoid single-use plastics</p>
                <p className="border-b border-slate-700 pb-2 text-slate-300">🌱 Compost kitchen waste</p>
                <p className="border-b border-slate-700 pb-2 text-slate-300">🥗 Buy local and seasonal foods</p>
                <p className="border-b border-slate-700 pb-2 text-slate-300">👕 Air-dry clothes</p>
              </div>
            </div>
          </div>
        </div>

        <Leaderboard userId={userId} />
      </div>
    </div>
  );
}