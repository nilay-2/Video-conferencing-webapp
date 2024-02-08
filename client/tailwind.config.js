/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      width: {
        chat: "35rem",
      },
      backgroundImage: {
        landing_page: "url('../public/landing_page_img.png')",
      },
    },
  },
  plugins: [],
};
