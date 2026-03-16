/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./App.tsx",
    "./index.tsx",
    "./services/**/*.{ts,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./hooks/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
