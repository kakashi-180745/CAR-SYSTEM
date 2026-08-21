import { useEffect,useState } from "react";
import { Link,useNavigate,useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Heart, MapPin, MessageCircle, ShoppingBag } from "lucide-react";
import { getCar } from "../services/carService";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function CarDetails(){
 const {id}=useParams();const [car,setCar]=useState(null);const [sent,setSent]=useState(false);const [message,setMessage]=useState("");const {user}=useAuth();const navigate=useNavigate();
 useEffect(()=>{getCar(id).then(setCar)},[id]);
 if(!car)return <div className="page-loader"><div className="spinner"/></div>;
 const addCart=async()=>{if(!user)return navigate("/login");await api.post(`/cart/${id}`,{quantity:1});setSent(true);setMessage("Added to your cart.");setTimeout(()=>setMessage(""),1800)};
 const enquire=async()=>{if(!user)return navigate("/login");await api.post("/enquiries",{carId:Number(id),message:"I am interested in this car. Please contact me."});setSent(true);setMessage("Enquiry sent successfully.");setTimeout(()=>setMessage(""),1800)};
 return <section className="section detail-page"><Link className="back-link" to="/cars"><ArrowLeft size={16}/> Back to cars</Link><div className="detail-grid"><div className="detail-image"><img src={car.imageUrl} alt={`${car.brand} ${car.model}`}/></div><div className="detail-copy"><span className="eyebrow">{car.year} · {car.bodyType}</span><h1>{car.brand} {car.model}</h1><div className="detail-price">₹{Number(car.price).toLocaleString("en-IN")}</div><p>{car.description}</p><div className="spec-grid"><div><span>Fuel</span><b>{car.fuelType}</b></div><div><span>Transmission</span><b>{car.transmission}</b></div><div><span>Mileage</span><b>{car.mileage} km/l</b></div><div><span>Status</span><b>{car.available?"Available":"Sold"}</b></div></div><div className="detail-actions"><button disabled={!car.available} className="btn btn-dark" onClick={addCart}>{car.available?<><ShoppingBag size={17}/> Add to cart</>:"Not available"}</button><button className="btn btn-outline" onClick={enquire}><MessageCircle size={17}/> {car.available?"Enquire":"Ask about availability"}</button><button className="icon-outline" onClick={async()=>{if(!user)return navigate("/login");await api.post(`/wishlist/${id}`);setMessage("Saved to wishlist.");setTimeout(()=>setMessage(""),1500)}}><Heart size={19}/></button></div><div className="detail-note"><CheckCircle2 size={18}/><span>{car.available?"Verified listing":"Currently not available"} · <Link to="/showrooms">Find a showroom near you</Link> · <Link to="/reports">Report an issue</Link></span></div>{message&&<div className="toast">{message}</div>}</div></div></section>
}
