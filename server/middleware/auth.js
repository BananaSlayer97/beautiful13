const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'franklin-virtues-secret-key-2024';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';

// 生成JWT令牌
const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRE });
};

// 验证JWT令牌中间件
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        message: '访问被拒绝，需要认证令牌',
        code: 'NO_TOKEN'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
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

// 可选认证中间件（不强制要求登录）
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');
      if (user) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // 可选认证失败时不返回错误，继续执行
    next();
  }
};

// 检查用户权限中间件
const checkPermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        message: '需要登录才能执行此操作',
        code: 'LOGIN_REQUIRED'
      });
    }

    // 这里可以根据需要添加更复杂的权限检查逻辑
    // 目前所有登录用户都有基本权限
    next();
  };
};

// 检查是否为资源所有者
const checkOwnership = (resourceField = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        message: '需要登录才能执行此操作',
        code: 'LOGIN_REQUIRED'
      });
    }

    const resourceUserId = req.params.userId || req.body[resourceField] || req.query[resourceField];
    
    if (resourceUserId && resourceUserId !== req.user._id.toString()) {
      return res.status(403).json({ 
        message: '无权访问此资源',
        code: 'ACCESS_DENIED'
      });
    }

    next();
  };
};

module.exports = {
  generateToken,
  authenticateToken,
  optionalAuth,
  checkPermission,
  checkOwnership
};