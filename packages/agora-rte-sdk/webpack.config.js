const threadLoader = require('thread-loader');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
// const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const packageJson = require('./package.json');

const path = require('path');

const isProd = true;
// const isProd = process.env.NODE_ENV === 'production'

module.exports = {
  externals: {
    dayjs: 'dayjs',
    'agora-electron-sdk': 'commonjs2 agora-electron-sdk',
  },
  entry: {
    ['agora-rte-sdk']: './src/index.ts',
  },
  mode: isProd ? 'production' : 'development',
  output: {
    publicPath: '',
    // filename: '[name].js',
    filename: 'index.js',
    libraryTarget: 'umd',
    path: path.resolve(__dirname, 'lib'),
  },
  resolve: {
    extensions: ['.ts', '.js'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  module: {
    rules: [
      {
        test: /\.ts(x)?$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env', '@babel/preset-typescript'],
              plugins: [
                ['@babel/plugin-proposal-decorators', { legacy: true }],
                ['@babel/plugin-proposal-class-properties', { loose: true }],
                ['@babel/plugin-transform-runtime', { regenerator: true }],
              ],
            },
          },
        ],
        exclude: /node_modules/,
      },
    ],
  },
  optimization: {
    minimizer: [
      new TerserPlugin({
        parallel: require('os').cpus().length,
      }),
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      RTE_SDK_VERSION: JSON.stringify(packageJson.version),
    }),
  ],
};
