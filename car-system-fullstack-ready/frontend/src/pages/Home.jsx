import { Link } from "react-router-dom";
import { ArrowRight, MapPin, ShieldCheck, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { getCars } from "../services/carService";
import { getShowrooms } from "../services/showroomService";
import CarCard from "../components/CarCard";
import { FALLBACK_CAR_IMAGE } from "../services/api";

const SEGMENTS = [
  { label: "SUVs", to: "/cars?bodyType=SUV" },
  { label: "Sedans", to: "/cars?bodyType=Sedan" },
  { label: "Hatchbacks", to: "/cars?bodyType=Hatchback" },
  { label: "Coupes", to: "/cars?bodyType=Coupe" },
  { label: "Pickups", to: "/cars?bodyType=Pickup" },
  { label: "Electric", to: "/cars?fuelType=Electric" },
  { label: "Hybrid", to: "/cars?fuelType=Hybrid" }
];

export default function Home() {
  const [cars, setCars] = useState([]);
  const [inventory, setInventory] = useState(0);
  const [showroomCount, setShowroomCount] = useState(0);

  useEffect(() => {
    getCars()
      .then((d) => {
        setInventory(d.length);
        // Pick up to 6 featured cars from distinct brands for variety
        const seenBrands = new Set();
        const diverse = [];
        for (const car of d) {
          if (car.available && !seenBrands.has(car.brand)) {
            seenBrands.add(car.brand);
            diverse.push(car);
            if (diverse.length === 6) break;
          }
        }
        setCars(diverse.length ? diverse : d.slice(0, 6));
      })
      .catch(() => {});

    getShowrooms()
      .then((s) => setShowroomCount(s.length))
      .catch(() => {});
  }, []);

  return (
    <div>
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-copy">
            <span className="pill">
              <Sparkles size={14} /> A smarter way to buy a car
            </span>
            <h1>
              Drive something
              <br />
              <em>worth remembering.</em>
            </h1>
            <p>
              Browse premium cars, compare your options and connect with a showroom near you — all
              in one clean experience.
            </p>
            <div className="hero-actions">
              <Link className="btn btn-dark" to="/cars">
                Explore cars <ArrowRight size={18} />
              </Link>
              <Link className="btn btn-light" to="/showrooms">
                <MapPin size={17} /> Find a showroom
              </Link>
            </div>

            <div className="segment-pills">
              {SEGMENTS.map((s) => (
                <Link key={s.label} to={s.to} className="segment-pill">
                  {s.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-image-card">
              <img
                src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1500&q=85"
                alt="Premium car"
                onError={(e) => {
                  e.currentTarget.src = FALLBACK_CAR_IMAGE;
                }}
              />
            </div>
            <div className="floating-stat">
              <strong>{inventory ? inventory.toLocaleString() + "+" : "1,200+"}</strong>
              <span>Global cars to discover</span>
            </div>
          </div>
        </div>
      </section>

      <section className="trust-strip">
        <div>
          <ShieldCheck />
          <span>
            <b>{inventory ? `${inventory.toLocaleString()}+` : "1,200+"} vehicle listings</b>
            <small>Real-world model nameplates across segments</small>
          </span>
        </div>
        <div>
          <MapPin />
          <span>
            <b>{showroomCount ? `${showroomCount}` : "60+"} global showroom points</b>
            <small>Explore major automotive cities worldwide</small>
          </span>
        </div>
        <div>
          <Sparkles />
          <span>
            <b>Global market view</b>
            <small>Country, currency and reference values</small>
          </span>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <span className="section-kicker">GLOBAL COLLECTION</span>
            <h2>Cars worth a closer look.</h2>
            <p className="section-subtitle">
              From everyday hatchbacks to flagship performance cars — browse a worldwide reference
              inventory.
            </p>
          </div>
          <Link className="text-link" to="/cars">
            View all cars <ArrowRight size={16} />
          </Link>
        </div>

        <div className="car-grid">
          {cars.map((c) => (
            <CarCard key={c.id} car={c} />
          ))}
        </div>
      </section>

      <section className="cta">
        <div>
          <span className="section-kicker">VISIT IN PERSON</span>
          <h2>Your next car is closer than you think.</h2>
          <p>Use our showroom map to find the nearest location and plan your visit.</p>
          <Link className="btn btn-light" to="/showrooms">
            Explore showrooms <ArrowRight size={17} />
          </Link>
        </div>
      </section>
    </div>
  );
}
