import api from "./axios";

export const getFeed = (cursor) =>
  api.get("/api/feed", { params: { cursor, limit: 10 } });

export const getStories = () => api.get("/api/feed/stories");

export const getTrending = (city) =>
  api.get("/api/feed/trending", { params: { city } });

export const logInteraction = (foodId, data) =>
  api.post(`/api/food/${foodId}/interact`, data);
// data = { action: 'watch'|'like'|'save'|'share'|'skip'|'order', watchPercentage: 0-100 }
