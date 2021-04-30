const threadLoader = require("thread-loader");
const webpack = require("webpack");
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const { GenerateSW, InjectManifest } = require('workbox-webpack-plugin')
const autoprefixer = require('autoprefixer')
const tailwindcss = require('tailwindcss')

const config = require('dotenv').config().parsed

const packageInfo = require('./package.json')

const swSrcPath = packageInfo.swSrcPath

const babelConfig = packageInfo.babel

// const HtmlWebpackPlugin = require("html-webpack-plugin");
// const ModuleFederationPlugin = require("webpack").container
//   .ModuleFederationPlugin;
const path = require("path");

module.exports = {
  entry: {
    edu_sdk: "./src/infra/api/index.tsx",
  },
  mode: "production",
  output: {
    publicPath: '',
    filename: '[name].bundle.js',
    libraryTarget: "umd",
    // library: "AgoraEduSDK",
    path: path.resolve(__dirname, 'lib'),
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".css"],
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '~ui-kit': path.resolve(__dirname, 'src/ui-kit'),
      '~components': path.resolve(__dirname, 'src/ui-kit/components'),
      '~styles': path.resolve(__dirname, 'src/ui-kit/styles'),
      '~utilities': path.resolve(__dirname, 'src/ui-kit/utilities'),
      '~capabilities': path.resolve(__dirname, 'src/ui-kit/capabilities'),
      '~capabilities/containers': path.resolve(__dirname, 'src/ui-kit/capabilities/containers'),
      '~capabilities/hooks': path.resolve(__dirname, 'src/ui-kit/capabilities/hooks'),
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
              ...babelConfig
              // presets: [
              //   "@babel/preset-react",
              //   "@babel/preset-typescript"
              // ]
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
        test: /\.css$/i,
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
          },
          {
            loader: "postcss-loader",
            options: {
              postcssOptions: {
                ident: 'postcss',
                // config: path.resolve(__dirname, './postcss.config.js')
                plugins: [
                  tailwindcss(),
                  autoprefixer()
                ]
              }
            }
          },
          {
            loader: 'thread-loader',
          }
        ]
      },
      // {
      //   test: /\.svg$/,
      //   use: ['@svgr/webpack'],
      // }
      // {
      //   test: /\.(module.scss|module.css)$/i,
      //   use: [
      //     {
      //       loader: 'style-loader',
      //     },
      //     {
      //       loader: 'css-loader',
      //       options: {
      //         modules: true,
      //         localIdentName: '[hash:base64:6]',
      //       }
      //     },
      //     {
      //       loader: "postcss-loader",
      //       options: {
      //         postcssOptions: {
      //           ident: 'postcss',
      //           plugins: [
      //             tailwindcss(),
      //             autoprefixer()
      //           ]
      //         }
      //       }
      //     },
      //     // {
      //     //   loader: 'postcss-loader',
      //     //   options: {
      //     //       postcssOptions: {
      //     //           config: path.join(__dirname, './postcss.config.js'),
      //     //       },
      //     //       sourceMap: true,
      //     //   },
      //     // },
      //     {
      //       loader: 'thread-loader',
      //     }
      //   ]
      // },
      {
        test: /\.(png|jpe?g|gif|svg|mp4|webm|ogg|mp3|wav|flac|aac|woff|woff2|eot|ttf)$/,
        // exclude: /node_modules/,
        loader: "url-loader",
        options: {
          esModule: false,
          // limit: 1024
        }
      },
      // fix: https://github.com/gildas-lormeau/zip.js/issues/212#issuecomment-769766135
      {
        test: /\.js$/,
        loader: require.resolve('@open-wc/webpack-import-meta-loader'),
      }
    ],
  },
  optimization: {
    minimizer: [
        new TerserPlugin({
            parallel: require('os').cpus().length,
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
    // new BundleAnalyzerPlugin(),
    new MiniCssExtractPlugin(),
    new webpack.DefinePlugin({
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
    }),
    new InjectManifest({
      // injectionPoint: '__WB_MANIFEST',
      // importWorkboxFrom: 'local',
      // importsDirectory: path.join(__dirname, 'public'),
      swSrc: path.join(__dirname, swSrcPath),
      // swSrc: path.join(process.cwd(), '/src/sw/index.worker.js'),
      swDest: 'serviceWorker.js',
      include: [],
      exclude: [
        /\.map$/,
        /manifest$/,
        /\.htaccess$/,
        /service-worker\.js$/,
        /sw\.js$/,
      ],
    })
  ],
};