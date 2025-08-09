# Vercel + MongoDB Atlas 部署指南

本指南将帮助您将富兰克林美德系统部署到 Vercel + MongoDB Atlas，适合新手用户。

## 📋 准备工作

### 需要的账号
1. GitHub 账号（用于代码托管）
2. Vercel 账号（用于应用部署）
3. MongoDB Atlas 账号（用于数据库）

## 🗄️ 第一步：设置 MongoDB Atlas 数据库

### 1.1 注册 MongoDB Atlas
1. 访问 [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. 点击 "Try Free" 注册免费账号
3. 选择 "Build a Database" → "M0 Sandbox"（免费层）
4. 选择云服务商：**Azure**（有香港节点，速度更快）
5. 选择区域：**Hong Kong (ap-east-1)**
6. 集群名称：保持默认或改为 `franklin-virtues`

### 1.2 配置数据库访问
1. **设置数据库用户**：
   - 用户名：`franklin_user`
   - 密码：生成强密码并保存
   - 权限：`Read and write to any database`

2. **配置网络访问**：
   - 点击 "Add IP Address"
   - 选择 "Allow access from anywhere" (0.0.0.0/0)
   - 描述：`Vercel deployment`

### 1.3 获取连接字符串
1. 点击 "Connect" → "Connect your application"
2. 选择 "Node.js" 和版本 "4.1 or later"
3. 复制连接字符串，格式如下：
   ```
   mongodb+srv://franklin_user:<password>@franklin-virtues.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
4. 将 `<password>` 替换为实际密码
5. 在末尾添加数据库名：`/franklin-virtues`

## 🚀 第二步：准备代码仓库

### 2.1 推送代码到 GitHub
```bash
# 在项目目录下执行
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

### 2.2 创建 Vercel 配置文件
创建 `vercel.json` 文件：
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server/app.js",
      "use": "@vercel/node"
    },
    {
      "src": "index-fullstack.html",
      "use": "@vercel/static"
    },
    {
      "src": "styles.css",
      "use": "@vercel/static"
    },
    {
      "src": "app-fullstack.js",
      "use": "@vercel/static"
    },
    {
      "src": "shared-utils.js",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/server/app.js"
    },
    {
      "src": "/(.*\\.(css|js))",
      "dest": "/$1"
    },
    {
      "src": "/",
      "dest": "/index-fullstack.html"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

## 🌐 第三步：部署到 Vercel

### 3.1 注册并连接 Vercel
1. 访问 [Vercel](https://vercel.com)
2. 点击 "Sign Up" 并选择 "Continue with GitHub"
3. 授权 Vercel 访问您的 GitHub 仓库

### 3.2 导入项目
1. 在 Vercel 控制台点击 "New Project"
2. 找到您的 `beautiful13` 仓库并点击 "Import"
3. 项目名称：保持默认或改为 `franklin-virtues`
4. Framework Preset：选择 "Other"

### 3.3 配置环境变量
在 "Environment Variables" 部分添加以下变量：

| Name | Value | 说明 |
|------|-------|------|
| `MONGODB_URI` | 您的 MongoDB 连接字符串 | 数据库连接 |
| `JWT_SECRET` | 随机生成的32位字符串 | JWT 加密密钥 |
| `JWT_EXPIRES_IN` | `7d` | Token 过期时间 |
| `NODE_ENV` | `production` | 运行环境 |
| `CLIENT_URL` | `https://your-app.vercel.app` | 前端地址（部署后获得） |

**生成 JWT_SECRET 的方法：**
```bash
# 在终端执行
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3.4 部署
1. 点击 "Deploy" 开始部署
2. 等待构建完成（通常需要1-3分钟）
3. 部署成功后，您会获得一个 `.vercel.app` 域名

## ⚠️ 重要：Node.js 版本配置

**注意：本项目必须使用 Node.js 22.x 版本！**

### 版本配置说明
1. **package.json 中的 engines 字段**：
   ```json
   "engines": {
     "node": "22.x"
   }
   ```

2. **vercel.json 中的运行时配置**：
   ```json
   "functions": {
     "api/index.js": {
       "runtime": "@vercel/node@3.1.0"
     }
   }
   ```

### 重要提醒
- **切勿将 Node.js 版本改为 18.x**，这会导致部署失败
- 如果 Vercel 提示版本错误，请检查并确保使用 22.x 版本
- 本项目的依赖和代码已针对 Node.js 22.x 进行优化

## 🔧 第四步：更新配置

### 4.1 更新 CLIENT_URL
1. 复制 Vercel 提供的域名（如：`https://franklin-virtues.vercel.app`）
2. 在 Vercel 项目设置中更新 `CLIENT_URL` 环境变量
3. 重新部署项目

### 4.2 解决 "Failed to fetch" 错误
如果遇到登录时出现 "Failed to fetch" 错误，请按以下步骤操作：

1. **推送最新代码**：
   ```bash
   git push origin main
   ```

2. **在 Vercel 中重新部署**：
   - 进入 Vercel 项目控制台
   - 点击 "Deployments" 标签页
   - 点击最新部署右侧的 "..." 菜单
   - 选择 "Redeploy"

3. **检查环境变量**：
   - 确保 `MONGODB_URI` 正确设置
   - 确保 `CLIENT_URL` 设置为您的 Vercel 域名
   - 确保 `JWT_SECRET` 已设置

### 4.3 测试应用
1. 访问您的 Vercel 域名
2. 尝试注册新用户
3. 测试登录和美德记录功能

## 🎯 第五步：自定义域名（可选）

### 5.1 添加自定义域名
1. 在 Vercel 项目设置中点击 "Domains"
2. 输入您的域名（需要先购买）
3. 按照提示配置 DNS 记录

## 🔍 故障排除

### 常见问题

**1. "Failed to fetch" 登录错误**
- **原因**：API 请求无法到达服务器
- **解决方案**：
  - 确保已推送最新代码到 GitHub（包含修复的 API 配置）
  - 在 Vercel 中重新部署项目
  - 检查环境变量 `MONGODB_URI` 是否正确设置
  - 确认 `CLIENT_URL` 环境变量设置为您的 Vercel 域名

**2. 数据库连接失败**
- 检查 MongoDB Atlas 网络访问设置
- 确认连接字符串格式正确
- 验证用户名密码
- 确保连接字符串末尾包含数据库名：`/franklin-virtues`

**3. API 请求失败**
- 检查 `vercel.json` 路由配置
- 确认环境变量设置正确
- 查看 Vercel 函数日志
- 确保 API 路由以 `/api/` 开头

**4. 静态文件加载失败**
- 确认文件路径正确
- 检查 `vercel.json` 构建配置
- 清除浏览器缓存

### 查看日志
1. 在 Vercel 控制台点击项目
2. 进入 "Functions" 标签页
3. 点击具体函数查看执行日志

## 📈 性能优化建议

1. **启用 MongoDB 索引**：
   - 在 Atlas 控制台为常用查询字段创建索引

2. **配置缓存**：
   - Vercel 自动为静态文件启用 CDN 缓存

3. **监控使用情况**：
   - 定期检查 Vercel 和 MongoDB Atlas 的使用量

## 💰 费用说明

- **MongoDB Atlas M0**：永久免费（512MB 存储）
- **Vercel Hobby**：免费（100GB 带宽/月）
- 超出免费额度后会有相应收费

## 🎉 完成！

恭喜！您的富兰克林美德系统现在已经成功部署到云端。您可以：

1. 分享您的应用链接给朋友
2. 在任何设备上访问您的应用
3. 数据会自动同步到云端数据库

如果遇到问题，请检查 Vercel 和 MongoDB Atlas 的官方文档，或者查看项目的 GitHub Issues。