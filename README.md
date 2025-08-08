# 🌟 富兰克林13美德养成系统

一个基于富兰克林13美德体系的个人品德培养工具，支持多用户、数据持久化的全栈Web应用。

## 📖 项目背景

本杰明·富兰克林（Benjamin Franklin）是美国历史上著名的政治家、科学家和作家。他提出了13项美德作为个人品德培养的指导原则，通过每周专注一项美德的方式，帮助人们逐步培养良好的品德习惯。

## 🎯 项目功能

### 核心功能
- **👤 用户系统** - 用户注册、登录、JWT认证
- **📅 周度打卡** - 每周专注一项美德，每天检查执行情况
- **📊 数据统计** - 实时显示完成率、连续打卡天数等统计信息
- **🎯 专注模式** - 选择本周重点培养的美德，跟踪进度
- **📝 笔记系统** - 记录每日感悟和进步
- **🔥 连续打卡** - 追踪连续打卡天数，激励持续坚持
- **📈 历史回顾** - 查看不同周的数据和进度
- **💾 数据持久化** - MongoDB数据库存储，支持多设备同步

### 13项美德
1. **节制** - 食不过饱，饮不过量
2. **沉默** - 言必有益，避免闲谈
3. **秩序** - 物归其位，事按时做
4. **决心** - 下定决心做该做之事
5. **节俭** - 花钱须于己于人有利
6. **勤勉** - 珍惜时间，用于有益之事
7. **诚实** - 不欺骗，思想纯洁公正
8. **正义** - 不损人利己，尽责助人
9. **中庸** - 避免极端，忍让化解怨恨
10. **清洁** - 身体、衣着、居所洁净
11. **平静** - 不为琐事扰乱心神
12. **贞洁** - 节欲保健康，不损名誉
13. **谦逊** - 效法耶稣与苏格拉底

## 🚀 快速开始

### 环境要求
- Node.js 16+
- MongoDB 4.4+
- npm 或 yarn

### 安装和运行

```bash
# 1. 克隆项目
git clone <repository-url>
cd beautiful13

# 2. 安装依赖
npm install

# 3. 配置环境变量
cp .env.example .env
# 编辑 .env 文件，设置数据库连接等配置

# 4. 启动 MongoDB（如果未运行）
brew services start mongodb/brew/mongodb-community

# 5. 启动服务器
npm run server

# 6. 访问应用
# 全栈版：http://localhost:3003
```

### 快速体验（无需数据库）
```bash
# 启动内存版本（数据不持久化）
npm run server:memory
```

## 📁 项目结构

```
beautiful13/
├── server/                    # 后端服务器
│   ├── app.js                # 主服务器文件（MongoDB版）
│   ├── app-memory.js         # 内存版服务器
│   ├── middleware/
│   │   └── auth.js          # JWT认证中间件
│   ├── models/
│   │   ├── User.js          # 用户数据模型
│   │   └── VirtueRecord.js  # 美德记录模型
│   ├── routes/
│   │   ├── auth.js          # 认证路由
│   │   ├── users.js         # 用户路由
│   │   └── virtues.js       # 美德记录路由
│   └── storage/
│       └── memoryStorage.js # 内存存储实现
├── index-fullstack.html      # 全栈版前端
├── app-fullstack.js          # 全栈版JavaScript
├── styles.css                # 样式文件
├── package.json              # 项目依赖
├── .env.example              # 环境变量示例
├── .gitignore                # Git忽略文件
└── README.md                 # 项目说明
```

## 🎓 全栈学习价值

### 学习目标
这个项目是学习全栈开发的绝佳案例，涵盖了：

#### 前端技术
1. **HTML基础**
   - 语义化标签
   - 表单元素
   - 表格结构

2. **CSS技能**
   - CSS Grid布局
   - 响应式设计
   - CSS动画和过渡
   - 渐变背景和现代UI设计

3. **JavaScript核心**
   - DOM操作
   - 事件处理
   - Fetch API和异步编程
   - JWT令牌管理
   - 错误处理和用户反馈



#### 后端技术
1. **Node.js和Express**
   - RESTful API设计
   - 中间件使用
   - 路由管理
   - 错误处理

2. **数据库技术**
   - MongoDB集成
   - Mongoose ODM
   - 数据模型设计
   - 查询优化

3. **用户认证**
   - JWT令牌认证
   - 密码加密（bcrypt）
   - 会话管理
   - 安全最佳实践

4. **开发工具**
   - 环境变量管理
   - 项目结构设计
   - Git版本控制
   - 依赖管理

### 技术栈对比

| 特性 | 全栈版 | 内存版 |
|------|--------|--------|
| 前端框架 | 原生JavaScript | 原生JavaScript |
| 后端 | Node.js + Express | Node.js + Express |
| 数据库 | MongoDB | 内存存储 |
| 用户系统 | JWT认证 | 简单认证 |
| 数据持久化 | ✅ | ❌ |
| 多用户支持 | ✅ | ✅ |
| 学习复杂度 | 高 | 中 |
| 生产就绪 | ✅ | ❌ |

