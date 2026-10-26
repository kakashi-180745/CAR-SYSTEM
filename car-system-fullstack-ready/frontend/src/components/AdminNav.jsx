import { NavLink } from "react-router-dom";
import { LayoutDashboard, CarFront, MapPin, MessageSquare, AlertTriangle, Users } from "lucide-react";

const links = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/admin/cars", label: "Cars", icon: CarFront },
  { to: "/admin/showrooms", label: "Showrooms", icon: MapPin },
  { to: "/admin/enquiries", label: "Enquiries", icon: MessageSquare },
  { to: "/admin/reports", label: "Reports", icon: AlertTriangle },
  { to: "/admin/users", label: "Users", icon: Users }
];

export default function AdminNav() {
  return (
    <nav className="admin-subnav" aria-label="Admin sections">
      {links.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) => "admin-subnav-link" + (isActive ? " active" : "")}
        >
          <Icon size={15} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
