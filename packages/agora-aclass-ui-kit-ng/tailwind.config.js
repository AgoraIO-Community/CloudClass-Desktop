const colors = require('tailwindcss/colors')

module.exports = {
  purge: ['./src/**/*.{ts,tsx}',],
  darkMode: false, // or 'media' or 'class'
  colors: {
    gray: colors.coolGray,
    blue: "#357BF6",
    red: colors.rose,
    pink: colors.fuchsia,
  },
  theme: {
    extend: {},
  },
  variants: {
    extend: {
      opacity: ['disabled'],
    }
  },
  plugins: [],
}
