const path = require('path');

module.exports = {
  typescript: {
    reactDocgen: 'react-docgen',
  },
  stories: ['../src/ui-kit/components/**/*.stories.@(ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    {
      name: '@storybook/addon-postcss',
      options: {
        postcssLoaderOptions: {
          // When using postCSS 8
          implementation: require('postcss'),
        },
      },
    },
  ],
  webpackFinal: async (config) => {
    config.resolve.extensions.push('.ts', '.tsx');
    config.resolve.alias = {
      ...config.resolve.alias,
      'agora-common-libs': path.resolve(__dirname, '../../../node_modules/agora-common-libs/lib'),
    };

    config.module.rules.push({
      test: /agora-common-libs\/.*\/(annotation)|(widget)|(agora-rte-sdk)/,
      use: { loader: 'null-loader' },
    });

    return config;
  },
};
