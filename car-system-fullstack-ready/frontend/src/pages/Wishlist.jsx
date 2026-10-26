import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, ArrowRight } from "lucide-react";
import { getCars } from "../services/carService";
import CarCard from "../components/CarCard";
import { useAuth } from "../context/AuthContext";

export default function Wishlist() {
  const { wishlistIds, refreshCollections } = useAuth();
  const [allCars, setAllCars] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([refreshCollections(), getCars()])
      .then(([, c]) => setAllCars(c))
      .finally(() => setLoading(false));
  }, [refreshCollections]);

  const savedCars = useMemo(
    () => allCars.filter((c) => wishlistIds.has(Number(c.id))),
    [allCars, wishlistIds]
  );

  return (
    <section className="section">
      <div className="page-title">
        <span className="section-kicker">SAVED CARS</span>
        <h1>Your wishlist.</h1>
        <p>Keep the cars you are seriously considering in one place.</p>
      </div>

      {loading ? (
        <div className="page-loader">
          <div className="spinner" />
        </div>
      ) : savedCars.length > 0 ? (
        <div className="car-grid">
          {savedCars.map((c) => (
            <CarCard key={c.id} car={c} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <Heart size={30} />
          <h3>Your wishlist is empty</h3>
          <p>Click the heart icon on any car in our inventory and it will appear here.</p>
          <Link className="btn btn-dark" to="/cars">
            Browse cars <ArrowRight size={16} />
          </Link>
        </div>
      )}
    </section>
  );
}
