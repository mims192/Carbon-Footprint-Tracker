
import React, { useState } from "react";

function Navbar({ onLogout }) {
  const [open, setOpen] = useState(false);
 
  return (
    <div>
      <header className="flex justify-between items-center px-8 py-4 border-b border-gray-800 bg-gray-900 relative">
        <h1 className="text-2xl font-semibold text-green-400">
          EcoTrack - Carbon Footprint Tracker
        </h1>

        {/* Settings Icon */}
        <div
          className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-600 transition relative"
          onClick={() => setOpen(!open)}
        >
          <span className="text-gray-300 text-sm">⚙️</span>
        </div>

        {/* Dropdown */}
        {open && (
          <div className="absolute right-8 top-14 bg-gray-800 text-white rounded-md shadow-lg border border-gray-700 w-32 z-50">
            <button
              className="w-full text-left px-4 py-2 hover:bg-gray-700 transition"
              onClick={onLogout}
            >
              Logout
            </button>
          </div>
        )}
      </header>
    </div>
  );
}

export default Navbar;
