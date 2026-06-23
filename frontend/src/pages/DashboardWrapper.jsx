import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";
import VictimDashboard from "./VictimDashboard.jsx";
import NgoDashboard from "./NgoDashboard.jsx";
import VolunteerDashboard from "./VolunteerDashboard.jsx";

export default function DashboardWrapper() {
  const [userData, setUserData] = useState(null); // Pura user object store karne ke liye
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserDashboardAuth = async () => {
      try {
        // Backend se logged-in user ka current status aur data fetch karo
        const res = await axios.get("/api/v1/users/current-user", { 
          withCredentials: true 
        });

        if (res.data?.data) {
          setUserData(res.data.data); // User profile data state me save kiya
          setUserRole(res.data.data.role.toLowerCase()); // Case-insensitive safety check
        } else {
          setUserRole("unauthorized");
        }
      } catch (err) {
        console.error("Dashboard Auth verification failed:", err);
        setUserRole("unauthorized");
      } finally {
        setLoading(false); // Spinner off chahe response success ho ya error
      }
    };

    fetchUserDashboardAuth();
  }, []);

  // 1. Core System Loading State
  if (loading) {
    return (
      <div className="bg-slate-950 min-h-screen text-slate-400 flex flex-col items-center justify-center font-sans">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-xs font-bold uppercase tracking-widest animate-pulse text-slate-500">
          Syncing Security Clearance...
        </p>
      </div>
    );
  }

  // 2. Session Expired ya Token missing -> Send to Login
  if (userRole === "unauthorized" || !userRole) {
    return <Navigate to="/login" replace />;
  }

  // 3. Conditional Rendering Matrix (Passing unified user data object as props)
  if (userRole === "ngo") {
    return <NgoDashboard user={userData} />;
  }

  if (userRole === "victim") {
    return <VictimDashboard user={userData} />;
  }

  if (userRole === "volunteer") {
    return <VolunteerDashboard user={userData} />;
  }

  // Fallback Route Guard
  return <Navigate to="/unauthorize" replace />;
}