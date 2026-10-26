import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Calculator,
  CheckCircle2,
  Globe2,
  Heart,
  MessageCircle,
  Send,
  ShoppingBag,
  X
} from "lucide-react";
import { getCar, getCars } from "../services/carService";
import api, { FALLBACK_CAR_IMAGE } from "../services/api";
import { useAuth } from "../context/AuthContext";
import CarCard from "../components/CarCard";

export default function CarDetails() {
  const { id } = useParams();
  const [car, setCar] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [similar, setSimilar] = useState([]);
  const [toast, setToast] = useState("");
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [sendingEnquiry, setSendingEnquiry] = useState(false);
  const [enquiryForm, setEnquiryForm] = useState({
    name: "",
    phone: "",
    topic: "Test Drive Request",
    message: ""
  });

  // EMI Estimator state
  const [downPct, setDownPct] = useState(20);
  const [months, setMonths] = useState(60);
  const [rate, setRate] = useState(8.9);

  const { user, wishlistIds, toggleWishlist, refreshCollections } = useAuth();
  const navigate = useNavigate();

  const notify = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2800);
  };

  useEffect(() => {
    setCar(null);
    setNotFound(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
    getCar(id)
      .then((c) => {
        setCar(c);
        getCars({ brand: c.brand })
          .then((list) => {
            const others = list.filter((x) => String(x.id) !== String(c.id)).slice(0, 3);
            setSimilar(others);
          })
          .catch(() => {});
      })
      .catch(() => setNotFound(true));
  }, [id]);

  useEffect(() => {
    if (user && car) {
      const title = car.name || `${car.brand} ${car.model}`;
      setEnquiryForm((prev) => ({
        ...prev,
        name: user.name || "",
        phone: user.phone || "",
        message:
          prev.message ||
          `Hello, I am interested in the ${car.year || ""} ${title}. Please share showroom availability and final on-road pricing.`
      }));
    }
  }, [user, car]);

  const emiAmount = useMemo(() => {
    if (!car?.price) return 0;
    const principal = Number(car.price) * (1 - downPct / 100);
    if (principal <= 0) return 0;
    const monthlyRate = rate / 12 / 100;
    if (monthlyRate === 0) return Math.round(principal / months);
    const factor = Math.pow(1 + monthlyRate, months);
    return Math.round((principal * monthlyRate * factor) / (factor - 1));
  }, [car, downPct, months, rate]);

  if (notFound) {
    return (
      <section className="section narrow-page">
        <div className="empty-state" style={{ minHeight: 340 }}>
          <h3>Vehicle not found</h3>
          <p>This listing may have been removed or the URL is invalid.</p>
          <Link className="btn btn-dark" to="/cars">
            <ArrowLeft size={16} /> Back to inventory
          </Link>
        </div>
      </section>
    );
  }

  if (!car) {
    return (
      <div className="page-loader">
        <div className="spinner" />
      </div>
    );
  }

  const liked = wishlistIds.has(Number(car.id));
  const displayTitle = car.name && car.name.trim() ? car.name : `${car.brand} ${car.model}`;

  const addCart = async () => {
    if (!user) return navigate("/login", { state: { from: `/cars/${id}` } });
    try {
      await api.post(`/cart/${id}`, { quantity: 1 });
      await refreshCollections();
      notify("Added to your cart shortlist.");
    } catch (err) {
      notify(err.response?.data?.message || "Could not add to cart.");
    }
  };

  const openEnquiry = () => {
    if (!user) return navigate("/login", { state: { from: `/cars/${id}` } });
    setEnquiryOpen(true);
  };

  const submitEnquiry = async (e) => {
    e.preventDefault();
    setSendingEnquiry(true);
    try {
      const fullMsg = `[${enquiryForm.topic}] ${enquiryForm.message}`.trim();
      await api.post("/enquiries", {
        carId: Number(id),
        name: enquiryForm.name,
        phone: enquiryForm.phone,
        message: fullMsg
      });
      setEnquiryOpen(false);
      notify("Enquiry sent! Track updates under Enquiries.");
    } catch (err) {
      notify(err.response?.data?.message || "Could not send enquiry.");
    } finally {
      setSendingEnquiry(false);
    }
  };

  const handleWishlist = async () => {
    if (!user) return navigate("/login", { state: { from: `/cars/${id}` } });
    try {
      const saved = await toggleWishlist(id);
      notify(saved ? "Saved to wishlist." : "Removed from wishlist.");
    } catch {
      notify("Could not update wishlist.");
    }
  };

  return (
    <section className="section detail-page">
      <Link className="back-link" to="/cars">
        <ArrowLeft size={16} /> Back to cars
      </Link>

      <div className="detail-grid">
        <div className="detail-image">
          <img
            src={car.imageUrl || FALLBACK_CAR_IMAGE}
            alt={displayTitle}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = FALLBACK_CAR_IMAGE;
            }}
          />
        </div>

        <div className="detail-copy">
          <span className="eyebrow">
            {car.year || "2026"} · {car.bodyType || "Vehicle"} · {car.brand} {car.model}
          </span>
          <h1>{displayTitle}</h1>

          <div className="detail-price-row">
            <div className="detail-price">₹{Number(car.price || 0).toLocaleString("en-IN")}</div>
            {car.marketCountry && (
              <span className="market-badge">
                <Globe2 size={14} /> {car.marketCountry}
                {car.currency && car.marketPrice != null
                  ? ` · ${car.currency} ${Number(car.marketPrice).toLocaleString(undefined, {
                      maximumFractionDigits: 0
                    })}`
                  : ""}
              </span>
            )}
          </div>

          <p>{car.description || `${displayTitle} verified showroom reference listing.`}</p>

          <div className="spec-grid">
            <div>
              <span>Fuel</span>
              <b>{car.fuelType || "—"}</b>
            </div>
            <div>
              <span>Transmission</span>
              <b>{car.transmission || "—"}</b>
            </div>
            <div>
              <span>Mileage</span>
              <b>{car.mileage != null ? `${car.mileage} km/l` : "—"}</b>
            </div>
            <div>
              <span>Status</span>
              <b className={car.available ? "text-ok" : "text-sold"}>
                {car.available ? "Available" : "Sold"}
              </b>
            </div>
          </div>

          <div className="detail-actions">
            <button disabled={!car.available} className="btn btn-dark" onClick={addCart}>
              {car.available ? (
                <>
                  <ShoppingBag size={17} /> Add to cart
                </>
              ) : (
                "Not available"
              )}
            </button>

            <button className="btn btn-outline" onClick={openEnquiry}>
              <MessageCircle size={17} />{" "}
              {car.available ? "Send enquiry" : "Ask about availability"}
            </button>

            <button
              type="button"
              title={liked ? "Remove from wishlist" : "Save to wishlist"}
              aria-label={liked ? "Remove from wishlist" : "Save to wishlist"}
              className={"icon-outline " + (liked ? "liked" : "")}
              onClick={handleWishlist}
            >
              <Heart size={19} fill={liked ? "currentColor" : "none"} />
            </button>
          </div>

          <div className="detail-note">
            <CheckCircle2 size={18} />
            <span>
              {car.available ? "Verified listing" : "Currently not available"} ·{" "}
              <Link to="/showrooms">Find a showroom near you</Link> ·{" "}
              <Link to="/reports" state={{ prefillCarId: car.id, prefillCar: displayTitle }}>
                Report an issue
              </Link>
            </span>
          </div>

          {toast && <div className="toast">{toast}</div>}
        </div>
      </div>

      {/* Finance / EMI Estimator */}
      <div className="emi-card">
        <div className="emi-head">
          <div>
            <span className="section-kicker">FINANCE PLANNER</span>
            <h3>
              <Calculator size={18} /> Estimate monthly payments
            </h3>
          </div>
          <div className="emi-result">
            <span>ESTIMATED EMI</span>
            <strong>₹{emiAmount.toLocaleString("en-IN")} / mo</strong>
          </div>
        </div>

        <div className="emi-controls">
          <label>
            <span>
              Down payment: <b>{downPct}%</b> (₹
              {Math.round((Number(car.price) * downPct) / 100).toLocaleString("en-IN")})
            </span>
            <input
              type="range"
              min="0"
              max="80"
              step="5"
              value={downPct}
              onChange={(e) => setDownPct(Number(e.target.value))}
            />
          </label>
          <label>
            <span>
              Loan tenure: <b>{months} months</b> ({(months / 12).toFixed(1)} yrs)
            </span>
            <input
              type="range"
              min="12"
              max="84"
              step="12"
              value={months}
              onChange={(e) => setMonths(Number(e.target.value))}
            />
          </label>
          <label>
            <span>
              Interest rate: <b>{rate}% p.a.</b>
            </span>
            <input
              type="range"
              min="6.5"
              max="15"
              step="0.2"
              value={rate}
              onChange={(e) => setRate(Number(e.target.value))}
            />
          </label>
        </div>
      </div>

      {similar.length > 0 && (
        <div style={{ marginTop: 64 }}>
          <div className="section-head">
            <div>
              <span className="section-kicker">MORE FROM {car.brand?.toUpperCase()}</span>
              <h2 style={{ marginBottom: 22 }}>Similar vehicles to explore.</h2>
            </div>
            <Link className="text-link" to={`/cars?brand=${encodeURIComponent(car.brand)}`}>
              All {car.brand} cars
            </Link>
          </div>
          <div className="car-grid">
            {similar.map((s) => (
              <CarCard key={s.id} car={s} />
            ))}
          </div>
        </div>
      )}

      {enquiryOpen && (
        <div className="modal-backdrop" onClick={() => setEnquiryOpen(false)}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <span className="section-kicker">SHOWROOM CONCIERGE</span>
                <h3>Enquire about {displayTitle}</h3>
              </div>
              <button
                type="button"
                className="icon-close-btn"
                aria-label="Close modal"
                onClick={() => setEnquiryOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form className="admin-form" style={{ marginTop: 0 }} onSubmit={submitEnquiry}>
              <div className="form-grid">
                <label>
                  Your name
                  <input
                    required
                    value={enquiryForm.name}
                    onChange={(e) => setEnquiryForm({ ...enquiryForm, name: e.target.value })}
                  />
                </label>
                <label>
                  Contact phone
                  <input
                    required
                    placeholder="+91 9876543210"
                    value={enquiryForm.phone}
                    onChange={(e) => setEnquiryForm({ ...enquiryForm, phone: e.target.value })}
                  />
                </label>
              </div>
              <label>
                Enquiry type
                <select
                  value={enquiryForm.topic}
                  onChange={(e) => setEnquiryForm({ ...enquiryForm, topic: e.target.value })}
                >
                  <option>Test Drive Request</option>
                  <option>On-Road Price Quote</option>
                  <option>Finance & EMI Consultation</option>
                  <option>Availability & Delivery Timeline</option>
                </select>
              </label>
              <label>
                Message
                <textarea
                  required
                  rows="4"
                  value={enquiryForm.message}
                  onChange={(e) => setEnquiryForm({ ...enquiryForm, message: e.target.value })}
                />
              </label>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setEnquiryOpen(false)}
                >
                  Cancel
                </button>
                <button disabled={sendingEnquiry} className="btn btn-dark">
                  <Send size={15} /> {sendingEnquiry ? "Sending..." : "Submit enquiry"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
