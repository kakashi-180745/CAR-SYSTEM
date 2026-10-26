import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { Send } from "lucide-react";
import { getMyReports, createReport } from "../services/reportService";
import { getCars } from "../services/carService";
import { getShowrooms } from "../services/showroomService";

function reportStatusBadge(status) {
  switch ((status || "").toUpperCase()) {
    case "RESOLVED":
      return "badge badge-green";
    case "UNDER_REVIEW":
      return "badge badge-blue";
    case "REJECTED":
      return "badge badge-red";
    default:
      return "badge badge-amber";
  }
}

export default function Reports() {
  const location = useLocation();
  const prefillCar = location.state?.prefillCar || "";
  const prefillCarId = location.state?.prefillCarId ? String(location.state.prefillCarId) : "";

  const [items, setItems] = useState([]);
  const [cars, setCars] = useState([]);
  const [showrooms, setShowrooms] = useState([]);
  const [carSearch, setCarSearch] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const [f, setF] = useState({
    issueType: prefillCar && !prefillCarId ? "CAR_NOT_AVAILABLE" : "GENERAL",
    subject: prefillCar && !prefillCarId ? `Vehicle request: ${prefillCar}` : "",
    description:
      prefillCar && !prefillCarId
        ? `Could you please let me know if "${prefillCar}" can be sourced or added to inventory?`
        : "",
    carId: prefillCarId,
    showroomId: "",
    imageUrl: ""
  });

  const load = () => getMyReports().then(setItems).catch(() => {});

  useEffect(() => {
    load();
    getCars().then(setCars).catch(() => {});
    getShowrooms().then(setShowrooms).catch(() => {});
  }, []);

  const filteredCars = useMemo(() => {
    const q = carSearch.trim().toLowerCase();
    const list = q
      ? cars.filter((c) =>
          `${c.name || ""} ${c.brand} ${c.model} #${c.id}`.toLowerCase().includes(q)
        )
      : cars;
    return list.slice(0, 120);
  }, [cars, carSearch]);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    try {
      await createReport({
        issueType: f.issueType,
        subject: f.subject,
        description: f.description,
        carId: f.carId ? Number(f.carId) : null,
        showroomId: f.showroomId ? Number(f.showroomId) : null,
        imageUrl: f.imageUrl.trim() || null
      });
      setF({
        issueType: "GENERAL",
        subject: "",
        description: "",
        carId: "",
        showroomId: "",
        imageUrl: ""
      });
      setMsg("Report submitted to the admin team.");
      setTimeout(() => setMsg(""), 3000);
      load();
    } catch (err) {
      setMsg(err.response?.data?.message || "Could not send report.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="section narrow-page">
      <div className="page-title">
        <span className="section-kicker">SUPPORT & REQUESTS</span>
        <h1>Report an issue or request a car.</h1>
        <p>
          Tell our team about incorrect listing details, unavailable vehicles, showroom feedback or
          any platform issue.
        </p>
      </div>

      <form className="admin-form" onSubmit={submit}>
        <div className="form-grid">
          <label>
            Issue type
            <select
              value={f.issueType}
              onChange={(e) => setF({ ...f, issueType: e.target.value })}
            >
              <option value="GENERAL">General feedback</option>
              <option value="CAR_NOT_AVAILABLE">Car request / Not available</option>
              <option value="WRONG_CAR_INFORMATION">Wrong car information</option>
              <option value="WRONG_PRICE">Wrong price</option>
              <option value="SHOWROOM_PROBLEM">Showroom problem</option>
              <option value="ENQUIRY_PROBLEM">Enquiry problem</option>
              <option value="WEBSITE_PROBLEM">Website problem</option>
            </select>
          </label>

          <label>
            Related showroom (optional)
            <select
              value={f.showroomId}
              onChange={(e) => setF({ ...f, showroomId: e.target.value })}
            >
              <option value="">Not specific to a showroom</option>
              {showrooms.map((s) => (
                <option value={s.id} key={s.id}>
                  {s.name} ({s.city}, {s.country || "Global"})
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="form-grid">
          <label>
            Filter car list (optional)
            <input
              placeholder="Type brand or model to narrow car dropdown..."
              value={carSearch}
              onChange={(e) => setCarSearch(e.target.value)}
            />
          </label>

          <label>
            Related car (optional)
            <select value={f.carId} onChange={(e) => setF({ ...f, carId: e.target.value })}>
              <option value="">Not specific to a car</option>
              {filteredCars.map((c) => (
                <option value={c.id} key={c.id}>
                  {c.name || `${c.brand} ${c.model}`} — #{c.id}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="form-grid">
          <label>
            Subject
            <input
              required
              placeholder="Brief summary of the issue or vehicle request"
              value={f.subject}
              onChange={(e) => setF({ ...f, subject: e.target.value })}
            />
          </label>

          <label>
            Screenshot / Reference image URL (optional)
            <input
              type="url"
              placeholder="https://..."
              value={f.imageUrl}
              onChange={(e) => setF({ ...f, imageUrl: e.target.value })}
            />
          </label>
        </div>

        <label>
          Description
          <textarea
            required
            rows="4"
            placeholder="Share details so our admin team can investigate or source your vehicle..."
            value={f.description}
            onChange={(e) => setF({ ...f, description: e.target.value })}
          />
        </label>

        <button disabled={busy} className="btn btn-dark">
          <Send size={16} /> {busy ? "Sending..." : "Submit report"}
        </button>
        {msg && <div className="toast">{msg}</div>}
      </form>

      <div className="table-card" style={{ marginTop: 28 }}>
        <table>
          <thead>
            <tr>
              <th>Type</th>
              <th>Subject</th>
              <th>Status</th>
              <th>Admin response</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {items.map((r) => (
              <tr key={r.id}>
                <td>
                  <b>{(r.issueType || "GENERAL").replace(/_/g, " ")}</b>
                  <small>
                    {r.carId ? `Car #${r.carId} ` : ""}
                    {r.showroomId ? `Showroom #${r.showroomId}` : ""}
                  </small>
                </td>
                <td>
                  <b>{r.subject}</b>
                  <small>{r.description}</small>
                </td>
                <td>
                  <span className={reportStatusBadge(r.status)}>
                    {(r.status || "OPEN").replace(/_/g, " ")}
                  </span>
                </td>
                <td>{r.adminResponse || "Awaiting admin review"}</td>
                <td>{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!items.length && (
          <div className="empty-state" style={{ border: 0 }}>
            <p style={{ margin: 0 }}>You haven’t submitted any reports yet.</p>
          </div>
        )}
      </div>
    </section>
  );
}
