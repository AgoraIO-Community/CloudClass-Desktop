const {
  override,
  addWebpackExternals,
  useBabelRc,
  fixBabelImports,
  addWebpackModuleRule,
  addWebpackPlugin,
  disableEsLint,
  babelInclude,
  babelExclude,
  addBundleVisualizer,
  getBabelLoader,
  addWebpackAlias,
  // addWebpackTarget,
} = require('customize-cra')
const PurifyCSS = require('purifycss-webpack')
const glob = require('glob-all')

const dotenv = require('dotenv')
const {DefinePlugin} = require('webpack')
const addWebpackTarget = target => config => {
  config.target = target
  return config
}
const path = require('path')
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin')
const SimpleProgressWebpackPlugin = require( 'simple-progress-webpack-plugin' )

const ProgressBarPlugin = require('progress-bar-webpack-plugin')

const isElectron = process.env.REACT_APP_RUNTIME_PLATFORM === 'electron'

const {devDependencies} = require('./package.json');

// TODO: You can customize your env
// TODO: 这里你可以定制自己的env
const isProd = process.env.ENV === 'production';

const webWorkerConfig = () => config => {
  config.optimization = {
    ...config.optimization,
    noEmitOnErrors: false,
  }
  config.output = {
    ...config.output,
    globalObject: 'this',
  }
  return config
}

const sourceMap = () => config => {
  // TODO: Please use 'source-map' in production environment
  // TODO: 建议上发布环境用 'source-map'
  config.devtool = 'source-map'
  //config.devtool = isProd ? 'source-map' : 'cheap-module-eval-source-map'
  return config;
}

const setElectronDeps = isProd ? {
  ...devDependencies,
  "agora-electron-sdk": "commonjs2 agora-electron-sdk"
} : {
  "agora-electron-sdk": "commonjs2 agora-electron-sdk"
}

const useOptimizeBabelConfig = () => config => {
  const rule = {
    test: /\.(ts)x?$/i,
    include: [
      path.resolve("src")
    ],
    use: [
      'thread-loader', 'cache-loader', getBabelLoader(config).loader
    ],
    exclude: [
      path.resolve("node_modules"),
    ]
  }

  for (let _rule of config.module.rules) {
    if (_rule.oneOf) {
      _rule.oneOf.unshift(rule);
      break;
    }
  }
  return config;
}

const config = process.env

module.exports = override(
  // useBabelRc(),
  // isElectron && addWebpackTarget('electron-renderer'),
  disableEsLint(),
  webWorkerConfig(),
  sourceMap(),
  addWebpackModuleRule({
    test: /\.worker\.js$/,
    use: { loader: 'worker-loader' },
  }),
  addWebpackExternals(setElectronDeps),
  fixBabelImports("import", [
    {
      libraryName: "@material-ui/core",
      libraryDirectory: "esm",
      camel2DashComponentName: false
    },
    {
      libraryName: "@material-ui/icon",
      libraryDirectory: "esm",
      camel2DashComponentName: false
    }
  ]),
  addWebpackPlugin(new DefinePlugin({
    // 'REACT_APP_AGORA_APP_SDK_DOMAIN': JSON.stringify(process.env.REACT_APP_AGORA_APP_SDK_DOMAIN),
    // 'REACT_APP_AGORA_APP_SDK_LOG_SECRET': JSON.stringify(process.env.REACT_APP_AGORA_APP_SDK_DOMAIN)
    REACT_APP_AGORA_RESTFULL_TOKEN: JSON.stringify(config.REACT_APP_AGORA_RESTFULL_TOKEN),
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
    REACT_APP_YOUR_OWN_OSS_BUCKET_KEY: JSON.stringify(config.REACT_APP_YOUR_OWN_OSS_BUCKET_KEY),
    REACT_APP_YOUR_OWN_OSS_BUCKET_SECRET: JSON.stringify(config.REACT_APP_YOUR_OWN_OSS_BUCKET_SECRET),
    REACT_APP_YOUR_OWN_OSS_BUCKET_NAME: JSON.stringify(config.REACT_APP_YOUR_OWN_OSS_BUCKET_NAME),
    REACT_APP_YOUR_OWN_OSS_CDN_ACCELERATE: JSON.stringify(config.REACT_APP_YOUR_OWN_OSS_CDN_ACCELERATE),
    REACT_APP_YOUR_OWN_OSS_BUCKET_FOLDER: JSON.stringify(config.REACT_APP_YOUR_OWN_OSS_BUCKET_FOLDER),
  })),
  addWebpackPlugin(
    new SimpleProgressWebpackPlugin()
  ),
  // addWebpackPlugin(
  //   new PurifyCSS({
  //     paths: glob.sync([
  //       path.resolve(__dirname, './*.html'),
  //       path.resolve(__dirname, './src/pages/*.tsx'),
  //       path.resolve(__dirname, './src/components/*.tsx'),
  //       path.resolve(__dirname, './src/components/**/*.tsx'),
  //       path.resolve(__dirname, './src/**/*.ts'),
  //       path.resolve(__dirname, './src/*.ts')
  //     ])
  //   })
  // ),
  babelInclude([
    path.resolve("src")
  ]),
  babelExclude([
    path.resolve("node_modules")
  ]),
  addWebpackPlugin(
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
  ),
  // addBundleVisualizer({
  //   // "analyzerMode": "static",
  //   // "reportFilename": "report.html"
  // }, true),
  useOptimizeBabelConfig(),
  addWebpackAlias({
    ['@']: path.resolve(__dirname, 'src')
  }),
)
