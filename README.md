# 🌟 富兰克林13美德养成系统

一个基于富兰克林13美德体系的个人品德培养工具，支持多用户、数据持久化的全栈Web应用。

## 📖 项目背景

本杰明·富兰克林提出了13项美德作为个人品德培养的指导原则，通过每周专注一项美德的方式，帮助人们逐步培养良好的品德习惯。

## 🎯 核心功能

- **👤 用户系统** - 注册、登录、JWT认证
- **📅 周度打卡** - 每周专注一项美德，每天检查执行情况
- **📊 数据统计** - 完成率、连续打卡天数等统计
- **🎯 专注模式** - 选择本周重点培养的美德
- **📝 笔记系统** - 记录每日感悟和进步
- **💾 数据持久化** - MongoDB存储，支持多设备同步

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
- Node.js 22+
- MongoDB 5.0+
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

# 4. 启动服务器
npm run server

# 5. 访问应用
# 全栈版：http://localhost:3003
```

## 📁 项目结构

```
beautiful13/
├── server/                    # 后端服务器
│   ├── app.js                # 主服务器文件
│   ├── middleware/           # 中间件
│   ├── models/               # 数据模型
│   ├── routes/               # API路由
│   └── utils/                # 工具函数
├── api/                      # Vercel API入口
├── index-fullstack.html      # 前端页面
├── app-fullstack.js          # 前端JavaScript
├── styles.css                # 样式文件
├── vercel.json               # Vercel配置
└── package.json              # 项目依赖
```

## 🛠️ 技术栈

### 前端
- 原生HTML/CSS/JavaScript
- CSS Grid布局
- Fetch API
- JWT令牌管理

### 后端
- Node.js 22.x
- Express.js
- MongoDB + Mongoose
- JWT认证
- bcrypt密码加密

### 部署
- Vercel (推荐)
- Docker
- PM2

## 📦 可用脚本

```bash
# 启动服务器
npm run server

# 开发模式（自动重启）
npm run dev

# Docker部署
npm run docker:up

# PM2部署
npm run pm2:start
```

## 🚀 部署指南

### Vercel部署（推荐）
1. 推送代码到GitHub
2. 在Vercel导入项目
3. 配置环境变量（MONGODB_URI, JWT_SECRET等）
4. 部署完成

详细部署指南请参考：[VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md)

### Docker部署
```bash
# 一键部署
npm run deploy:prod

# 查看状态
docker-compose ps
```

## ⚠️ 重要配置说明

**Node.js版本要求：必须使用22.x版本**
- package.json: `"node": "22.x"`
- vercel.json: `"@vercel/node@3.1.0"`
- Dockerfile: `node:22-alpine`

**切勿将版本改为18.x，这会导致部署失败！**

## 🤝 贡献

欢迎提交问题和改进建议！

1. Fork项目
2. 创建功能分支
3. 提交更改
4. 发起Pull Request

## 📄 许可证

MIT License

---

**通过这个项目学习现代全栈开发技术，从前端到后端，从数据库到部署！**