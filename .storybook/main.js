module.exports = {
  stories: [
    '../packages/**/__stories__/*.stories.mdx',
    '../packages/**/__stories__/*.stories.@(js|jsx|ts|tsx)',
  ],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-a11y',
    'storybook-addon-designs',
  ],
  features: {
    interactionsDebugger: true,
  },
  // later I shall create a customised framework
  // to support both react and vue
  framework: '@storybook/react',
  core: {
    builder: {
      name: 'webpack5',
      options: {
        lazyCompilation: true,
      },
    },
  },
  webpackFinal: async (config, { configType }) => {
    config.module.rules.push({
      test: /\.(scss|css)$/i,
      // if in case, we are planning to use sass,
      // add the needed packages and update webpack as well
      use: [
        configType === 'DEVELOPMENT'
          ? 'style-loader'
          : require('mini-css-extract-plugin').loader,
        'css-loader',
        'sass-loader',
      ],
    })
    return config
  },
}
