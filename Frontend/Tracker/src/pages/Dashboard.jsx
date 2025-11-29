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

  // Load from URL if exists, else default current month
  const [month, setMonth] = useState(Number(searchParams.get("month")) || now.getMonth() + 1);
  const [year, setYear] = useState(Number(searchParams.get("year")) || now.getFullYear());

  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ monthlyTotal: 0, activities: [] });
  const [previousMonthTotal, setPreviousMonthTotal] = useState(null);

  useEffect(() => {
    if (!userId) return navigate("/login");
    loadUser();
    loadStats();
  }, [userId]);

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
      // Save month/year in URL (so refresh keeps filter)
      setSearchParams({ month, year });

      const { data } = await API.get(`/dashboard/${userId}/monthly-carbon`, {
        params: { month, year },
      });
      setStats(data);

      // Compute previous month
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

  // Compare with previous month
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

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <Navbar />

      <div className="p-8">
        <h2 className="text-2xl font-semibold mb-6">
          Welcome{user ? `, ${user.username}` : ""}
        </h2>

        {/* Month selection */}
        <div className="flex gap-4 mb-6">
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="bg-slate-800 px-4 py-2 rounded"
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
            className="bg-slate-800 px-4 py-2 rounded"
          >
            {[2023, 2024, 2025, 2026].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          <button
            onClick={loadStats}
            className="bg-green-500 px-6 py-2 rounded font-semibold"
          >
            View
          </button>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-slate-800 p-4 rounded border-2 border-green-500">
            <div className="text-slate-400 text-sm mb-1">
              Carbon for {new Date(year, month - 1).toLocaleString("default", { month: "long" })} {year}
            </div>
            <span className="text-2xl font-bold">{stats.monthlyTotal.toFixed(2)} kg</span>
            <p className={`mt-2 text-sm font-semibold ${comparisonClass}`}>
              {comparisonText}
            </p>
          </div>

          <div className="bg-slate-800 p-4 rounded border-2 border-blue-500">
            <div className="text-slate-400 text-sm mb-1">Total Points</div>
            <span className="text-2xl font-bold text-green-400">{totalPoints}</span>
          </div>
        </div>

        <QuickAddActivity userId={userId} onAdded={loadStats} />

        <div className="grid grid-cols-3 gap-6 mt-8">
          <div className="col-span-2 bg-slate-800 p-6 rounded">
            <h2 className="text-xl mb-4">Recent Activities</h2>
            <RecentActivityss activities={stats.activities} />
          </div>

          <div className="bg-slate-800 p-6 rounded">
            <h2 className="text-xl">Eco Tips</h2>
            <p className="mt-4 border-b pb-2 text-slate-300">Use LED bulbs</p>
            <p className="mt-4 border-b pb-2 text-slate-300">Walk or use public transport</p>
            <p className="mt-4 border-b pb-2 text-slate-300">Recycle</p>
            <p className="mt-4 border-b pb-2 text-slate-300">Use reusable items</p>
          </div>
        </div>

        <Leaderboard />

        <Recommendations userId={userId}/>
      </div>
    </div>
  );
}
