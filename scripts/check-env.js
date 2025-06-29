/**
 * 环境变量检查脚本
 * 用于验证环境变量配置是否正确
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.join(__dirname, '..')

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
}

const log = (color, message) => {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

// 检查环境文件是否存在
const checkEnvFiles = () => {
  const envFiles = [
    '.env',
    '.env.development',
    '.env.production',
    '.env.staging'
  ]

  log('cyan', '\n📁 检查环境文件:')

  envFiles.forEach(file => {
    const filePath = path.join(rootDir, file)
    if (fs.existsSync(filePath)) {
      log('green', `  ✅ ${file} - 存在`)
    } else {
      log('red', `  ❌ ${file} - 不存在`)
    }
  })
}

// 解析环境文件
const parseEnvFile = (filePath) => {
  if (!fs.existsSync(filePath)) return {}

  const content = fs.readFileSync(filePath, 'utf8')
  const env = {}

  content.split('\n').forEach(line => {
    line = line.trim()
    if (line && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=')
      if (key && valueParts.length > 0) {
        env[key.trim()] = valueParts.join('=').trim()
      }
    }
  })

  return env
}

// 检查环境变量
const checkEnvVariables = () => {
  const environments = ['development', 'production', 'staging']

  log('cyan', '\n🔍 检查环境变量:')

  environments.forEach(env => {
    log('blue', `\n  📋 ${env.toUpperCase()} 环境:`)

    const baseEnv = parseEnvFile(path.join(rootDir, '.env'))
    const envFile = parseEnvFile(path.join(rootDir, `.env.${env}`))
    const mergedEnv = { ...baseEnv, ...envFile }

    // 必需的环境变量
    const requiredVars = [
      'VITE_API_BASE_URL',
      'VITE_APP_ENV',
      'VITE_APP_TITLE'
    ]

    requiredVars.forEach(varName => {
      if (mergedEnv[varName]) {
        log('green', `    ✅ ${varName}: ${mergedEnv[varName]}`)
      } else {
        log('red', `    ❌ ${varName}: 未定义`)
      }
    })

    // 可选的环境变量
    const optionalVars = [
      'VITE_API_TIMEOUT',
      'VITE_APP_DEBUG',
      'VITE_LOG_LEVEL',
      'VITE_CDN_URL'
    ]

    optionalVars.forEach(varName => {
      if (mergedEnv[varName]) {
        log('yellow', `    ⚠️  ${varName}: ${mergedEnv[varName]}`)
      }
    })
  })
}

// 检查Vite配置
const checkViteConfig = () => {
  log('cyan', '\n⚙️  检查Vite配置:')

  const viteConfigPath = path.join(rootDir, 'vite.config.js')
  if (fs.existsSync(viteConfigPath)) {
    log('green', '  ✅ vite.config.js - 存在')

    const content = fs.readFileSync(viteConfigPath, 'utf8')
    if (content.includes('loadEnv')) {
      log('green', '  ✅ 环境变量加载配置 - 已配置')
    } else {
      log('yellow', '  ⚠️  环境变量加载配置 - 可能需要配置')
    }
  } else {
    log('red', '  ❌ vite.config.js - 不存在')
  }
}

// 主函数
const main = () => {
  log('magenta', '🔧 环境变量配置检查工具')
  log('magenta', '================================')

  checkEnvFiles()
  checkEnvVariables()
  checkViteConfig()

  log('cyan', '\n📝 使用说明:')
  log('reset', '  • 开发环境: npm run dev')
  log('reset', '  • 测试环境: npm run dev:staging')
  log('reset', '  • 生产构建: npm run build')
  log('reset', '  • 测试构建: npm run build:staging')

  log('green', '\n✨ 检查完成!')
}

main()
