const path = require('path');
const autoprefixer = require('autoprefixer');
const tailwindcss = require('tailwindcss');

module.exports = {
  plugins: [autoprefixer(), tailwindcss(path.resolve(__dirname, './tailwind.config.js'))],
};
