/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ncb: {
          dark: "#0b132b",
          navy: "#1c2541",
          blue: "#3a506b",
          accent: "#48cae4",
          gold: "#f77f00",
          alert: "#d62828",
          emerald: "#10b981"
        }
      }
    },
  },
  plugins: [],
}
