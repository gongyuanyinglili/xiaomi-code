/**
 * 国产大模型配置
 * 支持火山引擎、DeepSeek、Kimi、智谱AI等国内主流模型
 */

// 模型提供商
export type ModelProvider = 
  | 'volcano'      // 火山引擎
  | 'deepseek'     // DeepSeek
  | 'kimi'         // Moonshot Kimi
  | 'zhipu'        // 智谱AI
  | 'qwen'         // 通义千问
  | 'baichuan'     // 百川智能
  | 'yi'           // 零一万物
  | 'minimax'      // MiniMax
  | 'openrouter'   // OpenRouter聚合

// 认证方式
export type AuthMethod = 'api_key' | 'oauth' | 'bearer'

// 模型定义
export interface ModelDefinition {
  id: string
  name: string
  provider: ModelProvider
  description: string
  contextWindow: number
  maxTokens: number
  supportsStreaming: boolean
  supportsFunctionCalling: boolean
  supportsVision: boolean
  pricing: {
    input: number  // 每千tokens输入价格(元)
    output: number // 每千tokens输出价格(元)
  }
  tags: string[]
}

// 提供商配置
export interface ProviderConfig {
  name: string
  displayName: string
  authMethod: AuthMethod
  baseUrl: string
  apiKeyEnvVar: string
  oauthConfig?: {
    authorizeUrl: string
    tokenUrl: string
    scopes: string[]
  }
  docsUrl: string
  consoleUrl: string
}

// 火山引擎配置 - 豆包系列
export const VOLCANO_CONFIG: ProviderConfig = {
  name: 'volcano',
  displayName: '火山引擎',
  authMethod: 'api_key',
  baseUrl: 'https://ark.cn-beijing.volces.com/api/v3',
  apiKeyEnvVar: 'ARK_API_KEY',
  docsUrl: 'https://www.volcengine.com/docs/82379',
  consoleUrl: 'https://console.volcengine.com/ark/',
}

// DeepSeek配置
export const DEEPSEEK_CONFIG: ProviderConfig = {
  name: 'deepseek',
  displayName: 'DeepSeek',
  authMethod: 'api_key',
  baseUrl: 'https://api.deepseek.com/v1',
  apiKeyEnvVar: 'DEEPSEEK_API_KEY',
  docsUrl: 'https://platform.deepseek.com/docs',
  consoleUrl: 'https://platform.deepseek.com/',
}

// Kimi配置
export const KIMI_CONFIG: ProviderConfig = {
  name: 'kimi',
  displayName: 'Moonshot Kimi',
  authMethod: 'api_key',
  baseUrl: 'https://api.moonshot.cn/v1',
  apiKeyEnvVar: 'MOONSHOT_API_KEY',
  docsUrl: 'https://platform.moonshot.cn/docs',
  consoleUrl: 'https://platform.moonshot.cn/',
}

// 智谱AI配置
export const ZHIPU_CONFIG: ProviderConfig = {
  name: 'zhipu',
  displayName: '智谱AI',
  authMethod: 'api_key',
  baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
  apiKeyEnvVar: 'ZHIPU_API_KEY',
  docsUrl: 'https://open.bigmodel.cn/dev/howuse',
  consoleUrl: 'https://open.bigmodel.cn/',
}

// 通义千问配置
export const QWEN_CONFIG: ProviderConfig = {
  name: 'qwen',
  displayName: '通义千问',
  authMethod: 'api_key',
  baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
  apiKeyEnvVar: 'DASHSCOPE_API_KEY',
  docsUrl: 'https://help.aliyun.com/document_detail/611472.html',
  consoleUrl: 'https://dashscope.console.aliyun.com/',
}

// 百川智能配置
export const BAICHUAN_CONFIG: ProviderConfig = {
  name: 'baichuan',
  displayName: '百川智能',
  authMethod: 'api_key',
  baseUrl: 'https://api.baichuan-ai.com/v1',
  apiKeyEnvVar: 'BAICHUAN_API_KEY',
  docsUrl: 'https://platform.baichuan-ai.com/docs',
  consoleUrl: 'https://platform.baichuan-ai.com/',
}

