/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {},
    fontFamily: {
      typewriter: ["Roboto Slab", "serif"],
      lato: ["Lato", "serif"],
      inter: ["Inter", "serif"],
      mono: [
        "ui-monospace",
        "SFMono-Regular",
        "Menlo",
        "Monaco",
        "Consolas",
        "Liberation Mono",
        "Courier New",
        "monospace",
      ],
    },
    // screens: {
    //   "2xl": "1729px",
    // },
  },
  plugins: [require("@tailwindcss/typography")],
};
