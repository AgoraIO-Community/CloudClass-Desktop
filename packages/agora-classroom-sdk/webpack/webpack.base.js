const path = require('path');
const webpack = require('webpack');
const webpackbar = require('webpackbar');
const eduCoreVersion = require('agora-edu-core/package.json').version;
const rteVersion = require('agora-rte-sdk/package.json').version;
const { ROOT_PATH, ALIAS } = require('./utils/index');

const classroomSdkVersion = require('../package.json').version;

module.exports = {
  externals: {
    'agora-electron-sdk': 'commonjs2 agora-electron-sdk',
    'agora-rdc-core': 'commonjs2 agora-rdc-core',
  },
  resolve: {
    fallback: {
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify'),
      buffer: require.resolve('buffer/'),
    },
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    alias: {
      '@': path.resolve(ROOT_PATH, 'src'),
      '~ui-kit': path.resolve(ROOT_PATH, '../agora-scenario-ui-kit/src'),
      '~components': path.resolve(ROOT_PATH, '../agora-scenario-ui-kit/src/components'),
      '~styles': path.resolve(ROOT_PATH, '../agora-scenario-ui-kit/src/styles'),
      '~utilities': path.resolve(ROOT_PATH, '../agora-scenario-ui-kit/src/utilities'),
      '~capabilities': path.resolve(ROOT_PATH, 'src/ui-kit/capabilities'),
      '~containers': path.resolve(ROOT_PATH, 'src/ui-kit/capabilities/containers'),
      '~hooks': path.resolve(ROOT_PATH, 'src/infra/hooks'),
      '~contexts': path.resolve(ROOT_PATH, 'src/infra/contexts'),
      'agora-plugin-gallery': path.resolve(ROOT_PATH, '../agora-plugin-gallery/src'),
      'agora-widget-gallery': path.resolve(ROOT_PATH, '../agora-widget-gallery/src'),
      'agora-chat-widget': path.resolve(ROOT_PATH, '../agora-chat-widget/src'),
      ...ALIAS,
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
                '@babel/plugin-transform-modules-commonjs',
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
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
    }),
    new webpackbar(),
    new webpack.DefinePlugin({
      RTE_SDK_VERSION: JSON.stringify(rteVersion),
      EDU_SDK_VERSION: JSON.stringify(eduCoreVersion),
      CLASSROOM_SDK_VERSION: JSON.stringify(classroomSdkVersion),
      RTE_RUNTIME_PLATFORM: JSON.stringify(process.env.RTE_RUNTIME_PLATFORM),
      BUILD_TIME: JSON.stringify(Date.now()),
      BUILD_COMMIT_ID: JSON.stringify(process.env.FCR_BUILD_COMMIT_ID),
    }),
  ],
  stats: {
    children: true,
  },
};
