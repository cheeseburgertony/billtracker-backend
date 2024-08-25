/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller, middleware } = app;

  // 中间件,进行token检验
  const _jwt = middleware.jwtErr(app.config.jwt.secret); // 传入加密字符串

  // 注册
  router.post('/api/user/register', controller.user.register);
  // 登录
  router.post('/api/user/login', controller.user.login);
  // 测试token解析
  router.get('/api/user/test', _jwt, controller.user.test); // 放入第二个参数,作为中间件过滤项

  // 获取用户信息
  router.get('/api/user/get_userinfo', _jwt, controller.user.getUserInfo);
};
