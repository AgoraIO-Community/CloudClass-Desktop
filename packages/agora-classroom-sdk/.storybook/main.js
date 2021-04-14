const path = require('path')

const disableEsLint = (e) => {
  return e.module.rules.filter(e =>
    e.use && e.use.some(e => e.options && void 0 !== e.options.useEslintrc)).forEach(s => {
      e.module.rules = e.module.rules.filter(e => e !== s)
    }), e
}

module.exports = {
  "stories": [
    "../src/ui-kit/**/*.stories.mdx",
    "../src/ui-kit/**/*.stories.@(js|jsx|ts|tsx)"
  ],
  "addons": [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/preset-create-react-app"
  ],
  webpackFinal: async (config) => {
    config = disableEsLint(config);
    config.module.rules.push({
      test: /\.css$/,
      use: [
        {
          loader: 'postcss-loader',
          options: {
            // ident: 'postcss',
            postcssOptions: {
              plugins: [
                require('tailwindcss'),
                require('autoprefixer')
              ]
            }
          }
        }
      ],
      include: path.resolve(__dirname, '../'),
    })
    config.resolve.alias = {
      ...config.resolve.alias,
      "~utilities": path.resolve(__dirname, '../src/ui-kit/utilities/'),
      "~components": path.resolve(__dirname, '../src/ui-kit/components/'),
      "~styles": path.resolve(__dirname, '../src/ui-kit/styles/'),
      "~capabilities": path.resolve(__dirname, '../src/ui-kit/capabilities'),
    }

    return config
  }
}