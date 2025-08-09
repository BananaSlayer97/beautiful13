// Vercel API 通配符路由处理文件
const app = require('../server/app');

// 导出 Vercel serverless 函数
export default function handler(req, res) {
  // 重写URL路径，添加/api前缀
  req.url = `/api${req.url}`;
  return app(req, res);
}