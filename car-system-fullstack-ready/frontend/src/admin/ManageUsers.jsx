import { useEffect, useMemo, useState } from "react";
import { Search, Trash2 } from "lucide-react";
import { getUsers, deleteUser } from "../services/userService";
import AdminNav from "../components/AdminNav";

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [msg, setMsg] = useState("");

  const load = () => getUsers().then(setUsers);
  useEffect(() => {
    load();
  }, []);

  const remove = async (id) => {
    if (window.confirm("Delete this user account?")) {
      try {
        await deleteUser(id);
        setMsg("User account deleted.");
        setTimeout(() => setMsg(""), 2500);
        load();
      } catch (err) {
        setMsg(err.response?.data?.message || "Could not delete user.");
      }
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) =>
      `${u.name} ${u.email} ${u.phone || ""} ${u.role}`.toLowerCase().includes(q)
    );
  }, [users, query]);

  return (
    <section className="section admin-page">
      <AdminNav />

      <div className="page-title">
        <span className="section-kicker">ADMIN / CUSTOMERS</span>
        <h1>Manage users.</h1>
        <p>{users.length} registered accounts.</p>
      </div>

      <div className="admin-filter-bar">
        <div className="search-box">
          <Search size={17} />
          <input
            placeholder="Search name, email or phone..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {msg && <div className="toast" style={{ marginBottom: 14 }}>{msg}</div>}

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Joined</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id}>
                <td>
                  <b>{u.name}</b>
                  <small>#{u.id}</small>
                </td>
                <td>{u.email}</td>
                <td>{u.phone || "—"}</td>
                <td>
                  <span className="role-chip">{u.role}</span>
                </td>
                <td>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}</td>
                <td>
                  {u.role !== "ADMIN" && (
                    <button
                      type="button"
                      className="danger-btn"
                      title="Delete user"
                      onClick={() => remove(u.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
