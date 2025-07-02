<template>
  <div class="login-container">
    <!-- 背景装饰 -->
    <div class="background-decoration">
      <div class="truck-icon">
        <CarOutlined />
      </div>
      <div class="floating-elements">
        <div class="element element-1">
          <CarOutlined />
        </div>
        <div class="element element-2">
          <EnvironmentOutlined />
        </div>
        <div class="element element-3">
          <ClockCircleOutlined />
        </div>
      </div>
    </div>

    <!-- 登录表单区域 -->
    <div class="login-form-container">
      <div class="login-form">
        <!-- 系统标题 -->
        <div class="system-header">
          <div class="logo">
            <CarOutlined class="logo-icon" />
          </div>
          <h1 class="system-title">车辆物流管理系统</h1>
          <p class="system-subtitle">Vehicle Logistics Management System</p>
        </div>

        <!-- 登录表单 -->
        <a-form
          :model="loginForm"
          :rules="rules"
          @finish="handleLogin"
          class="login-form-content"
          layout="vertical"
        >
          <a-form-item name="username" label="用户名">
            <a-input
              v-model:value="loginForm.username"
              size="large"
              placeholder="请输入用户名"
              :prefix="h(UserOutlined)"
            />
          </a-form-item>

          <a-form-item name="password" label="密码">
            <a-input-password
              v-model:value="loginForm.password"
              size="large"
              placeholder="请输入密码"
              :prefix="h(LockOutlined)"
            />
          </a-form-item>

          <a-form-item name="remember">
            <a-checkbox v-model:checked="loginForm.remember">
              记住密码
            </a-checkbox>
            <a class="forgot-password" href="#">忘记密码？</a>
          </a-form-item>

          <a-form-item>
            <a-button
              type="primary"
              html-type="submit"
              size="large"
              :loading="loading"
              class="login-button"
              block
            >
              <template #icon>
                <LoginOutlined />
              </template>
              登录系统
            </a-button>
          </a-form-item>
        </a-form>

        <!-- 底部信息 -->
        <div class="login-footer">
          <div class="features">
            <div class="feature-item">
              <SafetyOutlined />
              <span>安全可靠</span>
            </div>
            <div class="feature-item">
              <ThunderboltOutlined />
              <span>高效便捷</span>
            </div>
            <div class="feature-item">
              <GlobalOutlined />
              <span>全程追踪</span>
            </div>
          </div>
          <p class="copyright">
            © 2024 车辆物流管理系统 版权所有
          </p>
        </div>
      </div>
    </div>

    <!-- 侧边信息面板 -->
    <div class="info-panel">
      <div class="info-content">
        <h2>智能物流管理</h2>
        <div class="info-features">
          <div class="info-feature">
            <div class="feature-icon">
              <DashboardOutlined />
            </div>
            <div class="feature-text">
              <h3>实时监控</h3>
              <p>全程跟踪车辆位置和运输状态</p>
            </div>
          </div>

          <div class="info-feature">
            <div class="feature-icon">
              <DeploymentUnitOutlined />
            </div>
            <div class="feature-text">
              <h3>智能调度</h3>
              <p>优化路线规划，提高运输效率</p>
            </div>
          </div>

          <div class="info-feature">
            <div class="feature-icon">
              <BarChartOutlined />
            </div>
            <div class="feature-text">
              <h3>数据分析</h3>
              <p>深度分析运营数据，辅助决策</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, h } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import {
  UserOutlined,
  LockOutlined,
  LoginOutlined,
  CarOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  SafetyOutlined,
  ThunderboltOutlined,
  GlobalOutlined,
  DashboardOutlined,
  DeploymentUnitOutlined,
  BarChartOutlined
} from '@ant-design/icons-vue'

const router = useRouter()
const loading = ref(false)

// 登录表单数据
const loginForm = ref({
  username: 'admin',
  password: '123456',
  remember: true
})

// 表单验证规则
const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ]
}

// 处理登录
const handleLogin = async (values) => {
  loading.value = true

  try {
    // 模拟登录请求
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 简单的登录验证
    if (values.username === 'admin' && values.password === '123456') {
      message.success('登录成功！')

      // 存储登录状态
      localStorage.setItem('isLoggedIn', 'true')
      localStorage.setItem('username', values.username)

      // 跳转到主页
      router.push('/')
    } else {
      message.error('用户名或密码错误！')
    }
  } catch (error) {
    message.error('登录失败，请重试！')
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  position: relative;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  overflow: hidden;
}

// 背景装饰
.background-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 1;

  .truck-icon {
    position: absolute;
    top: 10%;
    left: 5%;
    font-size: 120px;
    color: rgba(255, 255, 255, 0.1);
    animation: float 6s ease-in-out infinite;
  }

  .floating-elements {
    .element {
      position: absolute;
      font-size: 40px;
      color: rgba(255, 255, 255, 0.15);
      animation: float 4s ease-in-out infinite;

      &.element-1 {
        top: 20%;
        right: 15%;
        animation-delay: -1s;
      }

      &.element-2 {
        bottom: 30%;
        left: 10%;
        animation-delay: -2s;
      }

      &.element-3 {
        top: 60%;
        right: 25%;
        animation-delay: -3s;
      }
    }
  }
}

