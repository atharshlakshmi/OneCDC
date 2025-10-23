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
    <nav className="flex justify-between items-center bg-blue-900 text-white px-6 py-4 shadow-md">
      {/* Left: Logo */}
      <div className="navbar-left">
        <Link
          to="/"
          className="text-xl font-bold text-white no-underline hover:opacity-90 transition-opacity"
        >
          OneCDC
        </Link>
      </div>

      {/* Right: Icons / Links */}
      <div className="flex items-center gap-6">
        <Link
          to="/ViewCart"
          className="relative flex items-center justify-center text-white font-medium text-base transition-transform duration-200 ease-in-out hover:scale-105 hover:opacity-85"
        >
          <ShoppingCart size="1.5rem" />
          {/* Example badge (optional, remove if not needed) */}
          {/* <span className="absolute top-0 right-[-0.3rem] bg-amber-400 text-blue-900 text-[0.7rem] font-bold rounded-full w-4 h-4 flex items-center justify-center">
            3
          </span> */}
        </Link>

        {isLoggedIn && (
          <button
            onClick={handleLogout}
            className="flex items-center justify-center text-white font-medium text-base transition-transform duration-200 ease-in-out hover:scale-105 hover:opacity-85"
          >
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}

export default NavBar;
