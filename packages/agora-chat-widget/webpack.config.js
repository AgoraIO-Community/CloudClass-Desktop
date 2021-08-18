const threadLoader = require('thread-loader');
const webpack = require('webpack');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const { GenerateSW, InjectManifest } = require('workbox-webpack-plugin');
//const dayjs = require('dayjs')
const path = require('path');
const { DefinePlugin } = require('webpack');
const autoprefixer = require('autoprefixer');
//const tailwindcss = require('tailwindcss')

const packageInfo = require('./package.json');

// const swSrcPath = packageInfo.swSrcPath

let version = packageInfo.version;
let apaasBuildEnv = process.env.AGORA_APAAS_BUILD_ENV;
if (apaasBuildEnv) {
  // const date = dayjs().format('YYMMDD')
  // const translator = short()
  // const hash = translator.new()
  version = `${packageInfo.version}`;
  // if(apaasBuildEnv === 'test') {
  //   version=`test-${packageInfo.version}`
  // } else if(apaasBuildEnv === 'preprod') {
  //   version=`preprod-${packageInfo.version}`
  // } else if(apaasBuildEnv === 'prod') {
  //   version=`${packageInfo.version}`
  // }
}

const config = require('dotenv').config().parsed;

// const packageInfo = require('./package.json')

// const swSrcPath = packageInfo.swSrcPath

const babelConfig = packageInfo.babel;

// const HtmlWebpackPlugin = require("html-webpack-plugin");
// const ModuleFederationPlugin = require("webpack").container
//   .ModuleFederationPlugin;

