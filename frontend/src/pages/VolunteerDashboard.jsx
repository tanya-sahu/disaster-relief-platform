import { useEffect, useState } from "react";
import axios from "axios";

export default function VolunteerDashboard({ user }) {
  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  
  // ⚡ MASTER WORKFLOW FILTER STATE
  // Options: 'all', 'assigned', 'in-progress', 'resolved'
  const [workflowFilter, setWorkflowFilter] = useState("all");

  useEffect(() => {
    const fetchVolunteerTasks = async () => {
      try {
        // Backend API call jo is volunteer ki specific assigned tasks fetch karegi
        const res = await axios.get("/api/v1/requests/my-tasks", {
          withCredentials: true,
        });
        setTasks(res.data.data || []);
      } catch (err) {
        console.error("Error pulling volunteer tasks ledger:", err);
      } finally {
        setLoadingTasks(false);
      }
    };

    fetchVolunteerTasks();
  }, []);

  // 🌟 Volunteer Credentials Fallback
  const displayName = user?.fullName || "Responder Profile";
  const displayEmail = user?.email || "On-Field Grid Active";
  const firstLetter = displayName.charAt(0).toUpperCase();

  // 🎯 LIVE STATS COUNTER MATRIX (Dropdown summary metrics ke liye)
  const totalCount = tasks.length;
  const assignedCount = tasks.filter((t) => t.status === "assigned").length;
  const inProgressCount = tasks.filter((t) => t.status === "in-progress" || t.status === "active").length;
  const resolvedCount = tasks.filter((t) => t.status === "resolved" || t.status === "completed").length;

  // 🎛️ FILTER MATCHING ENGINE
  const filteredTasks = tasks.filter((task) => {
    if (workflowFilter === "all") return true;
    if (workflowFilter === "assigned") return task.status === "assigned";
    if (workflowFilter === "in-progress") return task.status === "in-progress" || task.status === "active";
    if (workflowFilter === "resolved") return task.status === "resolved" || task.status === "completed";
    return true;
  });

  // 🔄 ACTION HANDLER: Task status update karne ke liye (e.g., Assigned -> In Progress -> Resolved)
  const handleStatusUpdate = async (taskId, newStatus) => {
    try {
      await axios.put(`/api/v1/requests/task-status/${taskId}`, { status: newStatus }, {
        withCredentials: true
      });
      
      // Local state mapping to immediately reflect changes in UI
      setTasks(prev => prev.map(t => t._id === taskId ? { ...t, status: newStatus } : t));
    } catch (err) {
      console.error("Failed to update execution matrix:", err);
      alert("Status synchronizer failed. Check connection grid.");
    }
  };

  return (
    <div className="bg-slate-950 min-h-screen text-slate-100 p-6 font-sans">
      <div className="max-w-[1600px] mx-auto flex flex-col gap-6">
        
        {/* TOP FIELD RESPONDER PROFILE IDENTITY */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl"></div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-500/20">
                {firstLetter}
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">
                  Field Captain: {displayName}
                </h1>
                <p className="text-slate-400 text-xs mt-0.5">
                  {displayEmail} • Ground Rescue Dispatch Grid
                </p>
              </div>
            </div>
            
            <div className="bg-blue-500/10 border border-blue-500/20 text-blue-400 px-4 py-2 rounded-xl text-xs font-mono font-bold tracking-wider uppercase">
              ⚡ Status: Active Deployment Ready
            </div>
          </div>
        </div>

        {/* 📋 CENTRAL DESK MANAGEMENT MATRIX */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 shadow-xl">
          
          {/* HEADER & DROPDOWN ENGINE */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-5 border-b border-b-slate-800/60">
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                Assigned Operational Ledger
              </h2>
              <p className="text-slate-500 text-xs mt-0.5">
                Monitor and route deployment lifecycles from fresh ticket allocations to site resolutions.
              </p>
            </div>

            {/* ⚡ VOLUNTEER WORKFLOW DROPDOWN SELECTOR */}
            <div className="w-full md:w-80 relative">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                Filter Field Lifecycles
              </label>
              <select
                value={workflowFilter}
                onChange={(e) => setWorkflowFilter(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 p-3 rounded-xl text-xs font-semibold text-slate-300 outline-none transition-all cursor-pointer appearance-none shadow-inner"
              >
                <option value="all">🌐 View All Tactical Deployments ({totalCount})</option>
                <option value="assigned">🪖 Stage 1: Freshly Assigned ({assignedCount})</option>
                <option value="in-progress">⚙️ Stage 2: In-Progress Actions ({inProgressCount})</option>
                <option value="resolved">🏆 Stage 3: Closed / Resolved Cases ({resolvedCount})</option>
              </select>
              <div className="pointer-events-none absolute right-4 bottom-3.5 text-slate-500 text-[10px]">
                ▼
              </div>
            </div>
          </div>

          {/* TASK MATRIX RESULTS TABLE */}
          {loadingTasks ? (
            <div className="flex flex-col items-center justify-center py-20 gap-2">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-slate-500 text-xs font-mono tracking-widest">Siphoning Assigned Field Coordinates...</p>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-slate-800 rounded-xl bg-slate-950/40">
              <p className="text-slate-400 text-xs font-medium">No emergency logs match this lifecycle phase.</p>
              <p className="text-slate-600 text-[11px] mt-1">Stand by for upcoming NGO tactical assignments.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/20">
              <table className="w-full text-left text-sm text-slate-300 border-collapse">
                <thead className="bg-slate-950/80 text-slate-400 font-semibold text-xs uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-4">Target Incident</th>
                    <th className="p-4">Victim Location Info</th>
                    <th className="p-4">Urgency Matrix</th>
                    <th className="p-4">Execution Status</th>
                    <th className="p-4 text-right">Operational Switch</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredTasks.map((task) => (
                    <tr key={task._id} className="hover:bg-slate-800/30 transition-colors">
                      
                      {/* 1. Category Token */}
                      <td className="p-4 flex flex-wrap gap-1.5 items-center min-h-[52px]">
                        <span className="px-2 py-0.5 bg-slate-800 border border-slate-700/60 text-slate-300 text-[10px] font-bold uppercase rounded">
                          {Array.isArray(task.requestType) ? task.requestType.join(", ") : task.requestType}
                        </span>
                      </td>

                      {/* 2. Target Coordinates / Address */}
                      <td className="p-4 text-slate-400 text-xs font-mono max-w-[250px] truncate">
                        {task.location}
                      </td>

                      {/* 3. Priority Tracker */}
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                          task.priority === "critical" || task.priority === "high" 
                            ? "bg-red-500/10 text-red-400 border border-red-500/20 animate-pulse" 
                            : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        }`}>
                          {task.priority}
                        </span>
                      </td>

                      {/* 4. Color-Coded Workflow Badge */}
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wide border ${
                          task.status === "resolved" || task.status === "completed"
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                            : task.status === "in-progress" || task.status === "active"
                            ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                            : "bg-blue-500/10 border-blue-500/20 text-blue-400"
                        }`}>
                          ● {task.status}
                        </span>
                      </td>

                      {/* 5. 🛠️ INTERACTIVE QUICK STATUS CHANGE TOGGLE PANEL */}
                      <td className="p-4 text-right">
                        {task.status === "assigned" && (
                          <button
                            onClick={() => handleStatusUpdate(task._id, "in-progress")}
                            className="text-[11px] bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-3 py-1 rounded transition-all cursor-pointer shadow"
                          >
                            Start Mission ⚙️
                          </button>
                        )}
                        {(task.status === "in-progress" || task.status === "active") && (
                          <button
                            onClick={() => handleStatusUpdate(task._id, "resolved")}
                            className="text-[11px] bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-3 py-1 rounded transition-all cursor-pointer shadow"
                          >
                            Mark Resolved 🏆
                          </button>
                        )}
                        {(task.status === "resolved" || task.status === "completed") && (
                          <span className="text-xs font-semibold text-slate-500 font-mono italic">
                            ✓ File Locked
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