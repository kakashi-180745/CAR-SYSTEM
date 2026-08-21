import api from "./api";
export const getShowrooms = () => api.get("/showrooms").then(r=>r.data);
export const createShowroom = (data) => api.post("/showrooms",data).then(r=>r.data);
export const updateShowroom = (id,data) => api.put(`/showrooms/${id}`,data).then(r=>r.data);
export const deleteShowroom = (id) => api.delete(`/showrooms/${id}`);
