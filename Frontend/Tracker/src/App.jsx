import React from "react";
import { Link } from "react-router-dom";

export default function App() {
  // If user logged in, show dashboard button
  const userId = localStorage.getItem("ecotrack_userId");

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-100">
      <div className="p-8 bg-slate-800 rounded shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4">Welcome to EcoTrack</h1>

        {userId ? (
          <Link
            className="px-4 py-2 bg-emerald-500 rounded"
            to={`/dashboard/${userId}`}
          >
            Go to Dashboard
          </Link>
        ) : (
          <div className="flex gap-4">
            <Link to="/login" className="px-4 py-2 bg-emerald-500 rounded">
              Login
            </Link>
            <Link to="/signup" className="px-4 py-2 bg-slate-700 rounded">
              Signup
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

