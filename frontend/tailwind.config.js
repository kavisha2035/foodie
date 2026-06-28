/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: "#D97706",        // Premium Dark Yellow / Amber
        "brand-dark": "#B45309",   // Deep Mustard / Dark Amber
        "brand-light": "#FEF3C7",  // Soft Yellow / cream background highlights
      }
    },
  },
  plugins: [],
}
