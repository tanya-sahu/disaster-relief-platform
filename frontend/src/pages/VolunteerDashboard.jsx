import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Menu,
  User,
  MapPin,
  AlertTriangle,
  Package,
  ShieldCheck,
  Clock,
  Activity,
  Send,
  SlidersHorizontal,
  Compass,
  ArrowLeft,
} from "lucide-react";

export default function VolunteerDashboard() {
  const [allRequests, setAllRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);

  // Navigation Tabs: "Discover Available Requests" OR "My Assigned Missions"
  const [currentTab, setCurrentTab] = useState("Discover Available Requests");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // 3 Dedicated Search Boxes (Global Status, Priority, Delivery Status)
  const [globalStatusSearch, setGlobalStatusSearch] = useState("");
  const [prioritySearch, setPrioritySearch] = useState("");
  const [deliveryStatusSearch, setDeliveryStatusSearch] = useState("");

  // Reset selected request when changing tabs so it goes back to the list view
  useEffect(() => {
    setSelectedRequest(null);
  }, [currentTab]);

  // 1. Fetching Logic Pipeline
  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      let url = "";
      let params = {};

      if (currentTab === "Discover Available Requests") {
        url = "/api/v1/requests/get-all-request";
        params = {
          priority: prioritySearch || undefined,
          status: globalStatusSearch || undefined,
        };
      } else {
        url = "/api/v1/requests/my-assigned";
        params = {
          priority: prioritySearch || undefined,
          status: globalStatusSearch || undefined,
        };
      }

      const response = await axios.get(url, {
        params,
        withCredentials: true,
      });

      setAllRequests(response.data?.data || []);
    } catch (err) {
      console.error("Backend Sync Error:", err);
      setError("Failed to link with live operation database maps.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [currentTab, prioritySearch, globalStatusSearch]);

  // 2. Client-Side Data Matrix Filter Engine
  useEffect(() => {
    let outputDataset = [...allRequests];

    if (currentTab === "Discover Available Requests") {
      outputDataset = outputDataset.filter(
        (req) =>
          !req.isVolunteerAssigned &&
          req.deliveryStatus === "Allocated" &&
          ["approved", "partially-fulfilled", "fulfilled"].includes(req.status),
      );

      if (globalStatusSearch) {
        outputDataset = outputDataset.filter(
          (req) => req.status === globalStatusSearch,
        );
      }
      if (deliveryStatusSearch) {
        outputDataset = outputDataset.filter(
          (req) => req.deliveryStatus === deliveryStatusSearch,
        );
      }
    } else {
      if (deliveryStatusSearch) {
        outputDataset = outputDataset.filter(
          (req) => req.deliveryStatus === deliveryStatusSearch,
        );
      }
    }

    setFilteredRequests(outputDataset);
  }, [
    allRequests,
    currentTab,
    globalStatusSearch,
    prioritySearch,
    deliveryStatusSearch,
  ]);

  // 3. Mission Route Assignment Lock-In Trigger
  const handleAssignMission = async (e, requestId) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const response = await axios.patch(
        `/api/v1/requests/assign/${requestId}`,
        {},
        { withCredentials: true },
      );

      if (response.data) {
        alert(
          "Success: Mission linked! Check 'My Assigned Missions' tab for details.",
        );
        setSelectedRequest(null); // Clear view to return to list
        fetchRequests(); // Automatically re-sync grids
      }
    } catch (err) {
      console.error("Assignment Action Error:", err);
      alert(
        err.response?.data?.message || "Failed to secure mission claim tokens.",
      );
    } finally {
      setActionLoading(false);
    }
  };



  const navTabs = [
    {
      name: "Discover Available Requests",
      icon: Compass,
      color: "text-cyan-400",
    },
    {
      name: "My Assigned Missions",
      icon: ShieldCheck,
      color: "text-emerald-400",
    },
  ];

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "approved":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "partially-fulfilled":
        return "bg-sky-50 text-sky-700 border-sky-200";
      case "fulfilled":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      default:
        return "bg-amber-50 text-amber-700 border-amber-200";
    }
  };

  const getPriorityBadgeColor = (prio) => {
    switch (String(prio).toLowerCase()) {
      case "critical":
        return "bg-rose-600 text-white font-black animate-pulse";
      case "high":
        return "bg-orange-100 text-orange-800 border border-orange-200";
      case "medium":
        return "bg-amber-100 text-amber-800 border border-amber-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };




  const handleStatusChange = async (targetStatus) => {
    setLoading(true);
    setErrorMessage("");

    try {
      // Aapke backend routes ke mutabik: PATCH request with requestId in URL params
      const response = await axios.patch(
        `/api/v1//allocate/deliveries/${request._id}`, 
        { deliveryStatus: targetStatus },
        { withCredentials: true } // Cookies handle karne ke liye (agar session check laga ho)
      );

      if (response.data?.success) {
        console.log("Status Updated Successfully:", response.data.data);
        
        // Parent component ko batane ke liye taaki list update ho jaye aur stepper badle
        if (onStatusUpdate) {
          onStatusUpdate(request._id, targetStatus);
        }
      }
    } catch (error) {
      // Error Extraction Engine
      const apiError = error.response?.data?.message || "Something went wrong while updating status.";
      setErrorMessage(apiError);
      console.error("Delivery status update failed:", apiError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50 font-sans text-slate-800 antialiased">
      {/* DARK SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 flex w-72 transform flex-col bg-slate-950 border-r border-slate-900 text-slate-100 transition-transform duration-200 ease-in-out md:static md:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex h-20 items-center justify-between border-b border-slate-900 px-6">
          <div className="flex items-center space-x-3">
            <Activity className="h-6 w-6 text-cyan-400" />
            <h1 className="text-md font-bold tracking-wider uppercase bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              VOLUNTEER HUB
            </h1>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="text-slate-400 hover:text-white md:hidden"
          >
            ✕
          </button>
        </div>

        <nav className="space-y-1.5 p-4 border-b border-slate-900">
          {navTabs.map((tab) => {
            const IconComp = tab.icon;
            const isTabActive = currentTab === tab.name;
            return (
              <button
                key={tab.name}
                onClick={() => setCurrentTab(tab.name)}
                className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-xs font-semibold transition-all ${
                  isTabActive
                    ? "bg-gradient-to-r from-cyan-600 to-cyan-700 text-white shadow-md border border-cyan-500/20"
                    : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <IconComp
                    className={`h-4 w-4 ${isTabActive ? "text-white" : tab.color}`}
                  />
                  <span>{tab.name}</span>
                </div>
              </button>
            );
          })}
        </nav>

        <div className="flex-1 p-4 space-y-4 overflow-y-auto custom-scrollbar text-slate-300">
          <div className="flex items-center space-x-2 text-slate-500 text-[10px] font-bold tracking-widest uppercase mb-1">
            <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
            <span>Search Parameters</span>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-slate-400">
              Global Lifecycle Status
            </label>
            <select
              value={globalStatusSearch}
              onChange={(e) => setGlobalStatusSearch(e.target.value)}
              className="w-full bg-slate-900 text-xs border border-slate-800 rounded-xl px-3 py-2 text-slate-300 focus:outline-none focus:border-cyan-500/50"
            >
              <option value="">All Global Statuses</option>
              <option value="partially-fulfilled">Partially Fulfilled</option>
              <option value="fulfilled">Fulfilled</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-slate-400">
              Mission Urgency Priority
            </label>
            <select
              value={prioritySearch}
              onChange={(e) => setPrioritySearch(e.target.value)}
              className="w-full bg-slate-900 text-xs border border-slate-800 rounded-xl px-3 py-2 text-slate-300 focus:outline-none focus:border-cyan-500/50"
            >
              <option value="">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-slate-400">
              Internal Delivery Pipeline
            </label>
            <select
              value={deliveryStatusSearch}
              onChange={(e) => setDeliveryStatusSearch(e.target.value)}
              className="w-full bg-slate-900 text-xs border border-slate-800 rounded-xl px-3 py-2 text-slate-300 focus:outline-none focus:border-cyan-500/50"
            >
              <option value="">All Delivery Phases</option>
              <option value="Request Placed">Request Placed</option>
              <option value="Allocated">Allocated</option>
              <option value="Assigned">Assigned</option>
              <option value="Dispatched">Dispatched</option>
              <option value="Out for delivery">Out for delivery</option>
              <option value="Delivered">Delivered</option>
            </select>
          </div>
        </div>

        <div className="flex items-center space-x-3 bg-slate-950 p-4 border-t border-slate-900">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 text-xs font-bold text-white shadow-sm">
            VOL
          </div>
          <div>
            <p className="text-xs font-bold text-slate-200">Field Responder Profile</p>
            <p className="text-[10px] text-cyan-400 flex items-center gap-1">
              <span className="h-1 w-1 rounded-full bg-cyan-400 animate-ping"></span> Grid Tracking Active
            </p>
          </div>
        </div>
      </aside>

      {/* CORE DISPLAY WINDOW */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* DARK TOP APP BAR */}
        <header className="flex h-20 items-center justify-between border-b border-slate-900 bg-slate-950 px-8 text-white">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="text-slate-400 hover:text-white focus:outline-none md:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h2 className="text-sm font-medium text-slate-400 tracking-wide">
              Active Context Matrix:{" "}
              <span className="text-cyan-400 font-bold ml-1">
                {currentTab} ({filteredRequests.length})
              </span>
            </h2>
          </div>
        </header>

        {/* LIGHT WORKSPACE BODY */}
        <main className="flex-1 overflow-y-auto bg-slate-50 p-6 md:p-8">
          {!selectedRequest ? (
            /* FULL WIDTH LIST VIEW */
            <div className="max-w-5xl mx-auto space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <h3 className="text-lg font-bold text-slate-900">Incoming Operation Feeds</h3>
                <p className="text-xs text-slate-500">Select a card file to open inspection</p>
              </div>

              {loading && <div className="p-12 text-center text-sm text-slate-500">Querying live data clusters...</div>}
              {error && <div className="p-12 text-center text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-xl">{error}</div>}
              {!loading && !error && filteredRequests.length === 0 && (
                <div className="p-12 text-center text-sm text-slate-500 flex flex-col items-center justify-center space-y-2 border-2 border-dashed border-slate-200 rounded-xl bg-white">
                  <Package className="w-8 h-8 text-slate-300" />
                  <p>No requests matching criteria maps available.</p>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4">
                {filteredRequests.map((req) => {
                  const itemsSummary = req.requestedItems?.map((i) => i.itemType).join(", ") || "Uncategorized Manifest Items";
                  return (
                    <button
                      key={req._id}
                      onClick={() => setSelectedRequest(req)}
                      className="w-full text-left p-5 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col space-y-3 border-l-4 border-l-cyan-600"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 w-full">
                        <div className="flex items-center space-x-2">
                          <span className={`text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 border rounded-md ${getStatusBadgeColor(req.status)}`}>
                            {req.status}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 border rounded-md ${getPriorityBadgeColor(req.priority)}`}>
                            {req.priority}
                          </span>
                        </div>
                        <span className="text-xs text-slate-400 font-medium">
                          {new Date(req.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div>
                        <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide truncate">
                          {itemsSummary}
                        </h4>
                        <p className="text-sm text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                          {req.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
                        <span className="truncate font-medium text-slate-700">
                          By: {req.createdBy?.fullName || "Anonymous Reporter"}
                        </span>
                        <span className="text-[11px] font-mono font-semibold bg-slate-100 px-2 py-0.5 rounded text-slate-600 border border-slate-200">
                          {req.deliveryStatus}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            /* FULL PAGE DETAILED REGISTRY INSPECTION VIEW */
            <div className="max-w-4xl mx-auto bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              {/* Context Back Strip Header */}
              <div className="p-4 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="flex items-center space-x-2 text-xs font-bold text-slate-700 hover:text-cyan-600 transition"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Request Logs</span>
                </button>
                <span className="text-[10px] font-mono text-slate-500">
                  MANIFEST INDEX HASH: {selectedRequest._id}
                </span>
              </div>

              {/* Core Body Container */}
              <div className="p-6 md:p-8 space-y-8">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-cyan-50 rounded-xl text-cyan-600">
                      <Package className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Operational Control Log</h3>
                      <p className="text-xs text-slate-500">Field logistics data profile matrix</p>
                    </div>
                  </div>
                  <span className="bg-slate-100 border border-slate-200 text-slate-700 px-3 py-1 text-xs font-mono font-bold rounded-md">
                    {selectedRequest.deliveryStatus}
                  </span>
                </div>

                {/* Claim Mission Action Banner */}
                {currentTab === "Discover Available Requests" && !selectedRequest.isVolunteerAssigned && (
                  <div className="p-4 border border-cyan-200 bg-cyan-50/50 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="w-5 h-5 text-cyan-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-bold text-slate-900">Route Map Unclaimed</p>
                        <p className="text-xs text-slate-600">
                          Lock assignment registry to assign this deployment path to your active log profile.
                        </p>
                      </div>
                    </div>
                    <button
                      disabled={actionLoading}
                      onClick={(e) => handleAssignMission(e, selectedRequest._id)}
                      className="flex items-center justify-center space-x-2 text-xs font-bold bg-cyan-600 text-white px-5 py-3 rounded-xl hover:bg-cyan-700 transition disabled:opacity-50 shadow-sm whitespace-nowrap"
                    >
                      <Send className="w-4 h-4" />
                      <span>Claim & Assign Route</span>
                    </button>
                  </div>
                )}

                {/* Quantities Tracking */}
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                    Resource Deployment Status
                  </h4>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {selectedRequest.requestedItems?.map((item, index) => {
                      const targetPerc = Math.min(100, Math.round((item.fulfilledQuantity / item.requiredQuantity) * 100)) || 0;
                      return (
                        <div key={index} className="border border-slate-200 p-4 rounded-xl bg-slate-50 flex flex-col justify-between space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold capitalize text-slate-900">{item.itemType}</span>
                            <span className="text-[10px] font-mono font-semibold bg-white text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                              {item.itemStatus}
                            </span>
                          </div>
                          <div>
                            <div className="flex items-baseline justify-between text-xs text-slate-500 mb-1">
                              <span>Fulfilled vs Required</span>
                              <span className="font-mono font-bold text-slate-900">
                                {item.fulfilledQuantity} / {item.requiredQuantity}
                              </span>
                            </div>
                            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-cyan-600 to-indigo-500 rounded-full transition-all"
                                style={{ width: `${targetPerc}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Profile Matrix Data Blocks */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                      Dropoff Target Location
                    </h4>
                    <div className="flex items-center text-sm text-slate-800 bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <MapPin className="w-4 h-4 text-rose-500 mr-2 flex-shrink-0" />
                      <span className="truncate font-medium">{selectedRequest.location}</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                      Origin Contact Profile
                    </h4>
                    <div className="border border-slate-200 p-3 rounded-xl bg-slate-50 flex items-center space-x-3">
                      <div className="w-9 h-9 bg-cyan-100 rounded-xl flex items-center justify-center font-bold text-cyan-700">
                        <User className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-900 truncate">
                          {selectedRequest.createdBy?.fullName || "Civilian Reporter"}
                        </p>
                        <p className="text-xs text-slate-500 truncate font-mono">
                          {selectedRequest.createdBy?.phone || "No secure phone matched"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Narrative Log Block */}
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                    Detailed Emergency Log Narrative
                  </h4>
                  <div className="bg-slate-900 p-4 rounded-xl border border-slate-950 text-xs md:text-sm text-slate-300 leading-relaxed font-mono">
                    "{selectedRequest.description}"
                  </div>
                </div>

                {/* Timestamp Logs */}
                <div className="text-[11px] text-slate-400 pt-4 border-t border-slate-100 font-mono space-y-1">
                  <p>SYSTEM INGESTION STAMP: {new Date(selectedRequest.createdAt).toLocaleString()}</p>
                  {selectedRequest.approvedAt && (
                    <p className="text-cyan-700 font-medium">
                      NGO SYSTEM CLEARANCE TIMESTAMP: {new Date(selectedRequest.approvedAt).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}