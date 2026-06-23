import React, { useState } from 'react';

export default function WorkspaceSection() {
  // State to switch between Victim, NGO, and Volunteer view
  const [activeTab, setActiveTab] = useState('victim');

  return (
    <div className="bg-slate-950 text-white py-16 px-6 lg:px-16 border-t border-slate-800">
      <div className="max-w-5xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold">Explore the Live Ecosystem</h2>
          <p className="text-slate-400 mt-2">Switch tabs below to see how different roles interact with the platform in real-time.</p>
        </div>

        {/* TAB BUTTONS */}
        <div className="flex justify-center gap-4 mb-8 bg-slate-900 p-2 rounded-lg max-w-md mx-auto border border-slate-800">
          {['victim', 'ngo', 'volunteer'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-md font-medium capitalize transition-all text-sm w-full ${
                activeTab === tab ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* DYNAMIC PORTAL VIEW */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 min-h-[300px] flex flex-col justify-between">
          
          {/* VICTIM VIEW */}
          {activeTab === 'victim' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="font-semibold text-lg text-emerald-400">Victim SOS Portal</h3>
                <span className="text-xs bg-slate-800 px-2.5 py-1 rounded text-slate-400 font-mono">Role: Victim</span>
              </div>
              <p className="text-sm text-slate-400">Submit an immediate request for emergency assistance. Your request will be instantly routed to active regional NGOs.</p>
              
              {/* Mock Form */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <input type="text" placeholder="Your Location (e.g., Sector 4)" className="bg-slate-950 border border-slate-800 p-2.5 rounded text-sm outline-none focus:border-emerald-500" disabled />
                <select className="bg-slate-950 border border-slate-800 p-2.5 rounded text-sm outline-none text-slate-400" disabled>
                  <option>Select Need (Shelter, Food, Medical)</option>
                </select>
              </div>
              <button className="w-full py-2.5 bg-emerald-500 text-slate-950 font-semibold rounded text-sm opacity-80 cursor-not-allowed">
                Submit SOS Request
              </button>
            </div>
          )}

          {/* NGO VIEW */}
          {activeTab === 'ngo' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="font-semibold text-lg text-blue-400">NGO Moderation Desk</h3>
                <span className="text-xs bg-slate-800 px-2.5 py-1 rounded text-slate-400 font-mono">Role: NGO Admin</span>
              </div>
              <p className="text-sm text-slate-400">Review incoming SOS distress signals. Verify authenticity and approve them for ground volunteer mobilization.</p>
              
              {/* Mock Table Row */}
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 flex justify-between items-center text-sm">
                <div>
                  <span className="text-xs text-amber-400 font-bold tracking-wide uppercase">[Pending Approval]</span>
                  <p className="font-medium mt-1">4 Families stranded near River Bank</p>
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium">Approve Request</button>
                  <button className="px-3 py-1.5 bg-slate-800 hover:bg-red-900 rounded text-xs font-medium text-slate-400">Reject</button>
                </div>
              </div>
            </div>
          )}

          {/* VOLUNTEER VIEW */}
          {activeTab === 'volunteer' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="font-semibold text-lg text-purple-400">Volunteer Dispatch Feed</h3>
                <span className="text-xs bg-slate-800 px-2.5 py-1 rounded text-slate-400 font-mono">Role: Ground Volunteer</span>
              </div>
              <p className="text-sm text-slate-400">Browse verified, NGO-approved emergency requests near your area and instantly claim ownership to deliver resources.</p>
              
              {/* Mock Card */}
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 flex justify-between items-center text-sm">
                <div>
                  <span className="text-xs text-emerald-400 font-bold tracking-wide uppercase">[Verified & Open]</span>
                  <p className="font-medium mt-1">Required: 15 Medical Kits & Clean Water</p>
                  <p className="text-xs text-slate-500 mt-0.5">Approved by: Red Cross NGO</p>
                </div>
                <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs font-medium shadow-md">
                  Accept Task & Deploy
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