// 零一万物配置
export const YI_CONFIG: ProviderConfig = {
  name: 'yi',
  displayName: '零一万物',
  authMethod: 'api_key',
  baseUrl: 'https://api.lingyiwanwu.com/v1',
  apiKeyEnvVar: 'YI_API_KEY',
  docsUrl: 'https://platform.lingyiwanwu.com/docs',
  consoleUrl: 'https://platform.lingyiwanwu.com/',
}

// MiniMax配置
export const MINIMAX_CONFIG: ProviderConfig = {
  name: 'minimax',
  displayName: 'MiniMax',
  authMethod: 'api_key',
  baseUrl: 'https://api.minimax.chat/v1',
  apiKeyEnvVar: 'MINIMAX_API_KEY',
  docsUrl: 'https://platform.minimaxi.com/docs',
  consoleUrl: 'https://platform.minimaxi.com/',
}

// OpenRouter配置
export const OPENROUTER_CONFIG: ProviderConfig = {
  name: 'openrouter',
  displayName: 'OpenRouter',
  authMethod: 'api_key',
  baseUrl: 'https://openrouter.ai/api/v1',
  apiKeyEnvVar: 'OPENROUTER_API_KEY',
  docsUrl: 'https://openrouter.ai/docs',
  consoleUrl: 'https://openrouter.ai/',
}

// 所有提供商配置
export const PROVIDER_CONFIGS: Record<ModelProvider, ProviderConfig> = {
  volcano: VOLCANO_CONFIG,
  deepseek: DEEPSEEK_CONFIG,
  kimi: KIMI_CONFIG,
  zhipu: ZHIPU_CONFIG,
  qwen: QWEN_CONFIG,
  baichuan: BAICHUAN_CONFIG,
  yi: YI_CONFIG,
  minimax: MINIMAX_CONFIG,
  openrouter: OPENROUTER_CONFIG,
}

// 火山引擎模型列表
export const VOLCANO_MODELS: ModelDefinition[] = [
  {
    id: 'doubao-seed-2-0-pro-260215',
    name: '豆包Seed 2.0 Pro',
    provider: 'volcano',
    description: '豆包Seed 2.0旗舰版，综合能力最强',
    contextWindow: 128000,
    maxTokens: 4096,
    supportsStreaming: true,
    supportsFunctionCalling: true,
    supportsVision: false,
    pricing: { input: 0.003, output: 0.009 },
    tags: ['旗舰', '2.0', '推荐'],
  },
  {
    id: 'doubao-seed-2-0-code-preview-260215',
    name: '豆包Seed 2.0 Code',
    provider: 'volcano',
    description: '豆包Seed 2.0代码专用模型，编程能力优异',
    contextWindow: 128000,
    maxTokens: 4096,
    supportsStreaming: true,
    supportsFunctionCalling: true,
    supportsVision: false,
    pricing: { input: 0.002, output: 0.008 },
    tags: ['代码', '2.0'],
  },
  {
    id: 'doubao-seed-2-0-lite-260215',
    name: '豆包Seed 2.0 Lite',
    provider: 'volcano',
    description: '豆包Seed 2.0轻量版，速度快性价比高',
    contextWindow: 128000,
    maxTokens: 4096,
    supportsStreaming: true,
    supportsFunctionCalling: false,
    supportsVision: false,
    pricing: { input: 0.001, output: 0.004 },
    tags: ['轻量', '2.0', '高性价比'],
  },
  {
    id: 'doubao-seed-2-0-mini-260215',
    name: '豆包Seed 2.0 Mini',
    provider: 'volcano',
    description: '豆包Seed 2.0迷你版，适合简单任务',
    contextWindow: 64000,
    maxTokens: 2048,
    supportsStreaming: true,
    supportsFunctionCalling: false,
    supportsVision: false,
    pricing: { input: 0.001, output: 0.003 },
    tags: ['轻量', '2.0'],
  },
  {
    id: 'doubao-1.5-pro-32k',
    name: '豆包 1.5 Pro 32K',
    provider: 'volcano',
    description: '豆包专业版，综合能力强劲',
    contextWindow: 32000,
    maxTokens: 4096,
    supportsStreaming: true,
    supportsFunctionCalling: true,
    supportsVision: false,
    pricing: { input:0.003, output: 0.009 },
    tags: ['综合', '专业'],
  },
  {
    id: 'doubao-1.5-pro-256k',
    name: '豆包 1.5 Pro 256K',
    provider: 'volcano',
    description: '超长上下文版本，适合长文档分析',
    contextWindow: 256000,
    maxTokens: 4096,
    supportsStreaming: true,
    supportsFunctionCalling: true,
    supportsVision: false,
    pricing: { input: 0.005, output: 0.015 },
    tags: ['长文本', '专业'],
  },
  {
    id: 'deepseek-v3-241226',
    name: 'DeepSeek V3',
    provider: 'volcano',
    description: 'DeepSeek V3，性能媲美GPT-4',
    contextWindow: 64000,
    maxTokens: 8192,
    supportsStreaming: true,
    supportsFunctionCalling: true,
    supportsVision: false,
    pricing: { input: 0.002, output: 0.008 },
    tags: ['高性价比'],
  },
  {
    id: 'deepseek-r1-250120',
    name: 'DeepSeek R1',
    provider: 'volcano',
    description: 'DeepSeek推理模型，思维链能力强劲',
    contextWindow: 64000,
    maxTokens: 8192,
    supportsStreaming: true,
    supportsFunctionCalling: false,
    supportsVision: false,
    pricing: { input: 0.004, output: 0.016 },
    tags: ['推理', '思维链'],
  },
  {
    id: 'kimi-k2-250905',
    name: 'Kimi K2',
    provider: 'volcano',
    description: 'Moonshot Kimi，长文本处理专家',
    contextWindow: 200000,
    maxTokens: 8192,
    supportsStreaming: true,
    supportsFunctionCalling: true,
    supportsVision: true,
    pricing: { input: 0.003, output: 0.012 },
    tags: ['长文本', '多模态'],
  },
  {
    id: 'kimi-k1.5-250905',
    name: 'Kimi K1.5',
    provider: 'volcano',
    description: 'Kimi基础版本，性价比高',
    contextWindow: 128000,
    maxTokens: 4096,
    supportsStreaming: true,
    supportsFunctionCalling: true,
    supportsVision: false,
    pricing: { input: 0.001, output: 0.004 },
    tags: ['高性价比'],
  },
]

