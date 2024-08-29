const fs = require('fs');
const moment = require('moment');
const { mkdirp } = require('mkdirp');
const path = require('path');

const Controller = require('egg').Controller;

class UploadController extends Controller {
  async upload() {
    const { ctx } = this;
    const file = ctx.request.files[0];

    // 存放资源的路径
    let uploadDir = '';
    try {
      // 通过文件路径读取文件信息
      const f = fs.readFileSync(file.filepath);
      // 获取当前日期
      const day = moment(new Date()).format('YYYYMMDD');
      // 创建保存图片的路径
      const dir = path.join(this.config.uploadDir, day);
      const date = Date.now(); // 当前时间戳
      await mkdirp(dir); // 不在就创建文件目录
      // 图片保存的地址
      uploadDir = path.join(dir, date + path.extname(file.filename)); // 取文件的后缀名和时间戳作为文件名
      // 写入文件中
      fs.writeFileSync(uploadDir, f);
    } finally {
      // 清除临时文件
      ctx.cleanupRequestFiles();
    }

    ctx.body = {
      code: 200,
      msg: '上传成功',
      data: uploadDir.replace(/app/g, ''), // 返回的是图片存储的路径,app替换成空字符串,因为在前端访问的时候会直接从public访问
    };
  }
}

module.exports = UploadController;
