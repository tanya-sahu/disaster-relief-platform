import React from 'react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 text-slate-400 py-12 px-6 lg:px-16 border-t border-slate-900 relative overflow-hidden">
      {/* Decorative background pulse indicator */}
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 items-start w-full">
        
        {/* COLUMN 1: Project Identity */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-white font-bold text-lg">
            <span className="text-emerald-400">🛡️</span> ReliefPulse
          </div>
          <p className="text-sm text-slate-500 max-w-xs">
            A full-stack synchronization architecture engineered to deliver real-time logistics and resource routing during natural crises.
          </p>
        </div>

        {/* COLUMN 2: Tech Stack Badges */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">System Architecture</h4>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-md text-emerald-400 font-mono">React.js</span>
            <span className="bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-md text-emerald-400 font-mono">Tailwind CSS</span>
            <span className="bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-md text-emerald-400 font-mono">Node.js</span>
            <span className="bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-md text-emerald-400 font-mono">Express</span>
            <span className="bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-md text-emerald-400 font-mono">MongoDB</span>
          </div>
        </div>

        {/* COLUMN 3: Developer Deliverables */}
        <div className="space-y-3 md:text-right md:flex md:flex-col md:items-end">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Connect with Developer</h4>
          <div className="flex gap-4 pt-1">
            <a 
              href="https://github.com/tanya-sahu" 
              target="_blank" 
              rel="noreferrer" 
              className="text-sm hover:text-white text-slate-400 transition-colors flex items-center gap-1"
            >
              ⌨️ GitHub
            </a>
            <a 
              href="https://www.linkedin.com/in/tanya-sahu/" 
              target="_blank" 
              rel="noreferrer" 
              className="text-sm hover:text-emerald-400 text-slate-400 transition-colors flex items-center gap-1"
            >
              💼 LinkedIn
            </a>
          </div>
        </div>

      </div>

      {/* Bottom Copyright & Status Bar */}
      <div className="max-w-6xl mx-auto mt-10 pt-6 border-t border-slate-900/60 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-600 gap-4">
        <div>
          &copy; {currentYear} ReliefPulse Platform. Built with passion for open-source disaster response.
        </div>
        <div className="flex items-center gap-2 bg-slate-900/50 px-3 py-1 rounded-full border border-slate-900">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          <span className="text-slate-400 font-mono">All Backend Endpoints Operational</span>
        </div>
      </div>
    </footer>
  );
}