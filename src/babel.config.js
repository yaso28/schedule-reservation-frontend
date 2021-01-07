const plugins = []
switch (process.env.NODE_ENV) {
  case 'production':
    if (!process.env.VUE_APP_IS_STAGING) {
      plugins.push('transform-remove-console')
    }
    break

  case 'development':
    break

  case 'test':
    plugins.push(['transform-remove-console', { exclude: ['info'] }])
    break

  default:
    break
}

module.exports = {
  presets: [
    '@vue/cli-plugin-babel/preset'
  ],
  plugins
}
