const Service = require('egg').Service;

class UserService extends Service {
  // 根据用户名获取用户信息
  async getUserByName(username) {
    const { app } = this;
    try {
      const result = await app.mysql.get('user', { username });
      return result;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  // 注册
  async register(params) {
    const { app } = this;
    try {
      const result = await app.mysql.insert('user', params);
      return result;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  // 修改用户信息
  async editUserInfo(params) {
    const { app } = this;
    try {
      // 通过app.mysql.update方法指定user并且进行修改,要修改的参数体，直接通过...扩展操作符展开
      // 筛选出id等于params.id的用户
      const result = await app.mysql.update('user', { ...params }, { id: params.id });
      return result;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  // 修改用户密码
  async modifyPass(params) {
    const { app } = this;
    try {
      const result = await app.mysql.update('user', { ...params }, { id: params.id });
      return result;
    } catch (error) {
      console.log(error);
      return null;
    }
  }
}

module.exports = UserService;
