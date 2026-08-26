/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        base: {
          950: '#0b0f14',
          900: '#0e131a',
          850: '#091326',
          800: '#161f2c',
          700: '#1c2733',
          600: '#26313f',
          border: '#232e3b',
        },
        amber: {
          400: '#f5a623',
          500: '#f2a71b',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
