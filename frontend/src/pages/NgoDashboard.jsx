import React, { useState, useEffect } from "react";
import axios from "axios"; // Standard axios use karein ya imported client
import {
  Layers,
  CheckCircle,
  XCircle,
  Menu,
  User,
  Calendar,
  MapPin,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
  Mail,
  Package,
  ShieldCheck,
  Clock,
  Activity,
  Send,
} from "lucide-react";

export default function NgoDashboard() {
  const [allRequests, setAllRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  
  // FIXED: Default state matches exact Navigation Option item identifier key
  const [currentFilter, setCurrentFilter] = useState("Pending Requests");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [allocationForm, setAllocationForm] = useState({});

  // 1. Fetch all requests
  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/v1/requests/get-all-request", {
        withCredentials: true,
      });
      const fetchedData = response.data?.data || [];
      setAllRequests(fetchedData);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load global request log. Please verify access rights.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // 2. FIXED: Pure Pipeline Engine mapped to exact backend schemas
  useEffect(() => {
    const filtered = allRequests.filter((req) => {
      switch (currentFilter) {
        case "Pending Requests":
          return req.status === "pending";
          
        case "Approved Requests":
          // Displays all approved actionable states matching backend keys
          return [
            "approved",
            "assigned",
            "partially-fulfilled",
            "fulfilled",
          ].includes(req.status);
          
        case "Rejected Requests":
          return req.status === "rejected";

        case "Partially Fulfilled":
          return req.status === "partially-fulfilled";

        case "Fully Fulfilled":
          return req.status === "fulfilled";

        default:
          return true;
      }
    });
    
    setFilteredRequests(filtered);
    // Automatically select the first item of the currently filtered view
    setSelectedRequest(filtered.length > 0 ? filtered[0] : null);
  }, [currentFilter, allRequests]);

  // Reset allocation form values when selected item changes
  useEffect(() => {
    if (selectedRequest) {
      const initialForm = {};
      selectedRequest.requestedItems?.forEach((item) => {
        const remaining = item.requiredQuantity - item.fulfilledQuantity;
        // Adjusted to fall back securely if itemType field name fluctuates 
        const key = item.itemType || item.itemName;
        initialForm[key] = remaining > 0 ? remaining : 0;
      });
      setAllocationForm(initialForm);
    }
  }, [selectedRequest]);

  // 3. NGO Request Approval Workflow
  const handleApprove = async (requestId) => {
    try {
      setActionLoading(true);
      const response = await axios.patch(
        `/api/v1/requests/approve/${requestId}`,
        {},
        { withCredentials: true }
      );
      const updatedRequest = response.data?.data;

      setAllRequests((prev) =>
        prev.map((req) =>
          req._id === requestId ? { ...req, ...updatedRequest } : req
        )
      );
      alert("Application cleared & broadcasted to deployment maps!");
    } catch (err) {
      alert(err.response?.data?.message || "Error processing approval.");
    } finally {
      setActionLoading(false);
    }
  };

  // 4. NGO Request Rejection Workflow
  const handleReject = async (requestId) => {
    try {
      setActionLoading(true);
      const response = await axios.patch(
        `/api/v1/requests/reject/${requestId}`,
        {},
        { withCredentials: true }
      );
      const updatedRequest = response.data?.data;

      setAllRequests((prev) =>
        prev.map((req) =>
          req._id === requestId ? { ...req, ...updatedRequest } : req
        )
      );
      alert("Request declined successfully.");
    } catch (err) {
      alert(err.response?.data?.message || "Error processing rejection.");
    } finally {
      setActionLoading(false);
    }
  };

  // 5. Assign/Fulfill Resources Transaction Submit
  const handleAllocationSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRequest) return;

    try {
      setActionLoading(true);
      console.log(`/api/v1/allocate/${selectedRequest._id}`)
      const response = await axios.post(
        `/api/v1/allocate/${selectedRequest._id}`,
        {},
        { withCredentials: true }
      );

      if (response.data?.success || response.status === 200) {
        alert("Inventory synced! Resources allocated from stocks automatically.");

        const updatedRequest = response.data?.data?.request;
        setAllRequests((prev) =>
          prev.map((req) =>
            req._id === selectedRequest._id ? { ...req, ...updatedRequest } : req
          )
        );
        setSelectedRequest(updatedRequest);
      }
    } catch (err) {
      console.error("Allocation Error:", err);
      alert(err.response?.data?.message || "Transaction failed. Please check inventory stocks.");
    } finally {
      setActionLoading(false);
    }
  };

  // FIXED: Consistent uniform labels with structural identity
  const navigationItems = [
    { name: "Pending Requests", icon: Clock, color: "text-amber-400" },
    { name: "Approved Requests", icon: ShieldCheck, color: "text-emerald-400" },
    { name: "Partially Fulfilled", icon: Activity, color: "text-sky-400" },
    { name: "Fully Fulfilled", icon: CheckCircle, color: "text-indigo-400" },
    { name: "Rejected Requests", icon: XCircle, color: "text-rose-400" },
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case "approved":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "assigned":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "partially-fulfilled":
      case "partially fulfilled":
        return "bg-sky-500/10 text-sky-400 border-sky-500/20";
      case "fulfilled":
        return "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
      case "rejected":
        return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      default:
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    }
  };

  const getPriorityStyle = (priority) => {
    switch (String(priority).toLowerCase()) {
      case "critical":
        return "bg-rose-500 text-white font-extrabold animate-pulse";
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
      {/* SIDEBAR WORKSPACE */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 flex w-72 transform flex-col bg-slate-900 border-r border-slate-800 transition-transform duration-200 ease-in-out md:static md:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex h-20 items-center justify-between border-b border-slate-800 px-6">
          <div className="flex items-center space-x-3">
            <Activity className="h-6 w-6 text-indigo-500" />
            <h1 className="text-lg font-bold tracking-wider uppercase bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              NGO Control Hub
            </h1>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="text-slate-400 hover:text-white md:hidden"
          >
            ✕
          </button>
        </div>

        <nav className="flex-1 space-y-1.5 p-4 overflow-y-auto">
          {navigationItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = currentFilter === item.name;
            return (
              <button
                key={item.name}
                onClick={() => setCurrentFilter(item.name)}
                className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-600/10 border border-indigo-500/20"
                    : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <IconComponent
                    className={`h-5 w-5 ${isActive ? "text-white" : item.color}`}
                  />
                  <span>{item.name}</span>
                </div>
              </button>
            );
          })}
        </nav>

        <div className="flex items-center space-x-3 bg-slate-950/80 p-4 border-t border-slate-800/60">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 font-bold text-white shadow-md">
            NGO
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-200">
              NGO Regional Officer
            </p>
            <p className="text-xs text-emerald-400 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping"></span>{" "}
              Admin Authorization Active
            </p>
          </div>
        </div>
      </aside>

      {/* CORE DISPLAY WINDOW */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* HEADER */}
        <header className="flex h-20 items-center justify-between border-b border-slate-800 bg-slate-900/40 px-8 backdrop-blur-md">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="text-slate-400 hover:text-white focus:outline-none md:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h2 className="text-md font-medium text-slate-400 tracking-wide">
              Selected View:{" "}
              <span className="text-indigo-400 font-bold ml-1">
                {currentFilter} ({filteredRequests.length})
              </span>
            </h2>
          </div>
        </header>

        {/* METRIC ROW & DUAL PANEL CONTROLS */}
        <div className="flex flex-1 overflow-hidden">
          {/* LEFT PANEL: Live Pipeline Feed */}
          <section className="w-full border-r border-slate-800 bg-slate-950 flex flex-col md:w-5/12 overflow-y-auto custom-scrollbar">
            {loading && (
              <div className="p-12 text-center text-sm text-slate-500">
                Decrypting incident data logs...
              </div>
            )}
            {error && (
              <div className="p-12 text-center text-sm text-rose-500 border border-rose-500/10 m-4 rounded-xl bg-rose-500/5">
                {error}
              </div>
            )}
            {!loading && !error && filteredRequests.length === 0 && (
              <div className="p-12 text-center text-sm text-slate-500 flex flex-col items-center justify-center h-full space-y-2">
                <Package className="w-8 h-8 text-slate-700" />
                <p>No deployment logs matched this filter pipeline.</p>
              </div>
            )}

            {!loading && !error && (
              <div className="divide-y divide-slate-900">
                {filteredRequests.map((req) => {
                  const isSelected = req._id === selectedRequest?._id;
                  const itemsSummary =
                    req.requestedItems?.map((i) => i.itemType || i.itemName).join(", ") ||
                    "No resources specified";
                  return (
                    <button
                      key={req._id}
                      onClick={() => setSelectedRequest(req)}
                      className={`w-full text-left p-5 transition-all flex flex-col space-y-3 relative border-l-4 ${
                        isSelected
                          ? "bg-indigo-600/10 border-indigo-500 shadow-inner"
                          : "border-transparent hover:bg-slate-900/40"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 border rounded-md ${getStatusBadge(req.status)}`}
                          >
                            {req.status}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 border rounded-md ${getPriorityStyle(req.priority)}`}
                          >
                            {req.priority}
                          </span>
                        </div>
                        <span className="text-xs text-slate-500">
                          {new Date(req.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold text-slate-200 capitalize truncate">
                          {itemsSummary}
                        </h4>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                          {req.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500 border-t border-slate-900">
                        <span className="text-indigo-400 font-medium truncate">
                          User: {req.createdBy?.fullName || "Disaster Victim"}
                        </span>
                        <span className="font-mono text-slate-600 text-[10px]">
                          ID: ...{req._id?.slice(-6)}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          {/* RIGHT PANEL: Inspection Details & Action Hub */}
          <section className="hidden md:flex md:w-7/12 flex-col bg-slate-900/20 overflow-y-auto">
            {selectedRequest ? (
              <div className="flex flex-col h-full">
                {/* Meta Header */}
                <div className="p-6 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-mono text-slate-500 block mb-1">
                      DATA CHAIN RECORD ID: {selectedRequest._id}
                    </span>
                    <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2 capitalize">
                      <Package className="w-5 h-5 text-indigo-400" />{" "}
                      Operational Dispatch Metrics
                    </h3>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2.5 py-1 text-xs font-bold uppercase border rounded-md ${getStatusBadge(selectedRequest.status)}`}
                    >
                      Lifecycle: {selectedRequest.status}
                    </span>
                  </div>
                </div>

                <div className="p-6 space-y-6 flex-1">
                  {/* Status Dependent Conditional Action Banner */}
                  {selectedRequest.status === "pending" && (
                    <div className="p-4 border border-amber-500/20 bg-amber-500/5 rounded-xl flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-amber-300">
                            Awaiting Regional NGO Authorization
                          </p>
                          <p className="text-[11px] text-slate-400">
                            Validate priorities before broadcast routing.
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          disabled={actionLoading}
                          onClick={() => handleReject(selectedRequest._id)}
                          className="flex items-center space-x-1.5 text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 px-3 py-2 rounded-xl hover:bg-rose-500/20 transition disabled:opacity-50"
                        >
                          <ThumbsDown className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                        <button
                          disabled={actionLoading}
                          onClick={() => handleApprove(selectedRequest._id)}
                          className="flex items-center space-x-1.5 text-xs font-semibold bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-600/10 transition disabled:opacity-50"
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                          <span>Approve Request</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Resource Breakdown Metrics */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
                      Live Manifest Allocation
                    </h4>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {selectedRequest.requestedItems?.map((item, idx) => {
                        const completionRate =
                          Math.min(
                            100,
                            Math.round(
                              (item.fulfilledQuantity / item.requiredQuantity) * 100
                            )
                          ) || 0;
                        const itemDisplayStatus = item.itemStatus || "pending";
                        return (
                          <div
                            key={idx}
                            className="border border-slate-800/80 p-4 rounded-xl bg-slate-900/40 flex flex-col justify-between space-y-3"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-bold capitalize text-slate-200">
                                {item.itemType || item.itemName}
                              </span>
                              <span className="text-[10px] font-mono font-semibold bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700">
                                {itemDisplayStatus}
                              </span>
                            </div>
                            <div>
                              <div className="flex items-baseline justify-between text-xs text-slate-400 mb-1.5">
                                <span>Fulfilled / Required</span>
                                <span className="font-mono font-bold text-slate-200">
                                  {item.fulfilledQuantity} / {item.requiredQuantity}
                                </span>
                              </div>
                              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                                <div
                                  className={`h-full transition-all duration-500 rounded-full ${
                                    itemDisplayStatus === "fulfilled"
                                      ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                                      : itemDisplayStatus === "partially-fulfilled" || itemDisplayStatus === "partially fulfilled"
                                        ? "bg-gradient-to-r from-sky-500 to-cyan-400"
                                        : "bg-gradient-to-r from-amber-500 to-orange-400"
                                  }`}
                                  style={{ width: `${completionRate}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Dynamic Action Area: Assign Resource Form */}
                  {["approved", "assigned", "partially-fulfilled", "partially fulfilled"].includes(
                    selectedRequest.status
                  ) && (
                    <div className="border border-indigo-500/20 bg-indigo-950/40 p-6 rounded-2xl space-y-4 shadow-sm">
                      <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
                        <Layers className="w-4 h-4 text-indigo-400" />
                        <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
                          Deploy Logistics & Assign Resource
                        </h4>
                      </div>

                      <form onSubmit={handleAllocationSubmit} className="space-y-4">
                        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-2.5">
                          <p className="text-xs text-slate-400 font-medium mb-1">
                            Clicking the dispatch button below will automatically match and deduct these items from your warehouse inventory:
                          </p>

                          <div className="divide-y divide-slate-800/60">
                            {selectedRequest.requestedItems?.map((item) => {
                              const remaining = item.requiredQuantity - item.fulfilledQuantity;
                              if (remaining <= 0) return null;

                              return (
                                <div
                                  key={item._id}
                                  className="flex items-center justify-between py-2 text-xs"
                                >
                                  <span className="capitalize font-bold text-slate-300">
                                    {item.itemType || item.itemName}
                                  </span>
                                  <span className="font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md font-semibold border border-indigo-500/20">
                                    Required: {remaining} Units
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div className="flex justify-end pt-1">
                          <button
                            type="submit"
                            disabled={actionLoading || selectedRequest.status === "fulfilled"}
                            className="w-full sm:w-auto flex items-center justify-center space-x-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl shadow-md shadow-indigo-600/10 transition-all disabled:bg-slate-800 disabled:text-slate-500"
                          >
                            {actionLoading ? (
                              <span>Processing Stock Transaction...</span>
                            ) : (
                              <>
                                <Send className="w-3.5 h-3.5" />
                                <span>Deduct Inventory & Allocate Now</span>
                              </>
                            )}
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Profile & Location Metadata */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                        Victim Registry Profile
                      </h4>
                      <div className="border border-slate-800 p-4 rounded-xl bg-slate-900/20 flex items-center space-x-3">
                        <div className="w-10 h-10 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center font-bold text-indigo-400">
                          <User className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-slate-200 truncate">
                            {selectedRequest.createdBy?.fullName || "Anonymous Caller"}
                          </p>
                          <p className="text-xs text-slate-500 truncate flex items-center">
                            <Mail className="w-3 h-3 mr-1" />{" "}
                            {selectedRequest.createdBy?.email || "No secure email link"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                        Target Incident Location
                      </h4>
                      <div className="flex items-center text-sm text-slate-300 bg-slate-900/20 p-4 rounded-xl border border-slate-800">
                        <MapPin className="w-4 h-4 text-rose-500 mr-2 flex-shrink-0" />
                        <span className="truncate">{selectedRequest.location}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                      Narrative Log Transmission
                    </h4>
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-400 leading-relaxed font-mono">
                      "{selectedRequest.description}"
                    </div>
                  </div>

                  {/* Timestamps */}
                  <div className="text-[11px] text-slate-600 pt-4 border-t border-slate-800 space-y-1 font-mono">
                    <p>SYSTEM INGEST TIME: {new Date(selectedRequest.createdAt).toLocaleString()}</p>
                    {selectedRequest.approvedAt && (
                      <p className="text-emerald-500/70">
                        CLEARANCE TIMESTAMP: {new Date(selectedRequest.approvedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center text-slate-600 text-xs font-mono p-4 text-center">
                SELECT AN ACTIVE REQUISITION PIPELINE DATA OBJECT FROM FILTER LOGS.
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}