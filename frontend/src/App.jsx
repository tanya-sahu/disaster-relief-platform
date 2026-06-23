import { Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

// Components & Pages Imports
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import RaiseHelp from "./pages/RaiseRequest.jsx";
import DashboardWrapper from "./pages/DashboardWrapper.jsx";
import AddInventory from "./pages/AddInventory.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Unauthorized from "./pages/Unauthorized.jsx"; // 👈 Naya page import kiya
import ProfileWrapper from "./pages/ProfileWrapper.jsx";

function App() {
  // 🌟 Global session states
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Page load hote hi API se current logged-in user check karo
    axios.get("/api/v1/users/current-user", { withCredentials: true })
      .then((res) => {
        setUser(res.data.data); // User state set (contains role)
      })
      .catch((err) => {
        console.log("No active session:", err.message);
        setUser(null);
      })
      .finally(() => {
        setLoading(false); // Verification complete
      });
  }, []);

  return (
    <>
      <Navbar user={user} setUser={setUser} /> {/* Prop pass kar di taaki navbar bhi dynamic ho sake */}

      <main className="flex-grow">
        <Routes>
          {/* 🌐 PUBLIC ROUTES */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* 🛡️ SECURITY BLOCK ERROR NODE */}
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* 🔒 PROTECTED FLOWS (Pass loading state also) */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute userRole={user?.role} allowedRoles={["victim", "ngo", "volunteer", "admin"]} loading={loading}>
                <DashboardWrapper />
              </ProtectedRoute>
            } 
          />


          <Route 
            path="/profile" 
            element={
              <ProtectedRoute userRole={user?.role} allowedRoles={["victim", "ngo", "volunteer", "admin"]} loading={loading}>
                <ProfileWrapper />
              </ProtectedRoute>
            } 
          />
          
          
          <Route 
            path="/raise-help" 
            element={
              <ProtectedRoute userRole={user?.role} allowedRoles={["victim"]} loading={loading}>
                <RaiseHelp />
              </ProtectedRoute>
            } 
          />

          {/* Cleaned up duplicate route - now strictly guarded */}
          <Route
            path="/inventory"
            element={
              <ProtectedRoute userRole={user?.role} allowedRoles={["ngo", "admin"]} loading={loading}>
                <AddInventory />
              </ProtectedRoute>
            }
          />
          
          
          
        </Routes>
      </main>
    </>
  );
}

export default App;