import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HiMenu, HiX } from "react-icons/hi";
import { FiUser, FiLayout, FiSettings, FiLogOut, FiPackage } from "react-icons/fi";
import axios from "axios";

function Navbar({ user, setUser }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Logout Handler Function
  const handleLogout = async () => {
    try {
      await axios.post(
        "/api/v1/users/logout", 
        {}, 
        { withCredentials: true }
      );

      console.log("Logout");
      
      setUser(null);          // React state clear
      setMenuOpen(false);      // Mobile menu close
      setDropdownOpen(false);   // Dropdown close
      navigate("/login");      // Redirect to login page
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

          {/* 💻 Desktop Menu (Clean & Uncluttered) */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8 font-medium text-slate-700">
            <Link to="/" className="hover:text-red-600 transition-colors">Home</Link>
            <Link to="/about" className="hover:text-red-600 transition-colors">About</Link>
          </div>

          {/* 💻 Desktop Actions + Profile Dropdown Area */}
          <div className="hidden md:flex items-center gap-4">
            
            {/* Victim "Create Request" Button (Untouched) */}
            {user && user.role === "victim" && (
              <Link
                to="/raise-help" 
                className="flex items-center gap-1.5 bg-gradient-to-r from-red-500 to-rose-600 text-white text-xs lg:text-sm font-extrabold px-4 py-2.5 rounded-lg shadow-md shadow-red-500/20 hover:from-red-600 hover:to-rose-700 transition-all active:scale-95 animate-pulse hover:animate-none"
              >
                <span>🚨</span> Create Request
              </Link>
            )}

            {!user ? (
              // IF NOT LOGGED IN: Show Auth Buttons
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
              // IF LOGGED IN: Unified Profile Icon Dropdown
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all focus:outline-none active:scale-95"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center font-bold text-white shadow-sm uppercase">
                    {user.fullName ? user.fullName.charAt(0) : "U"}
                  </div>
                  <div className="text-left hidden lg:block pr-1">
                    <p className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[120px]">{user.fullName}</p>
                    <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">{user.role}</p>
                  </div>
                </button>

                {/* Dropdown Menu Container */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50 transform origin-top-right transition-all">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs text-slate-400">Signed in as</p>
                      <p className="text-sm font-bold text-slate-800 truncate">{user.fullName}</p>
                      <span className="inline-block mt-1 bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] uppercase font-mono border border-slate-200">
                        {user.role}
                      </span>
                    </div>

                    <div className="p-1">
                      <Link
                        to="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-red-600 rounded-lg transition-colors"
                      >
                        <FiUser className="w-4 h-4 text-slate-400" />
                        <span>My Profile</span>
                      </Link>

                      <Link
                        to="/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-red-600 rounded-lg transition-colors"
                      >
                        <FiLayout className="w-4 h-4 text-slate-400" />
                        <span>My Dashboard</span>
                      </Link>

                      {/* Inventory link inside Profile menu (Only for NGO/Admin) */}
                      {(user.role === "ngo" || user.role === "admin") && (
                        <Link
                          to="/inventory"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-red-600 rounded-lg transition-colors"
                        >
                          <FiPackage className="w-4 h-4 text-slate-400" />
                          <span>My Inventory</span>
                        </Link>
                      )}

                      <Link
                        to="/settings"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-red-600 rounded-lg transition-colors"
                      >
                        <FiSettings className="w-4 h-4 text-slate-400" />
                        <span>Settings</span>
                      </Link>
                    </div>

                    <div className="p-1 border-t border-slate-100 mt-1">
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2.5 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left"
                      >
                        <FiLogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Actions Control Panel */}
          <div className="flex items-center gap-3 md:hidden">
            {/* Mobile View SOS Button (Untouched) */}
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

        {/* 📱 Mobile Menu Panel */}
        {menuOpen && (
          <div className="md:hidden mt-4 flex flex-col gap-4 border-t border-slate-100 pt-4 font-medium text-slate-700">
            <Link to="/" onClick={() => setMenuOpen(false)} className="hover:text-red-600 py-1">Home</Link>
            <Link to="/resources" onClick={() => setMenuOpen(false)} className="hover:text-red-600 py-1">Resources</Link>
            <Link to="/shelters" onClick={() => setMenuOpen(false)} className="hover:text-red-600 py-1">Shelters</Link>
            <Link to="/about" onClick={() => setMenuOpen(false)} className="hover:text-red-600 py-1">About</Link>
            
            {/* Authenticated Mobile User Extra Links */}
            {user && (
              <>
                <Link to="/profile" onClick={() => setMenuOpen(false)} className="py-1 hover:text-red-600 font-semibold">
                  My Profile
                </Link>
                <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="py-1 hover:text-red-600 font-semibold">
                  My Dashboard
                </Link>
                {(user.role === "ngo" || user.role === "admin") && (
                  <Link to="/inventory" onClick={() => setMenuOpen(false)} className="py-1 hover:text-red-600">
                    My Inventory
                  </Link>
                )}
                <Link to="/settings" onClick={() => setMenuOpen(false)} className="py-1 hover:text-red-600">
                  Settings
                </Link>
              </>
            )}

            {/* Auth Buttons Container for Mobile */}
            <div className="pt-4 border-t border-slate-100">
              {!user ? (
                <div className="flex flex-row space-x-3">
                  <Link
                    to="/login"
                    onClick={() => setMenuOpen(false)}
                    className="text-sm font-semibold bg-transparent border border-red-500 text-red-500 px-4 py-3 rounded-xl text-center flex-1 active:scale-95"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMenuOpen(false)}
                    className="text-sm font-semibold bg-red-500 text-white px-4 py-3 rounded-xl text-center flex-1 active:scale-95 shadow-md shadow-red-500/10"
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
                  
                  {/* Full width Mobile Emergency CTA (Untouched) */}
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