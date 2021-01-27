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
        exclude: {
          test: /node_modules/,
          // not: [
          //   /@material-ui/
          // ],
        },
        use: [
          {
            loader: "babel-loader",
            options: {
              presets: [
                "@babel/preset-env",
                "@babel/preset-typescript",
                "@babel/preset-react"
              ],
              plugins: [
                [
                  // "babel-plugin-transform-imports",
                  "transform-imports",
                  {
                    '@material-ui/core': {
                      // Use "transform: '@material-ui/core/${member}'," if your bundler does not support ES modules
                      'transform': '@material-ui/core/esm/${member}',
                      'preventFullImport': false,
                      // 'preventFullImport': false
                    },
                    '@material-ui/icons': {
                      // Use "transform: '@material-ui/icons/${member}'," if your bundler does not support ES modules
                      'transform': '@material-ui/icons/esm/${member}',
                      'preventFullImport': false,
                      // 'preventFullImport': false
                    },
                    '@material-ui/lab': {
                      // Use "transform: '@material-ui/lab/${member}'," if your bundler does not support ES modules
                      'transform': '@material-ui/lab/esm/${member}',
                      'preventFullImport': false,
                      // 'preventFullImport': false
                    }
                  }
                ],
                ['@babel/plugin-proposal-decorators', { legacy: true }],
                ['@babel/plugin-proposal-class-properties', { loose: true }],
                ['@babel/plugin-transform-runtime', { regenerator: true }],
              ],
            }
          }
        ],
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