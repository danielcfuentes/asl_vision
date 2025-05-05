/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#FAF9F6', // light cream
          surface: '#FFFFFF', // white
        },
        border: {
          DEFAULT: '#111111', // black
        },
        text: {
          primary: '#111111', // black
          secondary: '#222222', // dark gray
        },
        accent: {
          success: '#059669',
          error: '#E11D48',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
      },
      boxShadow: {
        card: '0 2px 12px 0 rgba(0,0,0,0.08)',
      },
    },
  },
  plugins: [],
} 