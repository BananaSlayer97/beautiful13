const mongoose = require('mongoose');

const virtueRecordSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  date: {
    type: Date,
    required: true,
    index: true
  },
  week: {
    type: Number,
    required: true,
    min: 1
  },
  year: {
    type: Number,
    required: true
  },
  // 13项美德的完成状态
  virtues: {
    type: Map,
    of: {
      completed: { type: Boolean, default: false },
      note: { type: String, maxlength: 500, default: '' },
      timestamp: { type: Date, default: Date.now }
    },
    default: function() {
      const virtuesMap = new Map();
      for (let i = 0; i < 13; i++) {
        virtuesMap.set(i.toString(), {
          completed: false,
          note: '',
          timestamp: new Date()
        });
      }
      return virtuesMap;
    }
  },
  // 当日重点美德
  focusVirtue: {
    type: Number,
    min: 0,
    max: 12,
    default: null
  },
  // 当日总体感悟
  dailyReflection: {
    type: String,
    maxlength: 1000,
    default: ''
  },
  // 当日评分 (1-5)
  dailyRating: {
    type: Number,
    min: 1,
    max: 5,
    default: null
  },
  // 统计信息
  stats: {
    completedCount: { type: Number, default: 0 },
    completionRate: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// 复合索引
virtueRecordSchema.index({ userId: 1, date: 1 }, { unique: true });
virtueRecordSchema.index({ userId: 1, year: 1, week: 1 });

// 计算统计信息的中间件
virtueRecordSchema.pre('save', function(next) {
  let completedCount = 0;
  
  // 计算完成的美德数量
  for (let [key, virtue] of this.virtues) {
    if (virtue.completed) {
      completedCount++;
    }
  }
  
  this.stats.completedCount = completedCount;
  this.stats.completionRate = Math.round((completedCount / 13) * 100);
  
  next();
});

// 静态方法：获取用户某周的记录
virtueRecordSchema.statics.getWeekRecords = function(userId, year, week) {
  return this.find({ 
    userId, 
    year, 
    week 
  }).sort({ date: 1 });
};

// 静态方法：获取用户的统计数据
virtueRecordSchema.statics.getUserStats = async function(userId) {
  const pipeline = [
    { $match: { userId: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalDays: { $sum: 1 },
        totalCompleted: { $sum: '$stats.completedCount' },
        avgCompletionRate: { $avg: '$stats.completionRate' },
        bestDay: { $max: '$stats.completedCount' },
        lastRecord: { $max: '$date' }
      }
    }
  ];
  
  const result = await this.aggregate(pipeline);
  return result[0] || {
    totalDays: 0,
    totalCompleted: 0,
    avgCompletionRate: 0,
    bestDay: 0,
    lastRecord: null
  };
};

// 实例方法：更新美德状态
virtueRecordSchema.methods.updateVirtue = function(virtueIndex, completed, note = '') {
  const virtue = this.virtues.get(virtueIndex.toString()) || {
    completed: false,
    note: '',
    timestamp: new Date()
  };
  
  virtue.completed = completed;
  virtue.note = note;
  virtue.timestamp = new Date();
  
  this.virtues.set(virtueIndex.toString(), virtue);
  return this.save();
};

// 实例方法：获取完成的美德列表
virtueRecordSchema.methods.getCompletedVirtues = function() {
  const completed = [];
  for (let [key, virtue] of this.virtues) {
    if (virtue.completed) {
      completed.push(parseInt(key));
    }
  }
  return completed;
};

module.exports = mongoose.model('VirtueRecord', virtueRecordSchema);