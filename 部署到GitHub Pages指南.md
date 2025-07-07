# 🚀 部署到 GitHub Pages 完整指南

## 📋 部署步骤

### 1. 准备 GitHub 仓库

#### 创建仓库
```bash
# 如果还没有仓库，创建一个
# 在 GitHub 网站上创建新仓库：vehicle-logistics-system
```

#### 初始化本地仓库（如果需要）
```bash
cd d:\小米云盘\桌面\学习文件\vue\入门\profession\vue-project-antdv

# 初始化 git（如果还没有）
git init

# 添加远程仓库
git remote add origin https://github.com/your-username/vehicle-logistics-system.git
```

### 2. 上传项目文件

#### 方法1: 上传整个项目（推荐）
```bash
# 添加所有文件
git add .

# 提交
git commit -m "Initial commit: Vehicle Logistics Management System"

# 推送到 GitHub
git push -u origin main
```

#### 方法2: 只上传打包文件
```bash
# 只添加打包文件
git add dist-production/
git add package.json
git add README.md

# 提交
git commit -m "Add production build"

# 推送
git push origin main
```

### 3. 配置 GitHub Pages

#### 步骤详解
1. **进入仓库设置**
   - 访问您的 GitHub 仓库
   - 点击 "Settings" 标签

2. **找到 Pages 设置**
   - 在左侧菜单找到 "Pages"
   - 点击进入 Pages 设置页面

3. **配置部署源**
   - Source: 选择 "Deploy from a branch"
   - Branch: 选择 "main" 或 "master"
   - Folder: 选择 "/ (root)" 或 "/dist-production"

4. **保存设置**
   - 点击 "Save" 按钮
   - 等待部署完成（通常需要几分钟）

### 4. 访问您的网站

#### 访问地址格式
```
https://your-username.github.io/your-repo-name/
```

#### 示例
如果您的 GitHub 用户名是 `zhangsan`，仓库名是 `vehicle-logistics-system`：
```
https://zhangsan.github.io/vehicle-logistics-system/
```

### 5. 配置自定义域名（可选）

#### 添加 CNAME 文件
```bash
# 在项目根目录创建 CNAME 文件
echo "your-domain.com" > CNAME
git add CNAME
git commit -m "Add custom domain"
git push origin main
```

#### 在 GitHub Pages 设置中
1. 在 "Custom domain" 输入框中输入您的域名
2. 勾选 "Enforce HTTPS"
3. 保存设置

## 🔧 解决常见问题

### 问题1: 页面显示 404
**原因**: Vue Router 使用 History 模式，但 GitHub Pages 不支持

**解决方案**: 创建 404.html 文件
```html
<!-- dist-production/404.html -->
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Vehicle Logistics System</title>
  <script>
    // GitHub Pages 单页应用重定向
    var pathSegmentsToKeep = 0;
    var l = window.location;
    l.replace(
      l.protocol + '//' + l.hostname + (l.port ? ':' + l.port : '') +
      l.pathname.split('/').slice(0, 1 + pathSegmentsToKeep).join('/') + 
      '/?/' + l.pathname.slice(1).split('/').slice(pathSegmentsToKeep).join('/').replace(/&/g, '~and~') +
      (l.search ? '&' + l.search.slice(1).replace(/&/g, '~and~') : '') +
      l.hash
    );
  </script>
</head>
<body></body>
</html>
```

### 问题2: 静态资源加载失败
**原因**: 路径配置问题

**解决方案**: 更新 vite.config.js
```javascript
export default defineConfig({
  base: '/your-repo-name/', // 替换为您的仓库名
  // ... 其他配置
})
```

### 问题3: API 调用失败
**原因**: HTTPS 页面无法调用 HTTP API

**解决方案**: 确保 API 支持 HTTPS 或使用 Mock 模式

## 🚀 自动部署（进阶）

### GitHub Actions 自动部署
创建 `.github/workflows/deploy.yml`：

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout
      uses: actions/checkout@v3
      
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm install
      
    - name: Build
      run: npm run build
      
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./dist-production
```

## 📋 部署检查清单

### 部署前检查
- [ ] 项目已成功打包
- [ ] GitHub 仓库已创建
- [ ] 代码已推送到 GitHub
- [ ] GitHub Pages 已启用

### 部署后验证
- [ ] 网站可以正常访问
- [ ] 登录功能正常
- [ ] 所有页面路由正常
- [ ] 静态资源加载正常
- [ ] 移动端显示正常

## 🎯 最终结果

完成后，您将拥有：
- ✅ **在线网站** - 任何人都可以访问
- ✅ **自动更新** - 推送代码自动部署
- ✅ **免费托管** - GitHub Pages 免费服务
- ✅ **HTTPS 支持** - 自动启用 HTTPS
- ✅ **全球 CDN** - 快速访问速度

您的车辆物流管理系统将在以下地址可访问：
```
https://your-username.github.io/your-repo-name/
```

## 📞 技术支持

如果遇到问题：
1. 检查 GitHub Pages 部署状态
2. 查看浏览器控制台错误
3. 确认文件路径配置正确
4. 验证 API 地址和 CORS 设置
