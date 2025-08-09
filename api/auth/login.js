// Vercel API 端点 - 登录
const app = require('../../server/app');

export default function handler(req, res) {
  // 设置正确的路径
  req.url = '/api/auth/login';
  return app(req, res);
}

// 兼容 CommonJS
module.exports = handler;
module.exports.default = handler;