const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { generateToken, authenticateToken } = require('../middleware/auth');

const router = express.Router();

// 注册验证规则
const registerValidation = [
  body('username')
    .isLength({ min: 3, max: 20 })
    .withMessage('用户名长度必须在3-20个字符之间')
    .matches(/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/)
    .withMessage('用户名只能包含字母、数字、下划线和中文'),
  body('email')
    .isEmail()
    .withMessage('请输入有效的邮箱地址')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('密码至少需要6个字符')
    .matches(/^(?=.*[a-zA-Z])(?=.*\d)/)
    .withMessage('密码必须包含至少一个字母和一个数字')
];

// 登录验证规则
const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('请输入有效的邮箱地址')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('密码不能为空')
];

// 用户注册
router.post('/register', registerValidation, async (req, res) => {
  try {
    // 检查验证错误
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: '输入数据验证失败',
        errors: errors.array()
      });
    }

    const { username, email, password } = req.body;

    // 检查用户是否已存在
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      const field = existingUser.email === email ? '邮箱' : '用户名';
      return res.status(400).json({
        message: `该${field}已被注册`,
        code: 'USER_EXISTS'
      });
    }

    // 创建新用户
    const user = new User({
      username,
      email,
      password
    });

    await user.save();

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
      error: process.env.NODE_ENV === 'development' ? error.message : '请稍后重试'
    });
  }
});

// 用户登录
router.post('/login', loginValidation, async (req, res) => {
  try {
    // 检查验证错误
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: '输入数据验证失败',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // 查找用户
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        message: '邮箱或密码错误',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // 验证密码
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        message: '邮箱或密码错误',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // 更新用户活跃状态
    await user.updateActivity();

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
      error: process.env.NODE_ENV === 'development' ? error.message : '请稍后重试'
    });
  }
});

// 获取当前用户信息
router.get('/me', authenticateToken, async (req, res) => {
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
      error: process.env.NODE_ENV === 'development' ? error.message : '请稍后重试'
    });
  }
});

// 验证令牌
router.post('/verify', authenticateToken, (req, res) => {
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

// 刷新令牌
router.post('/refresh', authenticateToken, (req, res) => {
  try {
    const newToken = generateToken(req.user._id);
    res.json({
      message: '令牌刷新成功',
      token: newToken
    });
  } catch (error) {
    console.error('刷新令牌错误:', error);
    res.status(500).json({
      message: '刷新令牌失败',
      error: process.env.NODE_ENV === 'development' ? error.message : '请稍后重试'
    });
  }
});

module.exports = router;