// DeepSeek官方模型
export const DEEPSEEK_MODELS: ModelDefinition[] = [
  {
    id: 'deepseek-chat',
    name: 'DeepSeek Chat',
    provider: 'deepseek',
    description: 'DeepSeek官方对话模型',
    contextWindow: 64000,
    maxTokens: 8192,
    supportsStreaming: true,
    supportsFunctionCalling: true,
    supportsVision: false,
    pricing: { input: 0.001, output: 0.002 },
    tags: ['官方', '高性价比'],
  },
  {
    id: 'deepseek-reasoner',
    name: 'DeepSeek Reasoner',
    provider: 'deepseek',
    description: 'DeepSeek推理模型，展示思维过程',
    contextWindow: 64000,
    maxTokens: 8192,
    supportsStreaming: true,
    supportsFunctionCalling: false,
    supportsVision: false,
    pricing: { input: 0.004, output: 0.016 },
    tags: ['推理', '思维链'],
  },
  {
    id: 'deepseek-coder',
    name: 'DeepSeek Coder',
    provider: 'deepseek',
    description: '代码专用模型',
    contextWindow: 64000,
    maxTokens: 8192,
    supportsStreaming: true,
    supportsFunctionCalling: true,
    supportsVision: false,
    pricing: { input: 0.001, output: 0.002 },
    tags: ['代码', '编程'],
  },
]

// Kimi官方模型
export const KIMI_MODELS: ModelDefinition[] = [
  {
    id: 'moonshot-v1-8k',
    name: 'Kimi 8K',
    provider: 'kimi',
    description: '轻量级模型，快速响应',
    contextWindow: 8192,
    maxTokens: 4096,
    supportsStreaming: true,
    supportsFunctionCalling: true,
    supportsVision: false,
    pricing: { input: 0.001, output: 0.003 },
    tags: ['轻量', '快速'],
  },
  {
    id: 'moonshot-v1-32k',
    name: 'Kimi 32K',
    provider: 'kimi',
    description: '标准版本，平衡性能与成本',
    contextWindow: 32000,
    maxTokens: 4096,
    supportsStreaming: true,
    supportsFunctionCalling: true,
    supportsVision: false,
    pricing: { input: 0.002, output: 0.006 },
    tags: ['标准'],
  },
  {
    id: 'moonshot-v1-128k',
    name: 'Kimi 128K',
    provider: 'kimi',
    description: '长上下文版本',
    contextWindow: 128000,
    maxTokens: 4096,
    supportsStreaming: true,
    supportsFunctionCalling: true,
    supportsVision: false,
    pricing: { input: 0.003, output: 0.009 },
    tags: ['长文本'],
  },
]

