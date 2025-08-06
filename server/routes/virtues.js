const express = require('express');
const { body, query, validationResult } = require('express-validator');
const VirtueRecord = require('../models/VirtueRecord');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// 获取当前周数
const getCurrentWeek = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now - start + (start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000;
  const oneWeek = 1000 * 60 * 60 * 24 * 7;
  return Math.floor(diff / oneWeek) + 1;
};

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

// 更新美德完成状态
router.put('/records/:date/virtue', 
  authenticateToken, 
  updateVirtueValidation, 
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

module.exports = router;