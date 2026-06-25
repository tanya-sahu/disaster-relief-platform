import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function RaiseHelp() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // 🌟 Schema ke mutabik: requestType array ko 'items' array of objects me badla
  const [formData, setFormData] = useState({
    items: [], // [{ itemType: "food", requiredQuantity: 10 }]
    location: "",
    priority: "medium",
    description: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 🌟 Checkbox select/deselect aur uske saath quantity track karne ka unique logic
  const handleItemToggle = (itemType) => {
    setFormData((prev) => {
      const exists = prev.items.find((i) => i.itemType === itemType);
      if (exists) {
        // Agar pehle se tick tha, toh un-tick karke array se nikal do
        return {
          ...prev,
          items: prev.items.filter((i) => i.itemType !== itemType),
        };
      } else {
        // Agar tick kiya, toh default quantity 1 ke saath add karo
        return {
          ...prev,
          items: [...prev.items, { itemType, requiredQuantity: 1 }],
        };
      }
    });
  };

  // 🌟 Specific item ki quantity ko dynamically update karne ke liye
  const handleQuantityChange = (itemType, qty) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.itemType === itemType
          ? { ...item, requiredQuantity: Math.max(1, parseInt(qty) || 1) }
          : item
      ),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.items.length === 0) {
      alert("🚨 Please select at least one Request Type and provide quantity!");
      return;
    }

    setLoading(true);

    try {
      // 🌟 Backend par updated formData bhej rahe hain
      const response = await axios.post("/api/v1/requests/create-request", formData, {
        headers: {
          "Content-Type": "application/json",
          // "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });

      if (response.status === 200 || response.status === 201) {
        alert("🚀 SOS Broadcasted Successfully!");
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Axios Error:", error);
      alert(`🚨 Failed: ${error.response?.data?.message || "Something went wrong!"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 min-h-screen text-white p-4 sm:p-6 md:p-8 flex items-center justify-center">
      <div className="w-full max-w-2xl bg-slate-900/80 backdrop-blur-md border border-slate-800/60 rounded-2xl p-5 sm:p-8 shadow-[0_0_50px_-12px_rgba(239,68,68,0.15)] relative overflow-hidden transition-all duration-300">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-500 via-amber-400 to-rose-500 animate-pulse" />

        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2 bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            <span className="animate-bounce">🚨</span> Create Emergency Request
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
            This request will be checked for authentication and fields validation by the backend server.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Request Type Selection with Quantity Inputs */}
          <div>
            <label className="block text-[11px] sm:text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
              Request Type & Needed Quantity <span className="text-rose-500">*</span>
            </label>

            {/* Grid layout stays clean on mobile and desktop */}
            <div className="grid grid-cols-1 gap-3">
              {[
                { label: "🍲 Food Supply", value: "food" },
                { label: "💧 Clean Water", value: "water" },
                { label: "💊 Medical Aid", value: "medical" },
                { label: "⛺ Shelter", value: "shelter" },
                { label: "🚨 Rescue / Other", value: "rescue" },
              ].map((item) => {
                const selectedItem = formData.items.find((i) => i.itemType === item.value);
                const isChecked = !!selectedItem;

                return (
                  <div
                    key={item.value}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border transition-all duration-200 gap-3 ${
                      isChecked
                        ? "bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-[0_0_20px_-5px_rgba(16,185,129,0.3)]"
                        : "bg-slate-950/60 border-slate-800 text-slate-300"
                    }`}
                  >
                    {/* Left Side: Checkbox and Label */}
                    <label className="flex items-center gap-3 cursor-pointer flex-1 select-none">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleItemToggle(item.value)}
                        className="w-5 h-5 accent-emerald-500 cursor-pointer rounded-md border-slate-700 bg-slate-900"
                      />
                      <span className={`text-sm font-medium tracking-wide transition-colors ${isChecked ? "font-bold" : ""}`}>
                        {item.label}
                      </span>
                    </label>

                    {/* Right Side: Quantity input box fields, fades in when item is active */}
                    {isChecked && (
                      <div className="flex items-center gap-2 animate-fade-in pl-8 sm:pl-0">
                        <span className="text-xs text-slate-400">Qty Needed:</span>
                        <input
                          type="number"
                          min="1"
                          required
                          value={selectedItem.requiredQuantity}
                          onChange={(e) => handleQuantityChange(item.value, e.target.value)}
                          className="w-24 bg-slate-950 border border-emerald-500/50 focus:border-emerald-400 p-1.5 rounded-lg text-sm text-center font-bold text-emerald-400 outline-none transition-all"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Priority Level */}
          <div>
            <label className="block text-[11px] sm:text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
              Priority Level
            </label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 p-3.5 rounded-xl text-sm outline-none text-slate-200 transition-all cursor-pointer"
            >
              <option value="low" className="bg-slate-900">🟢 Low (Resource stocking)</option>
              <option value="medium" className="bg-slate-900">🟡 Medium (Required within 24hrs)</option>
              <option value="high" className="bg-slate-900">Base-🟠 High (Urgent relief needed)</option>
              <option value="critical" className="bg-slate-900">🔴 Critical (Life-threatening SOS)</option>
            </select>
          </div>

          {/* Location */}
          <div>
            <label className="block text-[11px] sm:text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
              Location Address <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="location"
              required
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g., Sector 4, Near Temple, Flood Affected Area"
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 p-3.5 rounded-xl text-sm outline-none placeholder-slate-600 text-slate-100 transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-[11px] sm:text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
              Detailed Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              name="description"
              rows="4"
              required
              value={formData.description}
              onChange={handleChange}
              placeholder="Provide context for validation (e.g., Ground floor submerged, 3 people need food packages immediately)."
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 p-3.5 rounded-xl text-sm outline-none resize-none placeholder-slate-600 text-slate-100 transition-all"
            />
          </div>

          {/* Buttons Section */}
          <div className="flex flex-col sm:flex-row gap-3 pt-3">
            <button
              type="button"
              disabled={loading}
              onClick={() => navigate("/dashboard/victim")}
              className="w-full sm:w-1/3 py-3.5 bg-slate-800/80 hover:bg-slate-800 text-slate-300 font-semibold rounded-xl text-sm transition-all border border-slate-700/40 active:scale-95 disabled:opacity-50 order-2 sm:order-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-2/3 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold rounded-xl text-sm tracking-wider shadow-lg shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-50 order-1 sm:order-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-slate-950" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Broadcasting...
                </span>
              ) : (
                "Broadcast SOS Request"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}