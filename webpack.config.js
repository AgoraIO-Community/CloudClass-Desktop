const webpackMerge = require('webpack-merge');
const path = require('path');
const baseConfig = require('agora-common-libs/presets/webpack.config.base.js');
const ROOT_PATH = path.resolve(__dirname, './');
const CopyPlugin = require('copy-webpack-plugin');
const config = {
  entry: {
    edu_sdk: './src/infra/api/index.tsx',
  },
  output: {
    path: path.resolve(ROOT_PATH, 'lib'),
    publicPath: './',
    filename: '[name].bundle.js',
    libraryTarget: 'umd',
    clean: true,
  },
  resolve: {
    alias: {
      '@classroom': path.resolve(ROOT_PATH, './src'),
      'agora-classroom-sdk': path.resolve(ROOT_PATH, './src/infra/api'),
    },
  },

  plugins: [
    new CopyPlugin({
      patterns: [
        // ai denoiser
        {
          from: path.resolve(ROOT_PATH, '../../node_modules/agora-extension-ai-denoiser/external'),
          to: path.resolve(ROOT_PATH, './lib/externals/extensions/ai-denoiser'),
          noErrorOnMissing: true,
        },
        //virtual background
        {
          from: path.resolve(
            ROOT_PATH,
            '../../node_modules/agora-extension-virtual-background/wasms',
          ),
          to: path.resolve(
            ROOT_PATH,
            './lib/externals/extensions/agora-extension-virtual-background',
          ),
          noErrorOnMissing: true,
        },
      ],
    }),
  ],
};

const mergedConfig = webpackMerge.merge(baseConfig, config);
module.exports = mergedConfig;
