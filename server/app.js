const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3003;

// 中间件
// CORS配置 - 允许所有来源（生产环境临时解决方案）
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 添加预检请求处理
app.options('*', cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../')));

// 数据库连接
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/franklin-virtues';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB 连接成功'))
.catch(err => console.error('❌ MongoDB 连接失败:', err));

// 路由
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const virtueRoutes = require('./routes/virtues');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/virtues', virtueRoutes);

// 健康检查端点
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: '富兰克林美德系统API运行正常',
    timestamp: new Date().toISOString()
  });
});

// 服务前端文件
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../index-fullstack.html'));
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: '服务器内部错误',
    error: process.env.NODE_ENV === 'development' ? err.message : '请稍后重试'
  });
});

// 404 处理
app.use('*', (req, res) => {
  res.status(404).json({ message: '接口不存在' });
});

// 只在非 Vercel 环境下启动服务器
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
    console.log(`📱 前端页面: http://localhost:${PORT}`);
    console.log(`🔗 API健康检查: http://localhost:${PORT}/api/health`);
  });
}

module.exports = app;