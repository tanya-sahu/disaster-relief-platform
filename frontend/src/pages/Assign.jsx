import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Package, Send, AlertCircle, Info, CheckCircle2, 
  ArrowRight, ShieldCheck, Loader2, ClipboardList
} from 'lucide-react';

export default function AssignResourceModule({ requestData, onAllocationSuccess }) {
  // requestData: Parent dashboard component se click kiya hua selected request object
  const [allocationQuantities, setAllocationQuantities] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState({ type: '', text: '' });

  // Reset form allocations jab bhi user alag request par click kare
  useEffect(() => {
    if (requestData) {
      const defaultState = {};
      requestData.requestedItems?.forEach(item => {
        const netRemaining = item.requiredQuantity - item.fulfilledQuantity;
        // Default allocation value set to maximum needed resource
        defaultState[item.itemType] = netRemaining > 0 ? netRemaining : 0;
      });
      setAllocationQuantities(defaultState);
      setFeedbackMessage({ type: '', text: '' });
    }
  }, [requestData]);

  if (!requestData) {
    return (
      <div className="flex flex-col items-center justify-center p-8 border border-dashed border-gray-200 rounded-2xl bg-gray-50/50 text-center h-64">
        <ClipboardList className="w-8 h-8 text-gray-300 mb-2" />
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
          Select an Approved entry to activate deployment console.
        </p>
      </div>
    );
  }

  // Handle local incremental checks on client-side state
  const handleInputChange = (itemType, value, maxLimit) => {
    const cleanValue = Math.min(maxLimit, Math.max(0, Number(value)));
    setAllocationQuantities(prev => ({
      ...prev,
      [itemType]: cleanValue
    }));
  };

  // Submit resource payload to backend route router.route("/allocate")
  const handleSubmitAllocation = async (e) => {
    e.preventDefault();
    setFeedbackMessage({ type: '', text: '' });

    // Validate if at least something is being sent to prevent 400 bad transactions
    const absoluteTotalAllocated = Object.values(allocationQuantities).reduce((acc, curr) => acc + curr, 0);
    if (absoluteTotalAllocated === 0) {
      setFeedbackMessage({ 
        type: 'error', 
        text: 'Inventory Dispatch Alert: Please assign at least 1 unit to invoke audit transaction.' 
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Backend expects: req.body.requestId inside active verification session
      const payload = {
        requestId: requestData._id
        // internal loop identifies individual inventory elements securely on backend
      };

      const response = await axios.post(
        "/api/v1/requests/allocate", 
        payload, 
        { withCredentials: true }
      );

      if (response.data?.success || response.status === 200) {
        setFeedbackMessage({
          type: 'success',
          text: 'Disaster logistics verified! Allocations created and inventory deducted successfully.'
        });
        
        // Parent dashboard parameters refresh fallback trigger
        if (onAllocationSuccess) {
          onAllocationSuccess(response.data?.data?.request);
        }
      }
    } catch (err) {
      console.error("Allocation Transaction Error:", err);
      setFeedbackMessage({
        type: 'error',
        text: err.response?.data?.message || 'Transaction aborted: Check warehouse stocks matching the resource type.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden transition-all">
      
      {/* Header Banner */}
      <div className="p-5 border-b border-gray-100 bg-gray-50/70 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
            <Package className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-800">Warehouse Allocation Console</h3>
            <p className="text-[11px] text-gray-400 font-mono mt-0.5">TARGET REQUEST ID: {requestData._id}</p>
          </div>
        </div>
        <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold px-2 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1">
          <ShieldCheck className="w-3 h-3" /> System Cleared
        </span>
      </div>

      <form onSubmit={handleSubmitAllocation} className="p-6 space-y-5">
        
        {/* Info Banner explaining automation workflow */}
        <div className="p-3.5 bg-indigo-50/40 border border-indigo-100 rounded-xl flex items-start space-x-2.5">
          <Info className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-indigo-900 leading-relaxed">
            Clicking deploy will deduct materials from your inventory database matching the request array names automatically. An audit trail will log instantly.
          </p>
        </div>

        {/* Dynamic Item Inputs Matrix */}
        <div className="space-y-3">
          <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Items Dispatch Checklist</h4>
          
          {requestData.requestedItems?.map((item) => {
            const netNeeded = item.requiredQuantity - item.fulfilledQuantity;
            const isCompleted = item.itemStatus === "fulfilled" || netNeeded <= 0;

            return (
              <div 
                key={item._id} 
                className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${
                  isCompleted 
                    ? 'bg-gray-50/50 border-gray-200 opacity-60' 
                    : 'bg-white border-gray-200 hover:border-gray-300 shadow-sm'
                }`}
              >
                {/* Left Specs info */}
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold text-gray-800 capitalize">{item.itemType}</span>
                    {isCompleted && (
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-medium flex items-center gap-0.5">
                        <CheckCircle2 className="w-2.5 h-2.5" /> Ready
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5 font-medium">
                    Fulfilled: <span className="text-gray-700 font-mono">{item.fulfilledQuantity}</span> / Needed: <span className="text-gray-700 font-mono">{item.requiredQuantity}</span>
                  </p>
                </div>

                {/* Right Input Controllers */}
                {!isCompleted ? (
                  <div className="flex items-center space-x-3">
                    <div className="text-right hidden sm:block">
                      <span className="text-[10px] text-gray-400 block uppercase font-bold tracking-wider">Required Restock</span>
                      <span className="text-xs text-indigo-600 font-mono font-bold">+{netNeeded} Units</span>
                    </div>
                    <div className="relative flex items-center w-32">
                      <input
                        type="number"
                        min="0"
                        max={netNeeded}
                        disabled={isSubmitting}
                        value={allocationQuantities[item.itemType] || 0}
                        onChange={(e) => handleInputChange(item.itemType, e.target.value, netNeeded)}
                        className="w-full pl-3 pr-10 py-1.5 bg-gray-50 border border-gray-200 focus:bg-white focus:border-indigo-500 rounded-xl text-sm font-mono font-bold text-gray-800 text-center focus:outline-none transition-all shadow-inner"
                      />
                      <span className="absolute right-3 text-[10px] text-gray-400 font-medium pointer-events-none">units</span>
                    </div>
                  </div>
                ) : (
                  <span className="text-xs font-mono text-gray-400 bg-gray-100 px-2.5 py-1 rounded-lg">Fulfillment Closed</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Feedback Alert Log System */}
        {feedbackMessage.text && (
          <div className={`p-4 rounded-xl border text-xs leading-relaxed flex items-start space-x-2.5 ${
            feedbackMessage.type === 'success' 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}>
            <AlertCircle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${feedbackMessage.type === 'success' ? 'text-emerald-600' : 'text-rose-600'}`} />
            <span className="font-medium">{feedbackMessage.text}</span>
          </div>
        )}

        {/* Action Form Footer Submit button */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <p className="text-[11px] text-gray-400 max-w-xs leading-tight">
            Authorization transaction maps your credentials to the assigned transaction log instantly.
          </p>
          <button
            type="submit"
            disabled={isSubmitting || requestData.requestFulfilled === "fulfilled"}
            className="flex items-center space-x-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-200 text-white disabled:text-gray-400 font-bold text-xs rounded-xl shadow-md shadow-indigo-600/10 transition-all disabled:shadow-none"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Processing Order...</span>
              </>
            ) : (
              <>
                <span>Commit & Deliver Order</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}