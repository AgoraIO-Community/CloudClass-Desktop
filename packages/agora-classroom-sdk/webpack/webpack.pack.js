const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const webpackMerge = require('webpack-merge');
const { InjectManifest } = require('workbox-webpack-plugin');
const path = require('path');
const webpack = require('webpack');
const dotenv = require('dotenv-webpack');

const baseConfig = require('./webpack.base');
const { ROOT_PATH } = require('./utils/index');
const packageJson = require('../package.json');

const { swSrcPath = '' } = packageJson;

const config = {
  mode: 'production',
  entry: {
    edu_sdk: './src/infra/api/index.tsx',
  },
  output: {
    publicPath: '',
    filename: '[name].bundle.js',
    libraryTarget: 'umd',
    path: path.resolve(ROOT_PATH, 'lib'),
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [
          {
            loader: 'thread-loader',
          },
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
          },
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                ident: 'postcss',
                config: path.resolve(ROOT_PATH, './postcss.config.js'),
              },
            },
          },
        ],
      },
      {
        test: /\.(png|jpe?g|gif|svg|mp4|webm|ogg|mp3|wav|flac|aac|woff|woff2|eot|ttf)$/,
        type: 'asset/inline',
      },
    ],
  },
  optimization: {
    minimize: true,
    sideEffects: true,
    nodeEnv: 'production',
    minimizer: [
      new TerserPlugin({
        parallel: require('os').cpus().length, // 多线程并行构建
        terserOptions: {
          compress: {
            warnings: false, // 删除无用代码时是否给出警告
            drop_debugger: true, // 删除所有的debugger
          },
        },
        extractComments: false,
      }),
      new CssMinimizerPlugin(),
    ],
  },
  plugins: [
    new dotenv({
      path: './.env',
    }),
    new webpack.DefinePlugin({
      NODE_ENV: JSON.stringify('production'),
    }),
  ],
};

const mergedConfig = webpackMerge.merge(baseConfig, config);
module.exports = mergedConfig;
