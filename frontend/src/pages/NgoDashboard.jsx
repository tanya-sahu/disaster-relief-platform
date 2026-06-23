import { useEffect, useState } from "react";
import axios from "axios";

export default function NgoDashboard({ user }) {
  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  
  // ⚡ MASTER DROPDOWN STATE
  // Options: 'all', 'pending', 'approved', 'rejected'
  const [ngoFilter, setNgoFilter] = useState("all");

  useEffect(() => {
    const fetchNgoGlobalLedger = async () => {
      try {
        // Backend API call jo NGO ke jurisdiction ki saari requests lekar aayegi
        const res = await axios.get("/api/v1/requests/all-requests", {
          withCredentials: true,
        });
        setRequests(res.data.data || []);
      } catch (err) {
        console.error("Error pulling NGO global logmap:", err);
      } finally {
        setLoadingRequests(false);
      }
    };

    fetchNgoGlobalLedger();
  }, []);

  // 🌟 NGO Corporate Credentials Fallback
  const displayName = user?.fullName || "NGO Headquarter Core";
  const displayEmail = user?.email || "HQ Operations Active";
  const firstLetter = displayName.charAt(0).toUpperCase();

  // 🎯 LIVE DISPATCH METRICS (Dropdown text sync aur counter card matrix ke liye)
  const totalCount = requests.length;
  const pendingCount = requests.filter((r) => r.status === "pending").length;
  const approvedCount = requests.filter((r) => r.status === "approved" || r.status === "resolved" || r.status === "assigned").length;
  const rejectedCount = requests.filter((r) => r.status === "rejected").length;

  // 🎛️ SYSTEM FILTER MATRIX
  const filteredRequests = requests.filter((req) => {
    if (ngoFilter === "all") return true;
    if (ngoFilter === "pending") return req.status === "pending";
    if (ngoFilter === "approved") return req.status === "approved" || req.status === "resolved" || req.status === "assigned";
    if (ngoFilter === "rejected") return req.status === "rejected";
    return true;
  });

  // 🔄 ACTION GATEWAY: Update Status (Approve / Reject Requests)
  const handleActionExecution = async (requestId, newStatus) => {
    try {
      await axios.put(`/api/v1/requests/update-status/${requestId}`, { status: newStatus }, {
        withCredentials: true
      });
      
      // UI instant sync bina page re-render ke state modification statement
      setRequests(prev => prev.map(r => r._id === requestId ? { ...r, status: newStatus } : r));
    } catch (err) {
      console.error("Action gateway interception failure:", err);
      alert("Command execution matrix failed. Verify backend channels.");
    }
  };

  return (
    <div className="bg-slate-950 min-h-screen text-slate-100 p-6 font-sans">
      <div className="max-w-[1600px] mx-auto flex flex-col gap-6">
        
        {/* TOP COMMAND CENTER HEADQUARTERS BANNER */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl"></div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-purple-500/20">
                {firstLetter}
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">
                  HQ Node: {displayName}
                </h1>
                <p className="text-slate-400 text-xs mt-0.5">
                  {displayEmail} • Resource & Field Verification Authority
                </p>
              </div>
            </div>
            
            <div className="bg-purple-500/10 border border-purple-500/20 text-purple-400 px-4 py-2 rounded-xl text-xs font-mono font-bold tracking-wider uppercase">
              🛡️ Role: Master Review Control
            </div>
          </div>
        </div>

        {/* 📋 CENTRAL VERIFICATION MATRIX */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 shadow-xl">
          
          {/* HEADER CONTROL AND DROPDOWN LINE */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-5 border-b border-b-slate-800/60">
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                Incoming Citizen Emergency Requests
              </h2>
              <p className="text-slate-500 text-xs mt-0.5">
                Review life-support streams, execute status vetting, and authorize volunteer forces deployment.
              </p>
            </div>

            {/* ⚡ NGO MASTER DECISION SELECTOR DROPDOWN */}
            <div className="w-full md:w-80 relative">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                Vetting Filter Pipeline
              </label>
              <select
                value={ngoFilter}
                onChange={(e) => setNgoFilter(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 p-3 rounded-xl text-xs font-semibold text-slate-300 outline-none transition-all cursor-pointer appearance-none shadow-inner"
              >
                <option value="all">🌐 Global Incident Feed ({totalCount})</option>
                <option value="pending">⏳ Queue: Verification Pending ({pendingCount})</option>
                <option value="approved">✅ Queue: Approved & Deployed ({approvedCount})</option>
                <option value="rejected">❌ Queue: Flagged / Rejected Logs ({rejectedCount})</option>
              </select>
              <div className="pointer-events-none absolute right-4 bottom-3.5 text-slate-500 text-[10px]">
                ▼
              </div>
            </div>
          </div>

          {/* DATA STREAM MATRIX GRID */}
          {loadingRequests ? (
            <div className="flex flex-col items-center justify-center py-20 gap-2">
              <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-slate-500 text-xs font-mono tracking-widest">Siphoning Decentralized Server Logs...</p>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-slate-800 rounded-xl bg-slate-950/40">
              <p className="text-slate-400 text-xs font-medium">No rescue packets found matching this queue parameters.</p>
              <p className="text-slate-600 text-[11px] mt-1">Excellent! Network pipelines are clear of backlog targets.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/20">
              <table className="w-full text-left text-sm text-slate-300 border-collapse">
                <thead className="bg-slate-950/80 text-slate-400 font-semibold text-xs uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-4">Disaster Matrix</th>
                    <th className="p-4">Coordinates Info</th>
                    <th className="p-4">Priority Scale</th>
                    <th className="p-4">Current Clearance Status</th>
                    <th className="p-4 text-right">Vetting Execution Node</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredRequests.map((req) => (
                    <tr key={req._id} className="hover:bg-slate-800/30 transition-colors">
                      
                      {/* 1. Category Token */}
                      <td className="p-4 flex flex-wrap gap-1.5 items-center min-h-[52px]">
                        <span className="px-2 py-0.5 bg-slate-800 border border-slate-700/60 text-slate-300 text-[10px] font-bold uppercase rounded">
                          {Array.isArray(req.requestType) ? req.requestType.join(", ") : req.requestType}
                        </span>
                      </td>

                      {/* 2. Geolocation Coordinates */}
                      <td className="p-4 text-slate-400 text-xs font-mono max-w-[220px] truncate">
                        {req.location}
                      </td>

                      {/* 3. Incident Severity Priority Scale */}
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                          req.priority === "critical" || req.priority === "high" 
                            ? "bg-red-500/10 text-red-400 border border-red-500/20 animate-pulse" 
                            : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        }`}>
                          {req.priority}
                        </span>
                      </td>

                      {/* 4. Live Clearance Status Indicator Badges */}
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wide border ${
                          req.status === "approved" || req.status === "resolved" || req.status === "assigned"
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                            : req.status === "rejected"
                            ? "bg-red-500/10 border-red-500/20 text-red-400"
                            : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                        }`}>
                          ● {req.status === "assigned" ? "approved/deployed" : req.status}
                        </span>
                      </td>

                      {/* 5. 🛠️ ACTION BUTTON INTERACTIVE FORK */}
                      <td className="p-4 text-right">
                        {req.status === "pending" ? (
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleActionExecution(req._id, "approved")}
                              className="text-[11px] bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-3 py-1 rounded transition-all cursor-pointer shadow-md shadow-emerald-500/5 active:scale-95"
                            >
                              Approve ✓
                            </button>
                            <button
                              onClick={() => handleActionExecution(req._id, "rejected")}
                              className="text-[11px] bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-1 rounded transition-all cursor-pointer shadow-md shadow-red-500/5 active:scale-95"
                            >
                              Reject ❌
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs font-semibold text-slate-500 font-mono tracking-wider uppercase italic">
                            📁 Log Locked ({req.status === "assigned" ? "approved" : req.status})
                          </span>
                        )}
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