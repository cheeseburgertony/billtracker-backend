const Controller = require('egg').Controller;

class TypeController extends Controller {
  // 获取标签列表
  async list() {
    const { ctx, app } = this;
    try {
      const token = ctx.request.header.authorization;
      const decode = await app.jwt.verify(token, app.config.jwt.secret);
      if (!decode) return;
      const user_id = decode.id;
      const list = await ctx.service.type.list(user_id);

      ctx.body = {
        code: 200,
        msg: '请求成功',
        list,
      };
    } catch (error) {
      ctx.body = {
        code: 500,
        msg: '系统错误',
        data: null,
      };
    }
  }
}

module.exports = TypeController;
