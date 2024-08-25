/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;

  // 注册
  router.post('/api/user/register', controller.user.register);
  // 登录
  router.post('/api/user/login', controller.user.login);
  // 测试token解析
  router.get('/api/user/test', controller.user.test);
};
