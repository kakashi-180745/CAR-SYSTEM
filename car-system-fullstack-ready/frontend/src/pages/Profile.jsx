import { useEffect, useState } from "react";
import {
  Camera,
  Eye,
  EyeOff,
  Link2,
  LockKeyhole,
  Mail,
  Phone,
  Save,
  ShieldCheck,
  UserRound
} from "lucide-react";
import { getMyProfile, updateMyProfile } from "../services/userService";
import api, { resolveMediaUrl } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user, setUser } = useAuth();
  const [data, setData] = useState(user || {});
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [errMsg, setErrMsg] = useState("");

  useEffect(() => {
    getMyProfile()
      .then((u) => {
        setData(u);
        setUser(u);
      })
      .catch(() => {});
  }, [setUser]);

  const upload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setMsg("");
    setErrMsg("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const { data: u } = await api.post("/profile/image", fd, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setData(u);
      setUser(u);
      setMsg("Profile image uploaded.");
      setTimeout(() => setMsg(""), 2500);
    } catch (err) {
      setErrMsg(err.response?.data?.message || "Could not upload image.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const save = async (e) => {
    e.preventDefault();
    setMsg("");
    setErrMsg("");
    if (password && password.length < 8) {
      setErrMsg("New password must contain at least 8 characters.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: data.name,
        phone: data.phone || "",
        profileImage: data.profileImage || ""
      };
      if (password) payload.password = password;

      const u = await updateMyProfile(payload);
      setData(u);
      setUser(u);
      setPassword("");
      setMsg(password ? "Profile and password updated successfully." : "Profile updated successfully.");
      setTimeout(() => setMsg(""), 2600);
    } catch (err) {
      setErrMsg(err.response?.data?.message || "Could not update profile.");
    } finally {
      setSaving(false);
    }
  };

  const avatarSrc = data.profileImage ? resolveMediaUrl(data.profileImage) : "";

  return (
    <section className="section narrow-page profile-page">
      <div className="page-title profile-page-title">
        <span className="section-kicker">ACCOUNT</span>
        <h1>Your profile.</h1>
        <p>Manage your personal details, avatar image and account security in one place.</p>
      </div>

      <form className="profile-card" onSubmit={save}>
        <aside className="profile-sidebar">
          <div className="profile-avatar">
            {avatarSrc ? (
              <img
                src={avatarSrc}
                alt={data.name || "Profile"}
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <UserRound size={34} />
            )}
          </div>

          <div className="profile-identity">
            <h2>{data.name || "Your name"}</h2>
            <span className="role-chip">
              <ShieldCheck size={13} />
              {data.role || "USER"}
            </span>
          </div>

          <label className="profile-image-btn">
            <Camera size={16} />
            <span>{uploading ? "Uploading..." : "Upload profile image"}</span>
            <input type="file" accept="image/*" onChange={upload} disabled={uploading} />
          </label>
          <p className="profile-image-note">
            JPG, PNG, GIF or BMP up to 5MB — or paste an image URL on the right.
          </p>
        </aside>

        <div className="profile-main">
          <div className="profile-main-head">
            <div>
              <span className="profile-eyebrow">PERSONAL DETAILS</span>
              <h2>Account information</h2>
            </div>
            <span className="profile-status">
              <span />
              Active account
            </span>
          </div>

          {errMsg && <div className="form-error">{errMsg}</div>}

          <div className="profile-fields">
            <label className="profile-field">
              <span className="profile-field-label">
                <UserRound size={15} />
                Full name
              </span>
              <input
                required
                minLength="2"
                value={data.name || ""}
                onChange={(e) => setData({ ...data, name: e.target.value })}
              />
            </label>

            <div className="profile-field profile-field-readonly">
              <span className="profile-field-label">
                <Mail size={15} />
                Email
              </span>
              <div className="profile-readonly-value">{data.email || "—"}</div>
              <small>Email is your primary account identifier.</small>
            </div>

            <label className="profile-field">
              <span className="profile-field-label">
                <Phone size={15} />
                Phone number
              </span>
              <input
                value={data.phone || ""}
                placeholder="+91 9876543210"
                onChange={(e) => setData({ ...data, phone: e.target.value })}
                inputMode="tel"
              />
            </label>

            <label className="profile-field">
              <span className="profile-field-label">
                <Link2 size={15} />
                Profile image URL
              </span>
              <input
                placeholder="https://... or upload on the left"
                value={data.profileImage || ""}
                onChange={(e) => setData({ ...data, profileImage: e.target.value })}
              />
              <small>Paste a direct https:// image URL or use file upload.</small>
            </label>

            <label className="profile-field" style={{ gridColumn: "1 / -1" }}>
              <span className="profile-field-label">
                <LockKeyhole size={15} />
                New password
              </span>
              <div className="password-wrap">
                <input
                  type={showPass ? "text" : "password"}
                  minLength="8"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Leave blank to keep your current password"
                />
                <button
                  type="button"
                  aria-label={showPass ? "Hide password" : "Show password"}
                  onClick={() => setShowPass(!showPass)}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <small>Optional · minimum 8 characters.</small>
            </label>
          </div>

          <div className="profile-actions">
            <span className="profile-hint">Your changes are saved securely to your account.</span>
            <button className="btn btn-dark" disabled={uploading || saving}>
              <Save size={16} />
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>

          {msg && <div className="toast profile-toast">{msg}</div>}
        </div>
      </form>
    </section>
  );
}
