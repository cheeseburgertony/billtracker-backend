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
  // 修改用户信息
  router.post('/api/user/edit_userinfo', _jwt, controller.user.editUserInfo);
  // 修改用户头像
  router.post('/api/upload', _jwt, controller.upload.upload);
  // 修改用户密码
  router.post('/api/user/modify_pass', _jwt, controller.user.modifyPass);

  // 新增账单
  router.post('/api/bill/add', _jwt, controller.bill.add);
  // 获取账单列表
  router.get('/api/bill/list', _jwt, controller.bill.list);
  // 获取账单详情
  router.get('/api/bill/detail', _jwt, controller.bill.detail);
  // 修改账单
  router.post('/api/bill/update', _jwt, controller.bill.update);
  // 删除账单
  router.post('/api/bill/delete', _jwt, controller.bill.delete);

  // 获取图表数据(整合之后的数据)
  router.get('/api/bill/data', _jwt, controller.bill.data);

  // 获取标签列表
  router.get('/api/type/list', _jwt, controller.type.list);
};
