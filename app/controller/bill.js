const moment = require('moment');

const Controller = require('egg').Controller;

class BillController extends Controller {
  // 新增账单
  async add() {
    const { ctx, app } = this;
    // 获取body中携带的参数
    const { amount, type_id, type_name, date, pay_type, remark = '' } = ctx.request.body;
    // 判空处理
    if (!amount || !type_id || !type_name || !date || !pay_type) {
      ctx.body = {
        code: 400,
        msg: '参数错误',
        data: null,
      };
    }
    try {
      // 拿到token并解析
      const token = ctx.request.header.authorization;
      const decode = await app.jwt.verify(token, app.config.jwt.secret);
      if (!decode) return;
      const user_id = decode.id;
      // user_id 默认添加到每个账单项,作为后续获取指定用户账单的标示
      await ctx.service.bill.add({
        amount,
        type_id,
        type_name,
        date,
        pay_type,
        remark,
        user_id,
      });
      ctx.body = {
        code: 200,
        msg: '请求成功',
        data: null,
      };
    } catch (error) {
      ctx.body = {
        code: 500,
        msg: '系统错误',
        data: null,
      };
    }
  }

  // 获取账单列表
  async list() {
    const { ctx, app } = this;
    // 获取日期，分页数据，类型，
    const { date, page = 1, page_size = 5, type_id = 'all' } = ctx.query;
    try {
      // 拿到token并解析
      const token = ctx.request.header.authorization;
      const decode = await app.jwt.verify(token, app.config.jwt.secret);
      if (!decode) return;
      const user_id = decode.id;
      // 根据用户id拿到当前用户账单
      const list = await ctx.service.bill.list(user_id);
      // 过滤出月份和类型所对应的账单列表
      const _list = list.filter(item => {
        if (type_id !== 'all') {
          return moment(Number(item.date)).format('YYYY-MM') === date && item.type_id === type_id;
        }
        return moment(Number(item.date)).format('YYYY-MM') === date;
      });

      // 格式化数据,格式化成一下格式
      // [
      //   {
      //     date: '2020-1-1',
      //     bills: [
      //       {
      //         // bill 数据表中的每一项账单
      //       },
      //       {
      //         // bill 数据表中的每一项账单
      //       }
      //     ]
      //   },
      //   {
      //     date: '2020-1-2',
      //     bills: [
      //       {
      //         // bill 数据表中的每一项账单
      //       },
      //     ]
      //   }
      // ]
      const listMap = _list.reduce((prev, current) => {
        // prve初始默认是一个空数据
        // 把第一个账单项的时间格式化成YYYY-MM-DD
        const date = moment(Number(current.date)).format('YYYY-MM-DD');
        // 如果能在累加的数组项prev中找到当前项的时间，则将该项加入到加入到对应的prev数组中
        if (prev && prev.length && prev.findIndex(item => item.date === date) > -1) {
          const index = prev.findIndex(item => item.date === date);
          prev[index].bills.push(current);
        }
        // 如果在当前累加数组prev中找不到当前项的日期，那么在新建一项
        if (prev && prev.length && prev.findIndex(item => item.date === date) === -1) {
          prev.push({
            date,
            bills: [ current ],
          });
        }
        // 如果累加数组prev为空数组，则默认添加第一个账单项，格式化为要求的格式
        if (!prev.length) {
          prev.push({
            date,
            bills: [ current ],
          });
        }
        return prev;
      }, []).sort((a, b) => moment(b.date) - moment(a.date)); // 进行排序，顺序为倒叙，时间越新的，在越上面

      // 分页处理，listMap为格式化之后的全部数据，还需要进行分页，后续才可以实现滚动加载
      const filterListMap = listMap.slice((page - 1) * page_size, page * page_size);

      // 计算当月总收入和总支出
      const currentMonthList = list.filter(item => moment(Number(item.date)).format('YYYY-MM') === date);
      // 累加计算总支出
      const totalExpense = currentMonthList.reduce((prev, current) => (current.pay_type === 1 ? prev + Number(current.amount) : prev), 0);
      // 累计计算总收入
      const totalIncome = currentMonthList.reduce((prev, current) => (current.pay_type === 2 ? prev + Number(current.amount) : prev), 0);

      // 返回整理后数据
      ctx.body = {
        code: 200,
        msg: '请求成功',
        data: {
          totalExpense, // 当月支出
          totalIncome, // 当月收入
          totalPage: Math.ceil(listMap.length / page_size), // 总分页
          list: filterListMap || [], // 格式化后并且经过分页的数据
        },
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

module.exports = BillController;
