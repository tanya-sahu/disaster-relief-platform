import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Layers,
  CheckCircle,
  XCircle,
  UserCheck,
  Loader,
  ShieldCheck,
  Menu,
  User,
  Calendar,
  MapPin,
  Home,
  Phone,
  Package,
  ShieldAlert,
  ArrowLeft,
  Activity,
} from "lucide-react";

export default function VictimDashboard() {
  const [allRequests, setAllRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [currentFilter, setCurrentFilter] = useState("All Request");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/api/v1/requests/my-requests", {
          withCredentials: true,
        });

        const fetchedData = response.data?.data || [];

        setAllRequests(fetchedData);
        setFilteredRequests(fetchedData);
        if (fetchedData.length > 0) {
          setSelectedRequest(fetchedData[0]);
        }
      } catch (err) {
        console.error("Error fetching requests:", err);
        setError("Failed to load your requests. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  useEffect(() => {
    if (currentFilter === "All Request") {
      setFilteredRequests(allRequests);
    } else {
      const filtered = allRequests.filter((req) => {
        switch (currentFilter) {
          case "Pending Request":
            return req.status === "pending";
          case "Approved Request":
            return req.status === "approved";
          case "Rejected Request": 
            return req.status === "rejected";
          case "Assigned Request":
            return req.status === "assigned";
          case "Partially Fulfilled Request":
            return req.status === "partially-fulfilled";
          case "Fulfilled Request":
            return req.status === "fulfilled";
          default:
            return true;
        }
      });
      setFilteredRequests(filtered);

      if (filtered.length > 0) {
        setSelectedRequest(filtered[0]);
      } else {
        setSelectedRequest(null);
      }
    }
    setShowDetail(false);
  }, [currentFilter, allRequests]);

  const navigationItems = [
    { name: "All Request", icon: Layers, color: "text-slate-400" },
    { name: "Pending Request", icon: Layers, color: "text-green-400" },
    { name: "Approved Request", icon: CheckCircle, color: "text-green-500" },
    { name: "Rejected Request", icon: XCircle, color: "text-red-500" },
    { name: "Assigned Request", icon: UserCheck, color: "text-yellow-500" },
    { name: "Partially Fulfilled Request", icon: Loader, color: "text-blue-500" },
    { name: "Fulfilled Request", icon: ShieldCheck, color: "text-emerald-500" },
  ];

  const getStatusStyles = (req) => {
    if (req.status === "rejected")
      return {
        border: "border-red-500",
        badge: "bg-red-100 text-red-800",
        text: "Rejected",
      };
    if (req.status === "fulfilled")
      return {
        border: "border-emerald-500",
        badge: "bg-emerald-100 text-emerald-800",
        text: "Fulfilled",
      };
    if (req.status === "partially-fulfilled")
      return {
        border: "border-blue-500",
        badge: "bg-blue-100 text-blue-800",
        text: "Partially Fulfilled",
      };
    if (req.status === "assigned")
      return {
        border: "border-yellow-500",
        badge: "bg-yellow-100 text-yellow-800",
        text: "Assigned",
      };
    if (req.status === "approved")
      return {
        border: "border-green-500",
        badge: "bg-green-100 text-green-800",
        text: "Approved",
      };
    if (req.status === "pending")
      return {
        border: "border-gray-400",
        badge: "bg-gray-100 text-gray-800",
        text: "Pending",
      };
    return {
      border: "border-gray-300",
      badge: "bg-gray-100 text-gray-800",
      text: "Unknown Status",
    };
  };

  const getItemStatusColor = (status) => {
    switch (status) {
      case "fulfilled":
        return "text-emerald-600 bg-emerald-50 border-emerald-200";
      case "partially fulfilled":
        return "text-blue-600 bg-blue-50 border-blue-200";
      default:
        return "text-amber-600 bg-amber-50 border-amber-200";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "critical":
        return "bg-rose-600 text-white font-bold";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "medium":
        return "bg-amber-100 text-amber-800";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const handleSelectRequest = (req) => {
    setSelectedRequest(req);
    setShowDetail(true);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50 font-sans text-gray-800 antialiased">
      
      {/* SIDEBAR OVERLAY FOR MOBILE */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-sm md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR NAVIGATION */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 transform flex-col bg-slate-900 text-white transition-transform duration-200 ease-in-out md:static md:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-800 px-5">
          <h1 className="text-xl font-bold tracking-wide text-indigo-400">
            Emergency Hub
          </h1>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="text-slate-400 hover:text-white md:hidden text-lg p-1"
          >
            ✕
          </button>
        </div>
        <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
          {navigationItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <button
                key={item.name}
                onClick={() => {
                  setCurrentFilter(item.name);
                  setIsSidebarOpen(false);
                }}
                className={`flex w-full items-center space-x-3 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                  currentFilter === item.name
                    ? "bg-indigo-600 text-white"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <IconComponent
                  className={`h-5 w-5 ${currentFilter === item.name ? "text-white" : item.color}`}
                />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* MAIN CONTENT WORKSPACE */}
      <div className="flex flex-1 flex-col overflow-hidden w-full">
        <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 md:px-6 shadow-sm flex-shrink-0">
          <div className="flex items-center space-x-3">
            {showDetail ? (
              <button
                onClick={() => setShowDetail(false)}
                className="text-gray-500 hover:text-gray-700 p-1 bg-gray-100 rounded-full"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            ) : (
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="text-gray-500 hover:text-gray-700 focus:outline-none md:hidden p-1"
              >
                <Menu className="h-6 w-6" />
              </button>
            )}
            <h2 className="text-base md:text-lg font-semibold text-gray-800 truncate">
              {showDetail ? "Request Details" : `${currentFilter} (${filteredRequests.length})`}
            </h2>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden bg-gray-100 relative">
          
          {/* FULL SCREEN REQUEST LIST PANEL */}
          {!showDetail ? (
            <section className="w-full bg-white flex flex-col overflow-y-auto">
              {loading && (
                <div className="p-8 text-center text-sm text-gray-500">
                  Loading requests...
                </div>
              )}
              {error && (
                <div className="p-8 text-center text-sm text-red-500">
                  {error}
                </div>
              )}
              {!loading && !error && filteredRequests.length === 0 && (
                <div className="p-8 text-center text-sm text-gray-400">
                  No matching requests found.
                </div>
              )}

              {!loading && !error && (
                <div className="divide-y divide-gray-100 max-w-5xl w-full mx-auto px-4 md:px-6 py-2">
                  {filteredRequests.map((req) => {
                    const uiStyle = getStatusStyles(req);
                    return (
                      <button
                        key={req._id}
                        onClick={() => handleSelectRequest(req)}
                        className={`w-full text-left p-5 hover:bg-slate-50 flex items-start space-x-3 border-l-4 transition my-2 rounded-r-lg shadow-sm bg-white ${
                          req._id === selectedRequest?._id
                            ? "border-indigo-600 bg-indigo-50/10"
                            : uiStyle.border
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1 gap-2">
                            <div className="flex items-center space-x-1.5 truncate">
                              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded whitespace-nowrap ${uiStyle.badge}`}>
                                {uiStyle.text}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2 overflow-hidden">
                              <span className={`text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded whitespace-nowrap ${getPriorityColor(req.priority)}`}>
                                {req.priority}
                              </span>
                              <span className="text-xs text-gray-400 whitespace-nowrap">
                                {new Date(req.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <h4 className="text-sm font-semibold text-gray-900 capitalize truncate">
                            {req.requestedItems?.map((item) => item.itemType).join(", ") || "No Items"}
                          </h4>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2 break-words">
                            {req.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </section>
          ) : (
            /* FULL SCREEN DETAILED INFORMATION VIEW */
            <section className="w-full flex flex-col bg-white overflow-y-auto">
              {selectedRequest ? (
                <div className="max-w-4xl w-full mx-auto px-4 md:px-6 py-6">
                  <div className="pb-4 border-b border-gray-200 bg-white mb-6">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-2.5 py-1 text-xs font-bold uppercase rounded ${getStatusStyles(selectedRequest).badge}`}>
                          Lifecycle: {getStatusStyles(selectedRequest).text}
                        </span>
                        <span className={`px-2 py-1 text-xs uppercase font-bold rounded ${getPriorityColor(selectedRequest.priority)}`}>
                          {selectedRequest.priority} Priority
                        </span>
                      </div>
                      <span className="text-xs font-mono text-gray-400 break-all">
                        ID: {selectedRequest._id}
                      </span>
                    </div>
                    <h3 className="text-lg md:text-xl font-bold text-gray-900 capitalize leading-snug flex items-center gap-2">
                      <Activity className="w-5 h-5 text-indigo-500" />
                      Request Tracking Summary
                    </h3>
                  </div>

                  <div className="space-y-5 md:space-y-6">
                    {/* Requested Items Dynamic Breakdown */}
                    <div>
                      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                        Requested Supplies Break Down
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {selectedRequest.requestedItems && selectedRequest.requestedItems.length > 0 ? (
                          selectedRequest.requestedItems.map((item, idx) => (
                            <div key={idx} className={`p-3 rounded-lg border flex flex-col justify-between space-y-2 ${getItemStatusColor(item.itemStatus)}`}>
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-bold capitalize text-gray-900 flex items-center gap-1.5">
                                  <Package className="w-4 h-4 text-slate-500" />
                                  {item.itemType}
                                </span>
                                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-white/80 border text-gray-700">
                                  {item.itemStatus}
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-xs font-medium text-gray-700">
                                <span>Req Qty: <strong className="text-gray-900">{item.requiredQuantity}</strong></span>
                                <span>Fulfilled: <strong className="text-emerald-700">{item.fulfilledQuantity}</strong></span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-sm italic text-gray-400 col-span-2">No custom items defined.</div>
                        )}
                      </div>
                    </div>

                    {/* Narrative Statement */}
                    <div>
                      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                        Description Log
                      </h4>
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-sm text-gray-700 leading-relaxed shadow-inner break-words">
                        "{selectedRequest.description}"
                      </div>
                    </div>

                    {/* Reported Location */}
                    <div>
                      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                        Reported Location
                      </h4>
                      <div className="flex items-start text-sm text-gray-700 bg-slate-50 p-3 rounded-lg border border-gray-200">
                        <MapPin className="w-4 h-4 text-rose-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="break-words">{selectedRequest.location}</span>
                      </div>
                    </div>

                    {/* POPULATED DATABASE GRIDS */}
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider pt-2">
                      Assignment & Resource Allocations
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* 1. Populated Approved By field */}
                      <div className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm flex flex-col justify-between">
                        <div>
                          <span className="text-xs text-gray-400 block mb-2 font-medium">
                            Approved By Authorities
                          </span>
                          {selectedRequest.approvedBy ? (
                            <div className="text-sm space-y-1">
                              <p className="font-semibold text-gray-900 flex items-center">
                                <ShieldAlert className="w-4 h-4 text-indigo-500 mr-2 flex-shrink-0" />{" "}
                                <span className="truncate">{selectedRequest.approvedBy.fullName}</span>
                              </p>
                              <p className="text-gray-500 flex items-center text-xs">
                                <Phone className="w-3.5 h-3.5 text-gray-400 mr-2 flex-shrink-0" />{" "}
                                <span>{selectedRequest.approvedBy.phone}</span>
                              </p>
                            </div>
                          ) : (
                            <span className="text-sm italic text-gray-400 block">
                              Awaiting official approval review.
                            </span>
                          )}
                        </div>
                        {selectedRequest.approvedAt && (
                          <div className="mt-3 pt-2 border-t border-gray-100 text-[11px] text-green-700 font-medium">
                            📅 Approved At:{" "}
                            {new Date(selectedRequest.approvedAt).toLocaleString()}
                          </div>
                        )}
                      </div>

                      {/* 2. Populated Assigned Volunteer */}
                      <div className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
                        <span className="text-xs text-gray-400 block mb-2 font-medium">
                          Assigned On-Field Volunteer
                        </span>
                        {selectedRequest.assignedVolunteer ? (
                          <div className="text-sm space-y-1">
                            <p className="font-semibold text-gray-900 flex items-center">
                              <User className="w-4 h-4 text-emerald-500 mr-2 flex-shrink-0" />{" "}
                              <span className="truncate">{selectedRequest.assignedVolunteer.fullName}</span>
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
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex h-full items-center justify-center text-gray-400 p-6 text-center">
                  Select a request from the list to view live updates.
                </div>
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}