// Vercel API 端点 - 用户注册
const app = require('../../server/app');

export default function handler(req, res) {
  // 设置正确的路径
  req.url = '/api/auth/register';
  return app(req, res);
}

// 兼容 CommonJS
module.exports = handler;
module.exports.default = handler;