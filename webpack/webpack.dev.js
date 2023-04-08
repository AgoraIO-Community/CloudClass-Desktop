const webpackMerge = require('webpack-merge');

const baseConfig = require('./webpack.base');
const { dev } = require('./utils/loaders');

const config = {
  module: {
    rules: [...dev],
  },
};

const mergedConfig = webpackMerge.merge(baseConfig, config);
module.exports = mergedConfig;
