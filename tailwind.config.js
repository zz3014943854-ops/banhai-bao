/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "\"Microsoft YaHei\"", "sans-serif"],
        display: ["\"Noto Serif SC\"", "\"Microsoft YaHei\"", "serif"],
      },
      colors: {
        ink: "#0b0b0d",
        panel: "#151519",
        line: "#2a2a31",
        brand: "#e23b36",
        gold: "#efb84a",
        cyan: "#53c8c3",
      },
      boxShadow: {
        glow: "0 16px 42px rgba(226, 59, 54, 0.23)",
      },
    },
  },
  plugins: [],
};
