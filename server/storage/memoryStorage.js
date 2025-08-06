// 内存存储 - 用于开发和演示
class MemoryStorage {
  constructor() {
    this.users = new Map();
    this.virtueRecords = new Map();
    this.userIdCounter = 1;
    this.recordIdCounter = 1;
  }

  // 用户相关方法
  async createUser(userData) {
    const userId = this.userIdCounter++;
    const user = {
      _id: userId.toString(),
      ...userData,
      profile: {
        displayName: userData.username,
        avatar: '',
        bio: '',
        joinDate: new Date()
      },
      settings: {
        currentFocus: 0,
        notifications: {
          daily: true,
          weekly: true,
          achievements: true
        },
        privacy: {
          profilePublic: false,
          statsPublic: false
        }
      },
      stats: {
        totalDays: 0,
        currentStreak: 0,
        bestStreak: 0,
        lastActiveDate: null
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.users.set(userId.toString(), user);
    return user;
  }

  async findUserByEmail(email) {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return null;
  }

  async findUserByUsername(username) {
    for (const user of this.users.values()) {
      if (user.username === username) {
        return user;
      }
    }
    return null;
  }

  async findUserById(id) {
    return this.users.get(id.toString()) || null;
  }

  async updateUser(id, updateData) {
    const user = this.users.get(id.toString());
    if (!user) return null;
    
    Object.assign(user, updateData, { updatedAt: new Date() });
    this.users.set(id.toString(), user);
    return user;
  }

  async deleteUser(id) {
    const deleted = this.users.delete(id.toString());
    // 同时删除用户的所有记录
    for (const [recordId, record] of this.virtueRecords.entries()) {
      if (record.userId === id.toString()) {
        this.virtueRecords.delete(recordId);
      }
    }
    return deleted;
  }

  // 美德记录相关方法
  async createVirtueRecord(recordData) {
    const recordId = this.recordIdCounter++;
    const record = {
      _id: recordId.toString(),
      ...recordData,
      virtues: recordData.virtues || this.getDefaultVirtues(),
      stats: {
        completedCount: 0,
        completionRate: 0
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.calculateStats(record);
    this.virtueRecords.set(recordId.toString(), record);
    return record;
  }

  async findVirtueRecord(userId, date) {
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    
    for (const record of this.virtueRecords.values()) {
      if (record.userId === userId.toString()) {
        const recordDate = new Date(record.date);
        recordDate.setHours(0, 0, 0, 0);
        
        if (recordDate.getTime() === targetDate.getTime()) {
          return record;
        }
      }
    }
    return null;
  }

  async findWeekRecords(userId, year, week) {
    const records = [];
    
    for (const record of this.virtueRecords.values()) {
      if (record.userId === userId.toString() && 
          record.year === year && 
          record.week === week) {
        records.push(record);
      }
    }
    
    return records.sort((a, b) => new Date(a.date) - new Date(b.date));
  }

  async updateVirtueRecord(id, updateData) {
    const record = this.virtueRecords.get(id.toString());
    if (!record) return null;
    
    Object.assign(record, updateData, { updatedAt: new Date() });
    this.calculateStats(record);
    this.virtueRecords.set(id.toString(), record);
    return record;
  }

  async getUserStats(userId) {
    const userRecords = [];
    
    for (const record of this.virtueRecords.values()) {
      if (record.userId === userId.toString()) {
        userRecords.push(record);
      }
    }
    
    if (userRecords.length === 0) {
      return {
        totalDays: 0,
        totalCompleted: 0,
        avgCompletionRate: 0,
        bestDay: 0,
        lastRecord: null
      };
    }
    
    const totalDays = userRecords.length;
    const totalCompleted = userRecords.reduce((sum, record) => sum + record.stats.completedCount, 0);
    const avgCompletionRate = userRecords.reduce((sum, record) => sum + record.stats.completionRate, 0) / totalDays;
    const bestDay = Math.max(...userRecords.map(record => record.stats.completedCount));
    const lastRecord = userRecords.reduce((latest, record) => 
      new Date(record.date) > new Date(latest.date) ? record : latest
    ).date;
    
    return {
      totalDays,
      totalCompleted,
      avgCompletionRate: Math.round(avgCompletionRate),
      bestDay,
      lastRecord
    };
  }

  // 辅助方法
  getDefaultVirtues() {
    const virtues = {};
    for (let i = 0; i < 13; i++) {
      virtues[i.toString()] = {
        completed: false,
        note: '',
        timestamp: new Date()
      };
    }
    return virtues;
  }

  calculateStats(record) {
    let completedCount = 0;
    
    for (const virtue of Object.values(record.virtues)) {
      if (virtue.completed) {
        completedCount++;
      }
    }
    
    record.stats.completedCount = completedCount;
    record.stats.completionRate = Math.round((completedCount / 13) * 100);
  }

  // 获取当前周数
  getCurrentWeek() {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const diff = now - start + (start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000;
    const oneWeek = 1000 * 60 * 60 * 24 * 7;
    return Math.floor(diff / oneWeek) + 1;
  }

  // 清空所有数据（用于测试）
  clear() {
    this.users.clear();
    this.virtueRecords.clear();
    this.userIdCounter = 1;
    this.recordIdCounter = 1;
  }
}

// 创建全局实例
const memoryStorage = new MemoryStorage();

module.exports = memoryStorage;