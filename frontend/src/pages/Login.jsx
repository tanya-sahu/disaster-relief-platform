import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post("api/v1/users/login", formData, {
        withCredentials: true, // cookie and IWT token
      });

      alert("Logged in successfully! 👋");

      // Role-Based Redirection: Backend response se user ka role check karke use uske sahi dashboard par bhejo
      console.log("Backend Response:", response.data); // 👈 Yeh line add kijiye
      const userRole = response.data.data.user.role.toLowerCase();
      window.location.href = "/";
    } catch (err) {
      setError(err.response?.data?.message || "Invalid Email or Password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-950 min-h-[85vh] flex items-center justify-center p-6 text-white">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl relative">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Welcome Back
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            Secure access to your disaster relief workspace.
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-xs font-medium mb-4">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="name@example.com"
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 p-3 rounded-lg text-sm outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 p-3 rounded-lg text-sm outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-lg text-sm transition-all transform hover:-translate-y-0.5"
          >
            {loading ? "Verifying..." : "Sign In"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-400">
          New to the platform?{" "}
          <Link
            to="/register"
            className="text-emerald-400 font-medium hover:underline"
          >
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
}
