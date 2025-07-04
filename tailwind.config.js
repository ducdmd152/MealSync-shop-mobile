/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: "jit",
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  // purge: [
  //   "./public/**/*.html",
  //   "./app/**/*.{js,jsx,ts,tsx}",
  //   "./components/**/*.{js,jsx,ts,tsx}",
  // ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#DF4830",
          100: "#fd6246",
          200: "#fd6246",
          300: "#e95137",
          400: "#df4830",
          500: "#d53f29",
          600: "#cb3622",
          700: "#c22c1b",
        },
        secondary: {
          DEFAULT: "#FF9C01",
          100: "#FF9001",
          200: "#FF8E01",
        },
        shadow: {
          DEFAULT: "#df473093",
          100: "#df473071",
          200: "#df473044",
          300: "#df473025",
        },
        text: {
          DEFAULT: "#323643",
          100: "#232533",
          200: "#1E1E2D",
          900: "#FFFFFF",
        },
        tertiary: "#9EA1B1",
        cyan: "#227B94",
        black: {
          DEFAULT: "#000",
          100: "#1E1E2D",
          200: "#232533",
        },
        gray: {
          100: "#CDCDE0",
        },
      },
    },
  },
  plugins: [],
};
