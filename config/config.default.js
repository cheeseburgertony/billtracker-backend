/* eslint valid-jsdoc: "off" */

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = appInfo => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = exports = {};

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1724580148954_2517';

  // add your middleware config here
  config.middleware = [];

  // add your user config here
  const userConfig = {
    // myAppName: 'egg',
    uploadDir: 'app/public/upload',
  };

  // 安防策略问题配置
  config.security = {
    csrf: {
      enable: false,
      ignoreJSON: true,
    },
    domainWhiteList: [ '*' ], // 配置白名单
  };

  // 数据库信息配置
  exports.mysql = {
    // 单数据库信息配置
    client: {
      // host
      host: 'localhost',
      // 端口号
      port: '3306',
      // 用户名
      user: 'root',
      // 密码
      password: '1234',
      // 数据库名
      database: 'bill-tracker',
    },
    // 是否加载到app上,默认开启
    app: true,
    // 是否加载到agent上,默认关闭
    agent: false,
  };

  // 配置自定义加密字符串
  config.jwt = {
    secret: 'tony', // secret加密字符串,将在后续用于结合用户信息生成一串token,secret是放在服务端代码中
  };

  // 设置config.multipart的mode属性为file
  config.multipart = {
    mode: 'file',
  };

  // 解决跨域问题
  config.cors = {
    origin: '*', // 允许所有跨域访问
    credentials: true, // 允许Cookie跨域
    allowMethods: 'GET,POST,PUT,DELETE,PATCH,HEAD', // 允许请求的方式
  };

  return {
    ...config,
    ...userConfig,
  };
};
