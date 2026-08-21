import api from "./api";
export const getReports=()=>api.get("/reports").then(r=>r.data);
export const getMyReports=()=>api.get("/reports/mine").then(r=>r.data);
export const createReport=(data)=>api.post("/reports",data).then(r=>r.data);
export const updateReport=(id,data)=>api.patch(`/reports/${id}`,data).then(r=>r.data);
