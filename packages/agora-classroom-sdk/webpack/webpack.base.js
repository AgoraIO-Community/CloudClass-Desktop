const { ROOT_PATH } = require('./utils/index');
const path = require('path');
const webpack = require('webpack');
const dayjs = require('dayjs');
const webpackbar = require('webpackbar');
const dotenv = require('dotenv-webpack');
const packageJson = require('../package.json');
const { env } = process;

const eduCoreVersion = require('../../agora-edu-core/package.json').version;
const rteVersion = require('../../agora-rte-sdk/package.json').version;
const classroomSdkVersion = require('../package.json').version;

// const {
//   REACT_APP_AGORA_APP_RECORD_URL = '',
//   REACT_APP_AGORA_RESTFULL_TOKEN = '',
//   REACT_APP_AGORA_RECORDING_OSS_URL = '',
//   REACT_APP_AGORA_GTM_ID = '',
//   REACT_APP_NETLESS_APP_ID = '',
//   REACT_APP_AGORA_APP_ID = '',
//   REACT_APP_AGORA_APP_CERTIFICATE = '',
//   REACT_APP_AGORA_APP_TOKEN = '',
//   REACT_APP_AGORA_CUSTOMER_ID = '',
//   REACT_APP_AGORA_CUSTOMER_CERTIFICATE = '',
//   REACT_APP_AGORA_LOG = '',
//   REACT_APP_AGORA_APP_SDK_DOMAIN = '',
//   REACT_APP_YOUR_OWN_OSS_BUCKET_KEY = '',
//   REACT_APP_YOUR_OWN_OSS_BUCKET_SECRET = '',
//   REACT_APP_YOUR_OWN_OSS_BUCKET_NAME = '',
//   REACT_APP_YOUR_OWN_OSS_CDN_ACCELERATE = '',
//   REACT_APP_YOUR_OWN_OSS_BUCKET_FOLDER = '',
//   AGORA_APAAS_BRANCH_PATH = env.AGORA_APAAS_BRANCH_PATH || '',
//   REACT_APP_REPORT_URL = '',
//   REACT_APP_REPORT_QOS = '',
//   REACT_APP_V1_REPORT_URL = '',
//   RTE_SDK_VERSION = '',
// } = data;

const { version = '', swSrcPath = '' } = packageJson;

module.exports = {
  externals: { 'agora-electron-sdk': 'commonjs2 agora-electron-sdk' },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    alias: {
      '@': path.resolve(ROOT_PATH, 'src'),
      '~core': path.resolve(ROOT_PATH, 'src/core'),
      '~ui-kit': path.resolve(ROOT_PATH, '../agora-scenario-ui-kit/src'),
      '~components': path.resolve(ROOT_PATH, '../agora-scenario-ui-kit/src/components'),
      '~styles': path.resolve(ROOT_PATH, '../agora-scenario-ui-kit/src/styles'),
      '~utilities': path.resolve(ROOT_PATH, '../agora-scenario-ui-kit/src/utilities'),
      '~capabilities': path.resolve(ROOT_PATH, 'src/ui-kit/capabilities'),
      '~containers': path.resolve(ROOT_PATH, 'src/ui-kit/capabilities/containers'),
      '~hooks': path.resolve(ROOT_PATH, 'src/infra/hooks'),
      '~contexts': path.resolve(ROOT_PATH, 'src/infra/contexts'),
      'agora-rte-sdk': path.resolve(ROOT_PATH, '../agora-rte-sdk/src'),
      'agora-edu-core': path.resolve(ROOT_PATH, '../agora-edu-core/src'),
      'agora-plugin-gallery': path.resolve(ROOT_PATH, '../agora-plugin-gallery/src'),
      'agora-widget-gallery': path.resolve(ROOT_PATH, '../agora-widget-gallery/src'),
      'agora-chat-widget': path.resolve(ROOT_PATH, '../agora-chat-widget/src'),
    },
  },
  module: {
    unknownContextCritical: false,
    rules: [
      {
        test: /\.js(x)?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'thread-loader',
          },
          {
            loader: 'babel-loader',
            options: {
              presets: [
                [
                  '@babel/preset-env',
                  {
                    useBuiltIns: 'usage',
                    debug: false,
                    corejs: {
                      version: 3,
                      proposals: true,
                    },
                  },
                ],
                [
                  '@babel/preset-react',
                  {
                    runtime: 'automatic',
                  },
                ],
              ],
              plugins: [
                '@babel/plugin-proposal-object-rest-spread',
                '@babel/plugin-proposal-optional-chaining',
                '@babel/plugin-proposal-nullish-coalescing-operator',
                [
                  '@babel/plugin-proposal-decorators',
                  {
                    legacy: true,
                  },
                ],
                [
                  '@babel/plugin-proposal-class-properties',
                  {
                    loose: true,
                  },
                ],
              ],
            },
          },
        ],
      },
      {
        test: /\.ts(x)?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'thread-loader',
          },
          {
            loader: 'babel-loader',
            options: {
              presets: [
                [
                  '@babel/preset-env',
                  {
                    useBuiltIns: 'usage',
                    debug: false,
                    corejs: {
                      version: 3,
                      proposals: true,
                    },
                  },
                ],
                [
                  '@babel/preset-react',
                  {
                    runtime: 'automatic',
                  },
                ],
                '@babel/preset-typescript',
              ],
              plugins: [
                [
                  '@babel/plugin-transform-typescript',
                  {
                    allowDeclareFields: true,
                  },
                ],
                '@babel/plugin-proposal-object-rest-spread',
                '@babel/plugin-proposal-optional-chaining',
                '@babel/plugin-proposal-nullish-coalescing-operator',
                [
                  '@babel/plugin-proposal-decorators',
                  {
                    legacy: true,
                  },
                ],
                [
                  '@babel/plugin-proposal-class-properties',
                  {
                    loose: true,
                  },
                ],
              ],
            },
          },
        ],
      },
      {
        test: /\.worker\.js$/,
        use: { loader: 'worker-loader' },
      },
      {
        test: /\.svga$/,
        use: { loader: 'url-loader' },
      },
    ],
  },
  plugins: [
    new dotenv(),
    new webpackbar(),
    new webpack.DefinePlugin({
      RTE_SDK_VERSION: JSON.stringify(rteVersion),
      EDU_SDK_VERSION: JSON.stringify(eduCoreVersion),
      CLASSROOM_SDK_VERSION: JSON.stringify(classroomSdkVersion),
      RTE_RUNTIME_PLATFORM: JSON.stringify(env.RTE_RUNTIME_PLATFORM),
    }),
  ],
};
