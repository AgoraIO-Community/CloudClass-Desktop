const path = require('path');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const autoprefixer = require('autoprefixer');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const tailwindcss = require('tailwindcss');
const { ROOT_PATH } = require('agora-classroom-sdk/webpack/utils');

module.exports = {
  typescript: {
    reactDocgen: 'react-docgen',
  },
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-links', '@storybook/addon-essentials'],
  babel: async (options) => {
    return {
      ...options,
    };
  },
  webpackFinal: async (config) => {
    config.resolve.extensions.push('.ts', '.tsx');
    config.resolve.alias = {
      ...config.resolve.alias,
      '~ui-kit': path.resolve(__dirname, '../src'),
      '~components': path.resolve(__dirname, '../src/components'),
      '~styles': path.resolve(__dirname, '../src/styles'),
      '~utilities': path.resolve(__dirname, '../src/utilities'),
    };

    config.module.rules.push({
      test: /\.css$/,
      use: [
        {
          loader: 'postcss-loader',
          options: {
            postcssOptions: {
              plugins: [
                autoprefixer(),
                tailwindcss(path.resolve(ROOT_PATH, './tailwind.config.js')),
              ],
            },
          },
        },
      ],
    });

    return config;
  },
};
