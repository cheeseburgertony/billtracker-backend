const Controller = require('egg').Controller;

// 默认头像
const defaultAvatar = 'https://pic2.zhimg.com/80/v2-b028f76a018388009e969bea8101687d_1440w.webp';

class UserController extends Controller {
  async register() {
    const { ctx } = this;
    const { username, password } = ctx.request.body; // 获取注册所需要的参数
    // 判断账号和密码是否为空
    if (!username || !password) {
      ctx.body = {
        code: 500,
        msg: '账号和密码不能为空',
        data: null,
      };
      return;
    }

    // 查找数据库中是否已经存在此用户名
    const userInfo = await ctx.service.user.getUserByName(username);
    // 判断是否已经存在
    if (userInfo && userInfo.id) {
      ctx.body = {
        code: 500,
        msg: '账户名已被注册，请重新输入',
        data: null,
      };
      return;
    }

    // 不存在,注册账号,并且将数据存入数据库
    const result = await ctx.service.user.register({
      username,
      password,
      signature: '世界和平',
      avatar: defaultAvatar,
      ctime: new Date().getTime(),
    });
    if (result) {
      ctx.body = {
        code: 200,
        msg: '注册成功',
        data: null,
      };
    } else {
      ctx.body = {
        code: 500,
        msg: '注册失败',
        data: null,
      };
    }
  }
}

module.exports = UserController;
