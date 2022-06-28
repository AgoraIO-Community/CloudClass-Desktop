const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const path = require('path');
const { base, pack } = require('../agora-classroom-sdk/webpack/utils/loaders');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  entry: {
    hx_im: './src/index.jsx',
  },
  mode: 'production',
  output: {
    publicPath: '',
    filename: '[name].bundle.js',
    libraryTarget: 'umd',
    library: 'HxIm',
    path: path.resolve(__dirname, 'lib'),
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    alias: {
      '~ui-kit': path.resolve(__dirname, '../agora-scenario-ui-kit/src'),
      '~components': path.resolve(__dirname, '../agora-scenario-ui-kit/src/components'),
      '~styles': path.resolve(__dirname, '../agora-scenario-ui-kit/src/styles'),
      '~utilities': path.resolve(__dirname, '../agora-scenario-ui-kit/src/utilities'),
    },
  },
  module: {
    unknownContextCritical: false,
    rules: [...base, ...pack],
  },
  optimization: {
    minimize: true,
    sideEffects: true,
    nodeEnv: 'production',
    minimizer: [
      new TerserPlugin({
        parallel: require('os').cpus().length, // 多线程并行构建
        terserOptions: {
          compress: {
            warnings: false, // 删除无用代码时是否给出警告
            drop_debugger: true, // 删除所有的debugger
          },
        },
        extractComments: false,
      }),
      new CssMinimizerPlugin(),
    ],
  },
  plugins: [new BundleAnalyzerPlugin()],
};
