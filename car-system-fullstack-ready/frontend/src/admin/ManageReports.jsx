import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getReports, updateReport } from "../services/reportService";
import AdminNav from "../components/AdminNav";

export default function ManageReports() {
  const [items, setItems] = useState([]);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [toast, setToast] = useState("");

  const load = () => getReports().then(setItems);

  useEffect(() => {
    load();
  }, []);

  const save = async (r) => {
    await updateReport(r.id, { status: r.status, adminResponse: r.adminResponse || "" });
    setToast(`Report #${r.id} saved (${r.status}).`);
    setTimeout(() => setToast(""), 2500);
    load();
  };

  const filtered = useMemo(() => {
    if (statusFilter === "ALL") return items;
    return items.filter((r) => r.status === statusFilter);
  }, [items, statusFilter]);

  return (
    <section className="section admin-page">
      <AdminNav />

      <div className="page-title row-title">
        <div>
          <span className="section-kicker">ADMIN / SUPPORT</span>
          <h1>Issue reports.</h1>
          <p>Review user-reported issues or vehicle sourcing requests and send resolutions.</p>
        </div>
        <select
          className="status-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">All statuses ({items.length})</option>
          <option value="OPEN">OPEN</option>
          <option value="UNDER_REVIEW">UNDER REVIEW</option>
          <option value="RESOLVED">RESOLVED</option>
          <option value="REJECTED">REJECTED</option>
        </select>
      </div>

      {toast && <div className="toast" style={{ marginBottom: 14 }}>{toast}</div>}

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Report</th>
              <th>Issue & Subject</th>
              <th>Description</th>
              <th>Status</th>
              <th>Admin response</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id}>
                <td>
                  <b>#{r.id}</b>
                  <small>
                    User #{r.userId}
                    {r.carId ? (
                      <>
                        {" "}
                        · <Link to={`/cars/${r.carId}`}>Car #{r.carId}</Link>
                      </>
                    ) : (
                      ""
                    )}
                    {r.showroomId ? ` · Showroom #${r.showroomId}` : ""}
                  </small>
                  <small>{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ""}</small>
                </td>
                <td>
                  <b>{(r.issueType || "GENERAL").replace(/_/g, " ")}</b>
                  <small>{r.subject}</small>
                  {r.imageUrl && (
                    <small>
                      <a href={r.imageUrl} target="_blank" rel="noreferrer" style={{ textDecoration: "underline" }}>
                        View attachment
                      </a>
                    </small>
                  )}
                </td>
                <td style={{ maxWidth: 280 }}>{r.description}</td>
                <td>
                  <select
                    className="status-select"
                    value={r.status}
                    onChange={(e) =>
                      setItems(
                        items.map((x) => (x.id === r.id ? { ...x, status: e.target.value } : x))
                      )
                    }
                  >
                    <option value="OPEN">OPEN</option>
                    <option value="UNDER_REVIEW">UNDER_REVIEW</option>
                    <option value="RESOLVED">RESOLVED</option>
                    <option value="REJECTED">REJECTED</option>
                  </select>
                </td>
                <td style={{ minWidth: 220 }}>
                  <textarea
                    rows="2"
                    placeholder="Write response visible to user..."
                    value={r.adminResponse || ""}
                    onChange={(e) =>
                      setItems(
                        items.map((x) =>
                          x.id === r.id ? { ...x, adminResponse: e.target.value } : x
                        )
                      )
                    }
                  />
                </td>
                <td>
                  <button type="button" className="btn btn-dark btn-sm" onClick={() => save(r)}>
                    Save
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!filtered.length && (
          <div className="empty-state" style={{ border: 0 }}>
            <p style={{ margin: 0 }}>No reports in this view.</p>
          </div>
        )}
      </div>
    </section>
  );
}
