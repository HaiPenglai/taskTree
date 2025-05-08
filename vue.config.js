// vue.config.js
module.exports = {
  publicPath: './', // 确保index.html能正确加载js和css
  devServer: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        pathRewrite: { '^/api': '/api' } // 保留 /api 前缀
      }
    }
  },
  chainWebpack: (config) => {
    config.plugin('html').tap((args) => {
      args[0].favicon = './public/favicon.ico'; // 确保能加载icon
      return args;
    });
  }
}