// Vercel API 端点 - 登录
const app = require('../../server/app');

module.exports = (req, res) => {
  // 设置正确的路径
  req.url = '/api/auth/login';
  return app(req, res);
};