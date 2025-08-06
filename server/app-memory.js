const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const memoryStorage = require('./storage/memoryStorage');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'franklin-virtues-secret-key-2024-development';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../')));

// JWT工具函数
const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRE });
};

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ 
        message: '访问被拒绝，需要认证令牌',
        code: 'NO_TOKEN'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await memoryStorage.findUserById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ 
        message: '令牌无效，用户不存在',
        code: 'INVALID_USER'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        message: '令牌格式无效',
        code: 'INVALID_TOKEN'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: '令牌已过期，请重新登录',
        code: 'TOKEN_EXPIRED'
      });
    }

    console.error('认证中间件错误:', error);
    res.status(500).json({ 
      message: '认证过程中发生错误',
      code: 'AUTH_ERROR'
    });
  }
};

// 验证规则
const registerValidation = [
  body('username')
    .isLength({ min: 3, max: 20 })
    .withMessage('用户名长度必须在3-20个字符之间'),
  body('email')
    .isEmail()
    .withMessage('请输入有效的邮箱地址'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('密码至少需要6个字符')
];

const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('请输入有效的邮箱地址'),
  body('password')
    .notEmpty()
    .withMessage('密码不能为空')
];

// 认证路由
app.post('/api/auth/register', registerValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: '输入数据验证失败',
        errors: errors.array()
      });
    }

    const { username, email, password } = req.body;

    // 检查用户是否已存在
    const existingUserByEmail = await memoryStorage.findUserByEmail(email);
    const existingUserByUsername = await memoryStorage.findUserByUsername(username);

    if (existingUserByEmail) {
      return res.status(400).json({
        message: '该邮箱已被注册',
        code: 'EMAIL_EXISTS'
      });
    }

    if (existingUserByUsername) {
      return res.status(400).json({
        message: '该用户名已被注册',
        code: 'USERNAME_EXISTS'
      });
    }

    // 加密密码
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 创建新用户
    const user = await memoryStorage.createUser({
      username,
      email,
      password: hashedPassword
    });

    // 生成JWT令牌
    const token = generateToken(user._id);

    res.status(201).json({
      message: '注册成功',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profile: user.profile,
        settings: user.settings
      }
    });
  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({
      message: '注册过程中发生错误',
      error: error.message
    });
  }
});

app.post('/api/auth/login', loginValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: '输入数据验证失败',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // 查找用户
    const user = await memoryStorage.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        message: '邮箱或密码错误',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        message: '邮箱或密码错误',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // 生成JWT令牌
    const token = generateToken(user._id);

    res.json({
      message: '登录成功',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profile: user.profile,
        settings: user.settings,
        stats: user.stats
      }
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({
      message: '登录过程中发生错误',
      error: error.message
    });
  }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        profile: req.user.profile,
        settings: req.user.settings,
        stats: req.user.stats
      }
    });
  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.status(500).json({
      message: '获取用户信息失败',
      error: error.message
    });
  }
});

app.post('/api/auth/verify', authenticateToken, (req, res) => {
  res.json({
    message: '令牌有效',
    valid: true,
    user: {
      id: req.user._id,
      username: req.user.username,
      email: req.user.email
    }
  });
});

// 美德记录路由
app.get('/api/virtues/records/:date', authenticateToken, async (req, res) => {
  try {
    const { date } = req.params;
    const recordDate = new Date(date);
    
    if (isNaN(recordDate.getTime())) {
      return res.status(400).json({
        message: '无效的日期格式',
        code: 'INVALID_DATE'
      });
    }

    let record = await memoryStorage.findVirtueRecord(req.user._id, recordDate);

    // 如果记录不存在，创建一个新的
    if (!record) {
      const year = recordDate.getFullYear();
      const week = memoryStorage.getCurrentWeek();
      
      record = await memoryStorage.createVirtueRecord({
        userId: req.user._id,
        date: new Date(recordDate.setHours(0, 0, 0, 0)),
        week,
        year,
        focusVirtue: req.user.settings.currentFocus
      });
    }

    res.json({ record });
  } catch (error) {
    console.error('获取美德记录错误:', error);
    res.status(500).json({
      message: '获取美德记录失败',
      error: error.message
    });
  }
});

