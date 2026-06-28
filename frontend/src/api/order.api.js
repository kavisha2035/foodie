import api from "./axios";

export const placeOrder = (data) => api.post("/api/orders", data);

export const getUserOrders = () => api.get("/api/orders");

export const getOrderById = (id) => api.get(`/api/orders/${id}`);

export const updateOrderStatus = (id, status) => api.patch(`/api/orders/${id}/status`, { status });

export const getFoodPartnerOrders = (params) => api.get("/api/food-partner/orders", { params });
