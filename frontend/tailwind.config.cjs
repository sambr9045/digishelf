/** @type {import('tailwindcss').Config} */
module.exports = {
  important: true,
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f9f3f7",
          100: "#f3e7f0",
          600: "#551839",
          700: "#44122d",
        },
        accent: "#10ac84",
        text: {
          primary: "#231b2a",
          secondary: "#615768",
        },
        border: {
          soft: "#e4dfe8",
        },
        bg: {
          page: "#f7f7fa",
          surface: "#ffffff",
        },
      },
      fontFamily: {
        inter: ["Inter", "Poppins", "Roboto", "sans-serif"],
      },
      spacing: {
        120: "120px",
      },
    },
  },
  plugins: [],
};
