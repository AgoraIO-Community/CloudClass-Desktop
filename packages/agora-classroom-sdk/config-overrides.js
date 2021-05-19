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
  addPostcssPlugins,
  addWebpackAlias,
  addDecoratorsLegacy,
  addBabelPresets,
  adjustStyleLoaders,
  // addWebpackTarget,
} = require('customize-cra')
const autoprefixer = require('autoprefixer')
const tailwindcss = require('tailwindcss')
const path = require('path')
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin')
const { GenerateSW, InjectManifest } = require('workbox-webpack-plugin')
const short = require('short-uuid');
const dayjs = require('dayjs')
const fs = require('fs')

const packageInfo = require('./package.json')

const swSrcPath = packageInfo.swSrcPath

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

const addStyleLoader = () => (config) => {
  config.module.rules.push({
    test: /\.css$/,
    exclude: /node_modules/,
    include: path.resolve(__dirname, 'src'),
    use: [
      // No need for "css-loader" nor "style-loader"
      // for CRA will later apply them anyways.
      {
        loader: "postcss-loader",
        options: {
          postcssOptions: {
            ident: 'postcss',
            config: path.resolve(__dirname, './postcss.config.js')
            // plugins: [
            //   tailwindcss(),
            //   autoprefixer()
            // ]
          }
        }
      }
    ],
  });
  // config.module.rules.push(
  //   {
  //     test: /\.svg$/,
  //     use: ['@svgr/webpack'],
  //   }
  // )
  return config;
}

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
  console.log('node version', process.version)
  // config.devtool = 'none'
  config.devtool = 'source-map'
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

  // const plugins = [require('tailwindcss'), require('autoprefixer')]

  // const rules = config.module.rules.find(rule => Array.isArray(rule.oneOf))
  //   .oneOf;
  // rules.forEach(
  //   r =>
  //     r.use &&
  //     Array.isArray(r.use) &&
  //     r.use.forEach(u => {
  //       if (u.options && u.options.ident === "postcss") {
  //         if (!u.options.plugins) {
  //           u.options.plugins = () => [...plugins];
  //         }
  //         if (u.options.plugins) {
  //           const originalPlugins = u.options.plugins;
  //           u.options.plugins = () => [...originalPlugins(), ...plugins];
  //         }
  //       }
  //     })
  // );
  const rule = {
    test: /\.(ts)x?$/i,
    include: [
      path.resolve("src")
    ],
    // exclude: /\.(stories.ts)x?$/i,
    use: [
      'thread-loader', 'cache-loader', getBabelLoader(config).loader,
    ],
    exclude: /node_modules|(\.(stories.ts)x?$)/,
    // exclude: [
    //   path.resolve("node_modules"),
    //   path.resolve("src/sw"),
    // ],
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

const getToday = () => {
  const today = new Date()
  return `${today.getFullYear()}${today.getMonth()+1}${today.getDate()}`
}

const exportWebpackConfig = () => config => {
  fs.writeFileSync("./webpack.cra.js", JSON.stringify(config))
  return config;
}

const removeEslint = () => config => {
  config.plugins = config.plugins.filter(
    (plugin) => plugin.constructor.name !== "ESLintWebpackPlugin",
  );
  return config;
}

let version = packageInfo.version
let apaasBuildEnv = process.env.AGORA_APAAS_BUILD_ENV
if(apaasBuildEnv) {
  const date = dayjs().format('YYMMDD')
  const translator = short()
  const hash = translator.new()
  if(apaasBuildEnv === 'test') {
    version=`test-${packageInfo.version}-${date}${hash}`
  } else if(apaasBuildEnv === 'preprod') {
    version=`preprod-${packageInfo.version}-${date}${hash}`
  }
}

const webpackConfig = override(
  // useBabelRc(),
  // isElectron && addWebpackTarget('electron-renderer'),
  addDecoratorsLegacy(),
  disableEsLint(),
  removeEslint(),
  webWorkerConfig(),
  sourceMap(),
  addWebpackModuleRule({
    test: /\.worker\.js$/,
    use: { loader: 'worker-loader' },
  }),
  addWebpackExternals(setElectronDeps),
  adjustStyleLoaders((loader) => {
    loader.exclude = [
      /node_modules/,
      path.resolve(__dirname, 'src', 'ui-kit', 'components', 'chat')
    ]
  }),
  addStyleLoader(),
  addWebpackPlugin(new DefinePlugin({
    // 'REACT_APP_AGORA_APP_SDK_DOMAIN': JSON.stringify(process.env.REACT_APP_AGORA_APP_SDK_DOMAIN),
    // 'REACT_APP_AGORA_APP_SDK_LOG_SECRET': JSON.stringify(process.env.REACT_APP_AGORA_APP_SDK_DOMAIN)
    REACT_APP_AGORA_APP_RECORD_URL: JSON.stringify(config.REACT_APP_AGORA_APP_RECORD_URL),
    REACT_APP_AGORA_RESTFULL_TOKEN: JSON.stringify(config.REACT_APP_AGORA_RESTFULL_TOKEN),
    REACT_APP_AGORA_RECORDING_OSS_URL: JSON.stringify(config.REACT_APP_AGORA_RECORDING_OSS_URL),
    REACT_APP_AGORA_GTM_ID: JSON.stringify(config.REACT_APP_AGORA_GTM_ID),
    REACT_APP_BUILD_VERSION: JSON.stringify(version),
    REACT_APP_PUBLISH_DATE: JSON.stringify(dayjs().format('YYYY-MM-DD')),
    REACT_APP_NETLESS_APP_ID: JSON.stringify(config.REACT_APP_NETLESS_APP_ID),
    REACT_APP_AGORA_APP_ID: JSON.stringify(config.REACT_APP_AGORA_APP_ID),
    REACT_APP_AGORA_APP_CERTIFICATE: config.hasOwnProperty('REACT_APP_AGORA_APP_CERTIFICATE') ? JSON.stringify(`${config.REACT_APP_AGORA_APP_CERTIFICATE}`) : JSON.stringify(""),
    REACT_APP_AGORA_APP_TOKEN: JSON.stringify(config.REACT_APP_AGORA_APP_TOKEN),
    REACT_APP_AGORA_CUSTOMER_ID: JSON.stringify(config.REACT_APP_AGORA_CUSTOMER_ID),
    REACT_APP_AGORA_CUSTOMER_CERTIFICATE: JSON.stringify(config.REACT_APP_AGORA_CUSTOMER_CERTIFICATE),
    REACT_APP_AGORA_LOG: JSON.stringify(config.REACT_APP_AGORA_LOG),

    REACT_APP_AGORA_APP_SDK_DOMAIN: JSON.stringify(config.REACT_APP_AGORA_APP_SDK_DOMAIN),
    REACT_APP_YOUR_OWN_OSS_BUCKET_KEY: JSON.stringify(config.REACT_APP_YOUR_OWN_OSS_BUCKET_KEY),
    REACT_APP_YOUR_OWN_OSS_BUCKET_SECRET: JSON.stringify(config.REACT_APP_YOUR_OWN_OSS_BUCKET_SECRET),
    REACT_APP_YOUR_OWN_OSS_BUCKET_NAME: JSON.stringify(config.REACT_APP_YOUR_OWN_OSS_BUCKET_NAME),
    REACT_APP_YOUR_OWN_OSS_CDN_ACCELERATE: JSON.stringify(config.REACT_APP_YOUR_OWN_OSS_CDN_ACCELERATE),
    REACT_APP_YOUR_OWN_OSS_BUCKET_FOLDER: JSON.stringify(config.REACT_APP_YOUR_OWN_OSS_BUCKET_FOLDER),
    REACT_APP_AGORA_RESTFULL_TOKEN: JSON.stringify(config.REACT_APP_AGORA_RESTFULL_TOKEN),
    AGORA_APAAS_BRANCH_PATH: config.hasOwnProperty('AGORA_APAAS_BRANCH_PATH') ? JSON.stringify(`${process.env.AGORA_APAAS_BRANCH_PATH}`) : JSON.stringify(""),
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
    {
      test: /\.stories.ts?x$/i,
    }
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
  useSW(),
  fixZipCodecIssue(),
  useOptimizeBabelConfig(),
  addWebpackAlias({
    ['@']: path.resolve(__dirname, 'src'),
    '~core': path.resolve(__dirname, 'src/core'),
    '~ui-kit': path.resolve(__dirname, 'src/ui-kit'),
    '~components': path.resolve(__dirname, 'src/ui-kit/components'),
    '~styles': path.resolve(__dirname, 'src/ui-kit/styles'),
    '~utilities': path.resolve(__dirname, 'src/ui-kit/utilities'),
    '~capabilities': path.resolve(__dirname, 'src/ui-kit/capabilities'),
    '~capabilities/containers': path.resolve(__dirname, 'src/ui-kit/capabilities/containers'),
    '~capabilities/hooks': path.resolve(__dirname, 'src/ui-kit/capabilities/hooks'),
  }),
  // addBabelPresets(
  //   [
  //     "@babel/env",
  //   ],
  //   "@babel/preset-typescript",
  //   "@babel/preset-react"
  // )
  // exportWebpackConfig()
)

module.exports = webpackConfig