import React, { useState } from "react";
import axios from "axios";

export default function NGOProfileForm({ user }) {
  // Signup ka data aur NGO parameters props se safely connect ho jayenge
  const [formData, setFormData] = useState({
    fullName: user?.fullName || "", // NGO Name as Registered
    email: user?.email || "",
    role: user?.role || "ngo",
    registrationId: user?.registrationId || "", // Unique Reg No.
    darpanId: user?.darpanId || "", // Government Darpan ID (Optional)
    reliefSectors: user?.reliefSectors ? user.reliefSectors.join(", ") : "", // Array to comma separated string
    contactPerson: user?.contactPerson || "", // Primary representative name
    phone: user?.phone || "", // Public contact desk
    headquartersAddress: user?.headquartersAddress || "",
  });

  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setMessage({ type: "", text: "" });

    // Relief Sectors text ko array form me parse karna backend synchronization ke liye
    const cleanedSectors = formData.reliefSectors
      .split(",")
      .map((sector) => sector.trim())
      .filter((sector) => sector !== "");

    const payload = {
      ...formData,
      reliefSectors: cleanedSectors,
    };

    try {
      // Backend update profile API call
      await axios.put("/api/v1/users/update-profile", payload, { withCredentials: true });
      setMessage({ type: "success", text: "NGO verification and profile metrics saved! 🏢" });
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to update corporate rescue metrics",
      });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="bg-slate-950 min-h-screen text-slate-100 p-6 font-sans flex items-center justify-center">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl"></div>

        <div className="mb-6">
          <h2 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
            🏢 NGO Organization Terminal
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Maintain your legal validation badges, response pipelines, and organizational grid.
          </p>
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
          {/* SECTION 1: LEGAL SIGNUP CREDENTIALS (🔒 READ ONLY) */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/60 space-y-4">
            <h3 className="text-xs font-bold tracking-wider text-slate-500 uppercase">
              Registered Authority Anchor
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">
                  Organization Legal Name
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
                  System Authentication Role
                </label>
                <input
                  type="text"
                  disabled
                  value={formData.role.toUpperCase()}
                  className="w-full bg-slate-900/50 border border-slate-800 p-3 rounded-lg text-sm text-purple-400 font-mono tracking-widest cursor-not-allowed outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">
                Official Correspondence Email
              </label>
              <input
                type="email"
                disabled
                value={formData.email}
                className="w-full bg-slate-900/50 border border-slate-800 p-3 rounded-lg text-sm text-slate-400 cursor-not-allowed outline-none"
              />
            </div>
          </div>

          {/* SECTION 2: EDITABLE VERIFICATION & LOGISTICS */}
          <div className="space-y-4 pt-2">
            <h3 className="text-xs font-bold tracking-wider text-slate-500 uppercase">
              Legal Validation & Relief Scope
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">
                  Govt Registration ID / Trust No.
                </label>
                <input
                  type="text"
                  name="registrationId"
                  required
                  value={formData.registrationId}
                  onChange={handleChange}
                  placeholder="e.g. REG-89324/DELHI"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 p-3 rounded-lg text-sm outline-none transition-all text-slate-200 uppercase font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">
                  NGO Darpan ID (Optional)
                </label>
                <input
                  type="text"
                  name="darpanId"
                  value={formData.darpanId}
                  onChange={handleChange}
                  placeholder="e.g. DL/2026/012345"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 p-3 rounded-lg text-sm outline-none transition-all text-slate-200 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">
                  Chief Contact Person
                </label>
                <input
                  type="text"
                  name="contactPerson"
                  required
                  value={formData.contactPerson}
                  onChange={handleChange}
                  placeholder="e.g. Dr. Amit Sharma"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 p-3 rounded-lg text-sm outline-none transition-all text-slate-200"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">
                  HQ Helpline / Desk Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="e.g. 011-2345678"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 p-3 rounded-lg text-sm outline-none transition-all text-slate-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">
                Relief Sectors / Operations Core (Comma Separated)
              </label>
              <input
                type="text"
                name="reliefSectors"
                value={formData.reliefSectors}
                onChange={handleChange}
                placeholder="e.g. Flood Rescue, Medical Supplies, Free Kitchen, Shelter Logistics"
                className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 p-3 rounded-lg text-sm outline-none transition-all text-slate-200"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                Mention key disaster fields. Victims will be filtered and mapped to your center based on these tags.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">
                Headquarters / Core Dispatch Address
              </label>
              <textarea
                name="headquartersAddress"
                rows="2"
                required
                value={formData.headquartersAddress}
                onChange={handleChange}
                placeholder="Complete centralized organizational desk address"
                className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 p-3 rounded-lg text-sm outline-none transition-all resize-none text-slate-200"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={updating}
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg text-sm transition-all transform hover:-translate-y-0.5 shadow-lg shadow-purple-500/10 cursor-pointer"
          >
            {updating ? "Deploying Core Ledger Data..." : "Save Authority Profile Card"}
          </button>
        </form>
      </div>
    </div>
  );
}