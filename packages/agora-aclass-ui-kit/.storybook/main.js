const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  stories: [
    '../stories/**/*.stories.mdx',
    '../src/**/*.stories.@(js|jsx|ts|tsx)'
  ],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/preset-create-react-app'
  ],
  typescript: {
    check: false,
    checkOptions: {},
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      propFilter: (prop) => (prop.parent ? !/node_modules/.test(prop.parent.fileName) : true),
    },
  },
  webpackFinal: async (config, { configType }) => {
    config.module.rules.push({
        test: /\.scss$/,
        use: [
        {
            loader: MiniCssExtractPlugin.loader,
            options: {
                hmr: true,
            },
        },
        'css-loader',
        'postcss-loader',
        // {
        //     loader: 'sass-loader',
        //     options: {
        //     implementation: require('sass'),
        //     sassOptions: {
        //         fiber: require('fibers'),
        //     },
        //     },
        // },
        ],
    });
    return config;
  }
}