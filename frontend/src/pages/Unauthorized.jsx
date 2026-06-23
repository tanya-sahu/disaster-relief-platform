import { useNavigate } from "react-router-dom";

function Unauthorized() {
  const navigate = useNavigate();

  return (
    <div className="bg-slate-950 min-h-screen text-slate-100 p-6 font-sans flex items-center justify-center relative overflow-hidden">
      {/* Subtle Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl"></div>

      <div className="max-w-md w-full bg-slate-900 border border-slate-800/80 rounded-2xl p-8 shadow-2xl text-center relative z-10">
        
        {/* Shield Icon */}
        <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-6 shadow-xl shadow-red-500/5 animate-pulse">
          🛡️
        </div>

        {/* Heading */}
        <p className="text-xs font-mono tracking-widest text-red-400 uppercase font-bold mb-2">Error Code: 403 Forbidden</p>
        <h1 className="text-2xl font-black text-white tracking-tight mb-3">Access Unauthorized</h1>
        
        {/* Description */}
        <p className="text-slate-400 text-sm leading-relaxed mb-8">
          You do not have the required permissions or cryptographic clearance to view this dashboard or resource section.
        </p>

        {/* Simple Action Button */}
        <button
          onClick={() => navigate(-1)} // back
          className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-extrabold py-3.5 rounded-xl transition-all tracking-wider uppercase shadow-md active:scale-[0.99]"
        >
          ↩️ Go Back Safely
        </button>

        {/* Footer Text */}
        <div className="mt-8 pt-4 border-t border-slate-800/60 text-center">
          <span className="inline-flex items-center gap-1.5 text-[10px] tracking-wider text-slate-500 font-mono uppercase">
            Secured Network Environment
          </span>
        </div>

      </div>
    </div>
  );
}

export default Unauthorized;