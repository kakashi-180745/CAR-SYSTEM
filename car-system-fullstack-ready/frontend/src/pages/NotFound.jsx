import { Link } from "react-router-dom";
import { ArrowRight, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <section className="section narrow-page">
      <div className="empty-state" style={{ minHeight: 380, padding: "48px 24px" }}>
        <Compass size={36} />
        <h3>Page not found</h3>
        <p>The page you are looking for doesn’t exist or may have been moved.</p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
          <Link className="btn btn-dark" to="/cars">
            Explore cars <ArrowRight size={16} />
          </Link>
          <Link className="btn btn-outline" to="/">
            Back to Home
          </Link>
        </div>
      </div>
    </section>
  );
}
