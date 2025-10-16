import React from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, User } from "lucide-react";

function NavBar() {
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
      </div>
    </nav>
  );
}

export default NavBar;
