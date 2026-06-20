/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#8B2020',
          light: '#A52828',
          dark: '#6B1818',
        },
        accent: {
          DEFAULT: '#F5A800',
          light: '#FFB800',
          dark: '#D98F00',
        },
        surface: '#F9F9F9',
        border: '#E5E7EB',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '12px',
      },
    },
  },
  plugins: [],
}
