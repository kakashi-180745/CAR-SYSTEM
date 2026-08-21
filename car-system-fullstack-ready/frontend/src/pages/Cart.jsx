import { useEffect,useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Trash2 } from "lucide-react";
import api from "../services/api";
import { getCars } from "../services/carService";

export default function Cart(){const [items,setItems]=useState([]);const [cars,setCars]=useState([]);
const load=()=>Promise.all([api.get("/cart"),getCars()]).then(([a,c])=>{setItems(a.data);setCars(c)});
useEffect(()=>{load()},[]);
const remove=async(id)=>{await api.delete(`/cart/${id}`);load()};
const rows=items.map(i=>({...i,car:cars.find(c=>c.id===i.carId)})).filter(x=>x.car);const total=rows.reduce((s,x)=>s+Number(x.car.price)*x.quantity,0);
return <section className="section"><div className="page-title"><span className="section-kicker">YOUR SHORTLIST</span><h1>Cart & enquiry list.</h1><p>Keep cars ready for your next showroom conversation.</p></div>{rows.length?<div className="cart-layout"><div className="cart-list">{rows.map(x=><div className="cart-row" key={x.id}><img src={x.car.imageUrl} alt=""/><div><span>{x.car.brand}</span><h3>{x.car.model}</h3><small>Quantity: {x.quantity}</small></div><strong>₹{Number(x.car.price).toLocaleString("en-IN")}</strong><button onClick={()=>remove(x.carId)}><Trash2 size={17}/></button></div>)}</div><aside className="summary-card"><span>ESTIMATED TOTAL</span><h2>₹{total.toLocaleString("en-IN")}</h2><p>Prices are indicative. Final pricing is confirmed by the showroom.</p><Link className="btn btn-dark" to="/showrooms">Find showroom <ArrowRight size={16}/></Link></aside></div>:<div className="empty-state"><h3>Your cart is empty</h3><p>Add cars you want to discuss with a showroom.</p><Link className="btn btn-dark" to="/cars">Browse cars <ArrowRight size={16}/></Link></div>}</section>}
