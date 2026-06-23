import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HiMenu, HiX } from "react-icons/hi";
import axios from "axios";

// 🌟 Step 1: App.jsx se user aur setUser props yahan receive kiye
function Navbar({ user, setUser }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  // 🏃‍♂️ Logout Handler Function
  // 🏃‍♂️ Logout Handler Function ke andar axios call ko update karein
const handleLogout = async () => {
  try {
    // 🌟 URL ke aage complete backend server origin (http://localhost:8000) mention kar dijiye
    // (Agar aapka backend port 8000 ki jagah 5000 ya kuch aur h, toh bas port number change kar lena)
    await axios.post(
      "/api/v1/users/logout", 
      {}, 
      { withCredentials: true }
    );

    console.log("Logout")
    
    setUser(null);      // React state clear
    setMenuOpen(false);  // Mobile menu close
    navigate("/login");  // Redirect to login page
  } catch (err) {
    console.error("Logout failed:", err.message);
  }
};

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-red-600">
            🚨 Disaster Relief
          </Link>

          {/* 💻 Desktop Menu */}
          <div className="hidden md:flex items-center gap-8 font-medium">
            <Link to="/" className="hover:text-red-600">Home</Link>
            
            <Link to="/about" className="hover:text-red-600">About</Link>

            {/* 🔒 Condition 1: Dashboard link sirf tab dikhega jab user logged in ho */}
            {user && (
              <Link to="/dashboard" className="hover:text-red-600 font-semibold">
                Dashboard
              </Link>
            )}

            {user && (
              <Link to="/profile" className="hover:text-red-600 font-semibold">
                My Profile
              </Link>
            )}

            {/* 🔒 Condition 2: My Inventory sirf tab dikhega jab role 'ngo' ya 'admin' ho */}
            {user && (user.role === "ngo" || user.role === "admin") && (
              <Link to="/inventory" className="hover:text-red-600 border-l pl-4 border-slate-300">
                My Inventory
              </Link>
            )}
          </div>

          {/* 💻 Desktop Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {!user ? (
              // 🔏 USER NOT LOGGED IN: Show Auth Links
              <>
                <Link
                  to="/login"
                  className="text-sm font-semibold bg-transparent border border-red-500 text-red-500 px-5 py-3 rounded-md transition-all duration-200 hover:bg-red-500 hover:text-white active:scale-95"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-semibold bg-red-500 text-white px-5 py-3 rounded-md transition-all duration-200 hover:bg-red-600 active:scale-95"
                >
                  Sign Up
                </Link>
              </>
            ) : (
              // 🔓 USER IS LOGGED IN: Show Greetings & Logout
              <div className="flex items-center gap-4 text-sm">
                <span className="text-slate-600">
                  Welcome, <strong className="text-slate-900">{user.fullName}</strong> 
                  <span className="text-xs ml-1 bg-slate-100 text-slate-600 px-2 py-0.5 rounded uppercase font-mono">{user.role}</span>
                </span>
                <button
                  onClick={handleLogout}
                  className="text-sm font-semibold border border-slate-300 text-slate-700 px-4 py-2 rounded-md hover:bg-slate-100 transition-all active:scale-95"
                >
                  Logout 🏃‍♂️
                </button>
              </div>
            )}
          </div>

          {/* Mobile Toggle Button */}
          <button
            className="md:hidden text-3xl"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <HiX /> : <HiMenu />}
          </button>
        </div>

        {/* 📱 Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden mt-4 flex flex-col gap-4 border-t pt-4">
            <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
            <Link to="/resources" onClick={() => setMenuOpen(false)}>Resources</Link>
            <Link to="/shelters" onClick={() => setMenuOpen(false)}>Shelters</Link>
            <Link to="/about" onClick={() => setMenuOpen(false)}>About</Link>
            
            {/* Mobile Logged-in Links */}
            {user && (
              <>
                <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="text-red-500 font-semibold">
                  Dashboard
                </Link>
                
                {(user.role === "ngo" || user.role === "admin") && (
                  <Link to="/inventory" onClick={() => setMenuOpen(false)}>
                    My Inventory
                  </Link>
                )}
              </>
            )}

            {/* Mobile Auth Actions Section */}
            <div className="pt-2 border-t border-slate-100">
              {!user ? (
                <div className="flex flex-row space-x-4">
                  <Link
                    to="/login"
                    onClick={() => setMenuOpen(false)}
                    className="text-sm font-semibold bg-transparent border border-red-500 text-red-500 px-5 py-3 rounded-md text-center flex-1"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMenuOpen(false)}
                    className="text-sm font-semibold bg-red-500 text-white px-5 py-3 rounded-md text-center flex-1"
                  >
                    Sign Up
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <p className="text-xs text-slate-500">
                    Logged in as: <b>{user.fullName}</b> ({user.role})
                  </p>
                  <button
                    onClick={handleLogout}
                    className="w-full text-sm font-semibold bg-slate-800 text-white py-2.5 rounded-md text-center"
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