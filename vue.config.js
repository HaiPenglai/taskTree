// vue.config.js
module.exports = {
  publicPath: './', // 确保index.html能正确加载js和css
  chainWebpack: (config) => {
    config.plugin('html').tap((args) => {
      args[0].favicon = './public/favicon.ico'; // 确保能加载icon
      return args;
    });
  }
}