// 登录表单容器
.login-form-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  position: relative;
  z-index: 2;
}

.login-form {
  width: 100%;
  max-width: 400px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

// 系统标题
.system-header {
  text-align: center;
  margin-bottom: 40px;

  .logo {
    margin-bottom: 20px;

    .logo-icon {
      font-size: 48px;
      color: #1890ff;
      background: linear-gradient(45deg, #1890ff, #722ed1);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
  }

  .system-title {
    font-size: 28px;
    font-weight: 600;
    color: #262626;
    margin: 0 0 8px 0;
    background: linear-gradient(45deg, #1890ff, #722ed1);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .system-subtitle {
    font-size: 14px;
    color: #8c8c8c;
    margin: 0;
    font-weight: 400;
  }
}

// 登录表单内容
.login-form-content {
  .ant-form-item-label > label {
    font-weight: 500;
    color: #262626;
  }

  .ant-input-affix-wrapper,
  .ant-input {
    border-radius: 8px;
    border: 1px solid #d9d9d9;
    transition: all 0.3s;

    &:hover,
    &:focus {
      border-color: #1890ff;
      box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1);
    }
  }

  .ant-checkbox-wrapper {
    color: #595959;
  }

  .forgot-password {
    float: right;
    color: #1890ff;
    text-decoration: none;
    font-size: 14px;

    &:hover {
      color: #40a9ff;
    }
  }
}

.login-button {
  height: 48px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  background: linear-gradient(45deg, #1890ff, #722ed1);
  border: none;
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
  transition: all 0.3s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(24, 144, 255, 0.4);
  }
}

// 登录底部
.login-footer {
  margin-top: 30px;
  text-align: center;

  .features {
    display: flex;
    justify-content: space-around;
    margin-bottom: 20px;

    .feature-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      color: #8c8c8c;
      font-size: 12px;

      .anticon {
        font-size: 16px;
        margin-bottom: 4px;
        color: #1890ff;
      }
    }
  }

  .copyright {
    font-size: 12px;
    color: #bfbfbf;
    margin: 0;
  }
}

// 侧边信息面板
.info-panel {
  width: 480px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-left: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 40px;
  position: relative;
  z-index: 2;

  @media (max-width: 1200px) {
    display: none;
  }
}

.info-content {
  color: white;

  h2 {
    font-size: 32px;
    font-weight: 600;
    margin-bottom: 40px;
    color: white;
    text-align: center;
  }
}

.info-features {
  .info-feature {
    display: flex;
    align-items: flex-start;
    margin-bottom: 30px;
    padding: 20px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    transition: all 0.3s;

    &:hover {
      background: rgba(255, 255, 255, 0.15);
      transform: translateX(10px);
    }

    .feature-icon {
      width: 50px;
      height: 50px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 16px;
      flex-shrink: 0;

      .anticon {
        font-size: 24px;
        color: white;
      }
    }

    .feature-text {
      h3 {
        font-size: 18px;
        font-weight: 500;
        margin: 0 0 8px 0;
        color: white;
      }

      p {
        font-size: 14px;
        color: rgba(255, 255, 255, 0.8);
        margin: 0;
        line-height: 1.5;
      }
    }
  }
}

// 动画效果
@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
}

// 响应式设计
@media (max-width: 768px) {
  .login-container {
    padding: 20px;
  }

  .login-form-container {
    padding: 20px;
  }

  .login-form {
    padding: 30px 20px;
    margin: 0 10px;
  }

  .system-header {
    .system-title {
      font-size: 24px;
    }

    .logo .logo-icon {
      font-size: 40px;
    }
  }

  .background-decoration {
    .truck-icon {
      font-size: 80px;
    }

    .floating-elements .element {
      font-size: 30px;
    }
  }
}

// 加载动画
.login-button.ant-btn-loading {
  .anticon {
    animation: spin 1s linear infinite;
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

// 表单项动画
.login-form-content .ant-form-item {
  animation: slideInUp 0.6s ease-out;
  animation-fill-mode: both;

  &:nth-child(1) { animation-delay: 0.1s; }
  &:nth-child(2) { animation-delay: 0.2s; }
  &:nth-child(3) { animation-delay: 0.3s; }
  &:nth-child(4) { animation-delay: 0.4s; }
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// 系统标题动画
.system-header {
  animation: fadeInDown 0.8s ease-out;
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// 信息面板动画
.info-content {
  animation: slideInRight 0.8s ease-out;
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>
