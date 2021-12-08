const webpackMerge = require('webpack-merge');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const path = require('path');
const { InjectManifest } = require('workbox-webpack-plugin');
const webpack = require('webpack');
const dotenv = require('dotenv-webpack');

const { ROOT_PATH } = require('./utils/index');
const packageJson = require('../package.json');
const { swSrcPath = '' } = packageJson;
const template = path.resolve(ROOT_PATH, './public/index.html');
const entry = path.resolve(ROOT_PATH, './src/index.tsx');
const baseConfig = require('./webpack.base');

const config = {
  mode: 'production',
  entry: entry,
  output: {
    path: path.resolve(ROOT_PATH, './build'),
    publicPath: './',
    filename: 'static/bundle-[contenthash].js',
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: '../',
            },
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
        type: 'asset',
        generator: {
          filename: './assets/[name].[hash:8].[ext]',
        },
      },
    ],
  },
  optimization: {
    minimize: true,
    nodeEnv: 'production',
    minimizer: [
      new TerserPlugin({
        parallel: require('os').cpus().length,
        extractComments: false,
        terserOptions: {
          compress: {
            warnings: false,
            drop_debugger: true,
          },
        },
      }),
      new CssMinimizerPlugin(),
    ],
    splitChunks: {
      chunks: 'all',
    },
  },
  plugins: [
    new dotenv({
      path: './.env',
    }),
    new MiniCssExtractPlugin({
      filename: 'static/[name].[contenthash].css',
    }),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: template,
      inject: true,
    }),
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(ROOT_PATH, './public'),
          to: path.resolve(ROOT_PATH, './build'),
          globOptions: {
            ignore: ['**/index.html'],
          },
          noErrorOnMissing: true,
        },
      ],
    }),
    new webpack.DefinePlugin({
      NODE_ENV: JSON.stringify('production'),
    }),
  ],
};

const mergedConfig = webpackMerge.merge(baseConfig, config);
module.exports = mergedConfig;
