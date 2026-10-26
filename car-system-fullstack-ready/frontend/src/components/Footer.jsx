import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Footer() {
  const { user } = useAuth();
  return (
    <footer>
      <div className="footer-inner">
        <div>
          <div className="brand footer-brand">
            <span className="brand-mark">C</span>
            <span>
              CAR<span>SYSTEM</span>
            </span>
          </div>
          <p>Find your next car with confidence — global reference inventory & showroom network.</p>
        </div>
        <div className="footer-links">
          <Link to="/cars">Browse Cars</Link>
          <Link to="/showrooms">Showrooms</Link>
          {user ? (
            <>
              <Link to="/profile">My Profile</Link>
              <Link to="/reports">Support</Link>
              {user.role === "ADMIN" && <Link to="/admin">Admin Console</Link>}
            </>
          ) : (
            <>
              <Link to="/login">Sign in</Link>
              <Link to="/signup">Create Account</Link>
            </>
          )}
        </div>
      </div>
      <div className="footer-bottom">
        © {new Date().getFullYear()} Car System. Built for a modern automotive buying experience.
      </div>
    </footer>
  );
}
