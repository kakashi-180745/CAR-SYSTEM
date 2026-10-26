import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import api from "../services/api";
import { getCars } from "../services/carService";
import AdminNav from "../components/AdminNav";

export default function ManageEnquiries() {
  const [items, setItems] = useState([]);
  const [carMap, setCarMap] = useState({});
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState("");

  const load = () => api.get("/enquiries").then((r) => setItems(r.data));

  useEffect(() => {
    load();
    getCars()
      .then((cars) => {
        const m = {};
        for (const c of cars) m[c.id] = c;
        setCarMap(m);
      })
      .catch(() => {});
  }, []);

  const update = async (id, status) => {
    await api.patch(`/enquiries/${id}/status`, { status });
    setToast(`Enquiry #${id} updated to ${status.replace(/_/g, " ")}.`);
    setTimeout(() => setToast(""), 2400);
    load();
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((e) => {
      if (statusFilter !== "ALL" && e.status !== statusFilter) return false;
      if (!q) return true;
      const car = carMap[e.carId];
      const carTitle = car ? `${car.name || ""} ${car.brand} ${car.model}` : "";
      return `${e.name} ${e.email} ${e.phone || ""} ${e.message || ""} ${carTitle}`
        .toLowerCase()
        .includes(q);
    });
  }, [items, statusFilter, query, carMap]);

  return (
    <section className="section admin-page">
      <AdminNav />

      <div className="page-title">
        <span className="section-kicker">ADMIN / LEADS</span>
        <h1>Customer enquiries.</h1>
        <p>Follow up with prospective buyers, schedule test drives and update lead status.</p>
      </div>

      <div className="admin-filter-bar">
        <div className="search-box">
          <Search size={17} />
          <input
            placeholder="Search customer name, email, phone or car..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="ALL">All statuses ({items.length})</option>
          <option value="NEW">New</option>
          <option value="CONTACTED">Contacted</option>
          <option value="TEST_DRIVE_SCHEDULED">Test Drive Scheduled</option>
          <option value="CLOSED">Closed</option>
        </select>
      </div>

      {toast && <div className="toast" style={{ marginBottom: 14 }}>{toast}</div>}

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Customer</th>
              <th>Contact</th>
              <th>Vehicle</th>
              <th>Message</th>
              <th>Submitted</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((e) => {
              const car = carMap[e.carId];
              const carTitle = car ? car.name || `${car.brand} ${car.model}` : `Car #${e.carId}`;
              return (
                <tr key={e.id}>
                  <td>
                    <b>{e.name}</b>
                    <small>Lead #{e.id}</small>
                  </td>
                  <td>
                    <b>{e.phone || "No phone"}</b>
                    <small>{e.email}</small>
                  </td>
                  <td>
                    <Link to={`/cars/${e.carId}`}>
                      <b>{carTitle}</b>
                    </Link>
                    <small>#{e.carId}</small>
                  </td>
                  <td style={{ maxWidth: 300 }}>{e.message || "Interested in this car."}</td>
                  <td>{e.createdAt ? new Date(e.createdAt).toLocaleString() : "—"}</td>
                  <td>
                    <select
                      className="status-select"
                      value={e.status}
                      onChange={(x) => update(e.id, x.target.value)}
                    >
                      <option value="NEW">NEW</option>
                      <option value="CONTACTED">CONTACTED</option>
                      <option value="TEST_DRIVE_SCHEDULED">TEST DRIVE SCHEDULED</option>
                      <option value="CLOSED">CLOSED</option>
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!filtered.length && (
          <div className="empty-state" style={{ border: 0 }}>
            <p style={{ margin: 0 }}>No enquiries match your filter.</p>
          </div>
        )}
      </div>
    </section>
  );
}