app.get('/api/virtues/records/week/:year/:week', authenticateToken, async (req, res) => {
  try {
    const { year, week } = req.params;
    const yearNum = parseInt(year);
    const weekNum = parseInt(week);
    
    if (isNaN(yearNum) || isNaN(weekNum) || weekNum < 1 || weekNum > 53) {
      return res.status(400).json({
        message: '无效的年份或周数',
        code: 'INVALID_WEEK'
      });
    }

    const records = await memoryStorage.findWeekRecords(req.user._id, yearNum, weekNum);
    
    res.json({ records });
  } catch (error) {
    console.error('获取周记录错误:', error);
    res.status(500).json({
      message: '获取周记录失败',
      error: error.message
    });
  }
});

app.put('/api/virtues/records/:date/virtue', authenticateToken, async (req, res) => {
  try {
    const { date } = req.params;
    const { virtueIndex, completed, note = '' } = req.body;
    const recordDate = new Date(date);
    
    if (isNaN(recordDate.getTime())) {
      return res.status(400).json({
        message: '无效的日期格式',
        code: 'INVALID_DATE'
      });
    }

    let record = await memoryStorage.findVirtueRecord(req.user._id, recordDate);

    // 如果记录不存在，创建一个新的
    if (!record) {
      const year = recordDate.getFullYear();
      const week = memoryStorage.getCurrentWeek();
      
      record = await memoryStorage.createVirtueRecord({
        userId: req.user._id,
        date: new Date(recordDate.setHours(0, 0, 0, 0)),
        week,
        year,
        focusVirtue: req.user.settings.currentFocus
      });
    }

    // 更新美德状态
    record.virtues[virtueIndex.toString()] = {
      completed,
      note,
      timestamp: new Date()
    };

    await memoryStorage.updateVirtueRecord(record._id, record);

    res.json({
      message: '美德状态更新成功',
      record
    });
  } catch (error) {
    console.error('更新美德状态错误:', error);
    res.status(500).json({
      message: '更新美德状态失败',
      error: error.message
    });
  }
});

app.put('/api/virtues/records/:date/reflection', authenticateToken, async (req, res) => {
  try {
    const { date } = req.params;
    const { reflection, rating } = req.body;
    const recordDate = new Date(date);
    
    if (isNaN(recordDate.getTime())) {
      return res.status(400).json({
        message: '无效的日期格式',
        code: 'INVALID_DATE'
      });
    }

    let record = await memoryStorage.findVirtueRecord(req.user._id, recordDate);

    // 如果记录不存在，创建一个新的
    if (!record) {
      const year = recordDate.getFullYear();
      const week = memoryStorage.getCurrentWeek();
      
      record = await memoryStorage.createVirtueRecord({
        userId: req.user._id,
        date: new Date(recordDate.setHours(0, 0, 0, 0)),
        week,
        year,
        focusVirtue: req.user.settings.currentFocus
      });
    }

    // 更新反思内容
    if (reflection !== undefined) record.dailyReflection = reflection;
    if (rating !== undefined) record.dailyRating = rating;

    await memoryStorage.updateVirtueRecord(record._id, record);

    res.json({
      message: '每日反思更新成功',
      record
    });
  } catch (error) {
    console.error('更新每日反思错误:', error);
    res.status(500).json({
      message: '更新每日反思失败',
      error: error.message
    });
  }
});

app.get('/api/virtues/stats', authenticateToken, async (req, res) => {
  try {
    const stats = await memoryStorage.getUserStats(req.user._id);
    
    // 计算连续打卡天数（简化版本）
    const currentStreak = 0; // 这里可以实现更复杂的逻辑
    
    res.json({
      stats: {
        ...stats,
        currentStreak
      }
    });
  } catch (error) {
    console.error('获取统计数据错误:', error);
    res.status(500).json({
      message: '获取统计数据失败',
      error: error.message
    });
  }
});

