
module.exports = secret => {
  return async function jwtErr(ctx, next) {
    const token = ctx.request.header.authorization; // 如果没有token，返回的是null字符串
    if (token && token !== 'null') {
      try {
        ctx.app.jwt.verify(token, secret); // 解析token
        await next();
      } catch (error) {
        console.log('error', error);
        ctx.status = 200;
        ctx.body = {
          code: 401,
          msg: 'token已过期,请重新登录',
        };
        return;
      }
    } else {
      ctx.status = 200;
      ctx.body = {
        code: 401,
        msg: 'token不存在',
      };
      return;
    }
  };
};
