import React, { useEffect, useState } from "react";
import { Trophy, Medal, Award } from "lucide-react";
import API from "../api";

function Leaderboard({ userId }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [period, setPeriod] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, [period, userId]);

  async function loadLeaderboard() {
    try {
      setLoading(true);
      const { data } = await API.get("/leaderboard", {
        params: {
          userId,
          period,
          limit: 10,
        },
      });
      setLeaderboard(data.leaderboard);
      setCurrentUser(data.currentUser);
    } catch (err) {
      console.error("Error loading leaderboard:", err);
    } finally {
      setLoading(false);
    }
  }

  const getRankColor = (rank) => {
    if (rank === 1) return "text-yellow-400";
    if (rank === 2) return "text-gray-300";
    if (rank === 3) return "text-orange-400";
    return "text-gray-400";
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-300" />;
    if (rank === 3) return <Award className="w-5 h-5 text-orange-400" />;
    return null;
  };

  const getInitial = (username) => {
    return username ? username.charAt(0).toUpperCase() : "?";
  };

  const getAvatarColor = (rank) => {
    if (rank === 1) return "bg-yellow-600";
    if (rank === 2) return "bg-gray-600";
    if (rank === 3) return "bg-orange-600";
    return "bg-green-600";
  };

  if (loading) {
    return (
      <div className="bg-slate-800 rounded-2xl shadow-lg p-6 mt-8">
        <div className="flex items-center justify-center py-8">
          <div className="text-slate-400">Loading leaderboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 text-white rounded-2xl shadow-lg p-6 mt-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Trophy className="text-yellow-400" size={24} />
          <h2 className="text-xl font-semibold">Leaderboard</h2>
        </div>

        <button
          onClick={() => setPeriod(period === "all" ? "month" : "all")}
          className="text-sm bg-slate-700 px-3 py-1 rounded-lg hover:bg-slate-600 transition"
        >
          {period === "all" ? "All Time" : "This Month"}
        </button>
      </div>

      <div className="space-y-3">
        {leaderboard.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            No users found. Be the first to add activities!
          </div>
        ) : (
          <>
            {leaderboard.map((user) => (
              <div
                key={user._id}
                className={`flex items-center justify-between p-4 rounded-xl transition ${
                  user.currentUser
                    ? "bg-green-900/40 border border-green-500"
                    : "bg-slate-700 hover:bg-slate-600"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 w-8">
                    {getRankIcon(user.rank) || (
                      <span
                        className={`text-lg font-semibold ${getRankColor(
                          user.rank
                        )}`}
                      >
                        #{user.rank}
                      </span>
                    )}
                  </div>
                  <div
                    className={`w-10 h-10 rounded-full ${getAvatarColor(
                      user.rank
                    )} flex items-center justify-center text-white font-bold`}
                  >
                    {getInitial(user.username)}
                  </div>
                  <div>
                    <p className="font-medium">
                      {user.username}
                      {user.currentUser && (
                        <span className="text-sm text-green-400 ml-2">You</span>
                      )}
                    </p>
                    <p className="text-slate-400 text-sm">
                      Level {user.level} • {user.streak}🔥 streak
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{user.points.toLocaleString()}</p>
                  <p className="text-slate-400 text-sm">points</p>
                </div>
              </div>
            ))}

            {/* Show current user separately if not in top 10 */}
            {currentUser && !leaderboard.find((u) => u.currentUser) && (
              <>
                <div className="text-center text-slate-500 text-sm py-2">
                  ⋮
                </div>
                <div className="flex items-center justify-between bg-green-900/40 border border-green-500 p-4 rounded-xl">
                  <div className="flex items-center gap-4">
                    <span className="text-lg font-semibold text-slate-400 w-8">
                      #{currentUser.rank}
                    </span>
                    <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white font-bold">
                      {getInitial(currentUser.username)}
                    </div>
                    <div>
                      <p className="font-medium">
                        {currentUser.username}
                        <span className="text-sm text-green-400 ml-2">You</span>
                      </p>
                      <p className="text-slate-400 text-sm">
                        Level {currentUser.level} • {currentUser.streak}🔥 streak
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {currentUser.points.toLocaleString()}
                    </p>
                    <p className="text-slate-400 text-sm">points</p>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Leaderboard;