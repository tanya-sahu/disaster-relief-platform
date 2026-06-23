import React, { useState } from "react";
import axios from "axios";

export default function VictimProfile({ user }) {
  // Signup ka data automatically props se input fields ke standard values me set ho jayega
  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    role: user?.role || "victim",
    emergencyContact: user?.emergencyContact || "",
    bloodGroup: user?.bloodGroup || "",
    medicalConditions: user?.medicalConditions || "",
    currentAddress: user?.currentAddress || "",
  });

  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setMessage({ type: "", text: "" });

    try {
      // Backend api endpoint jahan additional values save hongi
      await axios.put("/api/v1/users/update-profile", formData, { withCredentials: true });
      setMessage({ type: "success", text: "Profile matrix updated securely! ✅" });
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to save profile metrics" });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="bg-slate-950 min-h-screen text-slate-100 p-6 font-sans flex items-center justify-center">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-3xl"></div>
        
        <div className="mb-6">
          <h2 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
            🏥 Citizen Identity Profile
          </h2>
          <p className="text-slate-400 text-sm mt-1">Review your signup registration tokens and complete emergency rescue details.</p>
        </div>

        {message.text && (
          <div className={`p-3 rounded-lg text-xs font-medium mb-4 border ${message.type === "success" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border-red-500/20 text-red-400"}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* SECTION 1: SIGNUP DETAILS (🔒 LOCKED VIEW) */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/60 space-y-4">
            <h3 className="text-xs font-bold tracking-wider text-slate-500 uppercase">Signup System Credentials</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Registered Full Name</label>
                <input type="text" name="fullName" disabled value={formData.fullName} className="w-full bg-slate-900/50 border border-slate-800 p-3 rounded-lg text-sm text-slate-400 cursor-not-allowed outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Security Account Role</label>
                <input type="text" name="role" disabled value={formData.role.toUpperCase()} className="w-full bg-slate-900/50 border border-slate-800 p-3 rounded-lg text-sm text-emerald-500 font-mono tracking-widest cursor-not-allowed outline-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Linked Email Address</label>
              <input type="email" name="email" disabled value={formData.email} className="w-full bg-slate-900/50 border border-slate-800 p-3 rounded-lg text-sm text-slate-400 cursor-not-allowed outline-none" />
            </div>
          </div>

          {/* SECTION 2: ADDITIONAL PROFILE DATA (✍️ EDITABLE VIEW) */}
          <div className="space-y-4 pt-2">
            <h3 className="text-xs font-bold tracking-wider text-slate-500 uppercase">Emergency & Medical Information</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">SOS / Next of Kin Contact</label>
                <input type="text" name="emergencyContact" required value={formData.emergencyContact} onChange={handleChange} placeholder="e.g. +91 9876543210" className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 p-3 rounded-lg text-sm outline-none transition-all" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Blood Group</label>
                <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 p-3 rounded-lg text-sm outline-none transition-all text-slate-300">
                  <option value="">Select Blood Group</option>
                  <option value="A+">A+</option> <option value="A-">A-</option>
                  <option value="B+">B+</option> <option value="B-">B-</option>
                  <option value="AB+">AB+</option> <option value="AB-">AB-</option>
                  <option value="O+">O+</option> <option value="O-">O-</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Existing Medical Conditions / Allergies</label>
              <textarea name="medicalConditions" rows="2" value={formData.medicalConditions} onChange={handleChange} placeholder="e.g. Diabetic, Requires periodic oxygen support, None" className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 p-3 rounded-lg text-sm outline-none transition-all resize-none" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Current Temporary Location / Base Address</label>
              <textarea name="currentAddress" rows="2" required value={formData.currentAddress} onChange={handleChange} placeholder="Where are you currently located or sheltering?" className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 p-3 rounded-lg text-sm outline-none transition-all resize-none" />
            </div>
          </div>

          <button type="submit" disabled={updating} className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-lg text-sm transition-all transform hover:-translate-y-0.5 shadow-lg shadow-emerald-500/10">
            {updating ? "Syncing Identity Vault..." : "Save & Secure Profile Card"}
          </button>
        </form>
      </div>
    </div>
  );
}