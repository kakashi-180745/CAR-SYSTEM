import { Link, NavLink, useNavigate } from "react-router-dom";
import { Heart, MapPin, ShoppingBag, UserRound, LogOut, ShieldCheck, Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const {user,logout}=useAuth(); const navigate=useNavigate(); const [open,setOpen]=useState(false);
  const signout=()=>{logout();navigate("/");setOpen(false);};
  return <header className="navbar">
    <div className="nav-inner">
      <Link className="brand" to="/" onClick={()=>setOpen(false)}><span className="brand-mark">C</span><span>CAR<span>SYSTEM</span></span></Link>
      <button className="menu-btn" onClick={()=>setOpen(!open)}>{open?<X/>:<Menu/>}</button>
      <nav className={open?"nav-links open":"nav-links"}>
        <NavLink to="/cars" onClick={()=>setOpen(false)}>Cars</NavLink>
        <NavLink to="/showrooms" onClick={()=>setOpen(false)}><MapPin size={16}/> Showrooms</NavLink>
        {user && <NavLink to="/wishlist" onClick={()=>setOpen(false)}><Heart size={16}/> Wishlist</NavLink>}
        {user && <NavLink to="/cart" onClick={()=>setOpen(false)}><ShoppingBag size={16}/> Cart</NavLink>}
        {user && <NavLink to="/my-enquiries" onClick={()=>setOpen(false)}>Enquiries</NavLink>}
        {user && <NavLink to="/reports" onClick={()=>setOpen(false)}>Report</NavLink>}
        {user?.role==="ADMIN" && <NavLink to="/admin" onClick={()=>setOpen(false)}><ShieldCheck size={16}/> Admin</NavLink>}
        {user ? <div className="nav-user"><Link to="/profile" onClick={()=>setOpen(false)}><UserRound size={16}/> {user.name.split(" ")[0]}</Link><button onClick={signout}><LogOut size={16}/></button></div>
              : <Link className="nav-login" to="/login" onClick={()=>setOpen(false)}>Sign in</Link>}
      </nav>
    </div>
  </header>
}
