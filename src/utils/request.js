/**
 * HTTP请求工具
 * 基于fetch API封装，使用环境变量配置
 */
import { API_CONFIG, APP_CONFIG } from '@/config/env.js'

// 请求拦截器
const requestInterceptor = (url, options = {}) => {
  // 添加基础URL
  const fullUrl = url.startsWith('http') ? url : `${API_CONFIG.baseURL}${url}`
  
  // 默认配置
  const defaultOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-App-Version': APP_CONFIG.version,
      'X-App-Env': APP_CONFIG.env,
    },
    timeout: API_CONFIG.timeout,
  }
  
  // 合并配置
  const finalOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  }
  
  // 添加认证token（如果存在）
  const token = localStorage.getItem('token')
  if (token) {
    finalOptions.headers.Authorization = `Bearer ${token}`
  }
  
  // 如果是POST/PUT/PATCH请求且body是对象，转换为JSON
  if (['POST', 'PUT', 'PATCH'].includes(finalOptions.method) && 
      typeof finalOptions.body === 'object' && 
      finalOptions.body !== null) {
    finalOptions.body = JSON.stringify(finalOptions.body)
  }
  
  if (APP_CONFIG.debug) {
    console.log('🚀 Request:', fullUrl, finalOptions)
  }
  
  return { url: fullUrl, options: finalOptions }
}

// 响应拦截器
const responseInterceptor = async (response, originalUrl) => {
  if (APP_CONFIG.debug) {
    console.log('📥 Response:', originalUrl, response.status)
  }
  
  // 检查响应状态
  if (!response.ok) {
    const error = new Error(`HTTP Error: ${response.status}`)
    error.status = response.status
    error.response = response
    throw error
  }
  
  // 解析JSON响应
  try {
    const data = await response.json()
    
    // 这里可以根据后端API的响应格式进行统一处理
    if (data.code && data.code !== 200) {
      const error = new Error(data.message || '请求失败')
      error.code = data.code
      error.data = data
      throw error
    }
    
    return data.data || data
  } catch (error) {
    if (error.name === 'SyntaxError') {
      // 不是JSON响应，返回文本
      return response.text()
    }
    throw error
  }
}

// 主要的请求函数
const request = async (url, options = {}) => {
  try {
    const { url: fullUrl, options: finalOptions } = requestInterceptor(url, options)
    
    // 创建AbortController用于超时控制
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), finalOptions.timeout)
    
    finalOptions.signal = controller.signal
    
    const response = await fetch(fullUrl, finalOptions)
    clearTimeout(timeoutId)
    
    return await responseInterceptor(response, fullUrl)
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('请求超时')
    }
    
    if (APP_CONFIG.debug) {
      console.error('❌ Request Error:', error)
    }
    
    throw error
  }
}

// 便捷方法
export const get = (url, options = {}) => request(url, { ...options, method: 'GET' })
export const post = (url, data, options = {}) => request(url, { ...options, method: 'POST', body: data })
export const put = (url, data, options = {}) => request(url, { ...options, method: 'PUT', body: data })
export const del = (url, options = {}) => request(url, { ...options, method: 'DELETE' })
export const patch = (url, data, options = {}) => request(url, { ...options, method: 'PATCH', body: data })

export default request
