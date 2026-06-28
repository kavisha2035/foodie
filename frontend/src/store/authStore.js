import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      partner: null,
      setUser: (user) => set({ user }),
      setPartner: (partner) => set({ partner }),
      clearAuth: () => set({ user: null, partner: null }),
    }),
    {
      name: "flavorloop-auth", // key in localStorage
    }
  )
);
