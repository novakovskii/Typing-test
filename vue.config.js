const { defineConfig } = require('@vue/cli-service')
module.exports = {
  transpileDependencies: ['wave-ui'],
  css: {
    loaderOptions: {
      sass: { additionalData: '@import "@/scss/_variables.scss";' }
    }
  }
}
