const webpackMerge = require('webpack-merge');
const path = require('path');
const baseConfig = require('agora-common-libs/presets/webpack.config.base.js');
const ROOT_PATH = path.resolve(__dirname, './');
const config = {
  entry: {
    edu_sdk: './src/infra/api/index.tsx',
  },
  output: {
    path: path.resolve(ROOT_PATH, 'lib'),
    publicPath: './',
    filename: '[name].bundle.js',
    libraryTarget: 'umd',
    clean: true,
  },
  resolve: {
    alias: {
      '@classroom': path.resolve(ROOT_PATH, './src'),
      'agora-classroom-sdk': path.resolve(ROOT_PATH, './src/infra/api'),
    },
  },
};

const mergedConfig = webpackMerge.merge(baseConfig, config);
module.exports = mergedConfig;
