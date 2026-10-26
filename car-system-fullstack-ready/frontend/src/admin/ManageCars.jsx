import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Trash2 } from "lucide-react";
import { getCars, deleteCar, updateCar } from "../services/carService";
import { FALLBACK_CAR_IMAGE } from "../services/api";
import AdminNav from "../components/AdminNav";

const PAGE_SIZE = 50;

export default function ManageCars() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState("");

  const load = () =>
    getCars()
      .then(setCars)
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return cars.filter((c) => {
      if (statusFilter === "AVAILABLE" && !c.available) return false;
      if (statusFilter === "SOLD" && c.available) return false;
      if (!q) return true;
      return `${c.id} ${c.name || ""} ${c.brand} ${c.model} ${c.marketCountry || ""} ${c.fuelType || ""}`
        .toLowerCase()
        .includes(q);
    });
  }, [cars, query, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pagedCars = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const remove = async (id) => {
    if (window.confirm("Delete this car listing permanently?")) {
      await deleteCar(id);
      setToast("Vehicle deleted.");
      setTimeout(() => setToast(""), 2200);
      load();
    }
  };

  const toggleAvailability = async (car) => {
    const updated = await updateCar(car.id, { ...car, available: !car.available });
    setCars((prev) => prev.map((c) => (c.id === car.id ? updated : c)));
    setToast(`${updated.name || `${updated.brand} ${updated.model}`} marked as ${updated.available ? "Available" : "Sold"}.`);
    setTimeout(() => setToast(""), 2200);
  };

  return (
    <section className="section admin-page">
      <AdminNav />

      <div className="page-title row-title">
        <div>
          <span className="section-kicker">ADMIN / INVENTORY</span>
          <h1>Manage cars.</h1>
          <p>{cars.length.toLocaleString()} vehicles in catalog.</p>
        </div>
        <Link className="btn btn-dark" to="/admin/cars/add">
          <Plus size={17} /> Add car
        </Link>
      </div>

      <div className="admin-filter-bar">
        <div className="search-box">
          <Search size={17} />
          <input
            placeholder="Search ID, brand, model, trim or market..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="ALL">All statuses</option>
          <option value="AVAILABLE">Available only</option>
          <option value="SOLD">Sold / Unavailable</option>
        </select>
      </div>

      {toast && <div className="toast" style={{ marginBottom: 14 }}>{toast}</div>}

      {loading ? (
        <div className="page-loader">
          <div className="spinner" />
        </div>
      ) : (
        <>
          <div className="table-card">
            <table>
              <thead>
                <tr>
                  <th>Car</th>
                  <th>Market</th>
                  <th>Price (INR)</th>
                  <th>Specs</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pagedCars.map((c) => {
                  const title = c.name || `${c.brand} ${c.model}`;
                  return (
                    <tr key={c.id}>
                      <td>
                        <div className="table-car">
                          <img
                            src={c.imageUrl || FALLBACK_CAR_IMAGE}
                            alt={title}
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.src = FALLBACK_CAR_IMAGE;
                            }}
                          />
                          <span>
                            <b>
                              <Link to={`/cars/${c.id}`}>{title}</Link>
                            </b>
                            <small>
                              #{c.id} · {c.year} · {c.bodyType}
                            </small>
                          </span>
                        </div>
                      </td>
                      <td>
                        <b>{c.marketCountry || "Global"}</b>
                        {c.currency && c.marketPrice != null && (
                          <small>
                            {c.currency} {Number(c.marketPrice).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                          </small>
                        )}
                      </td>
                      <td>
                        <b>₹{Number(c.price || 0).toLocaleString("en-IN")}</b>
                      </td>
                      <td>
                        {c.fuelType} · {c.transmission}
                        {c.mileage != null && <small>{c.mileage} km/l</small>}
                      </td>
                      <td>
                        <button
                          type="button"
                          title="Click to toggle availability"
                          className={"badge badge-clickable " + (c.available ? "badge-green" : "badge-red")}
                          onClick={() => toggleAvailability(c)}
                        >
                          {c.available ? "Available" : "Sold"}
                        </button>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: 8 }}>
                          <Link className="btn btn-outline btn-sm" to={`/admin/cars/${c.id}/edit`}>
                            Edit
                          </Link>
                          <button
                            type="button"
                            className="danger-btn"
                            title="Delete car"
                            onClick={() => remove(c.id)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {pagedCars.length === 0 && (
              <div className="empty-state" style={{ border: 0 }}>
                <p style={{ margin: 0 }}>No cars matched your search.</p>
              </div>
            )}
          </div>

          {totalPages > 1 && (
            <div className="pagination-bar">
              <span>
                Page <b>{safePage}</b> of <b>{totalPages}</b> ({filtered.length.toLocaleString()} results)
              </span>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  disabled={safePage <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </button>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  disabled={safePage >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}
