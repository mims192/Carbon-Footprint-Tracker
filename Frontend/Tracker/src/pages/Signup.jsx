import React, { useState } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setError("");
    try {
      const res = await API.post("/auth/signup", form);
      const user = res.data.user;
      // save user id locally (no JWT)
      localStorage.setItem("ecotrack_userId", user._id);
      // navigate to dashboard
      navigate(`/dashboard/${user._id}`);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Signup failed");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <form onSubmit={submit} className="bg-slate-800 p-6 rounded w-full max-w-md text-slate-100">
        <h2 className="text-xl font-semibold mb-4">Create account</h2>
        {error && <div className="text-red-400 mb-2">{error}</div>}
        <label className="block mb-2">Username</label>
        <input className="w-full p-2 mb-3 bg-slate-700 rounded" value={form.username} onChange={e=>setForm({...form, username: e.target.value})} />
        <label className="block mb-2">Email</label>
        <input className="w-full p-2 mb-3 bg-slate-700 rounded" value={form.email} onChange={e=>setForm({...form, email: e.target.value})} />
        <label className="block mb-2">Password</label>
        <input type="password" className="w-full p-2 mb-4 bg-slate-700 rounded" value={form.password} onChange={e=>setForm({...form, password: e.target.value})} />
        <button className="w-full py-2 rounded bg-emerald-500">Sign up</button>
      </form>
    </div>
  );
}
