import { useEffect,useState } from "react";
import { Link } from "react-router-dom";
import { Heart, ArrowRight } from "lucide-react";
import api from "../services/api";
import { getCars } from "../services/carService";
import CarCard from "../components/CarCard";

export default function Wishlist(){const [cars,setCars]=useState([]);useEffect(()=>{Promise.all([api.get("/wishlist"),getCars()]).then(([w,c])=>{const ids=new Set(w.data.map(x=>x.carId));setCars(c.filter(x=>ids.has(x.id)))})},[]);
return <section className="section"><div className="page-title"><span className="section-kicker">SAVED CARS</span><h1>Your wishlist.</h1><p>Keep the cars you are seriously considering in one place.</p></div>{cars.length?<div className="car-grid">{cars.map(c=><CarCard key={c.id} car={c}/>)}</div>:<div className="empty-state"><Heart size={30}/><h3>Your wishlist is empty</h3><p>Save a car from the inventory and it will appear here.</p><Link className="btn btn-dark" to="/cars">Browse cars <ArrowRight size={16}/></Link></div>}</section>}
