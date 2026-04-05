/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // ⚠️ මේ පේළිය අලුතින් එකතු කළා
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "node_modules/flowbite-react/lib/esm/**/*.js",
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('flowbite/plugin'),
  ],
}