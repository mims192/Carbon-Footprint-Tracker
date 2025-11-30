import React, { useState } from "react";

export default function RecentActivityss({ activities }) {
  const [showAll, setShowAll] = useState(false);

  const visibleActivities = showAll ? activities : activities.slice(0, 10);

  return (
    <div className="space-y-4">
      {visibleActivities.length === 0 && (
        <p className="text-slate-400 text-sm">No activities recorded.</p>
      )}

      {visibleActivities.map(a => (
        <div key={a._id} className="p-4 bg-slate-700 rounded flex justify-between">
          <div>
            <div className="font-semibold">{a.category}</div>
            <div className="text-sm text-slate-300">
              {new Date(a.createdAt).toLocaleString()}
            </div>
          </div>

          <div className="text-right">
            <div className="font-semibold">
              {a.details?.co2_kg || a.co2_kg} kg CO₂
            </div>
            <div className="text-green-400">
              +{a.details?.points || a.points} pts
            </div>
          </div>
        </div>
      ))}

      {/* View More / View Less Button */}
      {activities.length > 10 && (
        <button
          className="w-full text-center py-2 px-3 border border-slate-500 rounded text-sm hover:bg-slate-600 transition"
          onClick={() => setShowAll(prev => !prev)}
        >
          {showAll ? "View Less" : "View More"}
        </button>
      )}
    </div>
  );
}
