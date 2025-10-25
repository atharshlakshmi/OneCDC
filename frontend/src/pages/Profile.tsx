import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaClipboardList, FaFileAlt, FaExclamationCircle, FaSignOutAlt } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../lib/api";
import { FaUserCircle } from "react-icons/fa";

type User = {
  _id: string;
  email: string;
  role: string;
  name: string;
  isActive?: boolean;
  singpassVerified?: boolean;
  corppassVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, verify, isAuthed } = useAuth();

  const [refreshing, setRefreshing] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const didRun = useRef(false);

  // ✅ verify only once per visit
  useEffect(() => {
    if (!isAuthed) return; // ProtectedRoute already handles redirect
    if (didRun.current) return;
    didRun.current = true;

    (async () => {
      try {
        setRefreshing(true);
        await verify();
      } catch (e: any) {
        setErr(e?.message || "Failed to refresh profile");
      } finally {
        setRefreshing(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthed]);

  const handleLogout = async () => {
    try {
      await apiFetch("/auth/logout", { method: "POST" }).catch(() => {});
    } finally {
      await logout();
      navigate("/login", { replace: true });
    }
  };

  const goToReviews = () => navigate("/SeeReviews");
  const goToReports = () => navigate("/SeeReports");
  const goToViolations = () => navigate("/SeeViolations");

  if (refreshing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="animate-pulse text-gray-700">
          <p className="text-lg font-medium mb-2">Refreshing your profile…</p>
          <p className="text-sm text-gray-500">Please wait a moment</p>
        </div>
      </div>
    );
  }

  if (err) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <p className="text-lg font-medium text-red-600 mb-2">⚠️ {err}</p>
        <button className="rounded-lg bg-indigo-600 text-white px-4 py-2 hover:bg-indigo-700" onClick={() => navigate("/login")}>
          Go to Login
        </button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <p className="text-gray-700">No user data found</p>
        <button className="rounded-lg bg-indigo-600 text-white px-4 py-2 mt-3 hover:bg-indigo-700" onClick={() => navigate("/login")}>
          Login
        </button>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-header text-center py-6 ">
        <div className="profile-avatar flex justify-center mx-auto mb-3">
          {user.name ? (
            <span className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-indigo-100 text-indigo-600 text-3xl font-bold">
              {user.name.charAt(0).toUpperCase()}
            </span>
          ) : (
            <FaUserCircle className="text-gray-400" size={80} />
          )}
        </div>

        <h2 className="profile-name text-2xl font-semibold">{user.name}</h2>
        {user.email && <p className="text-gray-600">{user.email}</p>}
        {user.role && <p className="text-sm text-gray-500">Role: {user.role}</p>}
      </div>

      <div className="profile-menu max-w-md mx-auto space-y-3 mt-6">
        <button className="profile-item flex items-center justify-between w-full p-3 rounded-lg bg-gray-50 hover:bg-gray-100" onClick={goToReviews}>
          <div className="flex items-center gap-3">
            <div className="icon-circle bg-indigo-100 text-indigo-600 p-2 rounded-full">
              <FaClipboardList />
            </div>
            <span>My Reviews</span>
          </div>
          <span className="arrow">›</span>
        </button>

        <button className="profile-item flex items-center justify-between w-full p-3 rounded-lg bg-gray-50 hover:bg-gray-100" onClick={goToReports}>
          <div className="flex items-center gap-3">
            <div className="icon-circle bg-indigo-100 text-indigo-600 p-2 rounded-full">
              <FaFileAlt />
            </div>
            <span>My Reports</span>
          </div>
          <span className="arrow">›</span>
        </button>

        <button className="profile-item flex items-center justify-between w-full p-3 rounded-lg bg-gray-50 hover:bg-gray-100" onClick={goToViolations}>
          <div className="flex items-center gap-3">
            <div className="icon-circle bg-yellow-100 text-yellow-600 p-2 rounded-full">
              <FaExclamationCircle />
            </div>
            <span>Violations</span>
          </div>
          <span className="arrow">›</span>
        </button>

        <button className="profile-item flex items-center justify-between w-full p-3 rounded-lg bg-red-50 hover:bg-red-100" onClick={handleLogout}>
          <div className="flex items-center gap-3">
            <div className="icon-circle bg-red-200 text-red-600 p-2 rounded-full">
              <FaSignOutAlt />
            </div>
            <span>Log Out</span>
          </div>
          <span className="arrow">›</span>
        </button>
      </div>
    </div>
  );
};

export default Profile;
