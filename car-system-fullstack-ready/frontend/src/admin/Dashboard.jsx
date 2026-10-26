import { useEffect, useState } from "react";
import {
  CarFront,
  MapPin,
  Users,
  MessageSquare,
  AlertTriangle,
  ArrowRight,
  Plus
} from "lucide-react";
import { Link } from "react-router-dom";
import { getCars } from "../services/carService";
import { getShowrooms } from "../services/showroomService";
import { getUsers } from "../services/userService";
import api from "../services/api";
import { getReports } from "../services/reportService";
import { useAuth } from "../context/AuthContext";
import AdminNav from "../components/AdminNav";

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    cars: 0,
    availableCars: 0,
    showrooms: 0,
    users: 0,
    enquiries: 0,
    newEnquiries: 0,
    reports: 0
  });
  const [recentEnquiries, setRecentEnquiries] = useState([]);
  const [openReports, setOpenReports] = useState([]);

  useEffect(() => {
    Promise.all([getCars(), getShowrooms(), getUsers(), api.get("/enquiries"), getReports()])
      .then(([c, sh, u, e, r]) => {
        const enq = e.data || [];
        const unresolved = (r || []).filter((x) => x.status !== "RESOLVED");
        setStats({
          cars: c.length,
          availableCars: c.filter((x) => x.available).length,
          showrooms: sh.length,
          users: u.length,
          enquiries: enq.length,
          newEnquiries: enq.filter((x) => x.status === "NEW").length,
          reports: unresolved.length
        });
        setRecentEnquiries(enq.slice(0, 4));
        setOpenReports(unresolved.slice(0, 4));
      })
      .catch(() => {});
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const firstName = (user?.name || "Admin").trim().split(/\s+/)[0];

  const cards = [
    ["Cars", stats.cars, `${stats.availableCars.toLocaleString()} available`, CarFront, "/admin/cars"],
    ["Showrooms", stats.showrooms, "Global locations", MapPin, "/admin/showrooms"],
    ["Users", stats.users, "Registered accounts", Users, "/admin/users"],
    ["Enquiries", stats.enquiries, `${stats.newEnquiries} new`, MessageSquare, "/admin/enquiries"],
    ["Open reports", stats.reports, "Pending resolution", AlertTriangle, "/admin/reports"]
  ];

  return (
    <section className="section admin-page">
      <AdminNav />

      <div className="page-title row-title">
        <div>
          <span className="section-kicker">ADMIN CONSOLE</span>
          <h1>
            {greeting}, {firstName}.
          </h1>
          <p>Manage inventory, customers, showroom network, enquiries and issue reports.</p>
        </div>
        <Link className="btn btn-dark" to="/admin/cars/add">
          <Plus size={17} /> Add vehicle
        </Link>
      </div>

      <div className="stats-grid stats-grid-5">
        {cards.map(([name, n, sub, Icon, to]) => (
          <Link className="stat-card" to={to} key={name}>
            <Icon />
            <div>
              <span>{name}</span>
              <strong>{Number(n).toLocaleString()}</strong>
              <small className="stat-sub">{sub}</small>
            </div>
            <ArrowRight size={16} />
          </Link>
        ))}
      </div>

      <div className="admin-panels-grid">
        <div className="table-card admin-mini-panel">
          <div className="admin-mini-head">
            <h3>Recent enquiries</h3>
            <Link to="/admin/enquiries" className="text-link">
              Manage all <ArrowRight size={14} />
            </Link>
          </div>
          {recentEnquiries.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Car</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentEnquiries.map((e) => (
                  <tr key={e.id}>
                    <td>
                      <b>{e.name}</b>
                      <small>{e.phone || e.email}</small>
                    </td>
                    <td>#{e.carId}</td>
                    <td>
                      <span className="badge badge-amber">{e.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state" style={{ minHeight: 160, border: 0 }}>
              <p style={{ margin: 0 }}>No customer enquiries yet.</p>
            </div>
          )}
        </div>

        <div className="table-card admin-mini-panel">
          <div className="admin-mini-head">
            <h3>Open support reports</h3>
            <Link to="/admin/reports" className="text-link">
              Review all <ArrowRight size={14} />
            </Link>
          </div>
          {openReports.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Issue</th>
                  <th>Subject</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {openReports.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <b>{(r.issueType || "GENERAL").replace(/_/g, " ")}</b>
                    </td>
                    <td>{r.subject}</td>
                    <td>
                      <span className="badge badge-amber">{r.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state" style={{ minHeight: 160, border: 0 }}>
              <p style={{ margin: 0 }}>All reports are resolved.</p>
            </div>
          )}
        </div>
      </div>

      <div className="admin-callout">
        <div>
          <span className="section-kicker">LIVE SYNC</span>
          <h2>One database. Every screen.</h2>
          <p>
            Car edits, availability, showroom changes, enquiries and reports sync live across the
            entire storefront.
          </p>
        </div>
        <Link className="btn btn-dark" to="/cars">
          View storefront
        </Link>
      </div>
    </section>
  );
}
