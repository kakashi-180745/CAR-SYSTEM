import { Link } from "react-router-dom";
import { ArrowRight, MapPin, ShieldCheck, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { getCars } from "../services/carService";
import CarCard from "../components/CarCard";

export default function Home(){
  const [cars,setCars]=useState([]); const [inventory,setInventory]=useState(0);
  useEffect(()=>{getCars().then(d=>{setInventory(d.length);setCars(d.slice(0,6))}).catch(()=>{});},[]);
  return <div>
    <section className="hero"><div className="hero-inner"><div className="hero-copy"><span className="pill"><Sparkles size={14}/> A smarter way to buy a car</span><h1>Drive something<br/><em>worth remembering.</em></h1><p>Browse premium cars, compare your options and connect with a showroom near you — all in one clean experience.</p><div className="hero-actions"><Link className="btn btn-dark" to="/cars">Explore cars <ArrowRight size={18}/></Link><Link className="btn btn-light" to="/showrooms"><MapPin size={17}/> Find a showroom</Link></div></div><div className="hero-visual"><div className="hero-image-card"><img src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1500&q=85" alt="Premium car"/></div><div className="floating-stat"><strong>{inventory ? inventory.toLocaleString()+"+" : "1,200+"}</strong><span>Global cars to discover</span></div></div></div></section>
    <section className="trust-strip"><div><ShieldCheck/> <span><b>1,200+ vehicle listings</b><small>Real-world model nameplates across segments</small></span></div><div><MapPin/><span><b>60+ global showroom points</b><small>Explore major automotive cities worldwide</small></span></div><div><Sparkles/><span><b>Global market view</b><small>Country, currency and reference values</small></span></div></section>
    <section className="section"><div className="section-head"><div><span className="section-kicker">GLOBAL COLLECTION</span><h2>Cars worth a closer look.</h2><p className="section-subtitle">From everyday hatchbacks to flagship performance cars — browse a worldwide reference inventory.</p></div><Link className="text-link" to="/cars">View all cars <ArrowRight size={16}/></Link></div><div className="car-grid">{cars.map(c=><CarCard key={c.id} car={c}/>)}</div></section>
    <section className="cta"><div><span className="section-kicker">VISIT IN PERSON</span><h2>Your next car is closer than you think.</h2><p>Use our showroom map to find the nearest location and plan your visit.</p><Link className="btn btn-light" to="/showrooms">Explore showrooms <ArrowRight size={17}/></Link></div></section>
  </div>
}
