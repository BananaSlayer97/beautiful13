// 简单的健康检查API
module.exports = (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.status(200).json({
    status: 'OK',
    message: '富兰克林美德系统API运行正常',
    timestamp: new Date().toISOString(),
    environment: 'vercel'
  });
};