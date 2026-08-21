import { useEffect, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { getCars } from "../services/carService";
import CarCard from "../components/CarCard";

export default function Cars(){
  const [cars,setCars]=useState([]); const [loading,setLoading]=useState(true);
  const [filters,setFilters]=useState({q:"",brand:"",fuelType:"",transmission:"",maxPrice:""});
  const [brands,setBrands]=useState([]);
  const load=async()=>{setLoading(true);try{const d=await getCars(filters);setCars(d);setBrands([...new Set(d.map(x=>x.brand))]);}finally{setLoading(false)}};
  useEffect(()=>{load()},[]);
  const apply=(e)=>{e.preventDefault();load()};
  const clear=()=>{setFilters({q:"",brand:"",fuelType:"",transmission:"",maxPrice:""});setTimeout(load,0)};
  return <section className="section cars-page"><div className="page-title"><span className="section-kicker">INVENTORY</span><h1>Find your next car.</h1><p>Search a curated selection and narrow it down to what fits you.</p></div>
    <form className="filters" onSubmit={apply}><div className="search-box"><Search size={18}/><input placeholder="Search brand or model..." value={filters.q} onChange={e=>setFilters({...filters,q:e.target.value})}/></div>
      <select value={filters.brand} onChange={e=>setFilters({...filters,brand:e.target.value})}><option value="">All brands</option>{brands.map(b=><option key={b}>{b}</option>)}</select>
      <select value={filters.fuelType} onChange={e=>setFilters({...filters,fuelType:e.target.value})}><option value="">Fuel</option><option>Petrol</option><option>Diesel</option><option>Electric</option><option>Hybrid</option></select>
      <select value={filters.transmission} onChange={e=>setFilters({...filters,transmission:e.target.value})}><option value="">Transmission</option><option>Automatic</option><option>Manual</option></select>
      <input type="number" placeholder="Max price" value={filters.maxPrice} onChange={e=>setFilters({...filters,maxPrice:e.target.value})}/>
      <button className="btn btn-dark filter-btn"><SlidersHorizontal size={16}/> Apply</button><button type="button" className="clear-btn" onClick={clear}><X size={15}/> Clear</button>
    </form>
    {loading?<div className="page-loader"><div className="spinner"/></div>:<><div className="result-count"><span>{cars.length.toLocaleString()} vehicles found</span><span className="inventory-live">GLOBAL INVENTORY · 2026 REFERENCE</span></div><div className="car-grid">{cars.map(c=><CarCard key={c.id} car={c}/>)}</div>{cars.length===0&&<div className="empty-state"><h3>Car not available</h3><p>No vehicle matched your search. You can report/request this car and the admin team will review it.</p><a className="btn btn-dark" href="/reports">Report / request car</a></div>}</>}
  </section>
}
