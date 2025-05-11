// vue.config.js
module.exports = {
  publicPath: './', // 确保index.html能正确加载js和css
  devServer: {
    host: '0.0.0.0', // 允许外部IP访问
    port: 8080,      // 设置端口
    allowedHosts: 'all',  // 允许所有主机访问
  },
  chainWebpack: (config) => {
    config.plugin('html').tap((args) => {
      args[0].favicon = './public/favicon.ico'; // 确保能加载icon
      return args;
    });
  }
}