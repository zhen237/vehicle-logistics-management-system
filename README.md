# Vue3 管理系统

基于 Vue3 + Ant Design Vue + Vite 的现代化管理系统模板，支持多环境配置、动态标题、加载进度条等功能。

## ✨ 特性

- 🚀 **Vue3 + Vite** - 快速的开发体验
- 🎨 **Ant Design Vue** - 企业级UI组件库
- 🌍 **多环境配置** - 支持开发、测试、生产环境
- 📱 **响应式布局** - 适配不同屏幕尺寸
- 🔄 **加载进度条** - NProgress集成
- 📝 **动态标题** - 路由切换自动更新页面标题
- 🛠️ **开发工具** - ESLint + Prettier + Vue DevTools

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 开发环境

```bash
# 开发环境 (默认端口: 5174)
npm run dev

# 测试环境
npm run dev:staging
```

### 构建部署

```bash
# 生产环境构建
npm run build

# 测试环境构建
npm run build:staging

# 开发环境构建
npm run build:dev

# 预览构建结果
npm run preview
```

## 🔧 环境变量配置

项目支持多环境配置，通过不同的 `.env` 文件管理各环境的配置。

### 环境文件说明

| 文件 | 说明 | 优先级 |
|------|------|--------|
| `.env` | 所有环境的基础配置 | 低 |
| `.env.development` | 开发环境配置 | 中 |
| `.env.staging` | 测试环境配置 | 中 |
| `.env.production` | 生产环境配置 | 中 |
| `.env.local` | 本地配置（不提交到git） | 高 |

### 环境变量说明

#### 基础配置
```bash
VITE_APP_TITLE=管理系统              # 应用标题
VITE_APP_VERSION=1.0.0              # 应用版本
VITE_APP_DESCRIPTION=管理系统描述    # 应用描述
VITE_APP_ENV=development            # 当前环境
```

#### API配置
```bash
VITE_API_BASE_URL=http://localhost:3000/api  # API基础地址
VITE_API_TIMEOUT=10000                       # 请求超时时间(ms)
```

#### 功能开关
```bash
VITE_APP_DEBUG=true                 # 调试模式
VITE_APP_MOCK=true                  # Mock数据
VITE_ENABLE_DEVTOOLS=true           # Vue DevTools
VITE_ENABLE_VCONSOLE=true           # 移动端调试工具
```

#### 服务配置
```bash
VITE_PORT=5174                      # 开发服务器端口
VITE_HOST=localhost                 # 开发服务器主机
```

### 环境变量检查

运行以下命令检查环境变量配置：

```bash
npm run env:check
```

### 使用环境变量

在代码中使用环境变量：

```javascript
// 直接使用
const apiUrl = import.meta.env.VITE_API_BASE_URL

// 通过配置文件使用（推荐）
import { API_CONFIG, APP_CONFIG } from '@/config/env.js'

console.log(API_CONFIG.baseURL)  // API地址
console.log(APP_CONFIG.title)    // 应用标题
```

## 📁 项目结构

```
src/
├── components/          # 公共组件
├── config/             # 配置文件
│   └── env.js          # 环境变量配置
├── router/             # 路由配置
├── utils/              # 工具函数
│   └── request.js      # HTTP请求工具
├── views/              # 页面组件
│   ├── Home/           # 首页
│   ├── User/           # 用户管理
│   ├── Profile/        # 个人资料
│   ├── Settings/       # 系统设置
│   ├── Login/          # 登录页
│   └── Layout/         # 布局组件
└── types/              # 类型声明
```

## 🛠️ 开发工具

### 推荐IDE

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar)

### 代码规范

```bash
# 代码检查
npm run lint

# 代码格式化
npm run format
```

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```
