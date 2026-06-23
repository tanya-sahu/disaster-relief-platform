import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    password: "",
    role: "volunteer",
  });
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
      const response = await axios.post("/api/v1/users/register", formData);
      alert(response.data.message || "Registration Successful!");
      
      navigate("/dashboard");
    } catch (error) {
      // Catching API ERROR from Backend
      setError(
        error.response?.data?.message || "Registration failed. Try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-950 min-h-[85vh] flex items-center justify-center p-6 text-white">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Join the Mission
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            Create an account to start providing or receiving aid.
          </p>
        </div>

        {/* Error Alert Bar */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-xs font-medium mb-4">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">
              Full Name
            </label>
            <input
              type="text"
              name="fullName"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="Rahul Sharma"
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 p-3 rounded-lg text-sm outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">
              Phone Number
            </label>
            <input
              type="text"
              name="phone"
              required
              value={formData.phone}
              onChange={handleChange}
              placeholder="XXXXXXXXXX"
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 p-3 rounded-lg text-sm outline-none transition-all"
            />
          </div>

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

          {/* Role selection makes the system structure clear to recruiters */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">
              Select Your Role
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 p-3 rounded-lg text-sm outline-none text-slate-300 transition-all"
            >
              <option value="volunteer">Volunteer (I want to help)</option>
              <option value="ngo">NGO Admin (I want to manage requests)</option>
              <option value="victim">Victim (I need support)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-lg text-sm transition-all transform hover:-translate-y-0.5"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-400">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-emerald-400 font-medium hover:underline"
          >
            Login here
          </Link>
        </div>
      </div>
    </div>
  );
}
