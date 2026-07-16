/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  safelist: [
    'text-white',
    'text-turing-navy',
    'text-turing-teal',
    'text-turing-gray',
    'text-turing-light-green',
    'text-turing-dark-green',
    'bg-turing-navy',
    'bg-turing-dark-green',
    'bg-turing-teal',
    'bg-turing-light-green',
    'bg-turing-gray',
    'border-turing-dark-green',
    'border-turing-teal',
    'bg-green-100', 'text-green-800',
    'bg-yellow-100', 'text-yellow-800',
    'bg-red-100', 'text-red-800',
  ],
  theme: {
    extend: {
      colors: {
        'turing-navy': '#1E2E40',
        'turing-gray': '#C7D2D9',
        'turing-dark-green': '#025949',
        'turing-teal': '#07BFA2',
        'turing-light-green': '#4CD9BA',
        'turing-bg': '#F3F4F6'
      }
    },
  },
  plugins: [],
}