import React from "react";
import { Trophy } from "lucide-react";

 function Leaderboard() {
  const leaderboard = [
    { rank: 1, name: "EcoWarrior", level: 12, points: 2840, initial: "E" },
    { rank: 2, name: "GreenQueen", level: 11, points: 2650, initial: "G" },
    { rank: 3, name: "CurrentUser", level: 5, points: 1240, initial: "C", currentUser: true },
    { rank: 4, name: "EarthGuardian", level: 5, points: 1180, initial: "E" },
    { rank: 5, name: "NatureNinja", level: 4, points: 980, initial: "N" },
  ];

  return (
    <div class="bg-gray-900 text-white flex flex-col items-center py-4">
    <div class="w-full bg-gray-900 rounded-2xl shadow-lg p-4">
        <div class="flex justify-between items-center mb-6">
        <div class="flex items-center gap-2">
        
          <svg class="text-yellow-400" width="24" height="24" fill="currentColor">
            <circle cx="12" cy="12" r="10"></circle>
          </svg>
          <h2 class="text-xl font-semibold">Leaderboard</h2>
        </div>
  
        <button class="text-sm bg-gray-700 px-3 py-1 rounded-lg hover:bg-gray-600 transition">
          This Month
        </button>
      </div>
  
      <div class="space-y-3">
  
    
        <div class="flex items-center justify-between bg-gray-700 p-4 rounded-xl hover:bg-gray-600 transition">
          <div class="flex items-center gap-4">
            <span class="text-lg font-semibold text-yellow-400">#1</span>
            <div class="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white font-bold">
              E
            </div>
            <div>
              <p class="font-medium">EcoWarrior</p>
              <p class="text-gray-400 text-sm">Level 12</p>
            </div>
          </div>
          <div class="text-right">
            <p class="font-semibold">2840</p>
            <p class="text-gray-400 text-sm">points</p>
          </div>
        </div>
  
   
        <div class="flex items-center justify-between bg-gray-700 p-4 rounded-xl hover:bg-gray-600 transition">
          <div class="flex items-center gap-4">
            <span class="text-lg font-semibold text-gray-300">#2</span>
            <div class="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white font-bold">
              G
            </div>
            <div>
              <p class="font-medium">GreenQueen</p>
              <p class="text-gray-400 text-sm">Level 11</p>
            </div>
          </div>
          <div class="text-right">
            <p class="font-semibold">2650</p>
            <p class="text-gray-400 text-sm">points</p>
          </div>
        </div>
  
   
        <div class="flex items-center justify-between bg-green-900/40 border border-green-500 p-4 rounded-xl hover:bg-gray-600 transition">
          <div class="flex items-center gap-4">
            <span class="text-lg font-semibold text-orange-400">#3</span>
            <div class="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white font-bold">
              C
            </div>
            <div>
              <p class="font-medium">
                CurrentUser <span class="text-sm text-green-400 ml-1">You</span>
              </p>
              <p class="text-gray-400 text-sm">Level 5</p>
            </div>
          </div>
          <div class="text-right">
            <p class="font-semibold">1240</p>
            <p class="text-gray-400 text-sm">points</p>
          </div>
        </div>
  
      
        <div class="flex items-center justify-between bg-gray-700 p-4 rounded-xl hover:bg-gray-600 transition">
          <div class="flex items-center gap-4">
            <span class="text-lg font-semibold text-gray-400">#4</span>
            <div class="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white font-bold">
              E
            </div>
            <div>
              <p class="font-medium">EarthGuardian</p>
              <p class="text-gray-400 text-sm">Level 5</p>
            </div>
          </div>
          <div class="text-right">
            <p class="font-semibold">1180</p>
            <p class="text-gray-400 text-sm">points</p>
          </div>
        </div>
  
   
        <div class="flex items-center justify-between bg-gray-700 p-4 rounded-xl hover:bg-gray-600 transition">
          <div class="flex items-center gap-4">
            <span class="text-lg font-semibold text-gray-400">#5</span>
            <div class="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white font-bold">
              N
            </div>
            <div>
              <p class="font-medium">NatureNinja</p>
              <p class="text-gray-400 text-sm">Level 4</p>
            </div>
          </div>
          <div class="text-right">
            <p class="font-semibold">980</p>
            <p class="text-gray-400 text-sm">points</p>
          </div>
        </div>
  
      </div>
    </div>
  </div>
  
  );
}
export default Leaderboard;