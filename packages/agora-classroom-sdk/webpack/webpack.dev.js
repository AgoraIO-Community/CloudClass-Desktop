const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpackMerge = require('webpack-merge');
const baseConfig = require('./webpack.base');
const path = require('path');
const { DEFAULT_PORT, ROOT_PATH } = require('./utils/index');
const webpack = require('webpack');
const dotenv = require('dotenv-webpack');
const ESLintPlugin = require('eslint-webpack-plugin');

const entry = path.resolve(ROOT_PATH, './src/index.tsx');
const template = path.resolve(ROOT_PATH, './public/index.html');

const config = {
  mode: 'development',
  devtool: 'source-map',
  entry: entry,
  output: {
    publicPath: '/',
    filename: 'bundle-[contenthash].js',
  },
  devServer: {
    compress: true,
    port: DEFAULT_PORT,
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
            options: {},
          },
          {
            loader: 'css-loader',
            options: {
              import: true,
            },
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
          filename: 'static/[name].[hash:8].[ext]',
        },
      },
    ],
  },
  optimization: {
    nodeEnv: 'development',
    splitChunks: {
      chunks: 'all',
    },
  },
  plugins: [
    new dotenv({
      path: './.env',
    }),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: template,
      inject: true,
    }),
    new webpack.DefinePlugin({
      NODE_ENV: JSON.stringify('development'),
    }),
    new ESLintPlugin(),
  ],
};

const mergedConfig = webpackMerge.merge(baseConfig, config);

module.exports = mergedConfig;
