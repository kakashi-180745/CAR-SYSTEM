import { useEffect,useState } from "react";
import { MapContainer,Marker,Popup,TileLayer,useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { ExternalLink, MapPin, Phone, Mail } from "lucide-react";
import { getShowrooms } from "../services/showroomService";

const markerIcon=L.icon({iconUrl:"https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",iconRetinaUrl:"https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",shadowUrl:"https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",iconSize:[25,41],iconAnchor:[12,41]});
function Focus({position}){const map=useMap();useEffect(()=>{if(position)map.flyTo(position,13,{duration:.7})},[position,map]);return null}

export default function Showrooms(){
 const [items,setItems]=useState([]);const [selected,setSelected]=useState(null);
 useEffect(()=>{getShowrooms().then(setItems).catch(()=>{})},[]);
 const center=selected?[selected.latitude,selected.longitude]:[11.8,78.2];
 return <section className="section showroom-page"><div className="page-title"><span className="section-kicker">SHOWROOM NETWORK</span><h1>Come see it in person.</h1><p>Explore {items.length || 60}+ global showroom points, view exact locations and plan your visit.</p></div><div className="showroom-layout"><div className="showroom-list">{items.map(s=><button className={"showroom-card "+(selected?.id===s.id?"selected":"")} key={s.id} onClick={()=>setSelected(s)}><div className="showroom-icon"><MapPin/></div><div><span>{s.city} · {s.country || "Global"}</span><h3>{s.name}</h3><p>{s.address}</p><div className="small-contact">{s.phone&&<span><Phone size={13}/>{s.phone}</span>}{s.email&&<span><Mail size={13}/>{s.email}</span>}</div></div></button>)}</div><div className="map-box"><MapContainer center={center} zoom={7} scrollWheelZoom className="leaflet-map"><TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/><Focus position={selected?[selected.latitude,selected.longitude]:null}/>{items.map(s=><Marker key={s.id} position={[s.latitude,s.longitude]} icon={markerIcon}><Popup><b>{s.name}</b><br/>{s.address}, {s.city}, {s.country || "Global"}<br/><a target="_blank" rel="noreferrer" href={`https://www.openstreetmap.org/?mlat=${s.latitude}&mlon=${s.longitude}#map=16/${s.latitude}/${s.longitude}`}>Open map <ExternalLink size={12}/></a></Popup></Marker>)}</MapContainer></div></div></section>
}
