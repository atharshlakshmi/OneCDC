import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart } from "react-feather";
import { useAuth } from "../context/AuthContext";

function NavBar() {
  const navigate = useNavigate();
  const { user, isAuthed, logout } = useAuth();

  const handleLogout = async () => {
    const isAdmin = user?.role === "admin";
    await logout();
    if (isAdmin) {
      navigate("/", { replace: true });
    } else {
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
        {/* 👇 Only show cart for shoppers */}
        {user?.role === "registered_shopper" && (
          <Link
            to="/ViewCart"
            className="relative flex items-center justify-center text-white font-medium text-base transition-transform duration-200 ease-in-out hover:scale-105 hover:opacity-85"
          >
            <ShoppingCart size="1.5rem" />
          </Link>
        )}

        {isAuthed && (
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