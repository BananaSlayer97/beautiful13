// Vercel API 端点 - 验证令牌
const app = require('../../server/app');

module.exports = (req, res) => {
  // 设置正确的路径
  req.url = '/api/auth/verify';
  return app(req, res);
};