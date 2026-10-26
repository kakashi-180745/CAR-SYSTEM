import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Eye, EyeOff, Mail, Phone, UserRound } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Signup() {
  const { signup } = useAuth();
  const nav = useNavigate();
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }
    setBusy(true);
    try {
      await signup(form);
      nav("/");
    } catch (err) {
      setError(err.response?.data?.message || "Could not create your account.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-visual signup-visual">
        <div>
          <span className="pill pill-dark">START YOUR JOURNEY</span>
          <h1>
            Find the car
            <br />
            <em>that fits you.</em>
          </h1>
          <p>Create a secure account with your contact number for enquiries and updates.</p>
        </div>
      </div>

      <div className="auth-panel">
        <div className="auth-form">
          <Link to="/" className="back-link">
            <ArrowLeft size={15} /> Back to storefront
          </Link>
          <span className="section-kicker">CREATE ACCOUNT</span>
          <h2>Join Car System</h2>
          <p className="muted">Your phone number is used for car enquiries.</p>

          {error && <div className="form-error">{error}</div>}

          <form onSubmit={submit}>
            <label>
              Full name
              <div className="input-icon">
                <input
                  required
                  minLength="2"
                  placeholder="Your name"
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
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
                <Mail size={17} />
              </div>
            </label>

            <label>
              Phone number
              <div className="input-icon">
                <input
                  required
                  minLength="7"
                  placeholder="+91 9876543210"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
                <Phone size={17} />
              </div>
            </label>

            <label>
              Password
              <div className="password-wrap">
                <input
                  type={show ? "text" : "password"}
                  required
                  minLength="8"
                  placeholder="At least 8 characters"
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
              {busy ? "Creating..." : "Create account"} <ArrowRight size={17} />
            </button>
          </form>

          <p className="auth-bottom">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
          <p className="auth-bottom" style={{ marginTop: 10 }}>
            <Link to="/admin/signup">Admin registration</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
