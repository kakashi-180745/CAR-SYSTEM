import api from "./api";
export const getUsers=()=>api.get("/users").then(r=>r.data);
export const updateUser=(id,data)=>api.put(`/users/${id}`,data).then(r=>r.data);
export const deleteUser=(id)=>api.delete(`/users/${id}`);
export const getMyProfile=()=>api.get("/users/me").then(r=>r.data);
export const updateMyProfile=(data)=>api.put("/users/me",data).then(r=>r.data);
