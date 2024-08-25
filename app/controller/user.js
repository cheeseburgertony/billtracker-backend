const Controller = require('egg').Controller;

// 默认头像
const defaultAvatar = 'https://pic2.zhimg.com/80/v2-b028f76a018388009e969bea8101687d_1440w.webp';

class UserController extends Controller {
  // 注册
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
      ctime: Date.now(),
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

  // 登录
  async login() {
    // app为全局属性，相当于所有的插件方法都植入到了app对象
    const { ctx, app } = this;
    const { username, password } = ctx.request.body;
    // 根据用户名在数据库中查找相对于的id然后进行操作
    const userInfo = await ctx.service.user.getUserByName(username);
    // 不存在该用户
    if (!userInfo || !userInfo.id) {
      ctx.body = {
        code: 500,
        msg: '账号不存在',
        data: null,
      };
      return;
    }
    // 存在用户,判断密码是否正确
    if (userInfo && userInfo.id && password !== userInfo.password) {
      ctx.body = {
        code: 500,
        mgs: '账号密码错误',
        data: null,
      };
      return;
    }

    // 生成token加密
    const token = app.jwt.sign({
      id: userInfo.id,
      username: userInfo.username,
      exp: Math.floor(Date.now() / 1000 + (24 * 60 * 60)), // 有效期为24个小时
    }, app.config.jwt.secret);

    ctx.body = {
      code: 200,
      msg: '登录成功',
      data: {
        token,
      },
    };
  }

  // 验证token解析
  async test() {
    const { ctx, app } = this;
    // 通过token解析，拿到user_id
    const token = await ctx.request.header.authorization; // 请求头获取 authorization 属性，值为 token
    // 通过app.jwt.verify(token + 加密字符串)解析出token的值
    const decode = app.jwt.verify(token, app.config.jwt.secret);

    ctx.body = {
      code: 200,
      msg: '解析成功',
      data: {
        ...decode,
      },
    };
  }

  // 获取用户信息
  async getUserInfo() {
    const { ctx, app } = this;
    const token = ctx.request.header.authorization;
    // 解析出token
    const decode = await app.jwt.verify(token, app.config.jwt.secret);
    // 通过decode.username获取用户完整信息
    const userInfo = await ctx.service.user.getUserByName(decode.username);

    // 除了密码和创建时间其他都返回
    ctx.body = {
      code: 200,
      msg: '请求成功',
      data: {
        id: userInfo.id,
        username: userInfo.username,
        signature: userInfo.signature || '',
        avatar: userInfo.avatar || defaultAvatar,
      },
    };
  }

  // 修改用户信息
  async editUserInfo() {
    const { ctx, app } = this;
    // 在请求体中获取签名字段signature
    const { signature = '' } = ctx.request.body;
    try {
      const token = ctx.request.header.authorization;
      // 解析token
      const decode = await app.jwt.verify(token, app.config.jwt.secret);
      if (!decode) return;
      // 取出信息id
      const user_id = decode.id;
      // 通过username获取userInfo完整信息
      const userInfo = await ctx.service.user.getUserByName(decode.username);
      // 通过service层的editUserInfo修改信息
      await ctx.service.user.editUserInfo({
        ...userInfo,
        signature,
      });

      ctx.body = {
        code: 200,
        msg: '请求成功',
        data: {
          id: user_id,
          username: userInfo.username,
          signature,
        },
      };
    } catch (error) {
      console.log(error);
      return null;
    }

  }
}

module.exports = UserController;
