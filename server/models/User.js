const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, '用户名是必需的'],
    unique: true,
    trim: true,
    minlength: [3, '用户名至少需要3个字符'],
    maxlength: [20, '用户名不能超过20个字符']
  },
  email: {
    type: String,
    required: [true, '邮箱是必需的'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, '请输入有效的邮箱地址']
  },
  password: {
    type: String,
    required: [true, '密码是必需的'],
    minlength: [6, '密码至少需要6个字符']
  },
  profile: {
    displayName: {
      type: String,
      default: function() { return this.username; }
    },
    avatar: {
      type: String,
      default: ''
    },
    bio: {
      type: String,
      maxlength: [200, '个人简介不能超过200个字符'],
      default: ''
    },
    joinDate: {
      type: Date,
      default: Date.now
    }
  },
  settings: {
    currentFocus: {
      type: Number,
      default: 0,
      min: 0,
      max: 12
    },
    notifications: {
      daily: { type: Boolean, default: true },
      weekly: { type: Boolean, default: true },
      achievements: { type: Boolean, default: true }
    },
    privacy: {
      profilePublic: { type: Boolean, default: false },
      statsPublic: { type: Boolean, default: false }
    }
  },
  stats: {
    totalDays: { type: Number, default: 0 },
    currentStreak: { type: Number, default: 0 },
    bestStreak: { type: Number, default: 0 },
    lastActiveDate: { type: Date, default: null }
  }
}, {
  timestamps: true
});

// 密码加密中间件
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// 密码验证方法
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// 更新活跃状态
userSchema.methods.updateActivity = function() {
  this.stats.lastActiveDate = new Date();
  return this.save();
};

// 获取公开信息
userSchema.methods.getPublicProfile = function() {
  return {
    id: this._id,
    username: this.username,
    displayName: this.profile.displayName,
    avatar: this.profile.avatar,
    bio: this.profile.bio,
    joinDate: this.profile.joinDate,
    stats: this.settings.privacy.statsPublic ? this.stats : null
  };
};

module.exports = mongoose.model('User', userSchema);