app.get('/api/virtues/definitions', (req, res) => {
  const virtuesData = [
    { name: "1. 节制", desc: "食不过饱，饮不过量", tips: ["控制饮食量，吃到七分饱就停止", "避免过量饮酒，保持清醒", "培养对欲望的自我控制能力", "在购物前思考是否真的需要"] },
    { name: "2. 沉默", desc: "言必有益，避免闲谈", tips: ["说话前先思考是否有必要", "避免八卦和负面言论", "多听少说，学会倾听", "用沉默来避免不必要的冲突"] },
    { name: "3. 秩序", desc: "物归其位，事按时做", tips: ["保持工作环境整洁有序", "制定每日计划并严格执行", "为每样物品安排固定位置", "按时完成承诺的任务"] },
    { name: "4. 决心", desc: "下定决心做该做之事", tips: ["设定明确的目标并坚持执行", "克服拖延，立即行动", "培养意志力，不轻易放弃", "将大目标分解为小步骤"] },
    { name: "5. 节俭", desc: "花钱须于己于人有利", tips: ["制定预算并严格执行", "避免冲动消费", "投资于自我提升", "为未来储蓄和规划"] },
    { name: "6. 勤勉", desc: "珍惜时间，用于有益之事", tips: ["合理规划时间，提高效率", "避免浪费时间在无意义的事情上", "持续学习新知识和技能", "保持专注，一次只做一件事"] },
    { name: "7. 诚实", desc: "不欺骗，思想纯洁公正", tips: ["始终说真话，即使困难", "承认错误并承担责任", "保持内心的诚实和正直", "避免任何形式的欺骗"] },
    { name: "8. 正义", desc: "不损人利己，尽责助人", tips: ["公平对待每个人", "帮助需要帮助的人", "不占他人便宜", "为正义发声"] },
    { name: "9. 中庸", desc: "避免极端，忍让化解怨恨", tips: ["保持平衡，避免走极端", "学会妥协和忍让", "控制情绪，理性处理冲突", "寻求中间道路"] },
    { name: "10. 清洁", desc: "身体、衣着、居所洁净", tips: ["保持个人卫生", "整理居住和工作环境", "穿着得体整洁", "培养良好的生活习惯"] },
    { name: "11. 平静", desc: "不为琐事扰乱心神", tips: ["学会放松和冥想", "不被小事困扰", "保持内心的平静", "培养抗压能力"] },
    { name: "12. 贞洁", desc: "节欲保健康，不损名誉", tips: ["保持身心的纯洁", "避免不当行为", "尊重自己和他人", "培养高尚的品德"] },
    { name: "13. 谦逊", desc: "效法耶稣与苏格拉底", tips: ["承认自己的不足", "虚心学习他人优点", "不炫耀成就", "保持开放和谦虚的态度"] }
  ];
  
  res.json({ virtues: virtuesData });
});

// 用户设置路由
app.put('/api/users/:userId/settings', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { currentFocus, notifications, privacy } = req.body;

    if (userId !== req.user._id) {
      return res.status(403).json({
        message: '无权访问此资源',
        code: 'ACCESS_DENIED'
      });
    }

    const user = await memoryStorage.findUserById(userId);
    if (!user) {
      return res.status(404).json({
        message: '用户不存在',
        code: 'USER_NOT_FOUND'
      });
    }

    // 更新设置
    if (currentFocus !== undefined) user.settings.currentFocus = currentFocus;
    if (notifications) {
      Object.assign(user.settings.notifications, notifications);
    }
    if (privacy) {
      Object.assign(user.settings.privacy, privacy);
    }

    await memoryStorage.updateUser(userId, user);

    res.json({
      message: '设置更新成功',
      settings: user.settings
    });
  } catch (error) {
    console.error('更新用户设置错误:', error);
    res.status(500).json({
      message: '更新用户设置失败',
      error: error.message
    });
  }
});

// 健康检查端点
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: '富兰克林美德系统API运行正常（内存存储版本）',
    timestamp: new Date().toISOString(),
    storage: 'memory'
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

app.listen(PORT, () => {
  console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
  console.log(`📱 前端页面: http://localhost:${PORT}`);
  console.log(`🔗 API健康检查: http://localhost:${PORT}/api/health`);
  console.log(`💾 使用内存存储（数据重启后会丢失）`);
});

module.exports = app;