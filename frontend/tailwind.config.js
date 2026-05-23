/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkblue: '#1a3c5e',
        brandgreen: '#4CAF93'
      }
    },
  },
  plugins: [],
}
