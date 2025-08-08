// MongoDB初始化脚本
// 创建应用数据库和用户

db = db.getSiblingDB('franklin-virtues');

// 创建应用用户
db.createUser({
  user: 'franklin_user',
  pwd: 'franklin_password_2024',
  roles: [
    {
      role: 'readWrite',
      db: 'franklin-virtues'
    }
  ]
});

// 创建索引以提高性能
db.users.createIndex({ "username": 1 }, { unique: true });
db.users.createIndex({ "email": 1 }, { unique: true });

db.virtuerecords.createIndex({ "userId": 1, "date": 1 }, { unique: true });
db.virtuerecords.createIndex({ "userId": 1, "year": 1, "week": 1 });
db.virtuerecords.createIndex({ "date": 1 });

// 插入示例数据（可选）
print('MongoDB初始化完成');
print('数据库: franklin-virtues');
print('用户: franklin_user');
print('索引已创建');