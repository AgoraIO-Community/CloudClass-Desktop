const threadLoader = require("thread-loader");
const webpack = require("webpack");
const TerserPlugin = require('terser-webpack-plugin');
// const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const HtmlWebpackPlugin = require('html-webpack-plugin');

const path = require("path");

const env = process.env.NODE_ENV || 'production'

console.log(`webpack.config.js loaded ${env}`)

module.exports = {
  entry: {
    ['index']: "./src/index.ts"
  },
  mode: env,
  output: {
    publicPath: '',
    // filename: '[name].js',
    filename: '[name].js',
    libraryTarget: "umd",
    path: path.resolve(__dirname, 'lib'),
  },
  resolve: {
    extensions: [".ts", ".js", ".tsx"],
    alias: {
      '@': path.resolve(__dirname, 'src'),
    }
  },
  devServer: {
    watchOptions: {
      ignored: /node_modules/
    },
    watchContentBase: true,
    contentBase: path.resolve(__dirname, 'lib'),
    compress: true,
    hot: true,
    port: process.env.CVA_PORT
  },
  module: {
    rules: [
      {
        test: /\.ts(x)?$/,
        use: [
          {
            loader: "babel-loader",
            options: {
              presets: [
                "@babel/preset-env",
                "@babel/preset-react",
                "@babel/preset-typescript"
              ],
              plugins: [
                ['@babel/plugin-proposal-decorators', { legacy: true }],
                ['@babel/plugin-proposal-class-properties', { loose: true }],
                ['@babel/plugin-transform-runtime', { regenerator: true }],
              ],
            }
          }
        ],
        exclude: /node_modules/,
      }
    ],
  },
  optimization: {
    minimizer: [
        new TerserPlugin({
            parallel: true,
        })
    ]
},
  plugins: [
    new HardSourceWebpackPlugin({
      root: process.cwd(),
      directories: [],
      environmentHash: {
        root: process.cwd(),
        directories: [],
        files: [
          'package.json',
          'package-lock.json',
          'yarn.lock',
          '.env',
          '.env.local',
          'env.local',
          'config-overrides.js',
          'webpack.config.js',
          'tsconfig.json',
        ],
      }
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'index.html')
    })
  ],
};