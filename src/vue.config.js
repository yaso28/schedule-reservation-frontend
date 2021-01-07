module.exports = {
  publicPath: process.env.VUE_APP_PUBLIC_PATH,
  productionSourceMap: false,
  configureWebpack: {
    optimization: {
      splitChunks: {
        maxSize: 256000
      }
    }
  },
  pluginOptions: {
    i18n: {
      enableInSFC: false
    }
  }
}
