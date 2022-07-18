// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const autoprefixer = require('autoprefixer');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const tailwindcss = require('tailwindcss');

module.exports = {
  plugins: [autoprefixer(), tailwindcss(path.resolve(__dirname, './tailwind.config.js'))],
};
