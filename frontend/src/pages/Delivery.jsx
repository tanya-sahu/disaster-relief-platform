import React from "react";
import { FiCheck, FiClock } from "react-icons/fi";

function DeliveryStepper({ currentStatus }) {
  // 1. Aapka pure delivery lifecycle ka array sequence
  const steps = [
    "Request Placed",
    "Allocated",
    "Assigned",
    "Dispatched",
    "Out for delivery",
    "Delivered",
  ];

  // 2. Map state name to index safely (Case-insensitive handling for absolute safety)
  const currentStepIndex = steps.findIndex(
    (step) => step.toLowerCase() === (currentStatus || "").toLowerCase()
  );

  return (
    <div className="w-full bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
      <h3 className="text-sm font-bold text-slate-800 mb-6 flex items-center gap-2">
        📦 Live Delivery Lifecycle Status Tracker
      </h3>

      {/* Main Container Wrapper */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between w-full gap-4 md:gap-0 relative">
        {steps.map((step, index) => {
          // Condition check engine for step styling
          const isCompleted = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;
          const isUpcoming = index > currentStepIndex;

          return (
            <div
              key={step}
              className="flex flex-row md:flex-col items-center flex-1 w-full relative z-10"
            >
              {/* Icon / Number Indicator Circle Badge */}
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs transition-all duration-300 shadow-sm border ${
                  isCompleted
                    ? "bg-emerald-500 border-emerald-500 text-white shadow-emerald-500/20"
                    : isCurrent
                    ? "bg-red-600 border-red-600 text-white shadow-md shadow-red-500/20 animate-pulse"
                    : "bg-slate-50 border-slate-200 text-slate-400"
                }`}
              >
                {isCompleted ? (
                  <FiCheck className="w-5 h-5" />
                ) : isCurrent ? (
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                  </span>
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>

              {/* Text Information Description */}
              <div className="ml-4 md:ml-0 md:mt-3 text-left md:text-center max-w-[140px]">
                <p
                  className={`text-xs font-bold leading-tight transition-colors duration-300 ${
                    isCurrent
                      ? "text-red-600 font-black scale-105 transform"
                      : isCompleted
                      ? "text-emerald-600 font-semibold"
                      : "text-slate-400 font-medium"
                  }`}
                >
                  {step}
                </p>
                {isCurrent && (
                  <span className="inline-flex items-center gap-1 mt-0.5 px-1.5 py-0.2 bg-red-50 text-red-700 rounded text-[9px] font-mono font-bold border border-red-100 uppercase tracking-wide">
                    Live Status
                  </span>
                )}
              </div>

              {/* 💻 Connecting Desktop Line Arrow Connector */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-5 left-[50%] right-[-50%] h-[3px] bg-slate-100 -z-10 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      index < currentStepIndex
                        ? "bg-emerald-500 w-full"
                        : index === currentStepIndex
                        ? "bg-gradient-to-r from-red-500 to-slate-200 w-[50%]"
                        : "bg-slate-100 w-0"
                    }`}
                  />
                </div>
              )}

              {/* 📱 Connecting Mobile Vertical Line Connector */}
              {index < steps.length - 1 && (
                <div className="md:hidden absolute left-5 top-10 bottom-[-20px] w-[2px] bg-slate-100 -z-10">
                  <div
                    className={`w-full transition-all duration-500 ${
                      index < currentStepIndex
                        ? "bg-emerald-500 h-full"
                        : "bg-slate-100 h-0"
                    }`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default DeliveryStepper;