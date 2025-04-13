const path = require("path");
const { defineConfig } = require('@vue/cli-service');

module.exports = defineConfig({
  transpileDependencies: ['vuetify'],
  outputDir: path.resolve(__dirname, "../gofr-backend/lib/gofr-backend-site/gui"),
  publicPath: './',
  runtimeCompiler: true,
  devServer: {
    proxy: {
      '^/gofrapp': {
        target: 'http://localhost:4000/',
        logLevel: 'debug'
      },
      '^/translator': {
        target: 'http://localhost:4000/',
        logLevel: 'debug'
      },
      '^/auth': {
        target: 'http://localhost:4000/',
        logLevel: 'debug'
      },
      '^/users': {
        target: 'http://localhost:4000/',
        logLevel: 'debug'
      },
      '^/config': {
        target: 'http://localhost:4000/',
        logLevel: 'debug'
      }
    }
  }
})
