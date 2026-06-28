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

  // 1. Fetching Logic Pipeline
  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      let url = "";
      let params = {};

      if (currentTab === "Discover Available Requests") {
        // Global feed puller - filter parameters are applied on query engine
        url = "/api/v1/requests/get-all-request";
        params = {
          priority: prioritySearch || undefined,
          status: globalStatusSearch || undefined,
        };
      } else {
        // Pulls requests mapped explicitly to the signed-in volunteer
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
      // Rule Checklist:
      // - Status must NOT be 'pending' / 'rejected'
      // - No volunteer assigned yet (isVolunteerAssigned === false)
      // - Status must be approved, partially-fulfilled, or fulfilled
      outputDataset = outputDataset.filter(
        (req) =>
          !req.isVolunteerAssigned &&
          req.deliveryStatus === "Allocated" &&
          ["approved", "partially-fulfilled", "fulfilled"].includes(req.status),
      );

      // Apply the search boxes filter arrays to the Discover Tab dynamically
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
      // Inside 'My Assigned Missions', filter dynamically if delivery status selection exists
      if (deliveryStatusSearch) {
        outputDataset = outputDataset.filter(
          (req) => req.deliveryStatus === deliveryStatusSearch,
        );
      }
    }

    setFilteredRequests(outputDataset);
    setSelectedRequest(outputDataset.length > 0 ? outputDataset[0] : null);
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
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "partially-fulfilled":
        return "bg-sky-500/10 text-sky-400 border-sky-500/20";
      case "fulfilled":
        return "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
      default:
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    }
  };

  const getPriorityBadgeColor = (prio) => {
    switch (String(prio).toLowerCase()) {
      case "critical":
        return "bg-rose-500 text-white font-black animate-pulse";
      case "high":
        return "bg-orange-500/20 text-orange-400 border border-orange-500/30";
      case "medium":
        return "bg-amber-500/20 text-amber-400 border border-amber-500/30";
      default:
        return "bg-slate-700 text-slate-300";
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-950 font-sans text-slate-100 antialiased">
      {/* LEFT NAVIGATION & SEARCH SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 flex w-72 transform flex-col bg-slate-900 border-r border-slate-800 transition-transform duration-200 ease-in-out md:static md:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* NGO Style Clean Identity Branding Header */}
        <div className="flex h-20 items-center justify-between border-b border-slate-800 px-6">
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

        {/* Workspace Mode Swappable Navigation */}
        <nav className="space-y-1.5 p-4 border-b border-slate-800/60">
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
                    : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
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

        {/* 3 DISTINCT CONTROL BOXES */}
        <div className="flex-1 p-4 space-y-4 overflow-y-auto custom-scrollbar">
          <div className="flex items-center space-x-2 text-slate-400 text-[10px] font-bold tracking-widest uppercase mb-1">
            <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
            <span>Search Parameters</span>
          </div>

          {/* BOX 1: Global Status Router */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-slate-400">
              Global Lifecycle Status
            </label>
            <select
              value={globalStatusSearch}
              onChange={(e) => setGlobalStatusSearch(e.target.value)}
              className="w-full bg-slate-950 text-xs border border-slate-800 rounded-xl px-3 py-2 text-slate-300 focus:outline-none focus:border-cyan-500/50"
            >
              <option value="">All Global Statuses</option>
              <option value="partially-fulfilled">Partially Fulfilled</option>
              <option value="fulfilled">Fulfilled</option>
            </select>
          </div>

          {/* BOX 2: Pipeline Priority */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-slate-400">
              Mission Urgency Priority
            </label>
            <select
              value={prioritySearch}
              onChange={(e) => setPrioritySearch(e.target.value)}
              className="w-full bg-slate-950 text-xs border border-slate-800 rounded-xl px-3 py-2 text-slate-300 focus:outline-none focus:border-cyan-500/50"
            >
              <option value="">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* BOX 3: Delivery Steps Metrics */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-slate-400">
              Internal Delivery Pipeline
            </label>
            <select
              value={deliveryStatusSearch}
              onChange={(e) => setDeliveryStatusSearch(e.target.value)}
              className="w-full bg-slate-950 text-xs border border-slate-800 rounded-xl px-3 py-2 text-slate-300 focus:outline-none focus:border-cyan-500/50"
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

        {/* Identity footer matrix block */}
        <div className="flex items-center space-x-3 bg-slate-950/80 p-4 border-t border-slate-800/60">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 text-xs font-bold text-white shadow-sm">
            VOL
          </div>
          <div>
            <p className="text-xs font-bold text-slate-200">
              Field Responder Profile
            </p>
            <p className="text-[10px] text-cyan-400 flex items-center gap-1">
              <span className="h-1 w-1 rounded-full bg-cyan-400 animate-ping"></span>{" "}
              Grid Tracking Active
            </p>
          </div>
        </div>
      </aside>

      {/* CORE DISPLAY FEED WINDOW */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* TOP INTERFACE APP BAR */}
        <header className="flex h-20 items-center justify-between border-b border-slate-800 bg-slate-900/40 px-8 backdrop-blur-md">
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

        {/* CONTAINER SUBPANEL COMBOS */}
        <div className="flex flex-1 overflow-hidden">
          {/* LEFT LIST PANEL */}
          <section className="w-full border-r border-slate-800 bg-slate-950 flex flex-col md:w-5/12 overflow-hidden">
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {loading && (
                <div className="p-12 text-center text-xs text-slate-500">
                  Querying live data clusters...
                </div>
              )}
              {error && (
                <div className="p-12 text-center text-xs text-rose-500 bg-rose-500/5 border border-rose-500/10 m-4 rounded-xl">
                  {error}
                </div>
              )}
              {!loading && !error && filteredRequests.length === 0 && (
                <div className="p-12 text-center text-xs text-slate-500 flex flex-col items-center justify-center h-full space-y-2">
                  <Package className="w-7 h-7 text-slate-800" />
                  <p>No requests matching criteria maps available.</p>
                </div>
              )}

              {!loading && !error && (
                <div className="divide-y divide-slate-900">
                  {filteredRequests.map((req) => {
                    const isSelected = req._id === selectedRequest?._id;
                    const itemsSummary =
                      req.requestedItems?.map((i) => i.itemType).join(", ") ||
                      "Uncategorized Manifest Items";
                    return (
                      <button
                        key={req._id}
                        onClick={() => setSelectedRequest(req)}
                        className={`w-full text-left p-5 transition-all flex flex-col space-y-3 border-l-4 relative ${
                          isSelected
                            ? "bg-cyan-600/10 border-cyan-500 shadow-inner"
                            : "border-transparent hover:bg-slate-900/40"
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center space-x-2">
                            <span
                              className={`text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 border rounded-md ${getStatusBadgeColor(req.status)}`}
                            >
                              {req.status}
                            </span>
                            <span
                              className={`text-[9px] font-bold px-2 py-0.5 border rounded-md ${getPriorityBadgeColor(req.priority)}`}
                            >
                              {req.priority}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-500">
                            {new Date(req.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        <div>
                          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wide truncate">
                            {itemsSummary}
                          </h4>
                          <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                            {req.description}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-1.5 text-[11px] border-t border-slate-900 text-slate-500">
                          <span className="truncate text-cyan-400">
                            By: {req.createdBy?.fullName || "Anoymous Reporter"}
                          </span>
                          <span className="text-[10px] font-mono bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                            {req.deliveryStatus}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          {/* RIGHT ASSIGNMENT INSPECTION CONTROLLER */}
          <section className="hidden md:flex md:w-7/12 flex-col bg-slate-900/20 overflow-y-auto">
            {selectedRequest ? (
              <div className="flex flex-col h-full">
                {/* Panel Header Summary */}
                <div className="p-6 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-slate-500 block mb-1">
                      MANIFEST INDEX HASH: {selectedRequest._id}
                    </span>
                    <h3 className="text-md font-bold text-slate-100 flex items-center gap-2">
                      <Package className="w-4 h-4 text-cyan-400" /> Operational
                      Control Board
                    </h3>
                  </div>
                  <div>
                    <span className="bg-slate-800 border border-slate-700 text-slate-300 px-3 py-1 text-xs font-mono rounded-md">
                      {selectedRequest.deliveryStatus}
                    </span>
                  </div>
                </div>

                {/* Core Inspection Body */}
                <div className="p-6 space-y-6 flex-1">
                  {/* DYNAMIC ACTION COMPONENT: Shows Only in Non-Assigned Discovery view */}
                  {currentTab === "Discover Available Requests" &&
                    !selectedRequest.isVolunteerAssigned && (
                      <div className="p-4 border border-cyan-500/25 bg-cyan-500/5 rounded-xl flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <AlertTriangle className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                          <div>
                            <p className="text-xs font-bold text-cyan-300">
                              Route Map Unclaimed
                            </p>
                            <p className="text-[11px] text-slate-400">
                              Lock assignment registry to assign this deployment
                              path to your active log profile.
                            </p>
                          </div>
                        </div>
                        <button
                          disabled={actionLoading}
                          onClick={(e) =>
                            handleAssignMission(e, selectedRequest._id)
                          }
                          className="flex items-center space-x-1.5 text-xs font-bold bg-cyan-600 text-white px-5 py-2.5 rounded-xl hover:bg-cyan-700 transition disabled:opacity-50 shadow-md shadow-cyan-600/10"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Claim & Assign Route</span>
                        </button>
                      </div>
                    )}

                  {/* Quantity Fulfilment Visual Tracker */}
                  <div>
                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">
                      Resource Deployment Status
                    </h4>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {selectedRequest.requestedItems?.map((item, index) => {
                        const targetPerc =
                          Math.min(
                            100,
                            Math.round(
                              (item.fulfilledQuantity / item.requiredQuantity) *
                                100,
                            ),
                          ) || 0;
                        return (
                          <div
                            key={index}
                            className="border border-slate-800 p-4 rounded-xl bg-slate-900/40 flex flex-col justify-between space-y-3"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold capitalize text-slate-200">
                                {item.itemType}
                              </span>
                              <span className="text-[9px] font-mono font-semibold bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700">
                                {item.itemStatus}
                              </span>
                            </div>
                            <div>
                              <div className="flex items-baseline justify-between text-[11px] text-slate-400 mb-1.5">
                                <span>Fulfilled vs Required</span>
                                <span className="font-mono font-bold text-slate-200">
                                  {item.fulfilledQuantity} /{" "}
                                  {item.requiredQuantity}
                                </span>
                              </div>
                              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-cyan-500 to-indigo-400 rounded-full transition-all"
                                  style={{ width: `${targetPerc}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Coordinates & Location Maps */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                        Dropoff Target Location
                      </h4>
                      <div className="flex items-center text-xs text-slate-300 bg-slate-900/20 p-4 rounded-xl border border-slate-800">
                        <MapPin className="w-4 h-4 text-rose-500 mr-2 flex-shrink-0" />
                        <span className="truncate">
                          {selectedRequest.location}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                        Origin Contact Profile
                      </h4>
                      <div className="border border-slate-800 p-3 rounded-xl bg-slate-900/20 flex items-center space-x-3">
                        <div className="w-8 h-8 bg-cyan-500/10 border border-cyan-500/20 rounded-xl flex items-center justify-center font-bold text-cyan-400 text-xs">
                          <User className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-slate-200 truncate">
                            {selectedRequest.createdBy?.fullName ||
                              "Civilian Reporter"}
                          </p>
                          <p className="text-[11px] text-slate-500 truncate">
                            {selectedRequest.createdBy?.phone ||
                              "No secure phone matched"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Field Logs Text Description */}
                  <div>
                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                      Detailed Emergency Log Narrative
                    </h4>
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-400 leading-relaxed font-mono">
                      "{selectedRequest.description}"
                    </div>
                  </div>

                  {/* Operational Ingestion Logs Timestamps */}
                  <div className="text-[10px] text-slate-600 pt-4 border-t border-slate-800 font-mono space-y-1">
                    <p>
                      SYSTEM INGESTION STAMP:{" "}
                      {new Date(selectedRequest.createdAt).toLocaleString()}
                    </p>
                    {selectedRequest.approvedAt && (
                      <p className="text-cyan-500/60">
                        NGO SYSTEM CLEARANCE TIMESTAMP:{" "}
                        {new Date(selectedRequest.approvedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-xs text-slate-500 flex flex-col items-center justify-center h-full">
                <Package className="w-7 h-7 text-slate-800 mb-2" />
                <p>
                  Select a registry file row from the tracking list layout to
                  inspect parameters.
                </p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
