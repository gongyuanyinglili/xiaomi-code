/**
 * 认证管理器 - 统一处理OAuth和API Key认证
 */

import { promises as fs } from 'fs'
import path from 'path'
import os from 'os'
import type { ModelProvider, AuthMethod } from '../../constants/models.js'
import { PROVIDER_CONFIGS } from '../../constants/models.js'
import { SESSION_CONFIG } from '../../constants/product.js'

// 认证凭证
export interface Credentials {
  provider: ModelProvider
  method: AuthMethod
  apiKey?: string
  accessToken?: string
  refreshToken?: string
  expiresAt?: number
  userInfo?: {
    id?: string
    name?: string
    email?: string
    avatar?: string
  }
  createdAt: number
  updatedAt: number
}

// 认证管理器
export class AuthManager {
  private configDir: string
  private credentialsPath: string
  private credentials: Map<ModelProvider, Credentials> = new Map()
  private initialized = false

  constructor(customConfigDir?: string) {
    this.configDir = customConfigDir || this.getDefaultConfigDir()
    this.credentialsPath = path.join(this.configDir, SESSION_CONFIG.CREDENTIALS_FILE_NAME)
  }

  // 获取默认配置目录
  private getDefaultConfigDir(): string {
    const homeDir = os.homedir()
    return path.join(homeDir, SESSION_CONFIG.CONFIG_DIR_NAME)
  }

  // 初始化
  async initialize(): Promise<void> {
    if (this.initialized) return

    // 确保配置目录存在
    await fs.mkdir(this.configDir, { recursive: true })

    // 加载已有凭证
    await this.loadCredentials()

    this.initialized = true
  }

  // 加载凭证
  private async loadCredentials(): Promise<void> {
    try {
      const data = await fs.readFile(this.credentialsPath, 'utf-8')
      const configs: Record<ModelProvider, Credentials> = JSON.parse(data)
      
      for (const [provider, creds] of Object.entries(configs)) {
        this.credentials.set(provider as ModelProvider, creds)
      }
    } catch (error) {
      // 文件不存在或解析失败，从环境变量加载
      await this.loadFromEnvironment()
    }
  }

  // 从环境变量加载
  private async loadFromEnvironment(): Promise<void> {
    for (const [provider, config] of Object.entries(PROVIDER_CONFIGS)) {
      const apiKey = process.env[config.apiKeyEnvVar]
      if (apiKey) {
        this.credentials.set(provider as ModelProvider, {
          provider: provider as ModelProvider,
          method: 'api_key',
          apiKey,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        })
      }
    }
  }

  // 保存凭证
  private async saveCredentials(): Promise<void> {
    const data: Record<string, Credentials> = {}
    for (const [provider, creds] of this.credentials) {
      data[provider] = creds
    }
    await fs.writeFile(this.credentialsPath, JSON.stringify(data, null, 2))
  }

