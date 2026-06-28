import React, { useState, useEffect } from "react";
import axios from "axios";
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
  SlidersHorizontal,
  ArrowLeft,
  Phone, // Fixed missing import
} from "lucide-react";

export default function NgoDashboard() {
  const [allRequests, setAllRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);

  const [currentFilter, setCurrentFilter] = useState("Pending Requests");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [allocationForm, setAllocationForm] = useState({});
  const [deliveryStatus, setdeliveryStatus] = useState("Request Placed");

  // Priority filter state
  const [priorityFilter, setPriorityFilter] = useState("");

  // 1. Fetch requests
  const fetchRequests = async () => {
    try {
      setLoading(true);
      let url = "/api/v1/requests/get-all-request";
      if (priorityFilter) {
        url += `?priority=${priorityFilter}`;
      }

      const response = await axios.get(url, {
        withCredentials: true,
      });
      const fetchedData = response.data?.data || [];
      setAllRequests(fetchedData);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(
        "Failed to load global request log. Please verify access rights.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [priorityFilter]);

  // 2. Pure Pipeline Engine
  useEffect(() => {
    const filtered = allRequests.filter((req) => {
      switch (currentFilter) {
        case "Pending Requests":
          return req.status === "pending";

        case "Approved Requests":
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
    setSelectedRequest(null);
  }, [currentFilter, allRequests]);

  // Reset allocation form values when selected item changes
  useEffect(() => {
    if (selectedRequest) {
      const initialForm = {};
      selectedRequest.requestedItems?.forEach((item) => {
        const remaining = item.requiredQuantity - item.fulfilledQuantity;
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
        { withCredentials: true },
      );
      const updatedRequest = response.data?.data;

      setAllRequests((prev) =>
        prev.map((req) =>
          req._id === requestId ? { ...req, ...updatedRequest } : req,
        ),
      );
      if (updatedRequest) setSelectedRequest(updatedRequest);
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
        { withCredentials: true },
      );
      const updatedRequest = response.data?.data;

      setAllRequests((prev) =>
        prev.map((req) =>
          req._id === requestId ? { ...req, ...updatedRequest } : req,
        ),
      );
      if (updatedRequest) setSelectedRequest(updatedRequest);
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
      const response = await axios.post(
        `/api/v1/allocate/${selectedRequest._id}`,
        {},
        { withCredentials: true },
      );

      if (response.data?.success || response.status === 200) {
        alert(
          "Inventory synced! Resources allocated from stocks automatically.",
        );

        const updatedRequest = response.data?.data?.request;
        setAllRequests((prev) =>
          prev.map((req) =>
            req._id === selectedRequest._id
              ? { ...req, ...updatedRequest }
              : req
          ),
        );
        setSelectedRequest(updatedRequest);
      }
    } catch (err) {
      console.error("Allocation Error:", err);
      alert(
        err.response?.data?.message ||
          "Transaction failed. Please check inventory stocks.",
      );
    } finally {
      setActionLoading(false);
    }
  };

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
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "assigned":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "partially-fulfilled":
      case "partially fulfilled":
        return "bg-sky-100 text-sky-700 border-sky-200";
      case "fulfilled":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "rejected":
        return "bg-rose-100 text-rose-700 border-rose-200";
      default:
        return "bg-amber-100 text-amber-700 border-amber-200";
    }
  };

  const getPriorityStyle = (priority) => {
    switch (String(priority).toLowerCase()) {
      case "critical":
        return "bg-rose-500 text-white font-extrabold";
      case "high":
        return "bg-orange-100 text-orange-700 border border-orange-200";
      case "medium":
        return "bg-amber-100 text-amber-700 border border-amber-200";
      default:
        return "bg-slate-100 text-slate-600 border border-slate-200";
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50 font-sans text-slate-800 antialiased relative">
      {/* SIDEBAR WORKSPACE - SUPPORT HIDE/SHOW ON MOBILE AND DESKTOP */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 flex w-72 transform flex-col bg-[#0b1329] border-r border-[#152244] transition-transform duration-200 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-20 items-center justify-between border-b border-[#152244] px-6">
          <div className="flex items-center space-x-3">
            <Activity className="h-6 w-6 text-indigo-400" />
            <h1 className="text-lg font-bold tracking-wider uppercase text-white">
              Emergency Hub
            </h1>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
          {navigationItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = currentFilter === item.name;
            return (
              <button
                key={item.name}
                onClick={() => {
                  setCurrentFilter(item.name);
                  setSelectedRequest(null);
                  // Auto-close overlay on smaller screens on select
                  if (window.innerWidth < 768) {
                    setIsSidebarOpen(false);
                  }
                }}
                className={`flex w-full items-center justify-between rounded-lg px-4 py-3 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-900/20"
                    : "text-slate-300 hover:bg-slate-800/40 hover:text-white"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <IconComponent
                    className={`h-5 w-5 ${isActive ? "text-white" : "text-slate-400"}`}
                  />
                  <span>{item.name}</span>
                </div>
              </button>
            );
          })}
        </nav>

        <div className="flex items-center space-x-3 bg-[#070c1b] p-4 border-t border-[#152244]">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600 font-bold text-white shadow-md">
            NGO
          </div>
          <div>
            <p className="text-sm font-semibold text-white">
              NGO Regional Officer
            </p>
            <p className="text-xs text-emerald-400 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>{" "}
              Admin Center Active
            </p>
          </div>
        </div>
      </aside>

      {/* CORE DISPLAY WINDOW - SHIFTS DYNAMICALLY BASED ON SIDEBAR STATE */}
      <div 
        className={`flex flex-1 flex-col overflow-hidden transition-all duration-200 w-full ${
          isSidebarOpen ? "md:pl-72" : "md:pl-0"
        }`}
      >
        {/* HEADER */}
        <header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white px-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="text-slate-600 hover:text-slate-900 focus:outline-none p-1.5 hover:bg-slate-100 rounded-lg transition"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-medium text-slate-500 tracking-wide flex items-center gap-2 border-l border-slate-200 pl-4">
                {selectedRequest && (
                  <button
                    onClick={() => setSelectedRequest(null)}
                    className="p-1.5 mr-1 hover:bg-slate-100 rounded-lg text-slate-700 transition"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                )}
                Active Filter:{" "}
                <span className="text-indigo-600 font-bold ml-1">
                  {currentFilter} ({filteredRequests.length})
                </span>
              </h2>
            </div>
          </div>
        </header>

        {/* CONTAINER WORKSPACE */}
        <div className="flex flex-1 overflow-hidden">
          {!selectedRequest ? (
            /* FULL WIDTH WHITE LIST FEED */
            <section className="w-full bg-slate-50 flex flex-col overflow-hidden">
              <div className="p-6 bg-white border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 shadow-sm">
                <label className="text-[11px] font-bold tracking-wider uppercase text-slate-500 flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-600" />
                  Filter Feed Workflow
                </label>
                <div className="relative w-full sm:w-64">
                  <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    className="w-full bg-slate-50 text-sm border border-slate-200 rounded-lg px-4 py-2.5 text-slate-800 focus:outline-none focus:border-indigo-500 appearance-none transition"
                  >
                    <option value="">All Priorities</option>
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                    ▼
                  </div>
                </div>
              </div>

              {/* Scrollable List Frame */}
              <div className="flex-1 overflow-y-auto p-6">
                {loading && (
                  <div className="p-12 text-center text-sm text-slate-400 bg-white border border-slate-200 rounded-xl">
                    Loading layout pipelines...
                  </div>
                )}
                {error && (
                  <div className="p-12 text-center text-sm text-rose-600 border border-rose-200 rounded-xl bg-rose-50">
                    {error}
                  </div>
                )}
                {!loading && !error && filteredRequests.length === 0 && (
                  <div className="p-12 text-center text-sm text-slate-400 bg-white border border-slate-200 rounded-xl flex flex-col items-center justify-center h-full space-y-2">
                    <Package className="w-8 h-8 text-slate-300" />
                    <p>No deployment logs matched this filter pipeline.</p>
                  </div>
                )}

                {!loading && !error && (
                  <div className="grid grid-cols-1 gap-4 max-w-6xl mx-auto">
                    {filteredRequests.map((req) => {
                      const itemsSummary =
                        req.requestedItems
                          ?.map((i) => i.itemType || i.itemName)
                          .join(", ") || "No resources specified";
                      return (
                        <button
                          key={req._id}
                          onClick={() => setSelectedRequest(req)}
                          className="w-full text-left p-6 transition-all bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-sm flex flex-col space-y-3 border-l-4 border-l-indigo-600"
                        >
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center space-x-2">
                              <span
                                className={`text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 border rounded ${getStatusBadge(req.status)}`}
                              >
                                {req.status}
                              </span>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 border rounded ${getPriorityStyle(req.priority)}`}
                              >
                                {req.priority}
                              </span>
                            </div>
                            <span className="text-xs text-slate-400">
                              {new Date(req.createdAt).toLocaleDateString()}
                            </span>
                          </div>

                          <div>
                            <h4 className="text-base font-bold text-slate-800 capitalize truncate">
                              {itemsSummary}
                            </h4>
                            <p className="text-sm text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                              {req.description}
                            </p>
                          </div>

                          <div className="flex items-center justify-between pt-3 text-xs text-slate-400 border-t border-slate-100">
                            <span className="text-indigo-600 font-medium truncate">
                              Victim:{" "}
                              {req.createdBy?.fullName || "Disaster Victim"}
                            </span>
                            <span className="font-mono text-slate-400 text-[11px]">
                              ID: ...{req._id?.slice(-6)}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>
          ) : (
            /* FULL WIDTH ACTIONABLE INSPECTION DETAILS */
            <section className="w-full flex flex-col bg-slate-50 overflow-y-auto">
              <div className="flex flex-col h-full max-w-4xl w-full mx-auto p-6 space-y-6">
                {/* Meta Header */}
                <div className="p-6 border border-slate-200 bg-white rounded-xl shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                  <div>
                    <span className="text-xs font-mono text-slate-400 block mb-1">
                      DATA CHAIN RECORD ID: {selectedRequest._id}
                    </span>
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 capitalize">
                      <Package className="w-5 h-5 text-indigo-600" />{" "}
                      Operational Dispatch Metrics
                    </h3>
                  </div>
                  <div>
                    <span
                      className={`px-3 py-1.5 text-xs font-bold uppercase border rounded-md ${getStatusBadge(selectedRequest.status)}`}
                    >
                      Lifecycle: {selectedRequest.status}
                    </span>
                  </div>
                </div>

                {/* Status Dependent Conditional Action Banner */}
                {selectedRequest.status === "pending" && (
                  <div className="p-5 border border-amber-200 bg-amber-50 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 shadow-sm">
                    <div className="flex items-center space-x-3">
                      <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-bold text-amber-800">
                          Awaiting Regional NGO Authorization
                        </p>
                        <p className="text-xs text-amber-600">
                          Validate priorities before broadcast routing
                          configurations.
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-3 self-end sm:self-auto">
                      <button
                        disabled={actionLoading}
                        onClick={() => handleReject(selectedRequest._id)}
                        className="flex items-center space-x-1.5 text-xs font-semibold bg-white text-rose-600 border border-rose-200 px-4 py-2.5 rounded-lg hover:bg-rose-50 transition disabled:opacity-50"
                      >
                        <ThumbsDown className="w-4 h-4" />
                        <span>Reject</span>
                      </button>
                      <button
                        disabled={actionLoading}
                        onClick={() => handleApprove(selectedRequest._id)}
                        className="flex items-center space-x-1.5 text-xs font-semibold bg-indigo-600 text-white px-5 py-2.5 rounded-lg hover:bg-indigo-700 shadow-sm transition disabled:opacity-50"
                      >
                        <ThumbsUp className="w-4 h-4" />
                        <span>Approve Request</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Resource Breakdown Metrics */}
                <div className="border border-slate-200 p-6 bg-white rounded-xl shadow-sm">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                    Live Manifest Allocation
                  </h4>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {selectedRequest.requestedItems?.map((item, idx) => {
                      const rawRate =
                        (item.fulfilledQuantity / item.requiredQuantity) * 100;
                      const completionRate = isNaN(rawRate)
                        ? 0
                        : Math.min(100, Math.round(rawRate));
                      const itemDisplayStatus = item.itemStatus || "pending";

                      return (
                        <div
                          key={idx}
                          className="border border-slate-100 p-4 rounded-xl bg-slate-50 flex flex-col justify-between space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold capitalize text-slate-800">
                              {item.itemType || item.itemName}
                            </span>
                            <span className="text-[10px] font-mono font-semibold bg-white text-slate-500 px-2 py-0.5 rounded border border-slate-200">
                              {itemDisplayStatus}
                            </span>
                          </div>
                          <div>
                            <div className="flex items-baseline justify-between text-xs text-slate-500 mb-1.5">
                              <span>Fulfilled / Required</span>
                              <span className="font-mono font-bold text-slate-800">
                                {item.fulfilledQuantity} /{" "}
                                {item.requiredQuantity}
                              </span>
                            </div>
                            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all duration-500 rounded-full ${
                                  itemDisplayStatus === "fulfilled"
                                    ? "bg-emerald-500"
                                    : [
                                        "partially-fulfilled",
                                        "partially fulfilled",
                                      ].includes(itemDisplayStatus)
                                    ? "bg-sky-500"
                                    : "bg-amber-500"
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
                {[
                  "approved",
                  "assigned",
                  "partially-fulfilled",
                  "partially fulfilled",
                ].includes(selectedRequest.status) && (
                  <div className="border border-indigo-100 bg-white p-6 rounded-xl space-y-4 shadow-sm">
                    <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
                      <Layers className="w-4 h-4 text-indigo-600" />
                      <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                        Deploy Logistics & Assign Resource
                      </h4>
                    </div>

                    <form
                      onSubmit={handleAllocationSubmit}
                      className="space-y-4"
                    >
                      <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2.5">
                        <p className="text-xs text-slate-500 font-medium mb-1">
                          Clicking the dispatch button below will automatically
                          match and deduct these items from your warehouse
                          inventory:
                        </p>

                        <div className="divide-y divide-slate-200">
                          {selectedRequest.requestedItems?.map((item) => {
                            const remaining =
                              item.requiredQuantity - item.fulfilledQuantity;
                            if (remaining <= 0) return null;

                            return (
                              <div
                                key={item._id}
                                className="flex items-center justify-between py-2.5 text-xs"
                              >
                                <span className="capitalize font-bold text-slate-700">
                                  {item.itemType || item.itemName}
                                </span>
                                <span className="font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md font-semibold border border-indigo-100">
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
                          disabled={
                            actionLoading ||
                            selectedRequest.status === "fulfilled"
                          }
                          className="w-full sm:w-auto flex items-center justify-center space-x-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg shadow-sm transition-all disabled:bg-slate-200 disabled:text-slate-400"
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
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="border border-slate-200 p-5 rounded-xl bg-white shadow-sm">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                      Victim Registry Profile
                    </h4>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center font-bold text-indigo-600">
                        <User className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-800 truncate">
                          {selectedRequest.createdBy?.fullName ||
                            "Anonymous Caller"}
                        </p>
                        <p className="text-xs text-slate-500 truncate flex items-center mt-0.5">
                          <Mail className="w-3 h-3 mr-1 text-slate-400" />{" "}
                          {selectedRequest.createdBy?.email ||
                            "No secure email link"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="border border-slate-200 p-5 rounded-xl bg-white shadow-sm">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                      Target Incident Location
                    </h4>
                    <div className="flex items-center text-sm text-slate-700 h-10">
                      <MapPin className="w-4 h-4 text-rose-500 mr-2 flex-shrink-0" />
                      <span className="truncate">
                        {selectedRequest.location}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border border-slate-200 p-5 rounded-xl bg-white shadow-sm">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                    Narrative Log Transmission
                  </h4>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-600 leading-relaxed font-mono">
                    "{selectedRequest.description}"
                  </div>
                </div>

                {/* Populated Assigned Volunteer */}
                <div className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
                  <span className="text-xs text-gray-400 block mb-2 font-medium">
                    Assigned On-Field Volunteer
                  </span>
                  {selectedRequest.assignedVolunteer ? (
                    <div className="text-sm space-y-1">
                      <p className="font-semibold text-gray-900 flex items-center">
                        <User className="w-4 h-4 text-emerald-500 mr-2 flex-shrink-0" />{" "}
                        <span className="truncate">
                          {selectedRequest.assignedVolunteer.fullName}
                        </span>
                      </p>
                      <p className="text-gray-500 flex items-center text-xs">
                        <Phone className="w-3.5 h-3.5 text-gray-400 mr-2 flex-shrink-0" />{" "}
                        <span>{selectedRequest.assignedVolunteer.phone}</span>
                      </p>
                    </div>
                  ) : (
                    <span className="text-sm italic text-gray-400 block">
                      No volunteer assigned yet.
                    </span>
                  )}
                </div>

                {/* Timestamps */}
                <div className="text-[11px] text-slate-400 pt-4 border-t border-slate-200 space-y-1 font-mono">
                  <p>
                    SYSTEM INGEST TIME:{" "}
                    {new Date(selectedRequest.createdAt).toLocaleString()}
                  </p>
                  {selectedRequest.approvedAt && (
                    <p className="text-emerald-600">
                      CLEARANCE TIMESTAMP:{" "}
                      {new Date(selectedRequest.approvedAt).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}