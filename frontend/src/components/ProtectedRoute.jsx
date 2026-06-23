import { Navigate } from "react-router-dom";

function ProtectedRoute({ userRole, allowedRoles, children, loading }) {
  // Fetching user data 
  if (loading) {
    return (
      <div className="bg-slate-950 min-h-screen text-slate-400 flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs tracking-widest uppercase font-bold text-slate-500">Verifying Security Clearance...</p>
        </div>
      </div>
    );
  }

  // if user not login
  if (!userRole) {
    return <Navigate to="/login" replace />;
  }

  // if role is not allowd
  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorize" replace />;
  }

  // Agar sab sahi h, toh page open kar do!
  return children;
}

export default ProtectedRoute;