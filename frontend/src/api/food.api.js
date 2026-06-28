import api from "./axios";

export const createFood = (formData) =>
  api.post("/api/food", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const getFoodItems = () => api.get("/api/food");

export const getFoodById = (id) => api.get(`/api/food/${id}`);

export const updateFood = (id, data) => api.patch(`/api/food/${id}`, data);

export const deleteFood = (id) => api.delete(`/api/food/${id}`);

export const searchFood = (query) => api.get("/api/food/search", { params: { q: query } });

export const filterFood = (params) => api.get("/api/food/filter", { params });

export const toggleLike = (foodId) => api.post("/api/food/like", { foodId });

export const toggleSave = (foodId) => api.post("/api/food/save", { foodId });

export const getSavedFoods = () => api.get("/api/food/save");

export const getFoodPartnerById = (id) => api.get(`/api/food-partner/${id}`);

export const getPartnerReels = () => api.get("/api/food-partner/reels");
