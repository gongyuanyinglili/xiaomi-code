/**
 * 工具函数集合
 */

import { promises as fs } from 'fs'
import path from 'path'
import os from 'os'

// 延迟函数
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// 格式化文件大小
export function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let size = bytes
  let unitIndex = 0
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }
  
  return `${size.toFixed(2)} ${units[unitIndex]}`
}

// 格式化时间
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
  if (ms < 3600000) return `${(ms / 60000).toFixed(1)}m`
  return `${(ms / 3600000).toFixed(1)}h`
}

// 截断文本
export function truncate(text: string, maxLength: number, suffix = '...'): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - suffix.length) + suffix
}

// 生成唯一ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// 清理字符串（移除控制字符）
export function sanitizeString(str: string): string {
  return str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
}

// 检查是否是中文字符串
export function containsChinese(str: string): boolean {
  return /[\u4e00-\u9fa5]/.test(str)
}

// 安全JSON解析
export function safeJsonParse<T>(str: string, defaultValue: T): T {
  try {
    return JSON.parse(str) as T
  } catch {
    return defaultValue
  }
}

// 深度合并对象
export function deepMerge<T extends Record<string, unknown>>(
  target: T,
  source: Partial<T>
): T {
  const result = { ...target }
  
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(
        (result[key] as Record<string, unknown>) || {},
        source[key] as Record<string, unknown>
      ) as T[Extract<keyof T, string>]
    } else {
      result[key] = source[key] as T[Extract<keyof T, string>]
    }
  }
  
  return result
}

// 防抖函数
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}

// 节流函数
export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

// 检查路径是否在 home 目录下
export function isInHomeDir(targetPath: string): boolean {
  const homeDir = os.homedir()
  const resolved = path.resolve(targetPath)
  return resolved.startsWith(homeDir)
}

// 创建临时文件
export async function createTempFile(
  prefix: string,
  suffix: string,
  content?: string
): Promise<string> {
  const tmpDir = os.tmpdir()
  const fileName = `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}${suffix}`
  const filePath = path.join(tmpDir, fileName)
  
  if (content !== undefined) {
    await fs.writeFile(filePath, content, 'utf-8')
  }
  
  return filePath
}

// 读取文件内容为字符串
export async function readFileContent(filePath: string): Promise<string> {
  try {
    return await fs.readFile(filePath, 'utf-8')
  } catch (error) {
    throw new Error(`无法读取文件 ${filePath}: ${error}`)
  }
}

// 写入文件内容
export async function writeFileContent(
  filePath: string,
  content: string
): Promise<void> {
  try {
    // 确保目录存在
    const dir = path.dirname(filePath)
    await fs.mkdir(dir, { recursive: true })
    await fs.writeFile(filePath, content, 'utf-8')
  } catch (error) {
    throw new Error(`无法写入文件 ${filePath}: ${error}`)
  }
}

// 检查文件是否存在
export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

// 获取文件扩展名
export function getFileExtension(filePath: string): string {
  return path.extname(filePath).toLowerCase()
}

// 获取文件名（不含扩展名）
export function getFileNameWithoutExt(filePath: string): string {
  return path.basename(filePath, path.extname(filePath))
}

// 编码 base64
export function encodeBase64(str: string): string {
  return Buffer.from(str).toString('base64')
}

// 解码 base64
export function decodeBase64(str: string): string {
  return Buffer.from(str, 'base64').toString('utf-8')
}

// 模板字符串替换
export function renderTemplate(
  template: string,
  variables: Record<string, string>
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return variables[key] !== undefined ? variables[key] : match
  })
}
