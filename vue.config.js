// vue.config.js
 
module.exports = {
  publicPath: './', // 确保index.html能./js和./css
    chainWebpack: (config) => {
    config.plugin('html').tap((args) => {
      args[0].favicon = './public/favicon.ico'; // 指定icon路径
      return args;
    });
  }
}
