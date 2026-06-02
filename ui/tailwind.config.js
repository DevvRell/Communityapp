/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['"Instrument Serif"', 'Georgia', 'ui-serif', 'serif'],
      },
      transitionTimingFunction: {
        // out-expo-ish: snappy enter, soft exit
        brand: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      transitionDuration: {
        250: '250ms',
        400: '400ms',
        600: '600ms',
      },
      colors: {
        // CB 5 Connect brand palette
        // forest = deep civic green (#1e3a2e is 700)
        // gold   = warm amber accent (#d49a1c is 500)
        // cream  = ivory neutral (#f4ede0 is 100)
        forest: {
          50:  '#e8efeb',
          100: '#c7d4cc',
          200: '#9eb5a8',
          300: '#75967f',
          400: '#4d7860',
          500: '#356048',
          600: '#28503a',
          700: '#1e3a2e',   // brand
          800: '#172e24',
          900: '#10211a',
          950: '#0a1611',
        },
        gold: {
          50:  '#fdf7e7',
          100: '#fbeec1',
          200: '#f6dc88',
          300: '#ecc14d',
          400: '#dfaa2c',
          500: '#d49a1c',   // brand
          600: '#b07d14',
          700: '#896014',
          800: '#6a4a16',
          900: '#503816',
        },
        cream: {
          50:  '#fbf8f1',
          100: '#f4ede0',   // brand
          200: '#ebe0c8',
          300: '#dfcfa8',
          400: '#cbb37b',
          500: '#b59854',
          600: '#967a3f',
          700: '#735e32',
          800: '#534428',
          900: '#3a301c',
        },
        // Keep primary/secondary aliases pointing at the new brand so
        // existing components keep working without a rewrite.
        primary: {
          50:  '#e8efeb',
          100: '#c7d4cc',
          200: '#9eb5a8',
          300: '#75967f',
          400: '#4d7860',
          500: '#356048',
          600: '#28503a',
          700: '#1e3a2e',
          800: '#172e24',
          900: '#10211a',
        },
        secondary: {
          50:  '#fdf7e7',
          100: '#fbeec1',
          200: '#f6dc88',
          300: '#ecc14d',
          400: '#dfaa2c',
          500: '#d49a1c',
          600: '#b07d14',
          700: '#896014',
          800: '#6a4a16',
          900: '#503816',
        },
      },
    },
  },
  plugins: [],
} 