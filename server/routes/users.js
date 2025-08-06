const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const VirtueRecord = require('../models/VirtueRecord');
const { authenticateToken, checkOwnership } = require('../middleware/auth');

const router = express.Router();

// 更新用户资料验证规则
const updateProfileValidation = [
  body('displayName')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('显示名称长度必须在1-50个字符之间'),
  body('bio')
    .optional()
    .isLength({ max: 200 })
    .withMessage('个人简介不能超过200个字符'),
  body('avatar')
    .optional()
    .isURL()
    .withMessage('头像必须是有效的URL地址')
];

// 更新设置验证规则
const updateSettingsValidation = [
  body('currentFocus')
    .optional()
    .isInt({ min: 0, max: 12 })
    .withMessage('当前专注美德索引必须在0-12之间'),
  body('notifications.daily')
    .optional()
    .isBoolean()
    .withMessage('每日通知设置必须是布尔值'),
  body('notifications.weekly')
    .optional()
    .isBoolean()
    .withMessage('每周通知设置必须是布尔值'),
  body('notifications.achievements')
    .optional()
    .isBoolean()
    .withMessage('成就通知设置必须是布尔值'),
  body('privacy.profilePublic')
    .optional()
    .isBoolean()
    .withMessage('资料公开设置必须是布尔值'),
  body('privacy.statsPublic')
    .optional()
    .isBoolean()
    .withMessage('统计公开设置必须是布尔值')
];

// 获取用户资料
router.get('/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({
        message: '用户不存在',
        code: 'USER_NOT_FOUND'
      });
    }

    // 检查是否为本人或资料是否公开
    const isOwner = req.user._id.toString() === userId;
    if (!isOwner && !user.settings.privacy.profilePublic) {
      return res.status(403).json({
        message: '该用户资料不公开',
        code: 'PROFILE_PRIVATE'
      });
    }

    // 获取用户统计数据
    const stats = await VirtueRecord.getUserStats(userId);
    
    res.json({
      user: isOwner ? {
        id: user._id,
        username: user.username,
        email: user.email,
        profile: user.profile,
        settings: user.settings,
        stats: { ...user.stats, ...stats }
      } : user.getPublicProfile()
    });
  } catch (error) {
    console.error('获取用户资料错误:', error);
    res.status(500).json({
      message: '获取用户资料失败',
      error: process.env.NODE_ENV === 'development' ? error.message : '请稍后重试'
    });
  }
});

// 更新用户资料
router.put('/:userId/profile', 
  authenticateToken, 
  checkOwnership(), 
  updateProfileValidation, 
  async (req, res) => {
    try {
      // 检查验证错误
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: '输入数据验证失败',
          errors: errors.array()
        });
      }

      const { userId } = req.params;
      const { displayName, bio, avatar } = req.body;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          message: '用户不存在',
          code: 'USER_NOT_FOUND'
        });
      }

      // 更新资料
      if (displayName !== undefined) user.profile.displayName = displayName;
      if (bio !== undefined) user.profile.bio = bio;
      if (avatar !== undefined) user.profile.avatar = avatar;

      await user.save();

      res.json({
        message: '资料更新成功',
        profile: user.profile
      });
    } catch (error) {
      console.error('更新用户资料错误:', error);
      res.status(500).json({
        message: '更新用户资料失败',
        error: process.env.NODE_ENV === 'development' ? error.message : '请稍后重试'
      });
    }
  }
);

// 更新用户设置
router.put('/:userId/settings', 
  authenticateToken, 
  checkOwnership(), 
  updateSettingsValidation, 
  async (req, res) => {
    try {
      // 检查验证错误
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: '输入数据验证失败',
          errors: errors.array()
        });
      }

      const { userId } = req.params;
      const { currentFocus, notifications, privacy } = req.body;

      const user = await User.findById(userId);
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

      await user.save();

      res.json({
        message: '设置更新成功',
        settings: user.settings
      });
    } catch (error) {
      console.error('更新用户设置错误:', error);
      res.status(500).json({
        message: '更新用户设置失败',
        error: process.env.NODE_ENV === 'development' ? error.message : '请稍后重试'
      });
    }
  }
);

// 获取用户统计数据
router.get('/:userId/stats', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        message: '用户不存在',
        code: 'USER_NOT_FOUND'
      });
    }

    // 检查权限
    const isOwner = req.user._id.toString() === userId;
    if (!isOwner && !user.settings.privacy.statsPublic) {
      return res.status(403).json({
        message: '该用户统计数据不公开',
        code: 'STATS_PRIVATE'
      });
    }

    // 获取详细统计数据
    const stats = await VirtueRecord.getUserStats(userId);
    
    res.json({
      stats: {
        ...user.stats,
        ...stats
      }
    });
  } catch (error) {
    console.error('获取用户统计错误:', error);
    res.status(500).json({
      message: '获取用户统计失败',
      error: process.env.NODE_ENV === 'development' ? error.message : '请稍后重试'
    });
  }
});

// 删除用户账户
router.delete('/:userId', 
  authenticateToken, 
  checkOwnership(), 
  async (req, res) => {
    try {
      const { userId } = req.params;
      
      // 删除用户的所有美德记录
      await VirtueRecord.deleteMany({ userId });
      
      // 删除用户
      await User.findByIdAndDelete(userId);

      res.json({
        message: '账户删除成功'
      });
    } catch (error) {
      console.error('删除用户账户错误:', error);
      res.status(500).json({
        message: '删除账户失败',
        error: process.env.NODE_ENV === 'development' ? error.message : '请稍后重试'
      });
    }
  }
);

module.exports = router;