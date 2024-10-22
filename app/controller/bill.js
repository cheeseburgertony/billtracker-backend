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
          return moment(Number(item.date)).format('YYYY-MM') === date && Number(item.type_id) === Number(type_id);
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

  // 获取账单详情
  async detail() {
    const { ctx, app } = this;
    // 获取账单id
    const { id = '' } = ctx.query;
    // 获取tokne并解析获取user_id
    const token = ctx.request.header.authorization;
    const decode = await app.jwt.verify(token, app.config.jwt.secret);
    if (!decode) return;
    const user_id = decode.id;
    // 判断是否有账单id
    if (!id) {
      ctx.body = {
        code: 500,
        msg: '订单id不能为空',
        data: null,
      };
      return;
    }

    try {
      // 根据用户id和订单id从数据库获取订单详情
      const detail = await ctx.service.bill.detail(id, user_id);
      ctx.body = {
        code: 200,
        msg: '请求成功',
        data: detail,
      };
    } catch (error) {
      ctx.body = {
        code: 500,
        msg: '系统错误',
        data: null,
      };
    }
  }

  // 修改账单
  async update() {
    const { ctx, app } = this;
    // 接收来自body的请求参数 账单id也需要
    const { id, amount, type_id, type_name, date, pay_type, remark = '' } = ctx.request.body;
    // 判空处理
    if (!amount || !type_id || !type_name || !date || !pay_type) {
      ctx.body = {
        code: 400,
        msg: '参数错误',
        data: null,
      };
    }

    try {
      // 获取token并解析，获取user_id
      const token = ctx.request.header.authorization;
      const decode = await app.jwt.verify(token, app.config.jwt.secret);
      if (!decode) return;
      const user_id = decode.id;
      // 根据账单id和user_id修改账单
      await ctx.service.bill.update({
        id, // 账单id
        amount, // 金额
        type_id, // 消费类型id
        type_name, // 消费类型名字
        date, // 日期
        pay_type, // 消费类型(支出/收入)
        remark, // 备注
        user_id, // 用户id
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

  // 删除账单
  async delete() {
    const { ctx, app } = this;
    const { id } = ctx.request.body;
    if (!id) {
      ctx.body = {
        code: 400,
        msg: '参数错误',
        data: null,
      };
      return;
    }

    try {
      const token = ctx.request.header.authorization;
      const decode = await app.jwt.verify(token, app.config.jwt.secret);
      if (!decode) return;
      const user_id = decode.id;
      await ctx.service.bill.delete(id, user_id);
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

  // 数据图表(数据整合，相同类型的消费一起，以及总金额)
  // {
  //   totalData: [
  //     {
  //       number: 137.84, // 支出或收入数量
  //       pay_type: 1, // 支出或消费类型值
  //       type_id: 1, // 消费类型id
  //       type_name: "餐饮" // 消费类型名称
  //     }
  //   ],
  //   totalExpense: 3123.54, // 总消费
  //   totalIncome: 6555.80 // 总收入
  // }
  // 根据时间获取数据
  async data() {
    const { ctx, app } = this;
    const { date = '' } = ctx.query;
    const token = ctx.request.header.authorization;
    const decode = await app.jwt.verify(token, app.config.jwt.secret);
    if (!decode) return;
    const user_id = decode.id;

    try {
      // 获取账单表中当前用户的所有数据
      const result = await ctx.service.bill.list(user_id);
      // 根据时间参数筛选出当前月该用户所有的账单数据
      const start = moment(date).startOf('month').unix() * 1000; // 月初时间
      const end = moment(date).endOf('month').unix() * 1000; // 月末时间
      const _data = result.filter(item => Number(item.date) >= start && Number(item.date) <= end);
      // 通过当前月份数据进行计算
      // 总支出
      const totalExpense = _data.reduce((prev, current) => (current.pay_type === 1 ? prev + Number(current.amount) : prev), 0);
      // 总收入
      const totalIncome = _data.reduce((prev, current) => ((current.pay_type === 2) ? prev + Number(current.amount) : prev), 0);
      // 整理收支构成
      const totalData = _data.reduce((prev, current) => {
        // 找该类型的账单是否以及存在
        const index = prev.findIndex(item => item.type_id === current.type_id);
        // 不存在创建个新的
        if (index === -1) {
          prev.push({
            type_id: current.type_id, // 消费类型id
            type_name: current.type_name, // 消费类型名称
            pay_type: current.pay_type, // 支出或消费类型值
            number: Number(current.amount), // 支出或收入数量
          });
        }
        // 如果已经存在则直接将金额加入到已有的数组中
        if (index > -1) {
          prev[index].number += Number(current.amount);
        }
        return prev;
      }, []);
      totalData.forEach(item => (item.number = Number(Number(item.number).toFixed(2))));

      ctx.body = {
        code: 200,
        msg: '请求成功',
        data: {
          total_expense: Number(totalExpense).toFixed(2),
          total_income: Number(totalIncome).toFixed(2),
          total_data: totalData || [],
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
