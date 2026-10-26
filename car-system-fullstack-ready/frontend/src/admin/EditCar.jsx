import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { getCar, updateCar } from "../services/carService";
import AdminNav from "../components/AdminNav";

const BODY_TYPES = [
  "SUV",
  "Sedan",
  "Hatchback",
  "Coupe",
  "Convertible",
  "Pickup",
  "MPV",
  "Wagon",
  "Luxury",
  "Sports"
];
const CURRENCIES = ["INR", "USD", "GBP", "EUR", "AED", "JPY", "AUD", "CAD", "SGD"];

export default function EditCar() {
  const { id } = useParams();
  const nav = useNavigate();
  const [f, setF] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getCar(id)
      .then(setF)
      .catch(() => setNotFound(true));
  }, [id]);

  if (notFound) {
    return (
      <section className="section admin-page">
        <AdminNav />
        <div className="empty-state">
          <h3>Car not found</h3>
          <button type="button" className="btn btn-dark" onClick={() => nav("/admin/cars")}>
            Back to inventory
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
      await updateCar(id, {
        ...f,
        price: Number(f.price),
        year: f.year !== "" && f.year != null ? Number(f.year) : null,
        mileage: f.mileage !== "" && f.mileage != null ? Number(f.mileage) : null,
        marketPrice: f.marketPrice !== "" && f.marketPrice != null ? Number(f.marketPrice) : null,
        available: Boolean(f.available)
      });
      nav("/admin/cars");
    } catch (err) {
      setError(err.response?.data?.message || "Could not update car.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="section admin-page">
      <AdminNav />
      <button type="button" className="back-link" onClick={() => nav("/admin/cars")}>
        <ArrowLeft size={16} /> Back to inventory
      </button>

      <div className="page-title">
        <span className="section-kicker">ADMIN / INVENTORY</span>
        <h1>Edit car #{f.id}.</h1>
      </div>

      <form className="admin-form" onSubmit={save}>
        {error && <div className="form-error">{error}</div>}

        <div className="form-grid">
          <label>
            Listing title
            <input
              value={f.name ?? ""}
              onChange={(e) => setF({ ...f, name: e.target.value })}
            />
          </label>
          <label>
            Brand *
            <input
              required
              value={f.brand ?? ""}
              onChange={(e) => setF({ ...f, brand: e.target.value })}
            />
          </label>
          <label>
            Model *
            <input
              required
              value={f.model ?? ""}
              onChange={(e) => setF({ ...f, model: e.target.value })}
            />
          </label>
          <label>
            Price in INR (₹) *
            <input
              type="number"
              min="1"
              step="any"
              required
              value={f.price ?? ""}
              onChange={(e) => setF({ ...f, price: e.target.value })}
            />
          </label>
          <label>
            Model year
            <input
              type="number"
              value={f.year ?? ""}
              onChange={(e) => setF({ ...f, year: e.target.value })}
            />
          </label>
          <label>
            Mileage (km/l)
            <input
              type="number"
              step="any"
              value={f.mileage ?? ""}
              onChange={(e) => setF({ ...f, mileage: e.target.value })}
            />
          </label>
          <label>
            Fuel type
            <select
              value={f.fuelType ?? "Petrol"}
              onChange={(e) => setF({ ...f, fuelType: e.target.value })}
            >
              <option>Petrol</option>
              <option>Diesel</option>
              <option>Electric</option>
              <option>Hybrid</option>
            </select>
          </label>
          <label>
            Transmission
            <select
              value={f.transmission ?? "Automatic"}
              onChange={(e) => setF({ ...f, transmission: e.target.value })}
            >
              <option>Automatic</option>
              <option>Manual</option>
            </select>
          </label>
          <label>
            Body type
            <select
              value={f.bodyType ?? "SUV"}
              onChange={(e) => setF({ ...f, bodyType: e.target.value })}
            >
              {BODY_TYPES.map((b) => (
                <option key={b}>{b}</option>
              ))}
            </select>
          </label>
          <label>
            Availability
            <select
              value={String(Boolean(f.available))}
              onChange={(e) => setF({ ...f, available: e.target.value === "true" })}
            >
              <option value="true">Available</option>
              <option value="false">Sold / Not available</option>
            </select>
          </label>
          <label>
            Market country
            <input
              value={f.marketCountry ?? ""}
              onChange={(e) => setF({ ...f, marketCountry: e.target.value })}
            />
          </label>
          <label>
            Market currency
            <select
              value={f.currency || "INR"}
              onChange={(e) => setF({ ...f, currency: e.target.value })}
            >
              {CURRENCIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label>
            Reference market price
            <input
              type="number"
              step="any"
              value={f.marketPrice ?? ""}
              onChange={(e) => setF({ ...f, marketPrice: e.target.value })}
            />
          </label>
          <label>
            Image URL
            <input
              value={f.imageUrl ?? ""}
              onChange={(e) => setF({ ...f, imageUrl: e.target.value })}
            />
          </label>
        </div>

        <label>
          Description
          <textarea
            rows="4"
            value={f.description ?? ""}
            onChange={(e) => setF({ ...f, description: e.target.value })}
          />
        </label>

        <button disabled={busy} className="btn btn-dark">
          <Save size={16} /> {busy ? "Saving..." : "Save changes"}
        </button>
      </form>
    </section>
  );
}
