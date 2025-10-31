import { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute() {
  const { checked, isAuthed } = useAuth();
  const loc = useLocation();
  const navigate = useNavigate();

  // Wait for verification to finish
  if (!checked) {
    return <div style={{ padding: 16 }}>Checking your session…</div>;
  }

  // Show message briefly before redirecting
  useEffect(() => {
    if (checked && !isAuthed) {
      const timer = setTimeout(() => {
        navigate("/login", { replace: true, state: { from: loc.pathname } });
      }, 500); // delay for message display
      return () => clearTimeout(timer);
    }
  }, [checked, isAuthed, navigate, loc.pathname]);

  if (!isAuthed) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-orange-50 to-white text-center px-4">
        <div className="bg-white/90 backdrop-blur-sm shadow-lg rounded-2xl p-8 max-w-md w-full border border-orange-100 animate-fade-in">
          <div className="flex flex-col items-center space-y-3">
            <div className="bg-orange-100 text-orange-600 rounded-full p-3 shadow-sm animate-pulse">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 7v6m0 4h.01" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            <h2 className="text-xl font-semibold text-gray-800">You’re not logged in</h2>
            <p className="text-gray-500 text-sm">Redirecting to login page…</p>
            <div className="w-10 h-1 bg-orange-500 rounded-full animate-pulse mt-2" />
          </div>
        </div>
      </div>
    );
  }

  // Authed → render the protected content
  return <Outlet />;
}
