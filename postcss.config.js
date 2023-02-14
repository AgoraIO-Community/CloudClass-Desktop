// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const autoprefixer = require('autoprefixer');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const tailwindcss = require('tailwindcss');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const tailwindConfig = require('./tailwind.config');
const postcssPxToViewport = require('./webpack/postcss-plugin/px-to-vw');

module.exports = {
  plugins: [
    autoprefixer(),
    tailwindcss(tailwindConfig),
    postcssPxToViewport({
      viewportWidth: 375,
      unitPrecision: 3,
      viewportUnit: 'vw',
      fontViewportUnit: 'vw',
      include: [/\/mobile\//, /\.mobile\./],
      exclude: [/\/node_modules\//i],
      landscape: true, // 是否处理横屏情况
      landscapeUnit: 'vw', // (String) 横屏时使用的单位
      landscapeWidth: 667, // (Number) 横屏时使用的视口宽度
      landscapeHeight: 375, // (Number) 横屏时使用的视口宽度
    }),
  ],
};
