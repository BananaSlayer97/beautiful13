// Vercel API 入口文件
const app = require('../server/app');

// 导出 Vercel serverless 函数
module.exports = (req, res) => {
  return app(req, res);
};