module.exports = {
  entry: {
    hx_im: './src/index.js',
    // edu_sdk: "./src/infra/api/index.tsx",
  },
  mode: 'production',
  output: {
    publicPath: '',
    filename: '[name].bundle.js',
    libraryTarget: 'umd',
    // library: "HXIM",
    library: 'HxIm',
    path: path.resolve(__dirname, 'lib'),
  },
  resolve: {
    extensions: ['.js', '.jsx'],
    // alias: {
    //   ['@']: path.resolve(__dirname, 'src'),
    //   '~core': path.resolve(__dirname, 'src/core'),
    //   '~ui-kit': path.resolve(__dirname, '../agora-scenario-ui-kit/src'),
    //   '~components': path.resolve(__dirname, '../agora-scenario-ui-kit/src/components'),
    //   '~styles': path.resolve(__dirname, '../agora-scenario-ui-kit/src/styles'),
    //   '~utilities': path.resolve(__dirname, '../agora-scenario-ui-kit/src/utilities'),
    //   '~capabilities': path.resolve(__dirname, 'src/ui-kit/capabilities'),
    //   '~capabilities/containers': path.resolve(__dirname, 'src/ui-kit/capabilities/containers'),
    //   '~capabilities/hooks': path.resolve(__dirname, 'src/ui-kit/capabilities/hooks'),
    //   'agora-rte-sdk': path.resolve(__dirname, '../agora-rte-sdk/src'),
    //   'agora-edu-core': path.resolve(__dirname, '../agora-edu-core/src'),
    //   'agora-plugin-gallery': path.resolve(__dirname, '../agora-plugin-gallery/src'),
    //   'agora-widget-gallery': path.resolve(__dirname, '../agora-widget-gallery/src'),
    // }
  },
  module: {
    rules: [
      {
        test: /\.js(x)?$/i,
        use: [
          {
            loader: 'babel-loader',
            options: {
              ...babelConfig,
              // presets: [
              //   "@babel/preset-react",
              //   "@babel/preset-typescript"
              // ]
            },
          },
          {
            loader: 'thread-loader',
          },
        ],
        // exclude: /node_modules|(\.(stories.ts)x?$)/,
        // exclude: [
        //   // path.resolve('node_modules'),
        //   {
        //     test: /\.stories.ts?x$/i,
        //   }
        // ]
      },
      // webpack.config.js
      {
        test: /\.css$/,
        exclude: [/node_modules/],
        use: [
          'style-loader',
          // 'css-loader'
          {
            loader: 'css-loader',
            options: {
              modules: true,
              // localIdentName: '[local]_[hash:base64:8]'
              // localIdentName: '[name]__[local]--[hash:base64:5]'
              // minimize: true
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              // ident: 'postcss',
              plugins: (loader) => [
                // require('postcss-import')({ root: loader.resourcePath }),
                require('postcss-cssnext')(),
                // require('autoprefixer')(),
                // require('cssnano')()
              ],
            },
          },
        ],
      },
      {
        test: /\.css$/,
        exclude: [/src/],
        use: ['style-loader', 'css-loader'],
      },

      // {
      //   test: /\.css$/,
      //   use: [
      //     'style-loader',
      //     // {
      //     //   loader: 'style-loader',
      //     // },
      //     {
      //       loader: 'css-loader',
      //       options: {
      //         importLoaders: 1, // 0 => 无 loader(默认); 1 => postcss-loader; 2 => postcss-loader, sass-loader
      //       },
      //     },
      //     // {
      //     //   loader: "postcss-loader",
      //     //   options: {
      //     //     postcssOptions: {
      //     //       ident: 'postcss',
      //     //       config: path.resolve(__dirname, './postcss.config.js')
      //     //       // plugins: [
      //     //       //   tailwindcss(),
      //     //       //   autoprefixer()
      //     //       // ]
      //     //     }
      //     //   }
      //     // },
      //     {
      //       loader: 'thread-loader',
      //     },
      //     // {
      //     //   loader: 'thread-loader',
      //     // }
      //   ],
      // },
      {
        test: /\.(png|jpe?g|gif|svg|mp4|webm|ogg|mp3|wav|flac|aac|woff|woff2|eot|ttf)$/,
        // exclude: /node_modules/,
        loader: 'url-loader',
        options: {
          esModule: false,
          // limit: 1024
        },
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
      // {
      //   test: /\.(png|jpe?g|gif|svg|mp4|webm|ogg|mp3|wav|flac|aac|woff|woff2|eot|ttf)$/,
      //   // exclude: /node_modules/,
      //   loader: "url-loader",
      //   options: {
      //     esModule: false,
      //     // limit: 1024
      //   }
      // },
      // // fix: https://github.com/gildas-lormeau/zip.js/issues/212#issuecomment-769766135
      // {
      //   test: /\.js$/,
      //   loader: require.resolve('@open-wc/webpack-import-meta-loader'),
      // }
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
            removeAll: true,
          },
        },
        canPrint: true,
      }),
    ],
  },
  plugins: [
    // new BundleAnalyzerPlugin(),
    new MiniCssExtractPlugin(),
    // new DefinePlugin({
    //   // 'REACT_APP_AGORA_APP_SDK_DOMAIN': JSON.stringify(process.env.REACT_APP_AGORA_APP_SDK_DOMAIN),
    //   // 'REACT_APP_AGORA_APP_SDK_LOG_SECRET': JSON.stringify(process.env.REACT_APP_AGORA_APP_SDK_DOMAIN)
    //   REACT_APP_AGORA_APP_RECORD_URL: JSON.stringify(config.REACT_APP_AGORA_APP_RECORD_URL),
    //   REACT_APP_AGORA_RESTFULL_TOKEN: JSON.stringify(config.REACT_APP_AGORA_RESTFULL_TOKEN),
    //   REACT_APP_AGORA_RECORDING_OSS_URL: JSON.stringify(config.REACT_APP_AGORA_RECORDING_OSS_URL),
    //   REACT_APP_AGORA_GTM_ID: JSON.stringify(config.REACT_APP_AGORA_GTM_ID),
    //   REACT_APP_BUILD_VERSION: JSON.stringify(version),
    //   REACT_APP_PUBLISH_DATE: JSON.stringify(dayjs().format('YYYY-MM-DD')),
    //   REACT_APP_NETLESS_APP_ID: JSON.stringify(config.REACT_APP_NETLESS_APP_ID),
    //   REACT_APP_AGORA_APP_ID: JSON.stringify(config.REACT_APP_AGORA_APP_ID),
    //   REACT_APP_AGORA_APP_CERTIFICATE: config.hasOwnProperty('REACT_APP_AGORA_APP_CERTIFICATE') ? JSON.stringify(`${config.REACT_APP_AGORA_APP_CERTIFICATE}`) : JSON.stringify(""),
    //   REACT_APP_AGORA_APP_TOKEN: JSON.stringify(config.REACT_APP_AGORA_APP_TOKEN),
    //   REACT_APP_AGORA_CUSTOMER_ID: JSON.stringify(config.REACT_APP_AGORA_CUSTOMER_ID),
    //   REACT_APP_AGORA_CUSTOMER_CERTIFICATE: JSON.stringify(config.REACT_APP_AGORA_CUSTOMER_CERTIFICATE),
    //   REACT_APP_AGORA_LOG: JSON.stringify(config.REACT_APP_AGORA_LOG),

    //   REACT_APP_AGORA_APP_SDK_DOMAIN: JSON.stringify(config.REACT_APP_AGORA_APP_SDK_DOMAIN),
    //   REACT_APP_YOUR_OWN_OSS_BUCKET_KEY: JSON.stringify(config.REACT_APP_YOUR_OWN_OSS_BUCKET_KEY),
    //   REACT_APP_YOUR_OWN_OSS_BUCKET_SECRET: JSON.stringify(config.REACT_APP_YOUR_OWN_OSS_BUCKET_SECRET),
    //   REACT_APP_YOUR_OWN_OSS_BUCKET_NAME: JSON.stringify(config.REACT_APP_YOUR_OWN_OSS_BUCKET_NAME),
    //   REACT_APP_YOUR_OWN_OSS_CDN_ACCELERATE: JSON.stringify(config.REACT_APP_YOUR_OWN_OSS_CDN_ACCELERATE),
    //   REACT_APP_YOUR_OWN_OSS_BUCKET_FOLDER: JSON.stringify(config.REACT_APP_YOUR_OWN_OSS_BUCKET_FOLDER),
    //   REACT_APP_AGORA_RESTFULL_TOKEN: JSON.stringify(config.REACT_APP_AGORA_RESTFULL_TOKEN),
    //   AGORA_APAAS_BRANCH_PATH: config.hasOwnProperty('AGORA_APAAS_BRANCH_PATH') ? JSON.stringify(`${process.env.AGORA_APAAS_BRANCH_PATH}`) : JSON.stringify(""),
    //   REACT_APP_REPORT_URL: config.hasOwnProperty('REACT_APP_REPORT_URL') ? JSON.stringify(`${config.REACT_APP_REPORT_URL}`) : JSON.stringify(""),
    //   REACT_APP_REPORT_QOS: config.hasOwnProperty('REACT_APP_REPORT_QOS') ? JSON.stringify(`${config.REACT_APP_REPORT_QOS}`) : JSON.stringify(""),
    // }),
    // new webpack.DefinePlugin({
    //   REACT_APP_AGORA_GTM_ID: JSON.stringify(config.REACT_APP_AGORA_GTM_ID),
    //   REACT_APP_BUILD_VERSION: JSON.stringify(config.REACT_APP_BUILD_VERSION),
    //   REACT_APP_NETLESS_APP_ID: JSON.stringify(config.REACT_APP_NETLESS_APP_ID),
    //   REACT_APP_AGORA_APP_ID: JSON.stringify(config.REACT_APP_AGORA_APP_ID),
    //   REACT_APP_AGORA_CUSTOMER_ID: JSON.stringify(config.REACT_APP_AGORA_CUSTOMER_ID),
    //   REACT_APP_AGORA_CUSTOMER_CERTIFICATE: JSON.stringify(config.REACT_APP_AGORA_CUSTOMER_CERTIFICATE),
    //   REACT_APP_AGORA_APP_TOKEN: JSON.stringify(config.REACT_APP_AGORA_APP_TOKEN),
    //   REACT_APP_AGORA_LOG: JSON.stringify(config.REACT_APP_AGORA_LOG),

    //   REACT_APP_AGORA_APP_SDK_DOMAIN: JSON.stringify(config.REACT_APP_AGORA_APP_SDK_DOMAIN),
    //   REACT_APP_YOUR_OWN_OSS_BUCKET_KEY: JSON.stringify(""),
    //   REACT_APP_YOUR_OWN_OSS_BUCKET_SECRET: JSON.stringify(""),
    //   REACT_APP_YOUR_OWN_OSS_BUCKET_NAME: JSON.stringify(""),
    //   REACT_APP_YOUR_OWN_OSS_CDN_ACCELERATE: JSON.stringify(""),
    //   REACT_APP_YOUR_OWN_OSS_BUCKET_FOLDER: JSON.stringify(""),
    //   // 'process': 'utils'
    // }),
    // new HardSourceWebpackPlugin({
    //   root: process.cwd(),
    //   directories: [],
    //   environmentHash: {
    //     root: process.cwd(),
    //     directories: [],
    //     files: [
    //       'package.json',
    //       'package-lock.json',
    //       'yarn.lock',
    //       '.env',
    //       '.env.local',
    //       'env.local',
    //       'config-overrides.js',
    //       'webpack.config.js',
    //     ],
    //   }
    // })
  ],
};
