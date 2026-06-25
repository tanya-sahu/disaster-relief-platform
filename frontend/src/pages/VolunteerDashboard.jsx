import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  CheckCircle,
  Loader,
  ShieldCheck,
  Menu,
  User,
  MapPin,
  Phone,
  Package,
  ShieldAlert,
  ArrowLeft,
  Activity,
  UserPlus,
  Briefcase,
  UserCheck,
  HelpCircle,
} from "lucide-react";

export default function VolunteerDashboard() {
  const [filteredRequests, setFilteredRequests] = useState([]);
  // Default tab view set to "Unassigned Requests"
  const [currentFilter, setCurrentFilter] = useState("Unassigned Requests"); 
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showMobileDetail, setShowMobileDetail] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  // Dynamic Navigation Items Array
  const navigationItems = [
    {
      name: "Unassigned Requests",
      icon: HelpCircle,
      color: "text-amber-500",
    },
    {
      name: "Approved & Assigned by Me",
      icon: CheckCircle,
      color: "text-green-500",
    },
    {
      name: "Partially Fulfilled Assigned by Me",
      icon: Loader,
      color: "text-blue-500",
    },
    {
      name: "Fulfilled Assigned by Me",
      icon: ShieldCheck,
      color: "text-emerald-500",
    },
    {
      name: "All Requests Assigned by Me",
      icon: Briefcase,
      color: "text-indigo-500",
    },
  ];

  // Fetch Requests dynamically based on current selected navigation tab
  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      let url = "";

      switch (currentFilter) {
        case "Unassigned Requests":
          url = "/api/v1/requests/get-all-request?status=approved&isVolunteerAssigned=false";
          break;
        case "Approved & Assigned by Me":
          url = "/api/v1/requests/my-assigned?status=approved";
          break;
        case "Partially Fulfilled Assigned by Me":
          url = "/api/v1/requests/my-assigned?status=partially-fulfilled";
          break;
        case "Fulfilled Assigned by Me":
          url = "/api/v1/requests/my-assigned?status=fulfilled";
          break;
        case "All Requests Assigned by Me":
          url = "/api/v1/requests/my-assigned";
          break;
        default:
          url = "/api/v1/requests/get-all-request?status=approved&isVolunteerAssigned=false";
      }

      const response = await axios.get(url, { withCredentials: true });
      const fetchedData = response.data?.data || [];

      setFilteredRequests(fetchedData);

      // Default first card select karna screen loading par
      if (fetchedData.length > 0) {
        setSelectedRequest(fetchedData[0]);
      } else {
        setSelectedRequest(null);
      }
    } catch (err) {
      console.error("Error fetching requests:", err);
      setError("Failed to load requests from secure server.");
      setSelectedRequest(null);
    } finally {
      setLoading(false);
    }
  }, [currentFilter]);

  // Hook to refetch data whenever tab changes
  useEffect(() => {
    fetchRequests();
    setShowMobileDetail(false);
  }, [currentFilter, fetchRequests]);

  // Handle Assigning Request to Volunteer
  const handleAssignRequest = async (requestId) => {
    if (!requestId) return;
    try {
      setActionLoading(true);
      const response = await axios.patch(
        `/api/v1/requests/assign/${requestId}`,
        {},
        { withCredentials: true }
      );

      if (response.status === 200 || response.data?.success) {
        alert("Mission assigned to you successfully!");
        // Assign hote hi user ko automatically "Approved & Assigned by Me" tab me bhej dena jahan ye req dikhegi
        setCurrentFilter("Approved & Assigned by Me");
      }
    } catch (err) {
      console.error("Error assigning request:", err);
      alert(err.response?.data?.message || "Failed to assign request.");
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusStyles = (req) => {
    if (!req) return { border: "border-gray-300", badge: "bg-gray-100 text-gray-800", text: "Unknown" };
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
    if (req.status === "approved")
      return {
        border: "border-green-500",
        badge: "bg-green-100 text-green-800",
        text: "Approved",
      };
    return {
      border: "border-gray-300",
      badge: "bg-gray-100 text-gray-800",
      text: req.status,
    };
  };

  const getItemStatusColor = (status) => {
    switch (status) {
      case "fulfilled":
        return "text-emerald-600 bg-emerald-50 border-emerald-200";
      case "partially-fulfilled":
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
    setShowMobileDetail(true);
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
            Volunteer Hub
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
                className={`flex w-full items-start space-x-3 rounded-lg px-4 py-2.5 text-sm font-medium transition text-left ${
                  currentFilter === item.name
                    ? "bg-indigo-600 text-white"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <IconComponent
                  className={`h-5 w-5 mt-0.5 flex-shrink-0 ${currentFilter === item.name ? "text-white" : item.color}`}
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
          <div className="flex items-center space-x-3 w-full justify-between">
            <div className="flex items-center space-x-3">
              {showMobileDetail ? (
                <button
                  onClick={() => setShowMobileDetail(false)}
                  className="text-gray-500 hover:text-gray-700 md:hidden p-1 bg-gray-100 rounded-full"
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
              <h2 className="text-sm md:text-base font-semibold text-gray-800 truncate max-w-[220px] sm:max-w-none">
                {currentFilter} ({filteredRequests.length})
              </h2>
            </div>
            <div className="text-xs bg-indigo-50 text-indigo-700 font-semibold px-3 py-1.5 rounded-md border border-indigo-100">
              On-Field Mode
            </div>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden bg-gray-100 relative">
          {/* LEFT PANEL: Request Cards List */}
          <section
            className={`w-full border-r border-gray-200 bg-white flex flex-col md:w-5/12 overflow-y-auto ${
              showMobileDetail ? "hidden md:flex" : "flex"
            }`}
          >
            {loading && (
              <div className="p-8 text-center text-sm text-gray-500 flex items-center justify-center gap-2">
                <Loader className="animate-spin h-4 w-4 text-indigo-500" />{" "}
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
                No requests found under this section.
              </div>
            )}

            {!loading && !error && (
              <div className="divide-y divide-gray-100">
                {filteredRequests.map((req) => {
                  const uiStyle = getStatusStyles(req);
                  return (
                    <button
                      key={req._id}
                      onClick={() => handleSelectRequest(req)}
                      className={`w-full text-left p-4 hover:bg-slate-50 flex items-start space-x-3 border-l-4 transition ${
                        req._id === selectedRequest?._id
                          ? "bg-indigo-50/40 border-indigo-600"
                          : uiStyle.border
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1 gap-2">
                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded whitespace-nowrap ${uiStyle.badge}`}
                          >
                            {uiStyle.text}
                          </span>
                          <div className="flex items-center space-x-2 overflow-hidden">
                            <span
                              className={`text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded whitespace-nowrap ${getPriorityColor(req.priority)}`}
                            >
                              {req.priority}
                            </span>
                            <span className="text-xs text-gray-400 whitespace-nowrap">
                              {new Date(req.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <h4 className="text-sm font-semibold text-gray-900 capitalize truncate">
                          {req.requestedItems
                            ?.map((item) => item.itemType)
                            .join(", ") || "No Items"}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1 truncate">
                          {req.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          {/* RIGHT PANEL: Detailed Information View */}
          <section
            className={`w-full md:w-7/12 flex flex-col bg-white overflow-y-auto ${
              showMobileDetail ? "flex" : "hidden md:flex"
            }`}
          >
            {selectedRequest ? (
              <div className="flex flex-col w-full">
                <div className="p-4 md:p-6 border-b border-gray-200 bg-white sticky top-0 z-10 shadow-sm md:shadow-none">
                  <button
                    onClick={() => setShowMobileDetail(false)}
                    className="md:hidden text-indigo-600 text-xs font-semibold flex items-center mb-2"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to list
                  </button>

                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`px-2.5 py-1 text-xs font-bold uppercase rounded ${getStatusStyles(selectedRequest).badge}`}
                      >
                        Status: {getStatusStyles(selectedRequest).text}
                      </span>
                      <span
                        className={`px-2 py-1 text-xs uppercase font-bold rounded ${getPriorityColor(selectedRequest.priority)}`}
                      >
                        {selectedRequest.priority} Priority
                      </span>
                    </div>
                    <span className="text-xs font-mono text-gray-400 break-all">
                      ID: {selectedRequest._id}
                    </span>
                  </div>

                  <h3 className="text-base md:text-lg font-bold text-gray-900 capitalize leading-snug flex items-center gap-2">
                    <Activity className="w-5 h-5 text-indigo-500 flex-shrink-0" />{" "}
                    Request Allocation & Action Portal
                  </h3>
                </div>

                <div className="p-4 md:p-6 space-y-6">
                  {/* ASSIGNMENT BUTTON: Visible only inside "Unassigned Requests" */}
                  {currentFilter === "Unassigned Requests" &&
                    !selectedRequest.isVolunteerAssigned && (
                      <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                          <h4 className="text-sm font-bold text-indigo-900">
                            Accept this emergency mission?
                          </h4>
                          <p className="text-xs text-indigo-700 mt-0.5">
                            Accept karne par aap on-field validation aur
                            delivery ke liye responsible honge.
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            handleAssignRequest(selectedRequest._id)
                          }
                          disabled={actionLoading}
                          className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 shadow-md transition disabled:bg-indigo-400"
                        >
                          {actionLoading ? (
                            <Loader className="w-4 h-4 animate-spin" />
                          ) : (
                            <UserPlus className="w-4 h-4" />
                          )}
                          Assign to Me
                        </button>
                      </div>
                    )}

                  {selectedRequest.isVolunteerAssigned && (
                    <div className="p-3.5 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl text-xs flex items-center gap-2 font-medium">
                      <UserCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>
                        This request is successfully secured under your
                        pipeline.
                      </span>
                    </div>
                  )}

                  {/* Supplies Breakdown */}
                  <div>
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2.5">
                      Requested Supplies Break Down
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {selectedRequest.requestedItems?.map((item, idx) => (
                        <div
                          key={idx}
                          className={`p-3 rounded-lg border flex flex-col justify-between space-y-2 ${getItemStatusColor(item.itemStatus)}`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold capitalize text-gray-900 flex items-center gap-1.5">
                              <Package className="w-4 h-4 text-slate-500" />{" "}
                              {item.itemType}
                            </span>
                            <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-white/80 border text-gray-700">
                              {item.itemStatus}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs font-medium text-gray-700">
                            <span>
                              Req Qty:{" "}
                              <strong className="text-gray-900">
                                {item.requiredQuantity}
                              </strong>
                            </span>
                            <span>
                              Fulfilled:{" "}
                              <strong className="text-emerald-700">
                                {item.fulfilledQuantity}
                              </strong>
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Description Log */}
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
                      <span className="break-words">
                        {selectedRequest.location}
                      </span>
                    </div>
                  </div>

                  {/* Allocated Resources Area */}
                  <div>
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                      Allocated Inventory Resources
                    </h4>
                    {selectedRequest.allocations &&
                    selectedRequest.allocations.length > 0 ? (
                      <div className="border border-gray-200 rounded-lg overflow-hidden text-sm">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold border-b border-gray-200">
                              <th className="p-3">Allocation ID</th>
                              <th className="p-3 text-right">Status Link</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {selectedRequest.allocations.map(
                              (allocId, index) => (
                                <tr
                                  key={index}
                                  className="hover:bg-slate-50/80"
                                >
                                  <td className="p-3 font-mono text-xs text-gray-600 truncate max-w-[150px]">
                                    {allocId}
                                  </td>
                                  <td className="p-3 text-right">
                                    <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded font-medium border border-indigo-100">
                                      Dispatched
                                    </span>
                                  </td>
                                </tr>
                              ),
                            )}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-xs italic text-gray-400 p-4 border border-dashed rounded-lg bg-gray-50/50 text-center">
                        No active inventory item allocations link discovered
                        yet.
                      </div>
                    )}
                  </div>

                  {/* Authority & Victim Grids */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm flex flex-col justify-between">
                      <div>
                        <span className="text-xs text-gray-400 block mb-2 font-medium">
                          Approved By Authorities
                        </span>
                        {selectedRequest.approvedBy ? (
                          <div className="text-sm space-y-1">
                            <p className="font-semibold text-gray-900 flex items-center">
                              <ShieldAlert className="w-4 h-4 text-indigo-500 mr-2 flex-shrink-0" />
                              <span className="truncate">
                                {selectedRequest.approvedBy.fullName}
                              </span>
                            </p>
                            <p className="text-gray-500 flex items-center text-xs">
                              <Phone className="w-3.5 h-3.5 text-gray-400 mr-2 flex-shrink-0" />
                              <span>{selectedRequest.approvedBy.phone}</span>
                            </p>
                          </div>
                        ) : (
                          <span className="text-sm italic text-gray-400 block">
                            System Verification Auto-approved.
                          </span>
                        )}
                      </div>
                      {selectedRequest.approvedAt && (
                        <div className="mt-3 pt-2 border-t border-gray-100 text-[11px] text-green-700 font-medium">
                          📅 Validated:{" "}
                          {new Date(
                            selectedRequest.approvedAt,
                          ).toLocaleDateString()}
                        </div>
                      )}
                    </div>

                    <div className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
                      <span className="text-xs text-gray-400 block mb-2 font-medium">
                        Victims/Affected Person Contact
                      </span>
                      {selectedRequest.createdBy ? (
                        <div className="text-sm space-y-1">
                          <p className="font-semibold text-gray-900 flex items-center">
                            <User className="w-4 h-4 text-orange-500 mr-2 flex-shrink-0" />
                            <span className="truncate">
                              {selectedRequest.createdBy.fullName ||
                                "Affected Citizen"}
                            </span>
                          </p>
                          <p className="text-gray-500 flex items-center text-xs">
                            <Phone className="w-3.5 h-3.5 text-gray-400 mr-2 flex-shrink-0" />
                            <span>
                              {selectedRequest.createdBy.phone ||
                                "No phone listed"}
                            </span>
                          </p>
                        </div>
                      ) : (
                        <span className="text-sm italic text-gray-400 block">
                          Anonymous Emergency Alert.
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center text-gray-400 p-6 text-center">
                Select a request from the list to view allocation matrix and map
                status.
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}