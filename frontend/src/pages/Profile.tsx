import React, { useContext } from "react";
import { UserContext } from "../App";
import { useNavigate } from "react-router-dom";
import { FaClipboardList, FaFileAlt, FaExclamationCircle, FaSignOutAlt } from "react-icons/fa";

const Profile: React.FC = () => {
  const { username, setUsername } = useContext(UserContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    setUsername("");
    navigate("/");
  };

  const goToReviews = () => navigate("/SeeReviews");
  const goToReports = () => navigate("/SeeReports");
  const goToViolations = () => navigate("/SeeViolations");

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-avatar">
          <span className="avatar-icon" />
        </div>
        <h2 className="profile-name">{username || "Guest"}</h2>
      </div>

      <div className="profile-menu">
        <button className="profile-item" onClick={goToReviews}>
          <div className="icon-circle"><FaClipboardList /></div>
          <span>My Reviews</span>
          <span className="arrow">›</span>
        </button>

        <button className="profile-item" onClick={goToReports}>
          <div className="icon-circle"><FaFileAlt /></div>
          <span>My Reports</span>
          <span className="arrow">›</span>
        </button>

        <button className="profile-item" onClick={goToViolations}>
          <div className="icon-circle"><FaExclamationCircle /></div>
          <span>Violations</span>
          <span className="arrow">›</span>
        </button>

        <button className="profile-item" onClick={handleLogout}>
          <div className="icon-circle"><FaSignOutAlt /></div>
          <span>Log Out</span>
          <span className="arrow">›</span>
        </button>
      </div>
    </div>
  );
};

export default Profile;
