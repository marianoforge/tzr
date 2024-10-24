/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',

    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        darkBlue: '#3f37c9',
        mediumBlue: '#0077b6',
        lightBlue: '#00b4d8',
        lightPink: '#FEEFEE',
        lightGreen: '#E6FAF5',
        redAccent: '#EE5D50',
        greenAccent: '#04B574',
        mutedBlue: '#a3aed0',
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
