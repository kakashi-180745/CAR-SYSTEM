import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, Scale, Search, SlidersHorizontal, X } from "lucide-react";
import { getCars } from "../services/carService";
import CarCard from "../components/CarCard";
import { FALLBACK_CAR_IMAGE } from "../services/api";

const PAGE_SIZE = 48;

const EMPTY_FILTERS = {
  q: "",
  brand: "",
  bodyType: "",
  fuelType: "",
  transmission: "",
  country: "",
  maxPrice: "",
  availableOnly: false
};

export default function Cars() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [catalogMeta, setCatalogMeta] = useState({ brands: [], bodyTypes: [], countries: [] });
  const [sortBy, setSortBy] = useState("featured");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [compareList, setCompareList] = useState([]);
  const [compareOpen, setCompareOpen] = useState(false);

  const [filters, setFilters] = useState(() => ({
    ...EMPTY_FILTERS,
    q: searchParams.get("q") || "",
    brand: searchParams.get("brand") || "",
    bodyType: searchParams.get("bodyType") || "",
    fuelType: searchParams.get("fuelType") || "",
    transmission: searchParams.get("transmission") || "",
    country: searchParams.get("country") || "",
    maxPrice: searchParams.get("maxPrice") || ""
  }));

  const fetchCars = async (activeFilters) => {
    setLoading(true);
    try {
      const apiParams = {};
      if (activeFilters.q?.trim()) apiParams.q = activeFilters.q.trim();
      if (activeFilters.brand) apiParams.brand = activeFilters.brand;
      if (activeFilters.bodyType) apiParams.bodyType = activeFilters.bodyType;
      if (activeFilters.fuelType) apiParams.fuelType = activeFilters.fuelType;
      if (activeFilters.transmission) apiParams.transmission = activeFilters.transmission;
      if (activeFilters.country) apiParams.country = activeFilters.country;
      if (activeFilters.maxPrice) apiParams.maxPrice = activeFilters.maxPrice;
      if (activeFilters.availableOnly) apiParams.available = true;

      const d = await getCars(apiParams);
      setCars(d);
      setVisibleCount(PAGE_SIZE);
    } finally {
      setLoading(false);
    }
  };

  // Load full catalog facets once so dropdowns stay complete after filtering
  useEffect(() => {
    getCars()
      .then((all) => {
        const brands = [...new Set(all.map((x) => x.brand).filter(Boolean))].sort();
        const bodyTypes = [...new Set(all.map((x) => x.bodyType).filter(Boolean))].sort();
        const countries = [...new Set(all.map((x) => x.marketCountry).filter(Boolean))].sort();
        setCatalogMeta({ brands, bodyTypes, countries });
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchCars(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const apply = (e) => {
    e.preventDefault();
    const nextParams = {};
    for (const [k, v] of Object.entries(filters)) {
      if (k !== "availableOnly" && v) nextParams[k] = v;
    }
    setSearchParams(nextParams, { replace: true });
    fetchCars(filters);
  };

  const clear = () => {
    setFilters(EMPTY_FILTERS);
    setSortBy("featured");
    setSearchParams({}, { replace: true });
    fetchCars(EMPTY_FILTERS);
  };

  const sortedCars = useMemo(() => {
    const list = [...cars];
    switch (sortBy) {
      case "price-asc":
        return list.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
      case "price-desc":
        return list.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
      case "year-desc":
        return list.sort((a, b) => Number(b.year || 0) - Number(a.year || 0));
      case "mileage-desc":
        return list.sort((a, b) => Number(b.mileage || 0) - Number(a.mileage || 0));
      case "name-asc":
        return list.sort((a, b) =>
          (a.name || `${a.brand} ${a.model}`).localeCompare(b.name || `${b.brand} ${b.model}`)
        );
      default:
        return list;
    }
  }, [cars, sortBy]);

  const visibleCars = useMemo(
    () => sortedCars.slice(0, visibleCount),
    [sortedCars, visibleCount]
  );

  const toggleCompare = (car) => {
    setCompareList((prev) => {
      if (prev.some((x) => x.id === car.id)) {
        return prev.filter((x) => x.id !== car.id);
      }
      if (prev.length >= 3) {
        return [...prev.slice(1), car];
      }
      return [...prev, car];
    });
  };

  const hasActiveFilters = Object.entries(filters).some(([, v]) => Boolean(v));

  return (
    <section className="section cars-page">
      <div className="page-title">
        <span className="section-kicker">INVENTORY</span>
        <h1>Find your next car.</h1>
        <p>Search our global catalog, compare specifications side-by-side and narrow down what fits you.</p>
      </div>

      <form className="filters filters-extended" onSubmit={apply}>
        <div className="search-box">
          <Search size={18} />
          <input
            placeholder="Search brand, model, trim or country..."
            value={filters.q}
            onChange={(e) => setFilters({ ...filters, q: e.target.value })}
          />
        </div>

        <select
          value={filters.brand}
          aria-label="Filter by brand"
          onChange={(e) => setFilters({ ...filters, brand: e.target.value })}
        >
          <option value="">All brands</option>
          {catalogMeta.brands.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>

        <select
          value={filters.bodyType}
          aria-label="Filter by body type"
          onChange={(e) => setFilters({ ...filters, bodyType: e.target.value })}
        >
          <option value="">Body type</option>
          {(catalogMeta.bodyTypes.length
            ? catalogMeta.bodyTypes
            : ["SUV", "Sedan", "Hatchback", "Coupe", "Convertible", "Pickup"]
          ).map((bt) => (
            <option key={bt} value={bt}>
              {bt}
            </option>
          ))}
        </select>

        <select
          value={filters.fuelType}
          aria-label="Filter by fuel type"
          onChange={(e) => setFilters({ ...filters, fuelType: e.target.value })}
        >
          <option value="">Fuel</option>
          <option>Petrol</option>
          <option>Diesel</option>
          <option>Electric</option>
          <option>Hybrid</option>
        </select>

        <select
          value={filters.transmission}
          aria-label="Filter by transmission"
          onChange={(e) => setFilters({ ...filters, transmission: e.target.value })}
        >
          <option value="">Transmission</option>
          <option>Automatic</option>
          <option>Manual</option>
        </select>

        <select
          value={filters.country}
          aria-label="Filter by market country"
          onChange={(e) => setFilters({ ...filters, country: e.target.value })}
        >
          <option value="">Market</option>
          {catalogMeta.countries.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <input
          type="number"
          min="0"
          placeholder="Max price (₹)"
          value={filters.maxPrice}
          onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
        />

        <div className="filter-actions">
          <button className="btn btn-dark filter-btn" type="submit">
            <SlidersHorizontal size={16} /> Apply
          </button>
          {hasActiveFilters && (
            <button type="button" className="clear-btn" onClick={clear}>
              <X size={15} /> Clear
            </button>
          )}
        </div>
      </form>

      <div className="catalog-toolbar">
        <label className="avail-toggle">
          <input
            type="checkbox"
            checked={filters.availableOnly}
            onChange={(e) => {
              const next = { ...filters, availableOnly: e.target.checked };
              setFilters(next);
              fetchCars(next);
            }}
          />
          <span>Available vehicles only</span>
        </label>

        <div className="sort-control">
          <span>Sort by</span>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="featured">Featured</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="year-desc">Newest Year</option>
            <option value="mileage-desc">Highest Mileage</option>
            <option value="name-asc">Name: A to Z</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="page-loader">
          <div className="spinner" />
        </div>
      ) : (
        <>
          <div className="result-count">
            <span>
              Showing <b>{Math.min(visibleCount, sortedCars.length).toLocaleString()}</b> of{" "}
              <b>{sortedCars.length.toLocaleString()}</b> vehicles
            </span>
            <span className="inventory-live">GLOBAL INVENTORY · 2026 REFERENCE</span>
          </div>

          <div className="car-grid">
            {visibleCars.map((c) => (
              <CarCard
                key={c.id}
                car={c}
                onCompareToggle={toggleCompare}
                isCompared={compareList.some((x) => x.id === c.id)}
              />
            ))}
          </div>

          {visibleCount < sortedCars.length && (
            <div className="load-more-wrap">
              <button
                type="button"
                className="btn btn-outline load-more"
                onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
              >
                Load more vehicles{" "}
                <span>
                  ({(sortedCars.length - visibleCount).toLocaleString()} remaining)
                </span>
              </button>
            </div>
          )}

          {sortedCars.length === 0 && (
            <div className="empty-state">
              <h3>Car not available</h3>
              <p>
                No vehicle matched your search. You can report or request this car and our admin
                team will review it.
              </p>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
                <Link
                  className="btn btn-dark"
                  to="/reports"
                  state={{ prefillCar: filters.q || filters.brand }}
                >
                  Report / request car <ArrowRight size={16} />
                </Link>
                <button type="button" className="btn btn-outline" onClick={clear}>
                  Reset filters
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {compareList.length > 0 && (
        <div className="compare-bar">
          <div className="compare-bar-items">
            <span className="compare-bar-title">
              <Scale size={16} /> Compare ({compareList.length}/3)
            </span>
            {compareList.map((c) => (
              <span key={c.id} className="compare-chip">
                {c.name || `${c.brand} ${c.model}`}
                <button type="button" aria-label="Remove" onClick={() => toggleCompare(c)}>
                  <X size={13} />
                </button>
              </span>
            ))}
          </div>
          <div className="compare-bar-actions">
            <button type="button" className="clear-btn" onClick={() => setCompareList([])}>
              Clear
            </button>
            <button
              type="button"
              className="btn btn-dark"
              onClick={() => setCompareOpen(true)}
            >
              Compare now
            </button>
          </div>
        </div>
      )}

      {compareOpen && compareList.length > 0 && (
        <div className="modal-backdrop" onClick={() => setCompareOpen(false)}>
          <div className="modal-panel compare-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <span className="section-kicker">SIDE-BY-SIDE</span>
                <h3>Vehicle comparison</h3>
              </div>
              <button
                type="button"
                className="icon-close-btn"
                aria-label="Close modal"
                onClick={() => setCompareOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="table-card">
              <table>
                <thead>
                  <tr>
                    <th>Specification</th>
                    {compareList.map((c) => (
                      <th key={c.id}>
                        <div className="compare-col-head">
                          <img
                            src={c.imageUrl || FALLBACK_CAR_IMAGE}
                            alt={c.name || c.model}
                            onError={(e) => {
                              e.currentTarget.src = FALLBACK_CAR_IMAGE;
                            }}
                          />
                          <Link to={`/cars/${c.id}`} onClick={() => setCompareOpen(false)}>
                            {c.name || `${c.brand} ${c.model}`}
                          </Link>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><b>Price (INR)</b></td>
                    {compareList.map((c) => (
                      <td key={c.id}><b>₹{Number(c.price || 0).toLocaleString("en-IN")}</b></td>
                    ))}
                  </tr>
                  <tr>
                    <td><b>Market Reference</b></td>
                    {compareList.map((c) => (
                      <td key={c.id}>
                        {c.marketCountry || "Global"}{" "}
                        {c.currency && c.marketPrice != null
                          ? `(${c.currency} ${Number(c.marketPrice).toLocaleString(undefined, { maximumFractionDigits: 0 })})`
                          : ""}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td><b>Year & Body</b></td>
                    {compareList.map((c) => (
                      <td key={c.id}>{c.year || "—"} · {c.bodyType || "—"}</td>
                    ))}
                  </tr>
                  <tr>
                    <td><b>Powertrain</b></td>
                    {compareList.map((c) => (
                      <td key={c.id}>{c.fuelType || "—"} · {c.transmission || "—"}</td>
                    ))}
                  </tr>
                  <tr>
                    <td><b>Mileage</b></td>
                    {compareList.map((c) => (
                      <td key={c.id}>{c.mileage != null ? `${c.mileage} km/l` : "—"}</td>
                    ))}
                  </tr>
                  <tr>
                    <td><b>Availability</b></td>
                    {compareList.map((c) => (
                      <td key={c.id}>{c.available ? "Available" : "Sold"}</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
