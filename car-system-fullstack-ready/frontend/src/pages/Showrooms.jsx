import { useEffect, useMemo, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { ExternalLink, Globe2, Mail, MapPin, Phone, Search, X } from "lucide-react";
import { getShowrooms } from "../services/showroomService";

const markerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

function MapViewport({ selected, filtered }) {
  const map = useMap();
  useEffect(() => {
    if (selected && selected.latitude != null && selected.longitude != null) {
      map.flyTo([selected.latitude, selected.longitude], 13, { duration: 0.75 });
    } else if (filtered.length === 1) {
      map.flyTo([filtered[0].latitude, filtered[0].longitude], 11, { duration: 0.75 });
    } else if (filtered.length > 1 && filtered.length < 15) {
      const bounds = L.latLngBounds(filtered.map((s) => [s.latitude, s.longitude]));
      map.flyToBounds(bounds, { padding: [45, 45], maxZoom: 6, duration: 0.75 });
    } else {
      map.setView([20, 15], 2);
    }
  }, [selected, filtered, map]);
  return null;
}

export default function Showrooms() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [query, setQuery] = useState("");
  const [country, setCountry] = useState("");

  useEffect(() => {
    getShowrooms()
      .then(setItems)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const countries = useMemo(
    () => [...new Set(items.map((s) => s.country).filter(Boolean))].sort(),
    [items]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((s) => {
      if (country && (s.country || "") !== country) return false;
      if (!q) return true;
      return [s.name, s.city, s.country, s.address, s.brand]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [items, query, country]);

  return (
    <section className="section showroom-page">
      <div className="page-title">
        <span className="section-kicker">SHOWROOM NETWORK</span>
        <h1>Come see it in person.</h1>
        <p>
          Explore {items.length || 60}+ global showroom points across {countries.length || 25}+
          countries, view exact locations and plan your visit.
        </p>
      </div>

      <div className="showroom-filters">
        <div className="search-box">
          <Search size={18} />
          <input
            placeholder="Search city, showroom or address..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelected(null);
            }}
          />
        </div>
        <select
          value={country}
          aria-label="Filter by country"
          onChange={(e) => {
            setCountry(e.target.value);
            setSelected(null);
          }}
        >
          <option value="">All countries ({items.length})</option>
          {countries.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        {(query || country || selected) && (
          <button
            type="button"
            className="clear-btn"
            onClick={() => {
              setQuery("");
              setCountry("");
              setSelected(null);
            }}
          >
            <X size={15} /> Reset view
          </button>
        )}
      </div>

      {loading ? (
        <div className="page-loader">
          <div className="spinner" />
        </div>
      ) : (
        <div className="showroom-layout">
          <div className="showroom-list">
            {filtered.map((s) => (
              <button
                type="button"
                className={"showroom-card " + (selected?.id === s.id ? "selected" : "")}
                key={s.id}
                onClick={() => setSelected(s)}
              >
                <div className="showroom-icon">
                  <MapPin />
                </div>
                <div>
                  <span>
                    {s.city} · {s.country || "Global"}
                  </span>
                  <h3>{s.name}</h3>
                  <p>{s.address}</p>
                  <div className="small-contact">
                    {s.phone && (
                      <span>
                        <Phone size={12} />
                        {s.phone}
                      </span>
                    )}
                    {s.email && (
                      <span>
                        <Mail size={12} />
                        {s.email}
                      </span>
                    )}
                    {s.website && (
                      <span>
                        <Globe2 size={12} />
                        {s.website}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}

            {filtered.length === 0 && (
              <div className="empty-state" style={{ minHeight: 220, padding: 20 }}>
                <h3>No matching showrooms</h3>
                <p>Try clearing your city or country filter.</p>
              </div>
            )}
          </div>

          <div className="map-box">
            <MapContainer center={[20, 15]} zoom={2} scrollWheelZoom className="leaflet-map">
              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapViewport selected={selected} filtered={filtered} />
              {filtered
                .filter((s) => s.latitude != null && s.longitude != null)
                .map((s) => (
                  <Marker
                    key={s.id}
                    position={[s.latitude, s.longitude]}
                    icon={markerIcon}
                    eventHandlers={{ click: () => setSelected(s) }}
                  >
                    <Popup>
                      <b>{s.name}</b>
                      <br />
                      {s.address}, {s.city}, {s.country || "Global"}
                      {s.phone && (
                        <>
                          <br />
                          <small>{s.phone}</small>
                        </>
                      )}
                      <br />
                      <a
                        target="_blank"
                        rel="noreferrer"
                        href={`https://www.openstreetmap.org/?mlat=${s.latitude}&mlon=${s.longitude}#map=16/${s.latitude}/${s.longitude}`}
                      >
                        Open map <ExternalLink size={12} />
                      </a>
                    </Popup>
                  </Marker>
                ))}
            </MapContainer>
          </div>
        </div>
      )}
    </section>
  );
}
