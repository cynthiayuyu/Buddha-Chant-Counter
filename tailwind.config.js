/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        zen: {
          gold: '#d4a373',
          sage: '#6b705c',
          cream: '#fdfbf7',
          dark: '#3a3d35',
        }
      },
    },
  },
  plugins: [],
}
