import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

export default function VictimDashboard({ user }) {
  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  
  // ⚡ MASTER DROPDOWN STATE
  // Isme hum status, assignment, aur type sabhi ke options store karenge
  const [masterFilter, setMasterFilter] = useState("all"); 

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const reqRes = await axios.get("/api/v1/requests/my-requests", {
          withCredentials: true,
        });
        setRequests(reqRes.data.data || []);
      } catch (err) {
        console.error("Error fetching victim requests:", err);
      } finally {
        setLoadingRequests(false);
      }
    };

    fetchRequests();
  }, []);

  // 🌟 User Fallback Data
  const displayName = user?.fullName || "Citizen Profile";
  const displayEmail = user?.email || "Emergency Grid Active";
  const firstLetter = displayName.charAt(0).toUpperCase();

  // 🎯 UNIVERSAL FILTER LOGIC ENGINE
  const filteredRequests = requests.filter((req) => {
    if (masterFilter === "all") return true;

    // --- 1. Filter by Status & Assignment ---
    if (masterFilter === "approved") return req.status === "approved" || req.status === "resolved";
    if (masterFilter === "rejected") return req.status === "rejected";
    if (masterFilter === "assigned") return req.isAssigned === true || req.status === "assigned";
    if (masterFilter === "unassigned") return !req.isAssigned && req.status === "pending";

    // --- 2. Filter by Request Type (Case Insensitive Safety) ---
    // Backend se requestType array ho ya string, dono ko handle karega
    const typeToMatch = masterFilter.toLowerCase();
    if (Array.isArray(req.requestType)) {
      return req.requestType.some(t => t.toLowerCase().includes(typeToMatch));
    } else if (req.requestType) {
      return req.requestType.toLowerCase().includes(typeToMatch);
    }

    return true;
  });

  return (
    <div className="bg-slate-950 min-h-screen text-slate-100 p-6 font-sans">
      <div className="max-w-[1600px] mx-auto flex flex-col gap-6">
        
        {/* TOP IDENTITY BANNER */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl"></div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg shadow-emerald-500/20">
                {firstLetter}
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">
                  Welcome, {displayName}
                </h1>
                <p className="text-slate-400 text-xs mt-0.5">
                  {displayEmail} • Operations Terminal
                </p>
              </div>
            </div>
            <Link
              to="/raise-help"
              className="bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-slate-950 px-4 py-2.5 rounded-xl font-bold text-xs transition-all shadow-lg shadow-emerald-500/10 inline-flex items-center gap-2 cursor-pointer"
            >
              🚨 Raise Emergency Request
            </Link>
          </div>
        </div>

        {/* 📋 CENTRAL TERMINAL LOG */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 shadow-xl">
          
          {/* HEADER & DROPDOWN CONTROL BAR */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-5 border-b border-slate-800/60">
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                Emergency Dispatch Logmaps
              </h2>
              <p className="text-slate-500 text-xs mt-0.5">
                Use the master selector to filter requests by life-support core or verification flags.
              </p>
            </div>

            {/* ⚡ THE MASTER ALL-IN-ONE DROPDOWN */}
            <div className="w-full md:w-80 relative">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                Select Filter Matrix
              </label>
              <select
                value={masterFilter}
                onChange={(e) => setMasterFilter(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 p-3 rounded-xl text-xs font-semibold text-slate-300 outline-none transition-all cursor-pointer appearance-none shadow-inner"
              >
                {/* --- Group 1: Global Filters --- */}
                <option value="all">🌐 All Active Logs ({requests.length})</option>
                
                {/* --- Group 2: Status & Tracker Conditions --- */}
                <option value="approved">✅ Approved / Resolved Cases</option>
                <option value="assigned">🪖 Dispatched / Forces Assigned</option>
                <option value="unassigned">⏳ Waiting Allocation (Pending)</option>
                <option value="rejected">❌ Rejected / Invalid Logs</option>

                {/* --- Group 3: Core Request Categories --- */}
                <option value="medical">🏥 Category: Medical Aid & Injury</option>
                <option value="flood">🌊 Category: Flood & Evacuation</option>
                <option value="collapse">🏚️ Category: Structural Collapse</option>
                <option value="fire">🔥 Category: Fire Hazards</option>
                <option value="food">🍏 Category: Food & Clean Water</option>
                <option value="shelter">⛺ Category: Emergency Shelter</option>
                <option value="power">⚡ Category: Telecom & Power Failure</option>
              </select>
              <div className="pointer-events-none absolute right-4 bottom-3.5 text-slate-500 text-[10px]">
                ▼
              </div>
            </div>
          </div>

          {/* TABLE LOG MATRIX */}
          {loadingRequests ? (
            <div className="flex flex-col items-center justify-center py-20 gap-2">
              <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-slate-500 text-xs font-mono tracking-widest">Parsing Encryption Streams...</p>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-slate-800 rounded-xl bg-slate-950/40">
              <p className="text-slate-400 text-xs font-medium">No results match your selected filter criteria.</p>
              <p className="text-slate-600 text-[11px] mt-1">Try resetting the selector to "All Active Logs".</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/20">
              <table className="w-full text-left text-sm text-slate-300 border-collapse">
                <thead className="bg-slate-950/80 text-slate-400 font-semibold text-xs uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-4">Help Category</th>
                    <th className="p-4">Location Coordinates</th>
                    <th className="p-4">Deployment Status</th>
                    <th className="p-4">Priority Grid</th>
                    <th className="p-4 text-right">Verification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredRequests.map((req) => (
                    <tr key={req._id} className="hover:bg-slate-800/30 transition-colors">
                      
                      {/* 1. Category Badges */}
                      <td className="p-4 flex flex-wrap gap-1.5 items-center min-h-[52px]">
                        {Array.isArray(req.requestType) ? (
                          req.requestType.map((type, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-slate-800 border border-slate-700/60 text-slate-300 text-[10px] font-bold uppercase rounded">{type}</span>
                          ))
                        ) : (
                          <span className="px-2 py-0.5 bg-slate-800 border border-slate-700/60 text-slate-300 text-[10px] font-bold uppercase rounded">{req.requestType}</span>
                        )}
                      </td>

                      {/* 2. Location */}
                      <td className="p-4 text-slate-400 text-xs font-mono max-w-[220px] truncate">{req.location}</td>

                      {/* 3. Forces Deployment Assignment */}
                      <td className="p-4">
                        {req.isAssigned || req.status === "assigned" ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-blue-400 font-bold bg-blue-500/5 px-2 py-0.5 rounded border border-blue-500/10">
                            🪖 Dispatched
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 font-medium bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                            ⏳ Unassigned
                          </span>
                        )}
                      </td>

                      {/* 4. Priority level */}
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                          req.priority === "critical" || req.priority === "high" 
                            ? "bg-red-500/10 text-red-400 border border-red-500/20" 
                            : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        }`}>
                          {req.priority}
                        </span>
                      </td>

                      {/* 5. Master Status badge */}
                      <td className="p-4 text-right">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider border ${
                          req.status === "approved" || req.status === "resolved" || req.status === "assigned"
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                            : req.status === "rejected"
                            ? "bg-red-500/10 border-red-500/30 text-red-400"
                            : "bg-sky-500/10 border-sky-500/30 text-sky-400"
                        }`}>
                          ● {req.status === "assigned" ? "approved" : req.status}
                        </span>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}