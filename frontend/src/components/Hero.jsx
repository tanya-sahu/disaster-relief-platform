import React from "react";

export default function SimpleHero() {
  return (
    <div className="bg-slate-900 text-white min-h-[80vh] flex items-center px-6 lg:px-16">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center w-full">
        {/* LEFT SIDE: Clear Message */}
        <div className="space-y-6">
          <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
            Bridging the Gap in Crisis
            <br />
            <span className="text-emerald-400">Real-Time Disaster Relief</span>
          </h1>

          <p className="text-slate-400 text-lg">
            A unified disaster response management system that instantly
            connects victims with verified NGOs and local volunteers to deploy
            critical resources and emergency shelter when every second counts.
          </p>

          <div className="flex gap-4">
            <button className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-medium rounded-md transition-colors">
              Launch Live Demo
            </button>
            <button className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md transition-colors">
              Source Code
            </button>
          </div>
        </div>

        {/* RIGHT SIDE: Visual App Logic (Recruiter ke liye sabse important) */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-xl hover:scale-105 transition duration-300">
          <h3 className="text-xl font-semibold mb-6 text-slate-200 border-b border-slate-700 pb-3">
            How it Works (Project Flow)
          </h3>

          <div className="space-y-6 relative border-l-2 border-slate-700 pl-6 ml-3">
            {/* Step 1 */}
            <div className="relative">
              <span className="absolute -left-[33px] bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
                1
              </span>
              <h4 className="font-semibold text-slate-200">
                Victim Raises Request
              </h4>
              <p className="text-sm text-slate-400">
                Families or individuals submit real-time resource and shelter
                requirements.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <span className="absolute -left-[33px] bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
                2
              </span>
              <h4 className="font-semibold text-slate-200">NGO Approves</h4>
              <p className="text-sm text-slate-400">
                Vetted organizations audit, prioritize, and approve legitimate
                requests to eliminate spam.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <span className="absolute -left-[33px] bg-emerald-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
                3
              </span>
              <h4 className="font-semibold text-slate-200">
                Volunteer Delivers
              </h4>
              <p className="text-sm text-slate-400">
                Ground-level volunteers accept approved tasks and safely deliver
                targeted aid.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



