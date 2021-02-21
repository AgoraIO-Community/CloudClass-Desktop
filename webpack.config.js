const threadLoader = require("thread-loader");
const webpack = require("webpack");
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const glob = require('glob-all');

const config = require('dotenv').config().parsed

if(!config) {
  throw new Error(`${require('dotenv').config().error}`)
}

// const HtmlWebpackPlugin = require("html-webpack-plugin");
// const ModuleFederationPlugin = require("webpack").container
//   .ModuleFederationPlugin;
const path = require("path");

module.exports = {
  entry: {
    edu_sdk: "./src/edu-sdk/index.ts",
  },
  mode: "production",
  output: {
    publicPath: '',
    filename: '[name].bundle.js',
    libraryTarget: "umd",
    path: path.resolve(__dirname, 'dist'),
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".scss", ".css"],
    alias: {
      '@': path.resolve(__dirname, 'src'),
    }
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
                "@babel/preset-react",
                "@babel/preset-typescript"
              ],
            }
          }, 
          {
            loader: "thread-loader",
            options: {
            }
          }
        ],
        exclude: /node_modules/,
      },
      {
        test: /\.(scss|css)$/i,
        use: [
          // process.env.NODE_ENV === 'production' ? {
          //   loader: MiniCssExtractPlugin.loader,
          //   options: { publicPath: '' },
          // } : {
          //   loader: 'style-loader',
          //   options: {
          //     // cacheDirectory: false,
          //   }
          // },
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
            // options: {}
          },
          {
            loader: 'sass-loader',
            // options: {}
          },
          {
            loader: 'thread-loader',
          }
        ]
        // use: ["style-loader", "css-loader", "sass-loader", "thread-loader"],
        // loader: 'style-loader!css-loader!sass-loader'
        // use: [
        //   "style-loader",
        //   "css-loader",
        //   "sass-loader"
        // ],
      },
      {
        test: /\.(png|jpe?g|gif|svg|mp4|webm|ogg|mp3|wav|flac|aac|woff|woff2|eot|ttf)$/,
        // exclude: /node_modules/,
        loader: "url-loader",
        // options: {
          // limit: 2*1024,
          // name: '[name].[hash:7].[ext]'
          // name: 'agora',
          // name: argv.paths.image,
          // limit: 2 * 1024,
        // },
      },
    ],
  },
  optimization: {
    minimizer: [
        new TerserPlugin({
            parallel: true,
        }),
        new OptimizeCssAssetsPlugin({
            assetNameRegExp: /\.css$/g,
            cssProcessorOptions: {
                safe: true,
                autoprefixer: { disable: true },
                mergeLonghand: false,
                discardComments: {
                    removeAll: true
                }
            },
            canPrint: true
        })
    ]
},
  plugins: [
    new MiniCssExtractPlugin(),
    new webpack.DefinePlugin({
      REACT_APP_AGORA_RECORDING_OSS_URL: JSON.stringify(config.REACT_APP_AGORA_RECORDING_OSS_URL),
      REACT_APP_AGORA_GTM_ID: JSON.stringify(config.REACT_APP_AGORA_GTM_ID),
      REACT_APP_BUILD_VERSION: JSON.stringify(config.REACT_APP_BUILD_VERSION),
      REACT_APP_NETLESS_APP_ID: JSON.stringify(config.REACT_APP_NETLESS_APP_ID),
      REACT_APP_AGORA_APP_ID: JSON.stringify(config.REACT_APP_AGORA_APP_ID),
      REACT_APP_AGORA_CUSTOMER_ID: JSON.stringify(config.REACT_APP_AGORA_CUSTOMER_ID),
      REACT_APP_AGORA_CUSTOMER_CERTIFICATE: JSON.stringify(config.REACT_APP_AGORA_CUSTOMER_CERTIFICATE),
      REACT_APP_AGORA_APP_TOKEN: JSON.stringify(config.REACT_APP_AGORA_APP_TOKEN),
      REACT_APP_AGORA_LOG: JSON.stringify(config.REACT_APP_AGORA_LOG),

      REACT_APP_AGORA_APP_SDK_DOMAIN: JSON.stringify(config.REACT_APP_AGORA_APP_SDK_DOMAIN),
      REACT_APP_YOUR_OWN_OSS_BUCKET_KEY: JSON.stringify(""),
      REACT_APP_YOUR_OWN_OSS_BUCKET_SECRET: JSON.stringify(""),
      REACT_APP_YOUR_OWN_OSS_BUCKET_NAME: JSON.stringify(""),
      REACT_APP_YOUR_OWN_OSS_CDN_ACCELERATE: JSON.stringify(""),
      REACT_APP_YOUR_OWN_OSS_BUCKET_FOLDER: JSON.stringify(""),
      // 'process': 'utils'
    }),
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
        ],
      }
    })
  ],
};