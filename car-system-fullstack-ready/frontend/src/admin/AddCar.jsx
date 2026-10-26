import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { createCar } from "../services/carService";
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

const initial = {
  name: "",
  brand: "",
  model: "",
  price: "",
  year: "2026",
  fuelType: "Petrol",
  transmission: "Automatic",
  bodyType: "SUV",
  mileage: "14.5",
  marketCountry: "India",
  currency: "INR",
  marketPrice: "",
  imageUrl: "",
  description: "",
  available: true
};

export default function AddCar() {
  const [form, setForm] = useState(initial);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const nav = useNavigate();

  const change = (e) =>
    setForm({
      ...form,
      [e.target.name]: e.target.type === "checkbox" ? e.target.checked : e.target.value
    });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await createCar({
        ...form,
        name: form.name.trim() || `${form.brand.trim()} ${form.model.trim()}`,
        price: Number(form.price),
        year: Number(form.year),
        mileage: form.mileage !== "" ? Number(form.mileage) : null,
        marketPrice: form.marketPrice !== "" ? Number(form.marketPrice) : Number(form.price)
      });
      nav("/admin/cars");
    } catch (err) {
      setError(err.response?.data?.message || "Could not save car.");
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
        <h1>Add a car.</h1>
      </div>

      <form className="admin-form" onSubmit={submit}>
        {error && <div className="form-error">{error}</div>}

        <div className="form-grid">
          <label>
            Listing title (optional — auto-generated if blank)
            <input
              name="name"
              placeholder="e.g. Porsche 911 Carrera GTS"
              value={form.name}
              onChange={change}
            />
          </label>
          <label>
            Brand *
            <input name="brand" required placeholder="e.g. Porsche" value={form.brand} onChange={change} />
          </label>
          <label>
            Model *
            <input name="model" required placeholder="e.g. 911" value={form.model} onChange={change} />
          </label>
          <label>
            Price in INR (₹) *
            <input
              name="price"
              type="number"
              min="1"
              step="any"
              required
              placeholder="e.g. 4200000"
              value={form.price}
              onChange={change}
            />
          </label>
          <label>
            Model year *
            <input
              name="year"
              type="number"
              min="1990"
              max="2030"
              required
              value={form.year}
              onChange={change}
            />
          </label>
          <label>
            Mileage (km/l or range)
            <input
              name="mileage"
              type="number"
              min="0"
              step="any"
              value={form.mileage}
              onChange={change}
            />
          </label>
          <label>
            Fuel type
            <select name="fuelType" value={form.fuelType} onChange={change}>
              <option>Petrol</option>
              <option>Diesel</option>
              <option>Electric</option>
              <option>Hybrid</option>
            </select>
          </label>
          <label>
            Transmission
            <select name="transmission" value={form.transmission} onChange={change}>
              <option>Automatic</option>
              <option>Manual</option>
            </select>
          </label>
          <label>
            Body type
            <select name="bodyType" value={form.bodyType} onChange={change}>
              {BODY_TYPES.map((b) => (
                <option key={b}>{b}</option>
              ))}
            </select>
          </label>
          <label>
            Market country
            <input
              name="marketCountry"
              placeholder="e.g. India"
              value={form.marketCountry}
              onChange={change}
            />
          </label>
          <label>
            Market currency
            <select name="currency" value={form.currency} onChange={change}>
              {CURRENCIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label>
            Reference market price
            <input
              name="marketPrice"
              type="number"
              min="0"
              step="any"
              placeholder="Optional local currency price"
              value={form.marketPrice}
              onChange={change}
            />
          </label>
        </div>

        <label>
          Image URL *
          <input
            name="imageUrl"
            type="url"
            required
            placeholder="https://images.unsplash.com/..."
            value={form.imageUrl}
            onChange={change}
          />
        </label>

        <label>
          Description
          <textarea
            name="description"
            rows="4"
            placeholder="Highlight key specifications, trim features and condition..."
            value={form.description}
            onChange={change}
          />
        </label>

        <label className="check-label">
          <input
            type="checkbox"
            name="available"
            checked={form.available}
            onChange={change}
          />
          Available for showroom purchase / enquiry
        </label>

        <button disabled={busy} className="btn btn-dark">
          <Save size={16} /> {busy ? "Saving..." : "Save car"}
        </button>
      </form>
    </section>
  );
}
