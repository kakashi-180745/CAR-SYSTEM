import { useEffect, useMemo, useState } from "react";
import { Plus, Search, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { getShowrooms, createShowroom, deleteShowroom } from "../services/showroomService";
import AdminNav from "../components/AdminNav";

const blank = {
  name: "",
  brand: "",
  address: "",
  city: "Chennai",
  state: "",
  country: "India",
  latitude: "",
  longitude: "",
  phone: "",
  email: "",
  website: ""
};

export default function ManageShowrooms() {
  const [items, setItems] = useState([]);
  const [f, setF] = useState(blank);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  const load = () => getShowrooms().then(setItems).catch(() => {});
  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((s) =>
      `${s.name} ${s.city} ${s.country || ""} ${s.address}`.toLowerCase().includes(q)
    );
  }, [items, query]);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await createShowroom({
        ...f,
        latitude: Number(f.latitude),
        longitude: Number(f.longitude)
      });
      setF(blank);
      setToast("Showroom location added.");
      setTimeout(() => setToast(""), 2400);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not add showroom.");
    }
  };

  const remove = async (id) => {
    if (window.confirm("Delete this showroom location?")) {
      await deleteShowroom(id);
      setToast("Showroom removed.");
      setTimeout(() => setToast(""), 2400);
      load();
    }
  };

  return (
    <section className="section admin-page">
      <AdminNav />

      <div className="page-title">
        <span className="section-kicker">ADMIN / LOCATIONS</span>
        <h1>Showroom network.</h1>
        <p>{items.length} active locations across the global showroom map.</p>
      </div>

      {toast && <div className="toast" style={{ marginBottom: 14 }}>{toast}</div>}

      <div className="two-col-admin">
        <form className="admin-form compact" onSubmit={submit}>
          <h3>Add showroom</h3>
          {error && <div className="form-error">{error}</div>}
          <label>
            Showroom name *
            <input
              required
              placeholder="Car System Coimbatore"
              value={f.name}
              onChange={(e) => setF({ ...f, name: e.target.value })}
            />
          </label>
          <label>
            Street address *
            <input
              required
              placeholder="Avinashi Road, Peelamedu"
              value={f.address}
              onChange={(e) => setF({ ...f, address: e.target.value })}
            />
          </label>
          <div className="form-grid">
            <label>
              City *
              <input
                required
                value={f.city}
                onChange={(e) => setF({ ...f, city: e.target.value })}
              />
            </label>
            <label>
              Country *
              <input
                required
                value={f.country}
                onChange={(e) => setF({ ...f, country: e.target.value })}
              />
            </label>
          </div>
          <div className="form-grid">
            <label>
              Latitude *
              <input
                required
                type="number"
                step="any"
                placeholder="11.0168"
                value={f.latitude}
                onChange={(e) => setF({ ...f, latitude: e.target.value })}
              />
            </label>
            <label>
              Longitude *
              <input
                required
                type="number"
                step="any"
                placeholder="76.9558"
                value={f.longitude}
                onChange={(e) => setF({ ...f, longitude: e.target.value })}
              />
            </label>
          </div>
          <label>
            Phone
            <input
              placeholder="+91 422 555 2026"
              value={f.phone}
              onChange={(e) => setF({ ...f, phone: e.target.value })}
            />
          </label>
          <label>
            Email
            <input
              type="email"
              placeholder="coimbatore@carsystem.com"
              value={f.email}
              onChange={(e) => setF({ ...f, email: e.target.value })}
            />
          </label>
          <label>
            Brand / Franchise (optional)
            <input
              placeholder="Multi-brand Flagship"
              value={f.brand}
              onChange={(e) => setF({ ...f, brand: e.target.value })}
            />
          </label>
          <button className="btn btn-dark" style={{ width: "100%" }}>
            <Plus size={16} /> Add location
          </button>
        </form>

        <div>
          <div className="admin-filter-bar" style={{ marginBottom: 12 }}>
            <div className="search-box" style={{ flex: 1 }}>
              <Search size={17} />
              <input
                placeholder="Filter showrooms by city, country or name..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="table-card">
            <table>
              <thead>
                <tr>
                  <th>Showroom</th>
                  <th>Location</th>
                  <th>Coordinates</th>
                  <th>Contact</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <b>{s.name}</b>
                      <small>{s.address}</small>
                    </td>
                    <td>
                      <b>{s.city}</b>
                      <small>{s.country || "Global"}</small>
                    </td>
                    <td>
                      {s.latitude}, {s.longitude}
                    </td>
                    <td>
                      <small>{s.phone || "—"}</small>
                      <small>{s.email || ""}</small>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 8 }}>
                        <Link className="btn btn-outline btn-sm" to={`/admin/showrooms/${s.id}/edit`}>
                          Edit
                        </Link>
                        <button
                          type="button"
                          className="danger-btn"
                          title="Delete showroom"
                          onClick={() => remove(s.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
