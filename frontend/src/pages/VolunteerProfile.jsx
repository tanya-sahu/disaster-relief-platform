import React, { useState } from "react";
import axios from "axios";

export default function VolunteerProfile({ user }) {
  // Signup ka data aur custom volunteer fields props se read aur initial state me load ho jayenge
  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    role: user?.role || "volunteer",
    phone: user?.phone || "",
    skills: user?.skills ? user.skills.join(", ") : "", // Array ko comma separated string banaya
    isAvailable: user?.isAvailable ?? true, // True/False duty switch
    vehicleAvailable: user?.vehicleAvailable || "none",
    currentAddress: user?.currentAddress || "",
  });

  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Availability Switch ka custom handler
  const toggleAvailability = () => {
    setFormData((prev) => ({ ...prev, isAvailable: !prev.isAvailable }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setMessage({ type: "", text: "" });

    // Skills string ko dobara backend ke liye clean array me map karna
    const cleanedSkills = formData.skills
      .split(",")
      .map((skill) => skill.trim())
      .filter((skill) => skill !== "");

    const payload = {
      ...formData,
      skills: cleanedSkills,
    };

    try {
      // Backend update profile route
      await axios.put("/api/v1/users/update-profile", payload, { withCredentials: true });
      setMessage({ type: "success", text: "Volunteer operations profile synced! 🪖" });
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to update deployment metrics",
      });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="bg-slate-950 min-h-screen text-slate-100 p-6 font-sans flex items-center justify-center">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl"></div>

        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
              🛡️ Response Force Profile
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              Configure your tactical skills, on-field tools, and live dispatch logs.
            </p>
          </div>

          {/* LIVE DUTY TOGGLE SWITCH */}
          <button
            type="button"
            onClick={toggleAvailability}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all border ${
              formData.isAvailable
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                : "bg-slate-950 border-slate-800 text-slate-500 hover:bg-slate-800"
            }`}
          >
            ● {formData.isAvailable ? "Active On-Duty" : "Standby (Off)"}
          </button>
        </div>

        {message.text && (
          <div
            className={`p-3 rounded-lg text-xs font-medium mb-5 border ${
              message.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                : "bg-red-500/10 border-red-500/20 text-red-400"
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* SECTION 1: SIGNUP CREDENTIALS (🔒 READ ONLY) */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/60 space-y-4">
            <h3 className="text-xs font-bold tracking-wider text-slate-500 uppercase">
              Core Identity Tokens
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">
                  Volunteer Full Name
                </label>
                <input
                  type="text"
                  disabled
                  value={formData.fullName}
                  className="w-full bg-slate-900/50 border border-slate-800 p-3 rounded-lg text-sm text-slate-400 cursor-not-allowed outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">
                  Security Node Role
                </label>
                <input
                  type="text"
                  disabled
                  value={formData.role.toUpperCase()}
                  className="w-full bg-slate-900/50 border border-slate-800 p-3 rounded-lg text-sm text-blue-400 font-mono tracking-widest cursor-not-allowed outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">
                Communications Email
              </label>
              <input
                type="email"
                disabled
                value={formData.email}
                className="w-full bg-slate-900/50 border border-slate-800 p-3 rounded-lg text-sm text-slate-400 cursor-not-allowed outline-none"
              />
            </div>
          </div>

          {/* SECTION 2: EDITABLE VOLUNTEER METRICS */}
          <div className="space-y-4 pt-2">
            <h3 className="text-xs font-bold tracking-wider text-slate-500 uppercase">
              Operational Competencies
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">
                  Contact Mobile Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="e.g. +91 9123456789"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 p-3 rounded-lg text-sm outline-none transition-all text-slate-200"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">
                  Logistics / Vehicle Access
                </label>
                <select
                  name="vehicleAvailable"
                  value={formData.vehicleAvailable}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 p-3 rounded-lg text-sm outline-none transition-all text-slate-300"
                >
                  <option value="none">No Vehicle / Foot Operations</option>
                  <option value="two-wheeler">Two-Wheeler (Bike/Scooter)</option>
                  <option value="four-wheeler">Four-Wheeler (Car/SUV)</option>
                  <option value="heavy">Heavy Logistics (Truck/Ambulance)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">
                Specialized Skills (Comma Separated)
              </label>
              <input
                type="text"
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                placeholder="e.g. First Aid, Swimmer, Cooking, Driving, Crowd Control"
                className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 p-3 rounded-lg text-sm outline-none transition-all text-slate-200"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                Separate multiples with a comma (,). These help NGOs find you for matching relief pipelines.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">
                Operational Base Address / Deployment Zone
              </label>
              <textarea
                name="currentAddress"
                rows="2"
                required
                value={formData.currentAddress}
                onChange={handleChange}
                placeholder="Where are you stationed or ready to deploy from?"
                className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 p-3 rounded-lg text-sm outline-none transition-all resize-none text-slate-200"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={updating}
            className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-slate-950 font-bold rounded-lg text-sm transition-all transform hover:-translate-y-0.5 shadow-lg shadow-blue-500/10"
          >
            {updating ? "Updating Dispatch Logs..." : "Commit Force Profile Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}