import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, MessageSquare } from "lucide-react";
import api, { FALLBACK_CAR_IMAGE } from "../services/api";
import { getCars } from "../services/carService";

function statusClass(status) {
  switch ((status || "").toUpperCase()) {
    case "CONTACTED":
      return "badge badge-blue";
    case "TEST_DRIVE_SCHEDULED":
      return "badge badge-purple";
    case "CLOSED":
      return "badge badge-green";
    default:
      return "badge badge-amber";
  }
}

export default function MyEnquiries() {
  const [items, setItems] = useState([]);
  const [carMap, setCarMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get("/enquiries/mine"), getCars()])
      .then(([r, cars]) => {
        setItems(r.data);
        const map = {};
        for (const c of cars) map[c.id] = c;
        setCarMap(map);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="section narrow-page">
      <div className="page-title">
        <span className="section-kicker">ACCOUNT / ENQUIRIES</span>
        <h1>Your enquiries.</h1>
        <p>Track every car enquiry and the showroom team’s response status.</p>
      </div>

      {loading ? (
        <div className="page-loader">
          <div className="spinner" />
        </div>
      ) : items.length > 0 ? (
        <div className="table-card">
          <table>
            <thead>
              <tr>
                <th>Vehicle</th>
                <th>Message</th>
                <th>Status</th>
                <th>Submitted</th>
              </tr>
            </thead>
            <tbody>
              {items.map((e) => {
                const car = carMap[e.carId];
                const title = car
                  ? car.name || `${car.brand} ${car.model}`
                  : `Vehicle #${e.carId}`;
                return (
                  <tr key={e.id}>
                    <td>
                      <Link to={`/cars/${e.carId}`} className="table-car">
                        {car && (
                          <img
                            src={car.imageUrl || FALLBACK_CAR_IMAGE}
                            alt={title}
                            onError={(ev) => {
                              ev.currentTarget.src = FALLBACK_CAR_IMAGE;
                            }}
                          />
                        )}
                        <span>
                          <b>{title}</b>
                          <small>#{e.carId}</small>
                        </span>
                      </Link>
                    </td>
                    <td style={{ maxWidth: 340 }}>{e.message || "Interested in this car."}</td>
                    <td>
                      <span className={statusClass(e.status)}>
                        {(e.status || "NEW").replace(/_/g, " ")}
                      </span>
                    </td>
                    <td>{e.createdAt ? new Date(e.createdAt).toLocaleString() : "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">
          <MessageSquare size={30} />
          <h3>No enquiries yet</h3>
          <p>Open any car listing and send an enquiry to connect with a showroom.</p>
          <Link className="btn btn-dark" to="/cars">
            Explore cars <ArrowRight size={16} />
          </Link>
        </div>
      )}
    </section>
  );
}
