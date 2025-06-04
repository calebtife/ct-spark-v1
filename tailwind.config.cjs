/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  mode: 'jit',
  theme: {
    extend: {
      boxShadow: {
        'custom': '0 4px 6px rgba(6, 6, 64, 0.1), 0 1px 3px rgba(6, 6, 64, 0.08)', // Custom shadow
      },
    },
  },
  plugins: [],
}