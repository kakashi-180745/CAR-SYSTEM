import { Link, NavLink, useNavigate } from "react-router-dom";
import { Heart, MapPin, ShoppingBag, UserRound, LogOut, ShieldCheck, Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { resolveMediaUrl } from "../services/api";

export default function Navbar() {
  const { user, logout, wishlistIds, cartCount } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const signout = () => {
    logout();
    navigate("/");
    setOpen(false);
  };

  const firstName = (user?.name || "Account").trim().split(/\s+/)[0];
  const avatarSrc = user?.profileImage ? resolveMediaUrl(user.profileImage) : "";

  return (
    <header className="navbar">
      <div className="nav-inner">
        <Link className="brand" to="/" onClick={() => setOpen(false)}>
          <span className="brand-mark">C</span>
          <span>
            CAR<span>SYSTEM</span>
          </span>
        </Link>

        <button className="menu-btn" aria-label="Toggle navigation" onClick={() => setOpen(!open)}>
          {open ? <X /> : <Menu />}
        </button>

        <nav className={open ? "nav-links open" : "nav-links"}>
          <NavLink to="/cars" onClick={() => setOpen(false)}>
            Cars
          </NavLink>
          <NavLink to="/showrooms" onClick={() => setOpen(false)}>
            <MapPin size={16} /> Showrooms
          </NavLink>

          {user && (
            <NavLink to="/wishlist" onClick={() => setOpen(false)}>
              <Heart size={16} /> Wishlist
              {wishlistIds.size > 0 && <span className="nav-badge">{wishlistIds.size}</span>}
            </NavLink>
          )}
          {user && (
            <NavLink to="/cart" onClick={() => setOpen(false)}>
              <ShoppingBag size={16} /> Cart
              {cartCount > 0 && <span className="nav-badge">{cartCount}</span>}
            </NavLink>
          )}
          {user && (
            <NavLink to="/my-enquiries" onClick={() => setOpen(false)}>
              Enquiries
            </NavLink>
          )}
          {user && (
            <NavLink to="/reports" onClick={() => setOpen(false)}>
              Support
            </NavLink>
          )}
          {user?.role === "ADMIN" && (
            <NavLink to="/admin" onClick={() => setOpen(false)}>
              <ShieldCheck size={16} /> Admin
            </NavLink>
          )}

          {user ? (
            <div className="nav-user">
              <Link to="/profile" className="nav-profile-link" onClick={() => setOpen(false)}>
                {avatarSrc ? (
                  <img
                    className="nav-avatar"
                    src={avatarSrc}
                    alt={firstName}
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <UserRound size={16} />
                )}
                <span>{firstName}</span>
              </Link>
              <button title="Sign out" aria-label="Sign out" onClick={signout}>
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <Link className="nav-login" to="/login" onClick={() => setOpen(false)}>
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
