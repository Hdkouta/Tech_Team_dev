/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",  // ←これ超重要
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
