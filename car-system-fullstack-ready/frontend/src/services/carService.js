import api from "./api";
export const getCars = (params={}) => api.get("/cars",{params}).then(r=>r.data);
export const getCar = (id) => api.get(`/cars/${id}`).then(r=>r.data);
export const createCar = (data) => api.post("/cars",data).then(r=>r.data);
export const updateCar = (id,data) => api.put(`/cars/${id}`,data).then(r=>r.data);
export const deleteCar = (id) => api.delete(`/cars/${id}`);