## 🛠️ 功能详解

### 1. 用户认证系统
- 用户注册和登录
- JWT令牌认证
- 自动令牌刷新
- 安全的密码加密存储

### 2. 打卡系统
- 点击表格格子切换打卡状态
- 数据实时同步到MongoDB
- 支持查看历史周数据
- 多用户数据隔离

### 3. 统计面板
- **本周完成**：当前周打卡总数
- **完成率**：当前周完成百分比
- **连续天数**：连续打卡天数
- **最佳记录**：历史最佳连续天数

### 4. 专注模式
- 选择本周重点培养的美德
- 显示专注美德的进度条
- 可随时更换专注美德

### 5. 数据管理
- MongoDB持久化存储
- 跨设备数据同步
- 数据备份和恢复
- RESTful API接口

## 🎯 学习路径建议

### 初学者路径
1. **体验功能** - 先运行全栈版了解完整功能
2. **学习前端基础** - HTML/CSS/JavaScript基础
3. **理解API交互** - 学习前后端数据交互


### 后端学习路径
1. **Node.js基础** - 理解服务器端JavaScript
2. **Express框架** - 学习Web框架的使用
3. **数据库操作** - MongoDB和Mongoose的使用
4. **API设计** - RESTful API的设计原则
5. **认证系统** - JWT和用户认证的实现

### 全栈进阶
1. **代码对比** - 理解不同版本的差异
2. **功能扩展** - 尝试添加新功能
3. **性能优化** - 数据库查询和前端性能优化
4. **部署上线** - 学习项目部署和运维

## 🔧 自定义和扩展

### 添加新的API端点
```javascript
// 在 server/routes/ 中添加新路由
router.post('/api/new-feature', authenticateToken, async (req, res) => {
  try {
    // 你的业务逻辑
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### 扩展数据模型
```javascript
// 在 server/models/ 中修改或添加新模型
const newSchema = new mongoose.Schema({
  // 你的字段定义
});
```

### 前端功能扩展
```javascript
// 在 app-fullstack.js 中添加新功能
async function newFeature() {
  try {
    const response = await fetchWithAuth('/api/new-feature', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    // 处理响应
  } catch (error) {
    showError('操作失败：' + error.message);
  }
}
```

### 修改样式
```css
/* 在 styles.css 中添加新样式 */
.custom-feature {
  /* 你的样式 */
}
```

## 📚 学习资源

### 前端基础
- [MDN Web Docs](https://developer.mozilla.org/) - HTML/CSS/JavaScript官方文档
- [Vue.js官方文档](https://vuejs.org/) - Vue框架学习
- [现代JavaScript教程](https://zh.javascript.info/) - JavaScript深入学习

### 后端技术
- [Node.js官方文档](https://nodejs.org/) - Node.js学习
- [Express.js指南](https://expressjs.com/) - Express框架
- [MongoDB大学](https://university.mongodb.com/) - MongoDB学习
- [Mongoose文档](https://mongoosejs.com/) - MongoDB ODM

### 全栈开发
- [JWT.io](https://jwt.io/) - JWT令牌学习
- [RESTful API设计](https://restfulapi.net/) - API设计最佳实践
- [bcrypt文档](https://github.com/kelektiv/node.bcrypt.js) - 密码加密

## 📦 可用脚本

```bash
# 启动MongoDB版本服务器
npm run server

# 启动内存版本服务器（无需数据库）
npm run server:memory

# 开发模式（自动重启）
npm run dev

# 安装依赖
npm install
```

## 🚀 部署指南

### 本地部署
1. 确保MongoDB服务运行
2. 配置环境变量
3. 运行 `npm run server`

### 生产部署
1. 设置生产环境的MongoDB连接
2. 配置JWT密钥和其他环境变量
3. 使用PM2或类似工具管理进程
4. 配置反向代理（Nginx）

## 🤝 贡献和反馈

欢迎提交问题、建议或改进方案！

### 如何贡献
1. Fork项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 发起Pull Request

## 📄 许可证

本项目采用MIT许可证，详见LICENSE文件。

## 🙏 致谢

- 感谢富兰克林提出的13美德体系
- 感谢Vue.js团队提供的优秀框架
- 感谢所有为前端开发做出贡献的开发者

---

**记住：学习全栈开发最重要的是实践！通过这个项目，你可以从前端到后端，从数据库到部署，全面掌握现代Web开发的技能。**

## 🏆 项目特色

- ✅ **完整的用户认证系统**
- ✅ **RESTful API设计**
- ✅ **MongoDB数据持久化**
- ✅ **JWT令牌认证**
- ✅ **响应式UI设计**
- ✅ **多版本对比学习**
- ✅ **生产就绪的代码结构**
- ✅ **详细的学习文档**