import React, { useState } from "react";
import API from "../api";

export default function QuickAddActivity({ userId, onAdded }) {
  const [category, setCategory] = useState("Electricity");
  const [form, setForm] = useState({});

  async function submit(e){
    e.preventDefault();
    
    // Map "Food" category to "Cooking" for the model
    const categoryToSend = category === "Food" ? "Cooking" : category;
    
    const res = await API.post("/activity/add", { 
      userId, 
      category: categoryToSend, 
      details: form 
    });
    setForm({});
    if(onAdded) onAdded();
    
  }
  
  return (
    <form onSubmit={submit} className="bg-slate-800 p-6 rounded">
      <div className="flex gap-4 mb-6">
        {["Electricity","Transport","Shopping","Food","Waste","Water"].map(c=>(
          <button type="button" key={c} onClick={()=>setCategory(c)}
            className={`px-3 py-1 rounded transition-colors ${category===c? "bg-green-500":"bg-slate-700 hover:bg-slate-600"}`}>{c}</button>
        ))}
      </div>

      {category === "Transport" && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Distance (km)</label>
            <input 
              type="number"
              step="0.1"
              value={form.distance_travelled_km || ""} 
              onChange={e=>setForm({...form, distance_travelled_km: e.target.value})} 
              className="w-full p-2 rounded bg-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-green-500" 
              placeholder="Enter distance"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Mode</label>
            <select 
              value={form.transport_mode || "Car"} 
              onChange={e=>setForm({...form, transport_mode: e.target.value})} 
              className="w-full p-2 rounded bg-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option>Car</option>
              <option>Bike</option>
              <option>Public Transport</option>
              <option>Walking</option>
              <option>Carpool</option>
              <option>Electric Car</option>
            </select>
          </div>
        </div>
      )}

      {category === "Electricity" && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Electricity Bill (₹)</label>
            <input 
              type="number"
              step="0.01"
              value={form.electricity_bill||""} 
              onChange={e=>setForm({...form, electricity_bill: e.target.value})} 
              className="w-full p-2 rounded bg-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-green-500" 
              placeholder="Enter bill amount"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Days in month</label>
            <input 
              type="number"
              value={form.days_in_month||30} 
              onChange={e=>setForm({...form, days_in_month: e.target.value})} 
              className="w-full p-2 rounded bg-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-green-500" 
              placeholder="Enter number of days"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Source</label>
            <select 
              value={form.electricity_source||"State Grid"} 
              onChange={e=>setForm({...form, electricity_source: e.target.value})} 
              className="w-full p-2 rounded bg-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option>State Grid</option>
              <option>Hybrid</option>
              <option>Solar</option>
            </select>
          </div>
        </div>
      )}

      {category === "Shopping" && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Purchase Amount (₹)</label>
            <input 
              type="number" 
              step="0.01"
              value={form.purchase_amount || ""} 
              onChange={e=>setForm({...form, purchase_amount: e.target.value})} 
              className="w-full p-2 rounded bg-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-green-500" 
              placeholder="Enter amount spent"
            />
          </div>
        </div>
      )}

      {category === "Food" && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Cooking Fuel Type</label>
            <select 
              value={form.cooking_fuel_type || "LPG"} 
              onChange={e=>setForm({...form, cooking_fuel_type: e.target.value})} 
              className="w-full p-2 rounded bg-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option>LPG</option>
              <option>PNG</option>
              <option>Induction</option>
            </select>
          </div>
        </div>
      )}

      {category === "Waste" && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Daily Waste Generated (kg)</label>
            <input 
              type="number" 
              step="0.1"
              value={form.daily_waste_generated_kg || ""} 
              onChange={e=>setForm({...form, daily_waste_generated_kg: e.target.value})} 
              className="w-full p-2 rounded bg-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-green-500" 
              placeholder="Enter waste in kg"
            />
          </div>
        </div>
      )}

      {category === "Water" && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Water Usage (liters)</label>
            <input 
              type="number" 
              step="0.1"
              value={form.liters || ""} 
              onChange={e=>setForm({...form, liters: e.target.value})} 
              className="w-full p-2 rounded bg-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-green-500" 
              placeholder="Enter water usage in liters"
            />
          </div>
        </div>
      )}

      <div className="mt-6">
        <button 
          type="submit"
          className="bg-emerald-500 hover:bg-emerald-600 px-6 py-2 rounded transition-colors font-medium"
        >
          Add Activity
        </button>
      </div>
    </form>
  );
}