  // 设置API Key
  async setApiKey(provider: ModelProvider, apiKey: string): Promise<void> {
    await this.initialize()

    const creds: Credentials = {
      provider,
      method: 'api_key',
      apiKey,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    this.credentials.set(provider, creds)
    await this.saveCredentials()
  }

  // 设置OAuth凭证
  async setOAuthCredentials(
    provider: ModelProvider,
    accessToken: string,
    refreshToken: string,
    expiresIn: number,
    userInfo?: Credentials['userInfo']
  ): Promise<void> {
    await this.initialize()

    const creds: Credentials = {
      provider,
      method: 'oauth',
      accessToken,
      refreshToken,
      expiresAt: Date.now() + expiresIn * 1000,
      userInfo,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    this.credentials.set(provider, creds)
    await this.saveCredentials()
  }

  // 获取凭证
  async getCredentials(provider: ModelProvider): Promise<Credentials | undefined> {
    await this.initialize()
    return this.credentials.get(provider)
  }

  // 获取API Key
  async getApiKey(provider: ModelProvider): Promise<string | undefined> {
    await this.initialize()
    const creds = this.credentials.get(provider)
    if (creds?.method === 'api_key') {
      return creds.apiKey
    }
    // 从环境变量获取
    const envVar = PROVIDER_CONFIGS[provider].apiKeyEnvVar
    return process.env[envVar]
  }

  // 获取访问令牌
  async getAccessToken(provider: ModelProvider): Promise<string | undefined> {
    await this.initialize()
    const creds = this.credentials.get(provider)
    
    if (!creds) return undefined

    // API Key模式
    if (creds.method === 'api_key') {
      return creds.apiKey || process.env[PROVIDER_CONFIGS[provider].apiKeyEnvVar]
    }

    // OAuth模式，检查是否过期
    if (creds.method === 'oauth' && creds.expiresAt) {
      if (Date.now() >= creds.expiresAt - 5 * 60 * 1000) {
        // Token即将过期，尝试刷新
        const refreshed = await this.refreshToken(provider)
        if (refreshed) {
          const newCreds = this.credentials.get(provider)
          return newCreds?.accessToken
        }
      }
      return creds.accessToken
    }

    return undefined
  }

  // 刷新Token
  private async refreshToken(provider: ModelProvider): Promise<boolean> {
    const creds = this.credentials.get(provider)
    if (!creds?.refreshToken) return false

    try {
      // 这里实现具体的刷新逻辑
      // 不同提供商有不同的刷新方式
      const providerConfig = PROVIDER_CONFIGS[provider]
      
      if (providerConfig.oauthConfig) {
        // OAuth刷新
        // 实际实现需要调用提供商的token endpoint
        return false
      }
      
      return false
    } catch (error) {
      return false
    }
  }

  // 检查是否已认证
  async isAuthenticated(provider: ModelProvider): Promise<boolean> {
    await this.initialize()
    const creds = this.credentials.get(provider)
    
    if (!creds) {
      // 检查环境变量
      const envVar = PROVIDER_CONFIGS[provider].apiKeyEnvVar
      return !!process.env[envVar]
    }

    if (creds.method === 'api_key') {
      return !!creds.apiKey
    }

    if (creds.method === 'oauth') {
      if (!creds.expiresAt) return true
      // 检查是否过期
      return Date.now() < creds.expiresAt
    }

    return false
  }

  // 获取所有已配置的提供商
  async getConfiguredProviders(): Promise<ModelProvider[]> {
    await this.initialize()
    const providers: ModelProvider[] = []
    
    for (const provider of Object.keys(PROVIDER_CONFIGS) as ModelProvider[]) {
      if (await this.isAuthenticated(provider)) {
        providers.push(provider)
      }
    }
    
    return providers
  }

  // 获取第一个可用的提供商
  async getDefaultProvider(): Promise<ModelProvider | undefined> {
    const providers = await this.getConfiguredProviders()
    return providers[0]
  }

  // 清除凭证
  async clearCredentials(provider: ModelProvider): Promise<void> {
    await this.initialize()
    this.credentials.delete(provider)
    await this.saveCredentials()
  }

  // 清除所有凭证
  async clearAllCredentials(): Promise<void> {
    await this.initialize()
    this.credentials.clear()
    await fs.unlink(this.credentialsPath).catch(() => {})
  }

  // 获取用户信息
  async getUserInfo(provider: ModelProvider): Promise<Credentials['userInfo'] | undefined> {
    await this.initialize()
    const creds = this.credentials.get(provider)
    return creds?.userInfo
  }

  // 验证凭证
  async validateCredentials(provider: ModelProvider): Promise<boolean> {
    const token = await this.getAccessToken(provider)
    if (!token) return false

    try {
      // 尝试列出模型来验证凭证
      const { APIClient } = await import('../api/client.js')
      const client = new APIClient(provider, { method: 'api_key', apiKey: token })
      return await client.validateAuth()
    } catch (error) {
      return false
    }
  }

  // 获取配置目录路径
  getConfigDir(): string {
    return this.configDir
  }
}

// 全局认证管理器实例
let globalAuthManager: AuthManager | undefined

export function getAuthManager(configDir?: string): AuthManager {
  if (!globalAuthManager) {
    globalAuthManager = new AuthManager(configDir)
  }
  return globalAuthManager
}

// 便捷函数
export async function setupApiKey(provider: ModelProvider, apiKey: string): Promise<void> {
  const auth = getAuthManager()
  await auth.setApiKey(provider, apiKey)
}

export async function getActiveApiKey(provider?: ModelProvider): Promise<string | undefined> {
  const auth = getAuthManager()
  const targetProvider = provider || await auth.getDefaultProvider()
  if (!targetProvider) return undefined
  return auth.getApiKey(targetProvider)
}

export async function checkAuth(provider?: ModelProvider): Promise<boolean> {
  const auth = getAuthManager()
  const targetProvider = provider || await auth.getDefaultProvider()
  if (!targetProvider) return false
  return auth.isAuthenticated(targetProvider)
}
