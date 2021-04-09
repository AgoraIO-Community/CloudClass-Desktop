const path = require('path')

const disableEsLint = (e) => {
  return e.module.rules.filter(e =>
    e.use && e.use.some(e => e.options && void 0 !== e.options.useEslintrc)).forEach(s => {
      e.module.rules = e.module.rules.filter(e => e !== s)
    }), e
}

module.exports = {
  "stories": [
    "../src/**/*.stories.mdx",
    "../src/**/*.stories.@(js|jsx|ts|tsx)"
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
      "~utilities": path.resolve(__dirname, '../src/utilities/'),
      "~components": path.resolve(__dirname, '../src/components/'),
      "~styles": path.resolve(__dirname, '../src/styles/'),
    }

    return config
  }
}