// Vercel API 入口文件
const app = require('../server/app');

// 导出 Vercel serverless 函数
export default function handler(req, res) {
  return app(req, res);
}

// 兼容 CommonJS
module.exports = handler;
module.exports.default = handler;