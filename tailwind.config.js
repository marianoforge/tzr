/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",

    // Or if using `src` directory:
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBlue: "#1C00CD",
        mediumBlue: "#0077b6",
        lightBlue: "#0096c7",
        lightPink: "#FEEFEE",
        lightGreen: "#E6FAF5",
        redAccent: "#EE5D50",
        greenAccent: "#04B574",
        mutedBlue: "#a3aed0",
      },
      fontFamily: {
        sans: ["DM Sans", "sans-serif"],
      },
    },
  },
  plugins: [],
};
