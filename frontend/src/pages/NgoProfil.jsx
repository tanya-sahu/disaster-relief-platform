import React, { useState, useEffect } from "react";
import axios from "axios";
import { Clock, Package, UserCheck, Truck, MapPin, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";

// The ordered lifecycle stages mapped visually
const TIMELINE_STEPS = [
  { key: "Request Placed", label: "Request Placed", icon: Clock },
  { key: "Allocated", label: "Items Allocated", icon: Package },
  { key: "Assigned", label: "Volunteer Assigned", icon: UserCheck },
  { key: "Dispatched", label: "Dispatched", icon: Truck },
  { key: "Out for delivery", label: "Out for Delivery", icon: MapPin },
  { key: "Delivered", label: "Delivered", icon: CheckCircle2 },
];

export default function NGOProfileForm({ requestId }) {
  const [requestData, setRequestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Hook runs immediately on mount using your real backend GET request details endpoint 
  useEffect(() => {
    const fetchRealData = async () => {
      if (!requestId) return;
      try {
        setLoading(true);
        setErrorMessage("");
        
        // Axios GET configuration mapping with global config headers passed locally
        const response = await axios.get(`/api/v1/requests/${requestId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });
        
        // Axios puts parsed JSON response body inside response.data automatically
        setRequestData(response.data?.data?.request || response.data?.data || response.data);
      } catch (err) {
        // Safely extract error messages from your backend API structure via Axios
        const errorMsg = err.response?.data?.message || "Could not retrieve request logs from service.";
        setErrorMessage(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchRealData();
  }, [requestId]);

  // Method executing your specific updateDeliveryStatus logic block via Axios
  const handleStatusUpdate = async (targetStatus) => {
    if (updating) return;
    setUpdating(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      // Axios PUT request mapping explicitly to your express endpoint routing
      const response = await axios.put(
        `/api/v1/requests/${requestId}/delivery-status`,
        { deliveryStatus: targetStatus },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );

      // Synchronizes UI view using the parsed matching state architecture you coded: { request: dbRequest }
      if (response.data?.data?.request) {
        setRequestData(response.data.data.request);
        setSuccessMessage(`Status updated successfully to: ${targetStatus}`);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to push network status transition.";
      setErrorMessage(errorMsg);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] text-gray-500">
        <RefreshCw className="animate-spin mb-2 text-blue-600" size={32} />
        <p className="text-sm font-medium">Fetching active delivery route tracking...</p>
      </div>
    );
  }

  const currentStepIndex = TIMELINE_STEPS.findIndex(step => step.key === requestData?.deliveryStatus);

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      
      {/* Alert Interfaces */}
      {errorMessage && (
        <div className="flex items-center gap-3 p-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="shrink-0 text-red-500" size={18} />
          <div><span className="font-bold">Error:</span> {errorMessage}</div>
        </div>
      )}

      {successMessage && (
        <div className="flex items-center gap-3 p-4 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg">
          <CheckCircle2 className="shrink-0 text-emerald-500" size={18} />
          <div>{successMessage}</div>
        </div>
      )}

      {/* Main Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        
        {/* Document Metadata Header Banner */}
        <div className="bg-gray-900 text-white p-6">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div>
              <p className="text-xs font-semibold text-gray-400 tracking-wider uppercase">Request Identifier</p>
              <h2 className="text-lg font-mono font-bold text-blue-400">{requestData?._id}</h2>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400 font-medium">Lifecycle Status</p>
              <span className={`inline-block px-2.5 py-0.5 rounded text-xs font-bold uppercase mt-1 ${
                requestData?.status === "fulfilled" ? "bg-emerald-500/20 text-emerald-300" : "bg-amber-500/20 text-amber-300"
              }`}>
                {requestData?.status}
              </span>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-800 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
            <div><strong className="text-white">Location Target:</strong> {requestData?.location}</div>
            <div><strong className="text-white">Description Context:</strong> {requestData?.description}</div>
          </div>
        </div>

        {/* E-Commerce Process Timeline Progression */}
        <div className="p-6 md:p-10 border-b border-gray-100 overflow-x-auto">
          <div className="relative flex justify-between items-start min-w-[600px]">
            {/* Structural Connecting Line */}
            <div className="absolute top-5 left-8 right-8 h-1 bg-gray-100 -z-0" />
            
            {/* Reactive Filled Accent Indicator Line */}
            <div 
              className="absolute top-5 left-8 h-1 bg-emerald-500 transition-all duration-500 ease-in-out -z-0"
              style={{ width: currentStepIndex >= 0 ? `${(currentStepIndex / (TIMELINE_STEPS.length - 1)) * 93}%` : "0%" }}
            />

            {TIMELINE_STEPS.map((step, index) => {
              const StepIcon = step.icon;
              const isDone = index < currentStepIndex;
              const isCurrent = index === currentStepIndex;

              return (
                <div key={step.key} className="flex flex-col items-center flex-1 relative z-10">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isDone 
                      ? "bg-emerald-500 text-white shadow-lg shadow-emerald-100" 
                      : isCurrent 
                      ? "bg-blue-600 text-white ring-4 ring-blue-100 shadow-md scale-110" 
                      : "bg-white border-2 border-gray-200 text-gray-400"
                  }`}>
                    <StepIcon size={18} />
                  </div>
                  <span className={`mt-3 text-xs text-center font-semibold max-w-[95px] block ${
                    isCurrent ? "text-blue-600 font-bold" : isDone ? "text-gray-800" : "text-gray-400"
                  }`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Inventory Allocated Item List Breakdown */}
        {requestData?.requestedItems && requestData.requestedItems.length > 0 && (
          <div className="p-6 border-b border-gray-100 bg-gray-50/30">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Manifest Content Items</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {requestData.requestedItems.map((item, idx) => (
                <div key={idx} className="bg-white p-3 rounded-lg border border-gray-200 flex justify-between items-center text-sm">
                  <span className="font-semibold capitalize text-gray-700">{item.itemType}</span>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {item.fulfilledQuantity} / {item.requiredQuantity} Quantities ({item.itemStatus})
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dynamic Interactive Operation Panel */}
        <div className="p-6 bg-gray-50 border-t border-gray-100">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
            Volunteer Pipeline Status Mutators
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {["Assigned", "Dispatched", "Out for delivery", "Delivered"].map((statusOption) => {
              const isCurrentSelection = requestData?.deliveryStatus === statusOption;
              
              return (
                <button
                  key={statusOption}
                  disabled={updating || isCurrentSelection}
                  onClick={() => handleStatusUpdate(statusOption)}
                  className={`px-4 py-3 text-xs font-bold rounded-xl border transition-all flex flex-col items-center justify-center gap-1.5 ${
                    isCurrentSelection
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-100 cursor-not-allowed"
                      : "bg-white hover:bg-gray-50 text-gray-700 border-gray-200 active:scale-95 shadow-2xs disabled:opacity-50"
                  }`}
                >
                  <span>{statusOption}</span>
                  {isCurrentSelection && <span className="text-[10px] font-medium text-emerald-100 opacity-90">(Current)</span>}
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}