const Service = require('egg').Service;

class BillService extends Service {
  // 新增账单
  async add(params) {
    const { app } = this;
    try {
      // 往bill表中新增一条账单数据
      const result = await app.mysql.insert('bill', params);
      return result;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  // 获取账单列表
  async list(id) {
    const { app } = this;
    const QUERY_STR = 'id, pay_type, amount, date, type_id, type_name, remark';
    const sql = `select ${QUERY_STR} from bill where user_id = ${id}`;
    try {
      const result = await app.mysql.query(sql); // app.mysql.query的方法就是负责执行你的sql语句
      return result;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  // 获取订单详情
  async detail(id, user_id) {
    const { app } = this;
    try {
      const result = await app.mysql.get('bill', { id, user_id });
      return result;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  // 修改账单
  async update(params) {
    const { app } = this;
    try {
      // 根据账单id和user_id修改bill表中对应的数据
      // await app.mysql.update('表名', 更新内容, 查询参数)
      const result = await app.mysql.update('bill', { ...params }, { id: params.id, user_id: params.user_id });
      return result;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  // 删除账单
  async delete(id, user_id) {
    const { app } = this;
    try {
      const result = await app.mysql.delete('bill', { id, user_id });
      return result;
    } catch (error) {
      console.log(error);
      return;
    }
  }
}

module.exports = BillService;
