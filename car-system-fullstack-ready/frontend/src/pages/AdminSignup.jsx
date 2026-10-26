import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Eye, EyeOff, Mail, KeyRound, UserRound } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function AdminSignup() {
  const { adminSignup } = useAuth();
  const nav = useNavigate();
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", password: "", signupCode: "" });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }
    setBusy(true);
    try {
      await adminSignup(form);
      nav("/admin");
    } catch (err) {
      setError(err.response?.data?.message || "Could not create admin account.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-visual">
        <div>
          <span className="pill pill-dark">ADMIN CONSOLE</span>
          <h1>
            Run the
            <br />
            <em>showroom.</em>
          </h1>
          <p>
            Secure administrator registration for inventory, showrooms, enquiries and reports.
          </p>
        </div>
      </div>

      <div className="auth-panel">
        <div className="auth-form">
          <Link to="/" className="back-link">
            <ArrowLeft size={15} /> Back to storefront
          </Link>
          <span className="section-kicker">ADMIN REGISTRATION</span>
          <h2>Create admin</h2>
          <p className="muted">A private registration code is required.</p>

          {error && <div className="form-error">{error}</div>}

          <form onSubmit={submit}>
            <label>
              Admin name
              <div className="input-icon">
                <input
                  required
                  minLength="2"
                  placeholder="Admin full name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
                <UserRound size={17} />
              </div>
            </label>

            <label>
              Email
              <div className="input-icon">
                <input
                  type="email"
                  required
                  placeholder="admin@example.com"
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
                  minLength="8"
                  placeholder="Minimum 8 characters"
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

            <label>
              Admin registration code
              <div className="input-icon">
                <input
                  required
                  placeholder="Enter admin signup code"
                  value={form.signupCode}
                  onChange={(e) => setForm({ ...form, signupCode: e.target.value })}
                />
                <KeyRound size={17} />
              </div>
            </label>

            <button disabled={busy} className="btn btn-dark auth-submit">
              {busy ? "Creating..." : "Create admin"} <ArrowRight size={17} />
            </button>
          </form>

          <p className="auth-bottom">
            <Link to="/login">Back to sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
