import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";
import VictimProfile from "./VictimProfile.jsx";
import NGOProfileForm from "./NgoProfile.jsx"; // NGO ka complete profile form
import VolunteerProfile from "./VolunteerProfile.jsx";

export default function ProfileWrapper() {
  const [userData, setUserData] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // Backend se logged-in user ki saari details fetch karo
        const res = await axios.get("/api/v1/users/current-user", {
          withCredentials: true,
        });

        if (res.data?.data) {
          setUserData(res.data.data); // Pura user object save kar liya
          setUserRole(res.data.data.role.toLowerCase()); // Case-insensitive safety
        } else {
          setUserRole("unauthorized");
        }
      } catch (err) {
        console.error("Profile Auth verification failed:", err);
        setUserRole("unauthorized");
      } finally {
        setLoading(false); // Error aaye ya success, loading block end hoga
      }
    };

    fetchUserProfile();
  }, []);

  // 1. Loading State
  if (loading) {
    return (
      <div className="bg-slate-950 min-h-screen text-slate-400 flex flex-col items-center justify-center font-sans">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-xs font-bold uppercase tracking-widest animate-pulse">
          Loading Profile Vault...
        </p>
      </div>
    );
  }

  // 2. Not Logged In -> Redirect to Login
  if (userRole === "unauthorized" || !userRole) {
    return <Navigate to="/login" replace />;
  }

  // 3. Conditional Rendering based on Role (Passing user data as props)
  if (userRole === "ngo") {
    return <NGOProfileForm user={userData} />;
  }

  if (userRole === "victim") {
    return <VictimProfile user={userData} />;
  }

  if (userRole === "volunteer") {
    return <VolunteerProfile user={userData} />;
  }

  // Default backup
  return <Navigate to="/unauthorize" replace />;
}
