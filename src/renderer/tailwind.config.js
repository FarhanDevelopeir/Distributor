// src/renderer/tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  theme: {
    extend: {
      colors: {
        // Primary blue palette — entire app uses these
        primary: {
          50:  '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        // Neutral grays (blue-tinted)
        surface: {
          50:  '#f8faff',
          100: '#f0f4ff',
          200: '#e8eeff',
          300: '#d1deff',
        },
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      fontSize: {
        '2xs': ['10px', '14px'],
        xs:   ['11px', '16px'],
        sm:   ['12px', '18px'],
        base: ['13px', '20px'],
        md:   ['14px', '20px'],
        lg:   ['15px', '22px'],
        xl:   ['16px', '24px'],
        '2xl':['18px', '26px'],
        '3xl':['20px', '28px'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(30,64,175,0.06), 0 1px 2px -1px rgba(30,64,175,0.04)',
        'card-md': '0 4px 6px -1px rgba(30,64,175,0.08), 0 2px 4px -2px rgba(30,64,175,0.05)',
        'card-lg': '0 10px 15px -3px rgba(30,64,175,0.10), 0 4px 6px -4px rgba(30,64,175,0.06)',
      },
      borderRadius: {
        DEFAULT: '6px',
        lg: '8px',
        xl: '12px',
      },
    },
  },
  plugins: [],
};
