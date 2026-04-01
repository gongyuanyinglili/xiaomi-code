/**
 * API客户端 - 统一接口支持国产大模型
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import type { 
  ModelProvider, 
  ModelDefinition, 
  ProviderConfig,
  AuthMethod 
} from '../../constants/models.js'
import { 
  PROVIDER_CONFIGS, 
  getProviderConfig,
  getProviderByModel,
  DEFAULT_MODEL 
} from '../../constants/models.js'
import { API_CONFIG } from '../../constants/product.js'

// 聊天消息
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool'
  content: string
  name?: string
  tool_calls?: ToolCall[]
  tool_call_id?: string
}

// 工具调用
export interface ToolCall {
  id: string
  type: 'function'
  function: {
    name: string
    arguments: string
  }
}

// 工具定义
export interface ToolDefinition {
  type: 'function'
  function: {
    name: string
    description: string
    parameters: Record<string, unknown>
  }
}

// 聊天请求配置
export interface ChatRequest {
  model: string
  messages: ChatMessage[]
  temperature?: number
  max_tokens?: number
  stream?: boolean
  tools?: ToolDefinition[]
  tool_choice?: 'auto' | 'none' | { type: 'function'; function: { name: string } }
  top_p?: number
  frequency_penalty?: number
  presence_penalty?: number
}

// 聊天响应
export interface ChatResponse {
  id: string
  object: string
  created: number
  model: string
  choices: {
    index: number
    message: ChatMessage
    finish_reason: 'stop' | 'length' | 'tool_calls' | 'content_filter' | null
  }[]
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

// 流式响应块
export interface ChatStreamChunk {
  id: string
  object: string
  created: number
  model: string
  choices: {
    index: number
    delta: Partial<ChatMessage> & { tool_calls?: ToolCall[] }
    finish_reason: 'stop' | 'length' | 'tool_calls' | 'content_filter' | null
  }[]
}

// 认证信息
export interface AuthInfo {
  method: AuthMethod
  apiKey?: string
  accessToken?: string
  refreshToken?: string
  expiresAt?: number
}

// API客户端类
export class APIClient {
  private client: AxiosInstance
  private provider: ModelProvider
  private providerConfig: ProviderConfig
  private authInfo: AuthInfo
  private model: string

  constructor(
    provider: ModelProvider,
    authInfo: AuthInfo,
    model: string = DEFAULT_MODEL
  ) {
    this.provider = provider
    this.providerConfig = getProviderConfig(provider)
    this.authInfo = authInfo
    this.model = model

    this.client = axios.create({
      baseURL: this.providerConfig.baseUrl,
      timeout: API_CONFIG.DEFAULT_TIMEOUT_MS,
      headers: this.buildHeaders(),
    })

    // 请求拦截器
    this.client.interceptors.request.use(
      (config) => {
        this.logRequest(config)
        return config
      },
      (error) => Promise.reject(error)
    )

    // 响应拦截器
    this.client.interceptors.response.use(
      (response) => {
        this.logResponse(response)
        return response
      },
      async (error) => {
        return this.handleError(error)
      }
    )
  }

  // 构建请求头
  private buildHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': `XiaomiCode/${process.env.npm_package_version || '1.0.0'}`,
      'X-Client-Name': 'xiaomi-code',
    }

    // 根据认证方式添加认证头
    switch (this.authInfo.method) {
      case 'api_key':
        const apiKey = this.authInfo.apiKey || process.env[this.providerConfig.apiKeyEnvVar]
        if (apiKey) {
          headers['Authorization'] = `Bearer ${apiKey}`
        }
        break
      case 'bearer':
        if (this.authInfo.accessToken) {
          headers['Authorization'] = `Bearer ${this.authInfo.accessToken}`
        }
        break
    }

    // 提供商特定头
    switch (this.provider) {
      case 'volcano':
        headers['X-Client-Version'] = 'xiaomi-code-1.0.0'
        break
      case 'qwen':
        headers['X-DashScope-SSE'] = 'enable'
        break
    }

    return headers
  }

  // 发送聊天请求（非流式）
  async chat(request: ChatRequest): Promise<ChatResponse> {
    const response = await this.client.post<ChatResponse>('/chat/completions', {
      ...request,
      model: request.model || this.model,
      stream: false,
    })
    return response.data
  }

  // 发送聊天请求（流式）
  async *chatStream(request: ChatRequest): AsyncGenerator<ChatStreamChunk, void, unknown> {
    const response = await this.client.post(
      '/chat/completions',
      {
        ...request,
        model: request.model || this.model,
        stream: true,
      },
      {
        responseType: 'stream',
        headers: {
          Accept: 'text/event-stream',
        },
      }
    )

    const stream = response.data as NodeJS.ReadableStream
    let buffer = ''

    for await (const chunk of stream) {
      buffer += chunk.toString()
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || trimmed === 'data: [DONE]') continue
        if (trimmed.startsWith('data: ')) {
          try {
            const data = JSON.parse(trimmed.slice(6))
            yield data as ChatStreamChunk
          } catch (e) {
            // 忽略解析错误
          }
        }
      }
    }
  }

  // 列出可用模型
  async listModels(): Promise<{ id: string; object: string; created: number; owned_by: string }[]> {
    try {
      const response = await this.client.get('/models')
      return response.data.data || []
    } catch (error) {
      // 如果API不支持，返回预定义模型
      const { getProviderModels } = await import('../../constants/models.js')
      const models = getProviderModels(this.provider)
      return models.map(m => ({
        id: m.id,
        object: 'model',
        created: Date.now(),
        owned_by: this.provider,
      }))
    }
  }

  // 检查认证是否有效
  async validateAuth(): Promise<boolean> {
    try {
      await this.listModels()
      return true
    } catch (error) {
      return false
    }
  }

  // 刷新Token（如果需要）
  async refreshToken(): Promise<boolean> {
    if (this.authInfo.method !== 'oauth' || !this.authInfo.refreshToken) {
      return false
    }

    try {
      // OAuth token刷新逻辑
      // 具体实现取决于提供商
      return true
    } catch (error) {
      return false
    }
  }

  // 错误处理
  private async handleError(error: unknown): Promise<never> {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status
      const data = error.response?.data

      // 认证错误
      if (status === 401) {
        // 尝试刷新token
        if (await this.refreshToken()) {
          throw new APIError('Token refreshed, please retry', 401, 'TOKEN_REFRESHED')
        }
        throw new APIError('Authentication failed. Please check your API key.', 401, 'AUTH_FAILED')
      }

      // 速率限制
      if (status === 429) {
        const retryAfter = error.response?.headers['retry-after']
        throw new APIError(
          `Rate limit exceeded. Retry after ${retryAfter || 'unknown'} seconds`,
          429,
          'RATE_LIMIT',
          { retryAfter }
        )
      }

      // 模型错误
      if (status === 404) {
        throw new APIError(`Model not found: ${this.model}`, 404, 'MODEL_NOT_FOUND')
      }

      // 其他API错误
      throw new APIError(
        data?.error?.message || error.message,
        status || 500,
        data?.error?.code || 'UNKNOWN_ERROR'
      )
    }

    throw error
  }

  // 日志记录
  private logRequest(config: AxiosRequestConfig): void {
    if (process.env.XIAOMI_CODE_DEBUG) {
      console.error('[API Request]', {
        method: config.method,
        url: config.url,
        headers: this.sanitizeHeaders(config.headers as Record<string, unknown>),
      })
    }
  }

  private logResponse(response: AxiosResponse): void {
    if (process.env.XIAOMI_CODE_DEBUG) {
      console.error('[API Response]', {
        status: response.status,
        url: response.config.url,
      })
    }
  }

  private sanitizeHeaders(headers?: Record<string, unknown>): Record<string, string> {
    if (!headers) return {}
    const sanitized: Record<string, string> = {}
    for (const [key, value] of Object.entries(headers)) {
      if (key.toLowerCase() === 'authorization') {
        sanitized[key] = 'Bearer ***'
      } else {
        sanitized[key] = String(value)
      }
    }
    return sanitized
  }

  // 获取当前配置
  getConfig(): { provider: ModelProvider; model: string; baseUrl: string } {
    return {
      provider: this.provider,
      model: this.model,
      baseUrl: this.providerConfig.baseUrl,
    }
  }

  // 更新模型
  setModel(model: string): void {
    this.model = model
  }

  // 静态工厂方法
  static createFromModel(
    modelId: string,
    authInfo: AuthInfo
  ): APIClient {
    const provider = getProviderByModel(modelId)
    if (!provider) {
      throw new APIError(`Unknown model: ${modelId}`, 400, 'UNKNOWN_MODEL')
    }
    return new APIClient(provider, authInfo, modelId)
  }

  static createFromProvider(
    provider: ModelProvider,
    authInfo: AuthInfo,
    model?: string
  ): APIClient {
    return new APIClient(provider, authInfo, model)
  }
}

// API错误类
export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code: string,
    public metadata?: Record<string, unknown>
  ) {
    super(message)
    this.name = 'APIError'
  }
}

// 导出便捷函数
export async function createChatCompletion(
  provider: ModelProvider,
  apiKey: string,
  messages: ChatMessage[],
  options: Partial<ChatRequest> = {}
): Promise<ChatResponse> {
  const client = new APIClient(provider, { method: 'api_key', apiKey })
  return client.chat({
    model: options.model || DEFAULT_MODEL,
    messages,
    ...options,
  })
}

export async function* createChatCompletionStream(
  provider: ModelProvider,
  apiKey: string,
  messages: ChatMessage[],
  options: Partial<ChatRequest> = {}
): AsyncGenerator<ChatStreamChunk, void, unknown> {
  const client = new APIClient(provider, { method: 'api_key', apiKey })
  yield* client.chatStream({
    model: options.model || DEFAULT_MODEL,
    messages,
    ...options,
  })
}
