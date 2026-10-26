import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { getShowroom, updateShowroom } from "../services/showroomService";
import AdminNav from "../components/AdminNav";

export default function EditShowroom() {
  const { id } = useParams();
  const nav = useNavigate();
  const [f, setF] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getShowroom(id)
      .then(setF)
      .catch(() => setNotFound(true));
  }, [id]);

  if (notFound) {
    return (
      <section className="section admin-page">
        <AdminNav />
        <div className="empty-state">
          <h3>Showroom not found</h3>
          <button type="button" className="btn btn-dark" onClick={() => nav("/admin/showrooms")}>
            Back to showrooms
          </button>
        </div>
      </section>
    );
  }

  if (!f) {
    return (
      <div className="page-loader">
        <div className="spinner" />
      </div>
    );
  }

  const save = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await updateShowroom(id, {
        ...f,
        latitude: Number(f.latitude),
        longitude: Number(f.longitude)
      });
      nav("/admin/showrooms");
    } catch (err) {
      setError(err.response?.data?.message || "Could not update showroom.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="section admin-page">
      <AdminNav />
      <button type="button" className="back-link" onClick={() => nav("/admin/showrooms")}>
        <ArrowLeft size={16} /> Back to showrooms
      </button>

      <div className="page-title">
        <span className="section-kicker">ADMIN / LOCATIONS</span>
        <h1>Edit showroom.</h1>
      </div>

      <form className="admin-form" onSubmit={save}>
        {error && <div className="form-error">{error}</div>}

        <div className="form-grid">
          <label>
            Showroom name *
            <input
              required
              value={f.name ?? ""}
              onChange={(e) => setF({ ...f, name: e.target.value })}
            />
          </label>
          <label>
            Brand / Franchise
            <input
              value={f.brand ?? ""}
              onChange={(e) => setF({ ...f, brand: e.target.value })}
            />
          </label>
          <label>
            Street address *
            <input
              required
              value={f.address ?? ""}
              onChange={(e) => setF({ ...f, address: e.target.value })}
            />
          </label>
          <label>
            City *
            <input
              required
              value={f.city ?? ""}
              onChange={(e) => setF({ ...f, city: e.target.value })}
            />
          </label>
          <label>
            State / Region
            <input
              value={f.state ?? ""}
              onChange={(e) => setF({ ...f, state: e.target.value })}
            />
          </label>
          <label>
            Country *
            <input
              required
              value={f.country ?? ""}
              onChange={(e) => setF({ ...f, country: e.target.value })}
            />
          </label>
          <label>
            Latitude *
            <input
              type="number"
              step="any"
              required
              value={f.latitude ?? ""}
              onChange={(e) => setF({ ...f, latitude: e.target.value })}
            />
          </label>
          <label>
            Longitude *
            <input
              type="number"
              step="any"
              required
              value={f.longitude ?? ""}
              onChange={(e) => setF({ ...f, longitude: e.target.value })}
            />
          </label>
          <label>
            Phone
            <input
              value={f.phone ?? ""}
              onChange={(e) => setF({ ...f, phone: e.target.value })}
            />
          </label>
          <label>
            Email
            <input
              type="email"
              value={f.email ?? ""}
              onChange={(e) => setF({ ...f, email: e.target.value })}
            />
          </label>
          <label style={{ gridColumn: "1 / -1" }}>
            Website URL
            <input
              value={f.website ?? ""}
              placeholder="https://..."
              onChange={(e) => setF({ ...f, website: e.target.value })}
            />
          </label>
        </div>

        <button disabled={busy} className="btn btn-dark">
          <Save size={16} /> {busy ? "Saving..." : "Save showroom"}
        </button>
      </form>
    </section>
  );
}
