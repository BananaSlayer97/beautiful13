# 🔧 富兰克林美德系统 - 故障排除指南

## "Failed to fetch" 错误完整解决方案

### 🚨 当前状态检查

如果你仍然遇到 "Failed to fetch" 错误，请按以下步骤操作：

### 步骤 1: 确认代码已推送到 Vercel

```bash
# 1. 检查本地代码状态
git status

# 2. 推送最新代码到远程仓库
git push origin main

# 3. 确认推送成功
git log --oneline -5
```

### 步骤 2: 在 Vercel 控制台重新部署

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 找到你的项目
3. 点击 "Deployments" 标签
4. 点击 "Redeploy" 按钮
5. 等待部署完成（通常需要 1-3 分钟）

### 步骤 3: 检查环境变量

在 Vercel 项目设置中确认以下环境变量已正确配置：

```
MONGODB_URI=mongodb+srv://your-connection-string
JWT_SECRET=your-jwt-secret-key
CLIENT_URL=https://your-vercel-app.vercel.app
NODE_ENV=production
```

**重要**: 修改环境变量后必须重新部署！

### 步骤 4: 使用诊断工具

1. 打开 `debug-deployment.html` 文件
2. 在浏览器中运行所有测试
3. 检查每个测试的结果
4. 记录任何错误信息

### 步骤 5: 检查 Vercel 函数日志

1. 在 Vercel Dashboard 中点击你的项目
2. 点击 "Functions" 标签
3. 查看 `api/index.js` 的日志
4. 寻找错误信息或超时问题

### 步骤 6: 验证 API 端点

手动测试以下 URL（替换为你的实际域名）：

```
https://your-app.vercel.app/api/health
https://your-app.vercel.app/api/auth/verify
```

### 常见问题及解决方案

#### 问题 1: API 路由 404 错误

**症状**: 访问 `/api/*` 返回 404

**解决方案**:
1. 确认 `api/index.js` 文件存在
2. 检查 `vercel.json` 配置
3. 重新部署项目

#### 问题 2: 数据库连接失败

**症状**: API 返回 500 错误，日志显示数据库连接问题

**解决方案**:
1. 验证 `MONGODB_URI` 环境变量
2. 检查 MongoDB Atlas 网络访问设置
3. 确认数据库用户权限

#### 问题 3: CORS 错误

**症状**: 浏览器控制台显示 CORS 相关错误

**解决方案**:
1. 检查 `CLIENT_URL` 环境变量
2. 确认 `server/app.js` 中的 CORS 配置
3. 重新部署应用

#### 问题 4: 函数超时

**症状**: 请求长时间无响应，最终超时

**解决方案**:
1. 检查数据库查询性能
2. 优化 API 响应时间
3. 考虑增加函数超时时间

### 🔍 深度诊断

如果上述步骤都无法解决问题，请执行以下深度诊断：

#### 1. 本地测试

```bash
# 启动本地服务器
npm run dev

# 在另一个终端测试 API
curl http://localhost:3003/api/health
```

#### 2. 网络连接测试

```bash
# 测试 Vercel 部署的连通性
curl -I https://your-app.vercel.app/api/health

# 检查 DNS 解析
nslookup your-app.vercel.app
```

#### 3. 浏览器开发者工具

1. 打开浏览器开发者工具 (F12)
2. 切换到 "Network" 标签
3. 尝试登录操作
4. 检查失败的请求详情
5. 查看 "Console" 标签的错误信息

### 📞 获取帮助

如果问题仍然存在，请提供以下信息：

1. Vercel 项目 URL
2. 错误发生的具体步骤
3. 浏览器开发者工具的错误截图
4. Vercel 函数日志截图
5. 诊断工具的测试结果

### 🎯 快速修复检查清单

- [ ] 代码已推送到 GitHub/GitLab
- [ ] Vercel 项目已重新部署
- [ ] 环境变量配置正确
- [ ] API 健康检查通过
- [ ] 数据库连接正常
- [ ] CORS 配置正确
- [ ] 浏览器缓存已清除

---

**最后更新**: $(date)
**版本**: 2.0
**状态**: 活跃维护