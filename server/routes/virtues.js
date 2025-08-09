const express = require('express');
const { body, query, validationResult } = require('express-validator');
const VirtueRecord = require('../models/VirtueRecord');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');
const { virtuesData, getCurrentWeek } = require('../utils/shared-data');

const router = express.Router();

// 美德更新验证规则
const updateVirtueValidation = [
  body('virtueIndex')
    .isInt({ min: 0, max: 12 })
    .withMessage('美德索引必须在0-12之间'),
  body('completed')
    .isBoolean()
    .withMessage('完成状态必须是布尔值'),
  body('note')
    .optional()
    .isLength({ max: 500 })
    .withMessage('笔记不能超过500个字符')
];

// 每日反思验证规则
const dailyReflectionValidation = [
  body('reflection')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('每日反思不能超过1000个字符'),
  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('评分必须在1-5之间')
];

// 美德更新查询参数验证规则（用于 /records/virtue?date=xxx 格式）
const updateVirtueQueryValidation = [
  query('date')
    .notEmpty()
    .withMessage('日期参数是必需的')
    .isISO8601()
    .withMessage('日期格式必须是有效的ISO8601格式'),
  body('virtueIndex')
    .isInt({ min: 0, max: 12 })
    .withMessage('美德索引必须在0-12之间'),
  body('completed')
    .isBoolean()
    .withMessage('完成状态必须是布尔值'),
  body('note')
    .optional()
    .isLength({ max: 500 })
    .withMessage('笔记不能超过500个字符')
];

// 获取用户某日的美德记录
router.get('/records/:date', authenticateToken, async (req, res) => {
  try {
    const { date } = req.params;
    const recordDate = new Date(date);
    
    if (isNaN(recordDate.getTime())) {
      return res.status(400).json({
        message: '无效的日期格式',
        code: 'INVALID_DATE'
      });
    }

    let record = await VirtueRecord.findOne({
      userId: req.user._id,
      date: {
        $gte: new Date(recordDate.setHours(0, 0, 0, 0)),
        $lt: new Date(recordDate.setHours(23, 59, 59, 999))
      }
    });

    // 如果记录不存在，创建一个新的
    if (!record) {
      const year = recordDate.getFullYear();
      const week = getCurrentWeek();
      
      record = new VirtueRecord({
        userId: req.user._id,
        date: new Date(recordDate.setHours(0, 0, 0, 0)),
        week,
        year,
        focusVirtue: req.user.settings.currentFocus
      });
      
      await record.save();
    }

    res.json({ record });
  } catch (error) {
    console.error('获取美德记录错误:', error);
    res.status(500).json({
      message: '获取美德记录失败',
      error: process.env.NODE_ENV === 'development' ? error.message : '请稍后重试'
    });
  }
});

// 获取用户某周的美德记录
router.get('/records/week/:year/:week', authenticateToken, async (req, res) => {
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

    const records = await VirtueRecord.getWeekRecords(req.user._id, yearNum, weekNum);
    
    res.json({ records });
  } catch (error) {
    console.error('获取周记录错误:', error);
    res.status(500).json({
      message: '获取周记录失败',
      error: process.env.NODE_ENV === 'development' ? error.message : '请稍后重试'
    });
  }
});

// 更新美德完成状态（查询参数格式：/records/virtue?date=xxx）
router.put('/records/virtue', 
  authenticateToken, 
  updateVirtueQueryValidation, 
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

      const { date } = req.query;  // 从查询参数获取日期
      const { virtueIndex, completed, note = '' } = req.body;
      const recordDate = new Date(date);
      
      if (isNaN(recordDate.getTime())) {
        return res.status(400).json({
          message: '无效的日期格式',
          code: 'INVALID_DATE'
        });
      }

      let record = await VirtueRecord.findOne({
        userId: req.user._id,
        date: {
          $gte: new Date(recordDate.setHours(0, 0, 0, 0)),
          $lt: new Date(recordDate.setHours(23, 59, 59, 999))
        }
      });

      // 如果记录不存在，创建一个新的
      if (!record) {
        const year = recordDate.getFullYear();
        const week = getCurrentWeek();
        
        record = new VirtueRecord({
          userId: req.user._id,
          date: new Date(recordDate.setHours(0, 0, 0, 0)),
          week,
          year,
          focusVirtue: req.user.settings.currentFocus
        });
      }

      // 更新美德状态
      await record.updateVirtue(virtueIndex, completed, note);

      res.json({
        message: '美德状态更新成功',
        record
      });
    } catch (error) {
      console.error('更新美德状态错误:', error);
      res.status(500).json({
        message: '更新美德状态失败',
        error: process.env.NODE_ENV === 'development' ? error.message : '请稍后重试'
      });
    }
  }
);

// 更新每日反思
router.put('/records/:date/reflection', 
  authenticateToken, 
  dailyReflectionValidation, 
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

      const { date } = req.params;
      const { reflection, rating } = req.body;
      const recordDate = new Date(date);
      
      if (isNaN(recordDate.getTime())) {
        return res.status(400).json({
          message: '无效的日期格式',
          code: 'INVALID_DATE'
        });
      }

      let record = await VirtueRecord.findOne({
        userId: req.user._id,
        date: {
          $gte: new Date(recordDate.setHours(0, 0, 0, 0)),
          $lt: new Date(recordDate.setHours(23, 59, 59, 999))
        }
      });

      // 如果记录不存在，创建一个新的
      if (!record) {
        const year = recordDate.getFullYear();
        const week = getCurrentWeek();
        
        record = new VirtueRecord({
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

      await record.save();

      res.json({
        message: '每日反思更新成功',
        record
      });
    } catch (error) {
      console.error('更新每日反思错误:', error);
      res.status(500).json({
        message: '更新每日反思失败',
        error: process.env.NODE_ENV === 'development' ? error.message : '请稍后重试'
      });
    }
  }
);

// 获取用户统计数据
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const stats = await VirtueRecord.getUserStats(req.user._id);
    
    // 计算连续打卡天数
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let currentStreak = 0;
    let checkDate = new Date(today);
    
    // 向前查找连续打卡天数
    while (true) {
      const record = await VirtueRecord.findOne({
        userId: req.user._id,
        date: {
          $gte: checkDate,
          $lt: new Date(checkDate.getTime() + 24 * 60 * 60 * 1000)
        }
      });
      
      if (record && record.stats.completedCount > 0) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

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
      error: process.env.NODE_ENV === 'development' ? error.message : '请稍后重试'
    });
  }
});

// 获取美德定义数据
router.get('/definitions', (req, res) => {
  res.json({ virtues: virtuesData });
});

module.exports = router;