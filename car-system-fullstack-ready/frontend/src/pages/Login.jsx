import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Eye, EyeOff, Mail, ShieldCheck, UserRound } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const u = await login(form);
      nav(u.role === "ADMIN" ? "/admin" : loc.state?.from || "/");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password.");
    } finally {
      setBusy(false);
    }
  };

  const quickFill = (email, password) => {
    setError("");
    setForm({ email, password });
  };

  return (
    <div className="auth-page">
      <div className="auth-visual">
        <div>
          <span className="pill pill-dark">CAR SYSTEM</span>
          <h1>
            Good cars.
            <br />
            <em>Better decisions.</em>
          </h1>
          <p>
            Sign in to save cars, manage enquiries and keep your showroom journey in one place.
          </p>
        </div>
      </div>

      <div className="auth-panel">
        <div className="auth-form">
          <Link to="/" className="back-link">
            <ArrowLeft size={15} /> Back to storefront
          </Link>
          <span className="section-kicker">WELCOME BACK</span>
          <h2>Sign in</h2>
          <p className="muted">Enter your details to continue.</p>

          {error && <div className="form-error">{error}</div>}

          <form onSubmit={submit}>
            <label>
              Email
              <div className="input-icon">
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
                <Mail size={17} />
              </div>
            </label>

            <label>
              Password
              <div className="password-wrap">
                <input
                  type={show ? "text" : "password"}
                  required
                  placeholder="Your password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
                <button
                  type="button"
                  aria-label={show ? "Hide password" : "Show password"}
                  onClick={() => setShow(!show)}
                >
                  {show ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </label>

            <button disabled={busy} className="btn btn-dark auth-submit">
              {busy ? "Signing in..." : "Sign in"} <ArrowRight size={17} />
            </button>
          </form>

          <div className="quick-demo-box">
            <span className="quick-demo-label">QUICK DEMO ACCESS</span>
            <div className="quick-demo-actions">
              <button
                type="button"
                className="quick-demo-btn"
                onClick={() => quickFill("demo@carsystem.com", "User@1234")}
              >
                <UserRound size={14} /> Customer
              </button>
              <button
                type="button"
                className="quick-demo-btn"
                onClick={() => quickFill("admin@carsystem.com", "Admin@1234")}
              >
                <ShieldCheck size={14} /> Admin
              </button>
            </div>
          </div>

          <p className="auth-bottom">
            New here? <Link to="/signup">Create an account</Link> ·{" "}
            <Link to="/admin/signup">Admin signup</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
