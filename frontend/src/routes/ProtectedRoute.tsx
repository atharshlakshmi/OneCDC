import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute() {
  const { checked, isAuthed } = useAuth();
  const loc = useLocation();

  // Show a tiny loader while the session is being verified
  if (!checked) {
    return <div style={{ padding: 16 }}>Checking your session…</div>;
  }

  // Not authed → redirect immediately (no timers/effects)
  if (!isAuthed) {
    return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  }

  // Authed → render nested routes
  return <Outlet />;
}
