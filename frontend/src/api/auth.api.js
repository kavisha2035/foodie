import api from "./axios";

export const registerUser = (data) => api.post("/api/auth/register", data);
export const loginUser = (data) => api.post("/api/auth/login", data);
export const logoutUser = () => api.get("/api/auth/logout");

export const registerPartner = (data) => api.post("/api/auth/food-partner/register", data);
export const loginPartner = (data) => api.post("/api/auth/food-partner/login", data);
export const logoutPartner = () => api.get("/api/auth/food-partner/logout");
