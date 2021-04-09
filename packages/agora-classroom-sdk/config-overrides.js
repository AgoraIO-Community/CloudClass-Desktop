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
const path = require('path')
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin')
const { GenerateSW, InjectManifest } = require('workbox-webpack-plugin')

function findSWPrecachePlugin(element) {
  return element.constructor.name === 'GenerateSW';
}

function removeSWPrecachePlugin(config) {
  const swPrecachePluginIndex = config.plugins.findIndex(findSWPrecachePlugin);
  if (swPrecachePluginIndex !== -1) {
    config.plugins.splice(swPrecachePluginIndex, 1); // mutates
  }
}

exports.removeSWPrecachePlugin = removeSWPrecachePlugin;
exports.findSWPrecachePlugin = findSWPrecachePlugin;

const useSW = () => (config) => {
  removeSWPrecachePlugin(config);
  config.plugins.push(
    //precacheAndRoute(self.__precacheManifest)
    new InjectManifest({
      // injectionPoint: '__WB_MANIFEST',
      // importWorkboxFrom: 'local',
      // importsDirectory: path.join(__dirname, 'public'),
      swSrc: path.join(__dirname, './src/sw/service-worker.ts'),
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
  );
  return config;
}

const dotenv = require('dotenv')
const {DefinePlugin} = require('webpack')
const addWebpackTarget = target => config => {
  config.target = target
  return config
}


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

// fix: https://github.com/gildas-lormeau/zip.js/issues/212#issuecomment-769766135
const fixZipCodecIssue = () => config => {
  config.module.rules.push({
    test: /\.js$/,
    loader: require.resolve('@open-wc/webpack-import-meta-loader'),
  })
  return config
}

const useOptimizeBabelConfig = () => config => {
  const rule = {
    test: /\.(ts)x?$/i,
    include: [
      path.resolve("src")
    ],
    use: [
      'thread-loader', 'cache-loader', getBabelLoader(config).loader,
    ],
    exclude: [
      path.resolve("node_modules"),
      path.resolve("src/sw"),
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
  // fixBabelImports("import", [
  //   {
  //     libraryName: "@material-ui/core",
  //     libraryDirectory: "esm",
  //     camel2DashComponentName: false
  //   },
  //   {
  //     libraryName: "@material-ui/icon",
  //     libraryDirectory: "esm",
  //     camel2DashComponentName: false
  //   }
  // ]),
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
    REACT_APP_AGORA_RESTFULL_TOKEN: JSON.stringify(config.REACT_APP_AGORA_RESTFULL_TOKEN)
  })),
  // addWebpackPlugin(
  //   new SimpleProgressWebpackPlugin()
  // ),
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
    path.resolve("node_modules"),
    // path.resolve("src/sw")
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
  useSW(),
  fixZipCodecIssue(),
  useOptimizeBabelConfig(),
  addWebpackAlias({
    ['@']: path.resolve(__dirname, 'src')
  }),
)
