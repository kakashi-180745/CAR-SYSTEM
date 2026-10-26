import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Minus, Plus, Send, Trash2 } from "lucide-react";
import api, { FALLBACK_CAR_IMAGE } from "../services/api";
import { getCars } from "../services/carService";
import { useAuth } from "../context/AuthContext";

export default function Cart() {
  const { refreshCollections } = useAuth();
  const [items, setItems] = useState([]);
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState("");
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState("");

  const load = async () => {
    const [a, c] = await Promise.all([api.get("/cart"), getCars()]);
    setItems(a.data);
    setCars(c);
    await refreshCollections();
  };

  useEffect(() => {
    load().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const changeQty = async (carId, nextQty) => {
    if (nextQty <= 0) {
      await api.delete(`/cart/${carId}`);
    } else {
      await api.patch(`/cart/${carId}`, { quantity: nextQty });
    }
    await load();
  };

  const remove = async (carId) => {
    await api.delete(`/cart/${carId}`);
    await load();
  };

  const clearAll = async () => {
    await api.delete("/cart");
    await load();
  };

  const rows = items
    .map((i) => ({ ...i, car: cars.find((c) => Number(c.id) === Number(i.carId)) }))
    .filter((x) => x.car);

  const total = rows.reduce((s, x) => s + Number(x.car.price || 0) * x.quantity, 0);

  const enquireShortlist = async () => {
    if (!rows.length || sending) return;
    setSending(true);
    try {
      await Promise.all(
        rows.map((r) =>
          api.post("/enquiries", {
            carId: r.car.id,
            message:
              note.trim() ||
              `Shortlist enquiry for ${r.car.name || `${r.car.brand} ${r.car.model}`} (Qty: ${r.quantity}).`
          })
        )
      );
      setNote("");
      setToast(`Sent ${rows.length} showroom ${rows.length === 1 ? "enquiry" : "enquiries"}!`);
      setTimeout(() => setToast(""), 3000);
    } catch (err) {
      setToast(err.response?.data?.message || "Could not send enquiries.");
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="section">
      <div className="page-title row-title">
        <div>
          <span className="section-kicker">YOUR SHORTLIST</span>
          <h1>Cart & enquiry list.</h1>
          <p>Keep cars ready for your next showroom conversation or send a combined enquiry.</p>
        </div>
        {rows.length > 0 && (
          <button type="button" className="btn btn-outline" onClick={clearAll}>
            <Trash2 size={15} /> Clear shortlist
          </button>
        )}
      </div>

      {loading ? (
        <div className="page-loader">
          <div className="spinner" />
        </div>
      ) : rows.length > 0 ? (
        <div className="cart-layout">
          <div className="cart-list">
            {rows.map((x) => {
              const title = x.car.name || `${x.car.brand} ${x.car.model}`;
              return (
                <div className="cart-row" key={x.id}>
                  <Link to={`/cars/${x.car.id}`}>
                    <img
                      src={x.car.imageUrl || FALLBACK_CAR_IMAGE}
                      alt={title}
                      onError={(e) => {
                        e.currentTarget.src = FALLBACK_CAR_IMAGE;
                      }}
                    />
                  </Link>
                  <div>
                    <span>
                      {x.car.year} · {x.car.brand} · {x.car.fuelType}
                    </span>
                    <h3>
                      <Link to={`/cars/${x.car.id}`}>{title}</Link>
                    </h3>
                    <div className="qty-stepper">
                      <button
                        type="button"
                        aria-label="Decrease quantity"
                        onClick={() => changeQty(x.carId, x.quantity - 1)}
                      >
                        <Minus size={13} />
                      </button>
                      <span>{x.quantity}</span>
                      <button
                        type="button"
                        aria-label="Increase quantity"
                        onClick={() => changeQty(x.carId, x.quantity + 1)}
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                  </div>
                  <strong>
                    ₹{(Number(x.car.price || 0) * x.quantity).toLocaleString("en-IN")}
                  </strong>
                  <button
                    type="button"
                    aria-label="Remove item"
                    title="Remove from shortlist"
                    onClick={() => remove(x.carId)}
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              );
            })}
          </div>

          <aside className="summary-card">
            <span>ESTIMATED SHORTLIST TOTAL</span>
            <h2>₹{total.toLocaleString("en-IN")}</h2>
            <p>Prices are indicative reference values. Final on-road pricing is confirmed by the showroom.</p>

            <label className="summary-note-field">
              <span>Optional note for showroom concierge</span>
              <textarea
                rows="3"
                placeholder="Preferred contact time, city or test-drive request..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </label>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button
                type="button"
                disabled={sending}
                className="btn btn-dark"
                onClick={enquireShortlist}
              >
                <Send size={15} />{" "}
                {sending ? "Sending enquiries..." : `Enquire for all (${rows.length})`}
              </button>
              <Link className="btn btn-outline" to="/showrooms">
                Find showroom <ArrowRight size={16} />
              </Link>
            </div>
            {toast && <div className="toast" style={{ marginTop: 14 }}>{toast}</div>}
          </aside>
        </div>
      ) : (
        <div className="empty-state">
          <h3>Your cart is empty</h3>
          <p>Add cars you want to discuss with a showroom.</p>
          <Link className="btn btn-dark" to="/cars">
            Browse cars <ArrowRight size={16} />
          </Link>
        </div>
      )}
    </section>
  );
}
