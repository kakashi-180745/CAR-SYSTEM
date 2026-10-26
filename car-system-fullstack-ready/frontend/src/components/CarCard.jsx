import { Link, useNavigate } from "react-router-dom";
import { Heart, ArrowUpRight, Scale } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { FALLBACK_CAR_IMAGE } from "../services/api";

export default function CarCard({ car, onWishlistChange, onCompareToggle, isCompared = false }) {
  const { user, wishlistIds, toggleWishlist } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  const liked = wishlistIds.has(Number(car.id));
  const displayTitle = car.name && car.name.trim() ? car.name : `${car.brand} ${car.model}`;

  const handleToggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate("/login");
      return;
    }
    if (busy) return;
    setBusy(true);
    try {
      const nextLiked = await toggleWishlist(car.id);
      if (onWishlistChange) onWishlistChange(car.id, nextLiked);
    } catch {
      // Ignore network hiccup
    } finally {
      setBusy(false);
    }
  };

  const handleCompare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onCompareToggle) onCompareToggle(car);
  };

  return (
    <article className="car-card">
      <Link to={`/cars/${car.id}`} className="car-image-wrap">
        <img
          src={car.imageUrl || FALLBACK_CAR_IMAGE}
          alt={displayTitle}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = FALLBACK_CAR_IMAGE;
          }}
        />
        <button
          type="button"
          title={liked ? "Remove from wishlist" : "Save to wishlist"}
          aria-label={liked ? "Remove from wishlist" : "Save to wishlist"}
          className={"heart-btn " + (liked ? "liked" : "")}
          onClick={handleToggleWishlist}
        >
          <Heart size={18} fill={liked ? "currentColor" : "none"} />
        </button>

        {onCompareToggle && (
          <button
            type="button"
            title={isCompared ? "Remove from comparison" : "Compare car"}
            aria-label={isCompared ? "Remove from comparison" : "Compare car"}
            className={"compare-pin-btn " + (isCompared ? "active" : "")}
            onClick={handleCompare}
          >
            <Scale size={15} />
          </button>
        )}

        <span className={"available " + (car.available ? "is-available" : "is-sold")}>
          {car.available ? "Available" : "Sold"}
        </span>
      </Link>

      <div className="car-card-body">
        <div className="eyebrow">
          {car.year || "2026"} · {car.bodyType || "Vehicle"} · {car.brand}
        </div>
        <h3 title={displayTitle}>
          <Link to={`/cars/${car.id}`}>{displayTitle}</Link>
        </h3>
        <div className="spec-row">
          {car.fuelType && <span>{car.fuelType}</span>}
          {car.transmission && <span>{car.transmission}</span>}
          {car.mileage != null && <span>{car.mileage} km/l</span>}
        </div>
        <div className="market-line">
          <span>Market: {car.marketCountry || "Global"}</span>
          {car.marketPrice != null && car.currency && (
            <span>
              {car.currency}{" "}
              {Number(car.marketPrice).toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
          )}
        </div>
        <div className="card-bottom">
          <strong>₹{Number(car.price || 0).toLocaleString("en-IN")}</strong>
          <Link to={`/cars/${car.id}`} className="view-link">
            View <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>
    </article>
  );
}
