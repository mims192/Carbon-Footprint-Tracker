import React, { useState } from "react";
import API from "../api";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [form, setForm] = useState({ emailOrUsername: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setError("");
    try {
      const res = await API.post("/auth/login", form);
      const user = res.data.user;
      localStorage.setItem("ecotrack_userId", user._id);
      navigate(`/dashboard/${user._id}`);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Login failed");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <form onSubmit={submit} className="bg-slate-800 p-6 rounded w-full max-w-md text-slate-100">
        <h2 className="text-xl font-semibold mb-4">Log in</h2>
        {error && <div className="text-red-400 mb-2">{error}</div>}
        <label className="block mb-2">Email or username</label>
        <input className="w-full p-2 mb-3 bg-slate-700 rounded" value={form.emailOrUsername} onChange={e=>setForm({...form, emailOrUsername: e.target.value})} />
        <label className="block mb-2">Password</label>
        <input type="password" className="w-full p-2 mb-4 bg-slate-700 rounded" value={form.password} onChange={e=>setForm({...form, password: e.target.value})} />
        <button className="w-full py-2 rounded bg-emerald-500">Log in</button>
        <div className="mt-3 text-sm">
          No account? <Link to="/signup" className="text-emerald-400">Sign up</Link>
        </div>
      </form>
    </div>
  );
}
