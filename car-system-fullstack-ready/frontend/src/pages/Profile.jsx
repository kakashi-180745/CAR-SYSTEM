import {useEffect,useState} from "react";
import {Mail,Phone,ShieldCheck,UserRound,Camera,Save,LockKeyhole} from "lucide-react";
import {getMyProfile,updateMyProfile} from "../services/userService";
import api from "../services/api";
import {useAuth} from "../context/AuthContext";

export default function Profile(){
 const{user,setUser}=useAuth();
 const[data,setData]=useState(user||{});
 const[password,setPassword]=useState("");
 const[uploading,setUploading]=useState(false);
 const[msg,setMsg]=useState("");
 useEffect(()=>{getMyProfile().then(u=>{setData(u);setUser(u)}).catch(()=>{})},[]);
 const upload=async e=>{
  const file=e.target.files?.[0]; if(!file)return;
  setUploading(true);
  try{
   const fd=new FormData(); fd.append("file",file);
   const{data:u}=await api.post("/profile/image",fd,{headers:{"Content-Type":"multipart/form-data"}});
   setData(u);setUser(u);setMsg("Profile image updated.");
  }catch(err){setMsg(err.response?.data?.message||"Could not upload image.");}
  finally{setUploading(false)}
 };
 const save=async e=>{
  e.preventDefault();
  try{const u=await updateMyProfile({...data,password});setData(u);setUser(u);setPassword("");setMsg("Profile updated successfully.");setTimeout(()=>setMsg(""),1800)}
  catch(err){setMsg(err.response?.data?.message||"Could not update profile.")}
 };
 return <section className="section narrow-page profile-page">
  <div className="page-title profile-page-title">
   <span className="section-kicker">ACCOUNT</span>
   <h1>Your profile.</h1>
   <p>Manage your personal details and profile image in one place.</p>
  </div>

  <form className="profile-card" onSubmit={save}>
   <aside className="profile-sidebar">
    <div className="profile-avatar">
     {data.profileImage
      ? <img src={data.profileImage.startsWith("http")?data.profileImage:`${import.meta.env.VITE_API_URL || "http://localhost:8080"}${data.profileImage}`} alt="Profile"/>
      : <UserRound size={34}/>
     }
    </div>
    <div className="profile-identity">
     <h2>{data.name||"Your name"}</h2>
     <span className="role-chip"><ShieldCheck size={13}/>{data.role||"USER"}</span>
    </div>
    <label className="profile-image-btn">
     <Camera size={16}/>
     <span>{uploading?"Uploading...":"Change profile image"}</span>
     <input type="file" accept="image/*" onChange={upload} disabled={uploading}/>
    </label>
    <p className="profile-image-note">JPG, PNG or WebP. Choose a clear image for your account.</p>
   </aside>

   <div className="profile-main">
    <div className="profile-main-head">
     <div>
      <span className="profile-eyebrow">PERSONAL DETAILS</span>
      <h2>Account information</h2>
     </div>
     <span className="profile-status"><span/>Active account</span>
    </div>

    <div className="profile-fields">
     <label className="profile-field">
      <span className="profile-field-label"><UserRound size={15}/>Name</span>
      <input value={data.name||""} onChange={e=>setData({...data,name:e.target.value})}/>
     </label>

     <div className="profile-field profile-field-readonly">
      <span className="profile-field-label"><Mail size={15}/>Email</span>
      <div className="profile-readonly-value">{data.email||"—"}</div>
      <small>Email cannot be changed here.</small>
     </div>

     <label className="profile-field">
      <span className="profile-field-label"><Phone size={15}/>Phone</span>
      <input value={data.phone||""} onChange={e=>setData({...data,phone:e.target.value})} inputMode="tel"/>
     </label>

     <label className="profile-field">
      <span className="profile-field-label"><LockKeyhole size={15}/>New password</span>
      <input type="password" minLength="8" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Leave blank to keep current"/>
      <small>Optional · minimum 8 characters.</small>
     </label>
    </div>

    <div className="profile-actions">
     <span className="profile-hint">Your changes are saved securely to your account.</span>
     <button className="btn btn-dark" disabled={uploading}><Save size={16}/>Save changes</button>
    </div>
    {msg&&<div className="toast profile-toast">{msg}</div>}
   </div>
  </form>
 </section>
}
