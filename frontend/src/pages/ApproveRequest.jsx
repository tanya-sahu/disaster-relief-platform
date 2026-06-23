import React, { useEffect, useState } from "react";
import axios from "axios";

export default function ApproveRequest() {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // 1. Fetching Pending Requests using your getAllRequest query system
  const fetchPendingRequests = async () => {
    try {
      setLoading(true);
      setErrorMsg("");
      // Aapke controller ke mutabik hum query params me approvedStatus=pending bhej rahe hain
      const response = await axios.get(
        "/api/v1/requests/get-all-requests?approvedStatus=pending",
        { withCredentials: true }
      );
      
      if (response.data?.data) {
        setPendingRequests(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching pending requests:", error);
      setErrorMsg("Failed to load emergency logs. Please check your network or role authorization.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  // 2. Action Handler (Option 2): Hits isolated endpoints for approve/reject
  const handleReview = async (requestId, action) => {
    try {
      // Action ke basis par endpoint toggle hoga
      const endpoint = action === "approved" 
        ? `/api/v1/requests/approve/${requestId}` 
        : `/api/v1/requests/reject/${requestId}`;

      const response = await axios.patch(endpoint, {}, { withCredentials: true });

      if (response.status === 200 || response.status === 201) {
        // Success Toast/Alert
        alert(`🚨 SOS Broadcast successfully ${action === "approved" ? "Approved & Dispatched" : "Rejected"}.`);
        
        // Instant UI Update: Is card ko screen se remove kar do
        setPendingRequests((prev) => prev.filter((req) => req._id !== requestId));
      }
    } catch (error) {
      console.error(`Failed to ${action} request:`, error);
      alert(`❌ Error: Unable to process action. ${error.response?.data?.message || ""}`);
    }
  };

  return (
    <div className="bg-slate-950 min-h-screen text-slate-100 p-6 font-sans">
      <div className="max-w-[1400px] mx-auto">
        
        {/* Top Banner Section */}
        <div className="mb-6 bg-slate-900 border border-slate-800/80 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-3xl"></div>
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-white flex items-center gap-2 tracking-tight">
                <span>🛡️</span> NGO Verification Hub
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Review live incoming disaster logs. Verify situation context and approve to dispatch ground forces.
              </p>
            </div>
            {/* Quick Refresh Button */}
            <button 
              onClick={fetchPendingRequests}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
            >
              🔄 Sync Live Feeds
            </button>
          </div>
        </div>

        {/* Error Handling State */}
        {errorMsg && (
          <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm font-semibold text-center">
            {errorMsg}
          </div>
        )}

        {/* Dynamic Data States */}
        {loading ? (
          <div className="text-center py-24 flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-slate-500 text-xs font-semibold uppercase tracking-widest animate-pulse">
              Mapping Critical Distress Nodes...
            </span>
          </div>
        ) : pendingRequests.length === 0 ? (
          /* Empty Feed State */
          <div className="text-center py-20 border border-dashed border-slate-800 rounded-2xl bg-slate-900/10 max-w-2xl mx-auto mt-8">
            <div className="text-4xl mb-3">✨</div>
            <h3 className="text-white font-bold text-base tracking-wide">All Systems Clear</h3>
            <p className="text-slate-500 text-xs mt-1 max-w-sm mx-auto leading-relaxed">
              No pending distress logs found under review hierarchy. Ground dispatch queues are currently optimal.
            </p>
          </div>
        ) : (
          /* Main Feed Grid Layout */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {pendingRequests.map((req) => (
              <div 
                key={req._id} 
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between hover:border-slate-700/60 transition-all duration-200 group relative"
              >
                <div>
                  {/* Badges / Header Bar */}
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex flex-wrap gap-1.5">
                      {Array.isArray(req.requestType) ? (
                        req.requestType.map((type, idx) => (
                          <span key={idx} className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs rounded-md uppercase font-black tracking-wider shadow-sm shadow-emerald-500/5">
                            {type}
                          </span>
                        ))
                      ) : (
                        <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs rounded-md uppercase font-black tracking-wider">
                          {req.requestType}
                        </span>
                      )}
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-md text-xs font-black uppercase border tracking-wider ${
                      req.priority === "critical" || req.priority === "high" 
                        ? "bg-red-500/10 text-red-400 border-red-500/20" 
                        : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                    }`}>
                      {req.priority}
                    </span>
                  </div>

                  {/* Metadata: Victim Information (Populated from backend) */}
                  <div className="mt-5 border-b border-slate-800/60 pb-3.5">
                    <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest">SOS Origin Source</p>
                    <p className="text-sm font-black text-slate-200 mt-0.5">
                      {req.createdBy?.fullName || "Anonymous Caller"}
                    </p>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">{req.createdBy?.email || "No digital identity mail"}</p>
                  </div>

                  {/* Situation Log Area */}
                  <div className="mt-4">
                    <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest">Crisis Description</p>
                    <p className="text-sm text-slate-300 mt-1.5 leading-relaxed bg-slate-950/40 p-4 rounded-xl border border-slate-800/40 font-medium whitespace-pre-wrap">
                      {req.description}
                    </p>
                  </div>

                  {/* Geolocation Meta Data */}
                  <div className="mt-4">
                    <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest">📍 Deployment Destination</p>
                    <p className="text-xs text-slate-400 font-mono mt-1.5 bg-slate-950/20 p-2.5 rounded-lg border border-slate-800/30 break-all select-all">
                      {req.location}
                    </p>
                  </div>
                </div>

                {/* Isolated Dispatch Action Block */}
                <div className="flex gap-4 mt-8 pt-4 border-t border-slate-800/60">
                  <button
                    onClick={() => handleReview(req._id, "rejected")}
                    className="w-1/3 py-3 bg-slate-950 hover:bg-red-950/20 text-red-400 border border-slate-800 hover:border-red-900/30 font-bold rounded-xl text-xs transition-all uppercase tracking-wider active:scale-98"
                  >
                    Decline SOS
                  </button>
                  <button
                    onClick={() => handleReview(req._id, "approved")}
                    className="w-2/3 py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black rounded-xl text-xs shadow-lg shadow-emerald-500/10 transition-all uppercase tracking-widest transform active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <span>⚡</span> Verify & Deploy
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}