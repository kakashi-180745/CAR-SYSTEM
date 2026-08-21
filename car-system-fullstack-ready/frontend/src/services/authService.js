import api from "./api";

export async function signup(payload) {
  const { data } = await api.post("/auth/signup", payload);
  saveSession(data);
  return data;
}
export async function login(payload) {
  const { data } = await api.post("/auth/login", payload);
  saveSession(data);
  return data;
}
export async function me() {
  const { data } = await api.get("/auth/me");
  return data;
}
export function saveSession(data) {
  localStorage.setItem("car_token", data.token);
  localStorage.setItem("car_user", JSON.stringify({
    id: data.id, name: data.name, email: data.email, role: data.role
  }));
}
export function logout() {
  localStorage.removeItem("car_token");
  localStorage.removeItem("car_user");
}
export function getUser() {
  try { return JSON.parse(localStorage.getItem("car_user") || "null"); }
  catch { return null; }
}
export function isLoggedIn() { return !!localStorage.getItem("car_token"); }
