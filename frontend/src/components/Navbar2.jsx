import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HiMenu, HiX } from "react-icons/hi";
import axios from "axios";

// Step 1: App.jsx se user aur setUser props yahan receive kiye
function Navbar({ user, setUser }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Logout Handler Function
  const handleLogout = async () => {
    try {
      await axios.post(
        "/api/v1/users/logout", 
        {}, 
        { withCredentials: true }
      );

      console.log("Logout");
      
      setUser(null);      // React state clear
      setMenuOpen(false);  // Mobile menu close
      navigate("/login");  // Redirect to login page
    } catch (err) {
      console.error("Logout failed:", err.message);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-md border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          
          {/* Logo */}
          <Link to="/" className="text-xl sm:text-2xl font-black text-red-600 flex items-center gap-1 shrink-0">
            🚨 <span className="tracking-tight">Disaster Relief</span>
          </Link>

          {/* 💻 Desktop Menu */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8 font-medium text-slate-700">
            <Link to="/" className="hover:text-red-600 transition-colors">Home</Link>
            <Link to="/about" className="hover:text-red-600 transition-colors">About</Link>

            {/* Condition 1: Dashboard & Profile link jab user logged in ho */}
            {user && (
              <Link to="/dashboard" className="hover:text-red-600 font-semibold transition-colors">
                Dashboard
              </Link>
            )}

            {user && (
              <Link to="/profile" className="hover:text-red-600 font-semibold transition-colors">
                My Profile
              </Link>
              
            )}

            {/* Condition 2: My Inventory sirf tab dikhega jab role 'ngo' ya 'admin' ho */}
            {user && (user.role === "ngo" || user.role === "admin") && (
              <Link to="/inventory" className="hover:text-red-600 border-l pl-4 border-slate-300 transition-colors">
                My Inventory
              </Link>

             
            )}
          </div>

        

          {/* 💻 Desktop Action Buttons */}
          <div className="hidden md:flex items-center gap-4">
            
            {/* 🔥 NEW: Victim Ke Liye "Create Request" Button (Desktop View) */}
            {user && user.role === "victim" && (
              <Link
                to="/raise-help" 
                className="flex items-center gap-1.5 bg-gradient-to-r from-red-500 to-rose-600 text-white text-xs lg:text-sm font-extrabold px-4 py-2.5 rounded-lg shadow-md shadow-red-500/20 hover:from-red-600 hover:to-rose-700 transition-all active:scale-95 animate-pulse hover:animate-none"
              >
                <span>🚨</span> Create Request
              </Link>
            )}

            {!user ? (
              // USER NOT LOGGED IN: Show Auth Links
              <>
                <Link
                  to="/login"
                  className="text-sm font-semibold bg-transparent border border-red-500 text-red-500 px-4 py-2.5 rounded-lg transition-all duration-200 hover:bg-red-500 hover:text-white active:scale-95"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-semibold bg-red-500 text-white px-4 py-2.5 rounded-lg transition-all duration-200 hover:bg-red-600 active:scale-95 shadow-md shadow-red-500/10"
                >
                  Sign Up
                </Link>
              </>
            ) : (
              // USER IS LOGGED IN: Show Greetings & Logout
              <div className="flex items-center gap-4 text-sm">
                <span className="text-slate-600 text-xs lg:text-sm max-w-[200px] lg:max-w-none truncate">
                  Welcome, <strong className="text-slate-900">{user.fullName}</strong> 
                  <span className="ml-1.5 bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] uppercase font-mono border border-slate-200">{user.role}</span>
                </span>
                <button
                  onClick={handleLogout}
                  className="text-xs lg:text-sm font-semibold border border-slate-300 text-slate-700 px-3.5 py-2 rounded-lg hover:bg-slate-50 transition-all active:scale-95"
                >
                  Logout 🏃‍♂️
                </button>
              </div>
            )}
          </div>

          {/* Mobile Toggle & Quick SOS Mix Panel */}
          <div className="flex items-center gap-3 md:hidden">
            {/* 🔥 NEW: Victim Ke Liye "Create Request" Button (Mobile View - Toggle Ke Pehle Small Icon/Button) */}
            {user && user.role === "victim" && (
              <Link
                to="/raise-help"
                className="flex items-center gap-1 bg-red-600 text-white text-xs font-black px-3 py-2 rounded-lg shadow-lg shadow-red-600/30 animate-pulse active:scale-95"
              >
                🚨 SOS
              </Link>
            )}
            
            <button
              className="text-2xl text-slate-800 p-1 bg-slate-50 border border-slate-200 rounded-lg active:scale-95 transition-all"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <HiX /> : <HiMenu />}
            </button>
          </div>
        </div>

        {/* 📱 Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden mt-4 flex flex-col gap-4 border-t border-slate-100 pt-4 font-medium text-slate-700">
            <Link to="/" onClick={() => setMenuOpen(false)} className="hover:text-red-600 py-1">Home</Link>
            <Link to="/resources" onClick={() => setMenuOpen(false)} className="hover:text-red-600 py-1">Resources</Link>
            <Link to="/shelters" onClick={() => setMenuOpen(false)} className="hover:text-red-600 py-1">Shelters</Link>
            <Link to="/about" onClick={() => setMenuOpen(false)} className="hover:text-red-600 py-1">About</Link>
            
            {/* Mobile Logged-in Links */}
            {user && (
              <>
                <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="text-red-600 font-semibold py-1">
                  Dashboard
                </Link>
                <Link to="/profile" onClick={() => setMenuOpen(false)} className="font-semibold py-1">
                  My Profile
                </Link>
                
                {(user.role === "ngo" || user.role === "admin") && (
                  <Link to="/inventory" onClick={() => setMenuOpen(false)} className="py-1">
                    My Inventory
                  </Link>
                )}
              </>
            )}

            {/* Mobile Auth Actions Section */}
            <div className="pt-4 border-t border-slate-100">
              {!user ? (
                <div className="flex flex-row space-x-3">
                  <Link
                    to="/login"
                    onClick={() => setMenuOpen(false)}
                    className="text-sm font-semibold bg-transparent border border-red-500 text-red-500 px-4 py-3 rounded-xl text-center flex-1 active:scale-95 transition-transform"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMenuOpen(false)}
                    className="text-sm font-semibold bg-red-500 text-white px-4 py-3 rounded-xl text-center flex-1 active:scale-95 transition-transform shadow-md shadow-red-500/10"
                  >
                    Sign Up
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <p className="text-xs text-slate-500">
                    Logged in as: <span className="text-slate-900 font-bold">{user.fullName}</span>{" "}
                    <span className="ml-1 bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded text-[10px] uppercase font-mono">{user.role}</span>
                  </p>
                  
                  {/* 🔥 NEW: Mobile Menu Ke Andar Full-width Victim Call-To-Action */}
                  {user.role === "victim" && (
                    <Link
                      to="/raise-help"
                      onClick={() => setMenuOpen(false)}
                      className="w-full text-center text-sm font-black bg-gradient-to-r from-red-500 to-rose-600 text-white py-3 rounded-xl shadow-md shadow-red-500/10"
                    >
                      🚨 Raise Emergency Help (SOS)
                    </Link>
                  )}

                  <button
                    onClick={handleLogout}
                    className="w-full text-sm font-semibold bg-slate-800 text-white py-2.5 rounded-xl text-center hover:bg-slate-900 active:scale-95 transition-all"
                  >
                    Logout
                  </button>




                   
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;