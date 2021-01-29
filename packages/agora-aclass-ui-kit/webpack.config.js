const threadLoader = require("thread-loader");
const webpack = require("webpack");
const TerserPlugin = require('terser-webpack-plugin');
// const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const path = require("path");

module.exports = {
  entry: {
    ['main.js']: "./src/index.ts",
  },
  mode: "production",
  externals: /^(react|react-dom)$/,
  output: {
    publicPath: '',
    // filename: '[name].js',
    filename: 'index.js',
    libraryTarget: "commonjs",
    path: path.resolve(__dirname, 'lib'),
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx"],
    alias: {
      'src': path.resolve(__dirname, 'src'),
    }
  },
  module: {
    rules: [
      {
        test: /\.ts(x)?$/,
        use: 'babel-loader',
        exclude: {
          test: /node_modules/,
          // not: [
          //   /@material-ui/
          // ],
        },
      },
      {
        test: /\.(png|jpe?g|gif|svg|mp4|webm|ogg|mp3|wav|flac|aac|woff|woff2|eot|ttf)$/,
        loader: "url-loader",
      },
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
    })
  ],
};