/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#F7F4F0',
        surface: '#FFFFFF',
        primary: {
          DEFAULT: '#8B2020',
          hover: '#7A1A1A',
          light: '#A52828',
          dark: '#6B1818',
        },
        accent: {
          DEFAULT: '#F5A800',
          light: '#FFB800',
          dark: '#D98F00',
        },
        border: '#E5E7EB',
        error: '#DC2626',
        success: '#16A34A',
      },
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '8px',
        btn: '10px',
        modal: '16px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
        'card-elevated': '0 4px 12px rgba(0,0,0,0.10), 0 2px 4px rgba(0,0,0,0.06)',
        modal: '0 8px 32px rgba(0,0,0,0.14)',
      },
    },
  },
  plugins: [],
}
