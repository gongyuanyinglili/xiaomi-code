/**
 * Xiaomi Code - 产品常量配置
 * 为发烧友打造的智能编程工具
 */

// 产品信息
export const PRODUCT_NAME = 'Xiaomi Code'
export const PRODUCT_NAME_CN = '小米代码助手'
export const PRODUCT_VERSION = '1.0.0'
export const PRODUCT_URL = 'https://mi.com/xiaomi-code'
export const PRODUCT_SLOGAN = '为发烧而生'
export const PRODUCT_SLOGAN_EN = 'Born for Innovation'

// 小米品牌色彩系统
export const XIAOMI_COLORS = {
  // 主色调 - 小米橙
  PRIMARY: '#FF6900',
  PRIMARY_LIGHT: '#FF8C42',
  PRIMARY_DARK: '#E55A00',
  
  // 辅助色
  SECONDARY: '#1A1A1A',
  SECONDARY_LIGHT: '#333333',
  
  // 背景色
  BG_DARK: '#000000',
  BG_LIGHT: '#F5F5F5',
  BG_CARD: '#1A1A1A',
  
  // 文字色
  TEXT_PRIMARY: '#FFFFFF',
  TEXT_SECONDARY: '#999999',
  TEXT_MUTED: '#666666',
  
  // 功能色
  SUCCESS: '#00B578',
  WARNING: '#FFAA00',
  ERROR: '#FF4D4F',
  INFO: '#1890FF',
  
  // 渐变色
  GRADIENT_START: '#FF6900',
  GRADIENT_END: '#FF9F43',
} as const

// 小米Logo ASCII艺术
export const XIAOMI_LOGO_ASCII = `
░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
░░░░░░░░░░░░░▒▓██████▓░░░░░░░░░░░░░
░░░░░░░░░░░░▓██████████▒░░░░░░░░░░░
░░░░░░░░░░░███▓▒▒▒▒▓█████░░░░░░░░░░
░░░░░░░░░░▒██░░░░░░▒▓████▒░░░░░░░░░
░░░░░░░░░░▒█▓▒▒▒░░▒▓▓████▒░░░░░░░░░
░░░░░░░░░░░█▒▓▓█▒▒▓▓█████░░░░░░░░░░
░░░░░░░░░░░▒▒░░░░▒▓▒▒▓███░░░░░░░░░░
░░░░░░░░░░░░▒░▒░▒▓█▓▒███▒░░░░░░░░░░
░░░░░░░░░░░░▒▓▒▒▓██████░░░░░░░░░░░░
░░░░░░░░░░░░░▒▒░▒▒▓▓██▓░░░░░░░░░░░░
░░░░░░░░░░░░░░▓▓▓▓█████▓░░░░░░░░░░░
░░░░░░░░░░░░░▒▒▒▓██▓▓████▓░░░░░░░░░
░░░░░░░░▒▓▓███▒▓░▒▒░▓████████▓▒░░░░
░░░░▒▓████████▒░▒░░░█████████████▓▒
░░░▓██████████▒░░░░▒███████████████
░░░███████████▓░░░▒████████████████
░░▓███████████▓░░░█████████████████
`

// 品牌标语
export const XIAOMI_TAGLINES = [
  '为发烧而生',
  '永远相信美好的事情即将发生',
  '让每个人都能享受科技的乐趣',
  'Born for Innovation',
  'Innovation for Everyone',
]

// 会话配置
export const SESSION_CONFIG = {
  DEFAULT_SESSION_NAME: 'xiaomi-session',
  CONFIG_DIR_NAME: '.xiaomi-code',
  SESSION_FILE_NAME: 'session.json',
  SETTINGS_FILE_NAME: 'settings.json',
  CREDENTIALS_FILE_NAME: 'credentials.json',
  HISTORY_DIR_NAME: 'history',
  MAX_HISTORY_FILES: 50,
  SESSION_TIMEOUT_MS: 30 * 60 * 1000, // 30分钟
}

// API配置
export const API_CONFIG = {
  // 默认超时
  DEFAULT_TIMEOUT_MS: 600 * 1000, // 10分钟
  MAX_RETRIES: 3,
  RETRY_DELAY_MS: 1000,
  
  // 流式配置
  STREAM_CHUNK_SIZE: 1024,
  STREAM_TIMEOUT_MS: 300 * 1000,
  
  // 速率限制
  RATE_LIMIT_REQUESTS_PER_MINUTE: 60,
  RATE_LIMIT_WINDOW_MS: 60 * 1000,
}

// 编辑器配置
export const EDITOR_CONFIG = {
  DEFAULT_EDITOR: process.env.EDITOR || 'vim',
  TEMP_FILE_PREFIX: 'xiaomi-code-',
  TEMP_FILE_SUFFIX: '.tmp',
}

// 调试配置
export const DEBUG_CONFIG = {
  DEBUG_ENV_VAR: 'XIAOMI_CODE_DEBUG',
  LOG_LEVELS: ['error', 'warn', 'info', 'debug', 'trace'] as const,
  DEFAULT_LOG_LEVEL: 'info' as const,
}
