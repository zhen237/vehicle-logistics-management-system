/**
 * 环境变量配置
 * 注意：只有以 VITE_ 开头的变量才会被暴露给客户端代码
 */

// 应用基础信息
export const APP_CONFIG = {
  title: import.meta.env.VITE_APP_TITLE || '管理系统',
  version: import.meta.env.VITE_APP_VERSION || '1.0.0',
  description: import.meta.env.VITE_APP_DESCRIPTION || '管理系统',
  env: import.meta.env.VITE_APP_ENV || 'development',
  debug: import.meta.env.VITE_APP_DEBUG === 'true',
  mock: import.meta.env.VITE_APP_MOCK === 'true',
}

// API配置
export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 10000,
}

// 服务配置
export const SERVER_CONFIG = {
  port: Number(import.meta.env.VITE_PORT) || 5174,
  host: import.meta.env.VITE_HOST || 'localhost',
}

// 日志配置
export const LOG_CONFIG = {
  level: import.meta.env.VITE_LOG_LEVEL || 'info',
}

// 功能开关
export const FEATURE_CONFIG = {
  enableDevtools: import.meta.env.VITE_ENABLE_DEVTOOLS === 'true',
  enableMock: import.meta.env.VITE_ENABLE_MOCK === 'true',
  enableVConsole: import.meta.env.VITE_ENABLE_VCONSOLE === 'true',
}

// CDN配置
export const CDN_CONFIG = {
  url: import.meta.env.VITE_CDN_URL || '',
}

// 监控配置
export const MONITOR_CONFIG = {
  sentryDsn: import.meta.env.VITE_SENTRY_DSN || '',
  analyticsId: import.meta.env.VITE_ANALYTICS_ID || '',
}

// 判断当前环境
export const isDev = import.meta.env.DEV
export const isProd = import.meta.env.PROD
export const isStaging = import.meta.env.VITE_APP_ENV === 'staging'

// 导出所有配置
export default {
  APP_CONFIG,
  API_CONFIG,
  SERVER_CONFIG,
  LOG_CONFIG,
  FEATURE_CONFIG,
  CDN_CONFIG,
  MONITOR_CONFIG,
  isDev,
  isProd,
  isStaging,
}
