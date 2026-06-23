import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // 🚀 Axios import kiya

export default function RaiseHelp() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    requestType: [], 
    location: "",
    priority: "medium",
    description: "",
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setFormData((prev) => {
        const currentTypes = prev.requestType;
        if (checked) {
          return { ...prev, requestType: [...currentTypes, value] };
        } else {
          return { ...prev, requestType: currentTypes.filter((item) => item !== value) };
        }
      });
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // 🚀 AXIOS SUBMIT LOGIC
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.requestType.length === 0) {
      alert("🚨 Please select at least one Request Type!");
      return;
    }

    setLoading(true);

    try {
      // Apne URL ke hisaab se change kar lena (e.g., "/api/v1/requests" agar proxy hai)
      const response = await axios.post("/api/v1/requests/create-request", formData, {
        headers: {
          "Content-Type": "application/json",
          // Agar Authorization token bhejna hai toh:
          // "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });

      // Axios mein status codes 2xx automatic success hote hain
      if (response.status === 200 || response.status === 201) {
        alert("🚀 SOS Broadcasted Successfully!");
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Axios Error:", error);
      
      // Axios mein backend ka error response error.response.data mein milta hai
      if (error.response) {
        alert(`🚨 Failed: ${error.response.data.message || "Something went wrong!"}`);
      } else if (error.request) {
        // Request ban gayi thi par response nahi mila (Network Issue)
        alert("🌐 Network Error: Server respond nahi kar raha. Check karo backend running hai?");
      } else {
        alert("🚨 Error: Request setup karne mein koi dikkat aayi hai.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-950 min-h-[90vh] text-white p-6 flex items-center justify-center">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-500 via-amber-500 to-red-500 animate-pulse" />

        <div className="mb-6">
          <h1 className="text-2xl font-extrabold flex items-center gap-2">
            <span className="text-red-500">🚨</span> Create Emergency Request
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            This request will be checked for authentication and fields
            validation by the backend server.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Request Type Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Request Type (Select All That Apply) *
            </label>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "🍲 Food Supply", value: "food" },
                { label: "💧 Clean Water", value: "water" },
                { label: "💊 Medical Aid", value: "medical" },
                { label: "⛺ Shelter", value: "shelter" },
                { label: "🚨 Rescue / Other", value: "rescue , other" },
              ].map((item) => {
                const isChecked = formData.requestType.includes(item.value);

                return (
                  <label
                    key={item.value}
                    className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                      isChecked
                        ? "bg-emerald-500/10 border-emerald-500 text-emerald-400 font-bold shadow-lg shadow-emerald-500/5"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    <span className="text-sm">{item.label}</span>
                    <input
                      type="checkbox"
                      name="requestType"
                      value={item.value}
                      checked={isChecked}
                      onChange={handleChange}
                      className="w-4 h-4 accent-emerald-500 cursor-pointer rounded"
                    />
                  </label>
                );
              })}
            </div>
          </div>

          {/* Priority Level */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Priority Level
            </label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 p-3 rounded-lg text-sm outline-none text-slate-200"
            >
              <option value="low">🟢 Low (Resource stocking)</option>
              <option value="medium">🟡 Medium (Required within 24hrs)</option>
              <option value="high">🟠 High (Urgent relief needed)</option>
              <option value="critical">
                🔴 Critical (Life-threatening SOS)
              </option>
            </select>
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Location Address *
            </label>
            <input
              type="text"
              name="location"
              required
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g., Sector 4, Near Temple, Flood Affected Area"
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 p-3 rounded-lg text-sm outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Detailed Description *
            </label>
            <textarea
              name="description"
              rows="4"
              required
              value={formData.description}
              onChange={handleChange}
              placeholder="Provide context for validation (e.g., Ground floor submerged, 3 people need food packages immediately)."
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 p-3 rounded-lg text-sm outline-none resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              disabled={loading}
              onClick={() => navigate("/dashboard/victim")}
              className="w-1/3 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-lg text-sm transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-2/3 py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-lg text-sm tracking-wide shadow-lg shadow-emerald-500/10 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none"
            >
              {loading ? "Broadcasting..." : "Broadcast Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}