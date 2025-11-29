import React, { useEffect, useState } from "react";
import API from "../api";

export default function Recommendations({ userId }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!userId) return;
    loadRecommendation();
  }, [userId]);

  async function loadRecommendation() {
    try {
      const res = await API.get(`/recommend/${userId}/recommendation`);
      setData(res.data);
    } catch (err) {
      console.error(err);
    }
  }

  if (!data) return <p>Loading recommendations...</p>;

  return (
    <div className="bg-slate-800 p-6 mt-6 rounded">
      <h2 className="text-xl font-semibold mb-4">Your Personalized Recommendations</h2>
      <p className="text-slate-400">Cluster: {data.cluster}</p>

      <ul className="mt-4 list-disc pl-6">
        {data.recommendations.map((tip, i) => (
          <li key={i} className="mb-2 text-slate-300">{tip}</li>
        ))}
      </ul>
    </div>
  );
}

