import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart } from "react-feather";
import { apiFetch, getToken } from "../lib/api";

function NavBar() {
  const navigate = useNavigate();
  const isLoggedIn = !!getToken();

  const handleLogout = async () => {
    try {
      await apiFetch("/auth/logout", { method: "POST" }).catch(() => {});
    } finally {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
      sessionStorage.removeItem("auth_token");
      sessionStorage.removeItem("auth_user");
      navigate("/login", { replace: true });
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/" className="logo">
          OneCDC
        </Link>
      </div>

      <div className="navbar-right">
        <Link to="/ViewCart" className="nav-link">
          <ShoppingCart size="1.5rem" />
        </Link>
        {isLoggedIn && (
          <button onClick={handleLogout} className="nav-link logout-btn">
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}

export default NavBar;
