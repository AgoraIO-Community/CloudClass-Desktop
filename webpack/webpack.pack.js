const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const webpackMerge = require('webpack-merge');
const path = require('path');
const webpack = require('webpack');
const dotenv = require('dotenv-webpack');
const CopyPlugin = require('copy-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

const baseConfig = require('./webpack.base');
const { ROOT_PATH } = require('./utils/index');
const { pack } = require('./utils/loaders');

const config = {
  mode: 'production',
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
  module: {
    rules: [...pack],
  },
  optimization: {
    minimize: true,
    sideEffects: true,
    nodeEnv: 'production',
    minimizer: [
      new TerserPlugin({
        // parallel: require('os').cpus().length, // 多线程并行构建
        parallel: false,
        extractComments: false,
        terserOptions: {
          keep_classnames: true,
          keep_fnames: true,
          compress: {
            warnings: false, // 删除无用代码时是否给出警告
            drop_debugger: true, // 删除所有的debugger
          },
        },
      }),
      new CssMinimizerPlugin(),
    ],
  },
  plugins: [
    new dotenv({
      path: path.resolve(ROOT_PATH, '../../.env'),
    }),
    new webpack.DefinePlugin({
      NODE_ENV: JSON.stringify('production'),
    }),
    // copy wasm files of Web RTC SDK extension from node_modules
    new CopyPlugin({
      patterns: [
        // ai denoiser
        {
          from: path.resolve(ROOT_PATH, '../../node_modules/agora-extension-ai-denoiser/external'),
          to: path.resolve(ROOT_PATH, './lib/externals/extensions/ai-denoiser'),
          noErrorOnMissing: true,
        },
        //virtual background
        {
          from: path.resolve(
            ROOT_PATH,
            '../../node_modules/agora-extension-virtual-background/wasms',
          ),
          to: path.resolve(
            ROOT_PATH,
            './lib/externals/extensions/agora-extension-virtual-background',
          ),
          noErrorOnMissing: true,
        },
      ],
    }),
    new BundleAnalyzerPlugin(),
  ],
};

const mergedConfig = webpackMerge.merge(baseConfig, config);
module.exports = mergedConfig;
