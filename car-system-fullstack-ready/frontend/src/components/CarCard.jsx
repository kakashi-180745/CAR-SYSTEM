import { Link } from "react-router-dom";
import { Heart, ArrowUpRight } from "lucide-react";
import { useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function CarCard({car}){
  const {user}=useAuth(); const [liked,setLiked]=useState(false);
  const toggle=async(e)=>{e.preventDefault();e.stopPropagation(); if(!user){window.location.href="/login";return;} try{ if(liked) await api.delete(`/wishlist/${car.id}`); else await api.post(`/wishlist/${car.id}`); setLiked(!liked);}catch{}};
  return <article className="car-card">
    <Link to={`/cars/${car.id}`} className="car-image-wrap"><img src={car.imageUrl} alt={`${car.brand} ${car.model}`} onError={(e)=>e.currentTarget.src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=80"}/><button className={"heart-btn "+(liked?"liked":"")} onClick={toggle}><Heart size={18} fill={liked?"currentColor":"none"}/></button><span className="available">{car.available?"Available":"Sold"}</span></Link>
    <div className="car-card-body"><div className="eyebrow">{car.year} · {car.bodyType}</div><h3>{car.brand} {car.model}</h3><div className="spec-row"><span>{car.fuelType}</span><span>{car.transmission}</span><span>{car.mileage} km/l</span></div><div className="market-line"><span>Market: {car.marketCountry || "Global"}</span>{car.marketPrice && car.currency && <span>{car.currency} {Number(car.marketPrice).toLocaleString(undefined,{maximumFractionDigits:0})}</span>}</div><div className="card-bottom"><strong>₹{Number(car.price).toLocaleString("en-IN")}</strong><span className="view-link">View <ArrowUpRight size={16}/></span></div></div>
  </article>
}
