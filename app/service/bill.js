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
}

module.exports = BillService;