// 智谱AI模型
export const ZHIPU_MODELS: ModelDefinition[] = [
  {
    id: 'glm-4-plus',
    name: 'GLM-4 Plus',
    provider: 'zhipu',
    description: '智谱最强模型',
    contextWindow: 128000,
    maxTokens: 4096,
    supportsStreaming: true,
    supportsFunctionCalling: true,
    supportsVision: true,
    pricing: { input: 0.005, output: 0.015 },
    tags: ['旗舰', '多模态'],
  },
  {
    id: 'glm-4-air',
    name: 'GLM-4 Air',
    provider: 'zhipu',
    description: '高性价比版本',
    contextWindow: 128000,
    maxTokens: 4096,
    supportsStreaming: true,
    supportsFunctionCalling: true,
    supportsVision: false,
    pricing: { input: 0.001, output: 0.003 },
    tags: ['高性价比'],
  },
  {
    id: 'codegeex-4',
    name: 'CodeGeeX-4',
    provider: 'zhipu',
    description: '代码专用模型',
    contextWindow: 128000,
    maxTokens: 4096,
    supportsStreaming: true,
    supportsFunctionCalling: true,
    supportsVision: false,
    pricing: { input: 0.001, output: 0.003 },
    tags: ['代码', '编程'],
  },
]

// 通义千问模型
export const QWEN_MODELS: ModelDefinition[] = [
  {
    id: 'qwen-max',
    name: 'Qwen Max',
    provider: 'qwen',
    description: '通义千问最强模型',
    contextWindow: 32000,
    maxTokens: 8192,
    supportsStreaming: true,
    supportsFunctionCalling: true,
    supportsVision: true,
    pricing: { input: 0.004, output: 0.012 },
    tags: ['旗舰', '多模态'],
  },
  {
    id: 'qwen-plus',
    name: 'Qwen Plus',
    provider: 'qwen',
    description: '均衡版本',
    contextWindow: 32000,
    maxTokens: 8192,
    supportsStreaming: true,
    supportsFunctionCalling: true,
    supportsVision: false,
    pricing: { input: 0.002, output: 0.006 },
    tags: ['均衡'],
  },
  {
    id: 'qwen-coder-plus',
    name: 'Qwen Coder Plus',
    provider: 'qwen',
    description: '代码专用模型',
    contextWindow: 32000,
    maxTokens: 8192,
    supportsStreaming: true,
    supportsFunctionCalling: true,
    supportsVision: false,
    pricing: { input: 0.001, output: 0.003 },
    tags: ['代码', '编程'],
  },
]

// 百川模型
export const BAICHUAN_MODELS: ModelDefinition[] = [
  {
    id: 'Baichuan4',
    name: 'Baichuan 4',
    provider: 'baichuan',
    description: '百川旗舰模型',
    contextWindow: 32000,
    maxTokens: 4096,
    supportsStreaming: true,
    supportsFunctionCalling: true,
    supportsVision: false,
    pricing: { input: 0.005, output: 0.015 },
    tags: ['旗舰'],
  },
]

// 所有模型列表
export const ALL_MODELS: ModelDefinition[] = [
  ...VOLCANO_MODELS,
  ...DEEPSEEK_MODELS,
  ...KIMI_MODELS,
  ...ZHIPU_MODELS,
  ...QWEN_MODELS,
  ...BAICHUAN_MODELS,
]

// 默认模型
export const DEFAULT_MODEL = 'doubao-seed-2.0-code'

// 获取模型定义
export function getModelDefinition(modelId: string): ModelDefinition | undefined {
  return ALL_MODELS.find(m => m.id === modelId)
}

// 获取提供商的所有模型
export function getProviderModels(provider: ModelProvider): ModelDefinition[] {
  return ALL_MODELS.filter(m => m.provider === provider)
}

// 获取提供商配置
export function getProviderConfig(provider: ModelProvider): ProviderConfig {
  return PROVIDER_CONFIGS[provider]
}

// 根据模型ID获取提供商
export function getProviderByModel(modelId: string): ModelProvider | undefined {
  const model = getModelDefinition(modelId)
  return model?.provider
}
