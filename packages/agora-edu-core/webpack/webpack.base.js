const { ROOT_PATH } = require('./utils/index');
const path = require('path');
const webpack = require('webpack');
const dayjs = require('dayjs');
const webpackbar = require('webpackbar');

module.exports = {
  externals: {
    'white-web-sdk': 'white-web-sdk',
    react: 'react',
    'react-dom': 'react-dom',
    dayjs: 'dayjs',
    'agora-electron-sdk': 'commonjs2 agora-electron-sdk',
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    alias: {
      '@': path.resolve(ROOT_PATH, 'src'),
      'agora-rte-sdk': path.resolve(ROOT_PATH, '../agora-rte-sdk/src'),
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
  plugins: [new webpackbar()],
};
