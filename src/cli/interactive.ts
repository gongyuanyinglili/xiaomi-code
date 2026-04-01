/**
 * 交互模式 - 主对话循环
 */

import React, { useState, useCallback, useEffect } from 'react'
import { render, Box, Text, useInput, useApp, Spacer } from 'ink'
import { 
  XIAOMI_COLORS, 
  PRODUCT_NAME, 
  XIAOMI_TAGLINES 
} from '../constants/product.js'
import { XiaomiLogo, MiniLogo, BrandSeparator } from '../components/XiaomiLogo.js'
import { ModelTag, XiaomiBadge, XiaomiAlert } from '../components/XiaomiTheme.js'
import { APIClient, ChatMessage, ChatStreamChunk } from '../services/api/client.js'
import { getAuthManager } from '../services/auth/manager.js'
import { DEFAULT_MODEL, getModelDefinition } from '../constants/models.js'
import { getProviderByModel } from '../constants/models.js'

// 消息类型
interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  isStreaming?: boolean
  model?: string
}

// 交互式App组件
const InteractiveApp: React.FC<{ initialPrompt?: string }> = ({ initialPrompt }) => {
  const { exit } = useApp()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [currentModel, setCurrentModel] = useState(DEFAULT_MODEL)
  const [client, setClient] = useState<APIClient | null>(null)
  const [error, setError] = useState<string | null>(null)

  // 初始化
  useEffect(() => {
    initializeClient()
  }, [])

  // 处理初始提示
  useEffect(() => {
    if (initialPrompt && client) {
      handleSend(initialPrompt)
    }
  }, [client, initialPrompt])

  // 初始化API客户端
  const initializeClient = async () => {
    try {
      const auth = getAuthManager()
      const provider = await auth.getDefaultProvider()
      
      if (!provider) {
        setError('未配置API Key，请先运行: xiaomi-code setup')
        return
      }

      const apiKey = await auth.getApiKey(provider)
      if (!apiKey) {
        setError('API Key 未设置')
        return
      }

      const newClient = new APIClient(provider, { method: 'api_key', apiKey }, currentModel)
      setClient(newClient)
    } catch (err) {
      setError(`初始化失败: ${err}`)
    }
  }

  // 发送消息
  const handleSend = async (content: string) => {
    if (!client || !content.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    setError(null)

    try {
      // 构建聊天消息
      const chatMessages: ChatMessage[] = [
        { role: 'system', content: '你是 Xiaomi Code，一个智能编程助手。为发烧友提供专业、高效的编程帮助。' },
        ...messages.map(m => ({ role: m.role, content: m.content }) as ChatMessage),
        { role: 'user', content: content.trim() },
      ]

      // 创建助手消息占位
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        isStreaming: true,
        model: currentModel,
      }
      setMessages(prev => [...prev, assistantMessage])

      // 流式响应
      const stream = client.chatStream({
        model: currentModel,
        messages: chatMessages,
        stream: true,
        temperature: 0.7,
      })

      let fullContent = ''
      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content
        if (delta) {
          fullContent += delta
          setMessages(prev =>
            prev.map(m =>
              m.id === assistantMessage.id
                ? { ...m, content: fullContent }
                : m
            )
          )
        }
      }

      // 标记完成
      setMessages(prev =>
        prev.map(m =>
          m.id === assistantMessage.id
            ? { ...m, isStreaming: false }
            : m
        )
      )
    } catch (err) {
      setError(`请求失败: ${err}`)
    } finally {
      setIsLoading(false)
    }
  }

  // 键盘输入处理
  useInput((inputChar, key) => {
    if (key.return) {
      handleSend(input)
    } else if (key.escape) {
      exit()
    } else if (key.ctrl && inputChar === 'c') {
      exit()
    } else if (key.backspace || key.delete) {
      setInput(prev => prev.slice(0, -1))
    } else if (!key.ctrl && !key.meta) {
      setInput(prev => prev + inputChar)
    }
  })

  const provider = getProviderByModel(currentModel)

  return (
    <Box flexDirection="column" height="100%">
      {/* 头部 */}
      <Box flexDirection="column" padding={1}>
        <Box justifyContent="space-between">
          <MiniLogo showVersion />
          {provider && <ModelTag provider={provider} model={currentModel} />}
        </Box>
        <BrandSeparator width={50} />
      </Box>

      {/* 消息区域 */}
      <Box flexDirection="column" flexGrow={1} paddingX={1}>
        {messages.length === 0 ? (
          <Box flexDirection="column" alignItems="center" paddingTop={2}>
            <Text color={XIAOMI_COLORS.PRIMARY}>
              {'\u25A0'} Xiaomi Code
            </Text>
            <Text color={XIAOMI_COLORS.TEXT_SECONDARY}>
              输入消息开始对话，按 ESC 退出
            </Text>
          </Box>
        ) : (
          messages.map((message) => (
            <Box key={message.id} flexDirection="column" marginY={1}>
              <Box>
                <Text 
                  bold 
                  color={message.role === 'user' ? XIAOMI_COLORS.PRIMARY : XIAOMI_COLORS.SUCCESS}
                >
                  {message.role === 'user' ? '你' : 'Xiaomi Code'}
                </Text>
                {message.model && (
                  <Text color={XIAOMI_COLORS.TEXT_MUTED}> ({message.model})</Text>
                )}
              </Box>
              <Box marginLeft={2}>
                <Text color={XIAOMI_COLORS.TEXT_PRIMARY}>{message.content}</Text>
                {message.isStreaming && (
                  <Text color={XIAOMI_COLORS.PRIMARY}>{'\u2588'}</Text>
                )}
              </Box>
            </Box>
          ))
        )}
        
        {error && (
          <Box marginY={1}>
            <XiaomiAlert type="error">{error}</XiaomiAlert>
          </Box>
        )}
      </Box>

      {/* 输入区域 */}
      <Box flexDirection="column" padding={1} borderStyle="single" borderColor={XIAOMI_COLORS.PRIMARY}>
        <Box>
          <Text color={XIAOMI_COLORS.PRIMARY}>{'> '}</Text>
          <Text color={XIAOMI_COLORS.TEXT_PRIMARY}>{input}</Text>
          <Text color={XIAOMI_COLORS.PRIMARY}>{'\u2588'}</Text>
        </Box>
        <Box marginTop={1}>
          <Text color={XIAOMI_COLORS.TEXT_MUTED}>
            Enter 发送 · ESC 退出 · Ctrl+C 强制退出
          </Text>
        </Box>
      </Box>
    </Box>
  )
}

// 启动交互模式
export async function startInteractiveMode(
  initialPrompt?: string,
  options: { file?: string; debug?: boolean } = {}
): Promise<void> {
  // 检查认证
  const auth = getAuthManager()
  const providers = await auth.getConfiguredProviders()
  
  if (providers.length === 0) {
    console.log('未配置API Key，请先运行: xiaomi-code setup')
    process.exit(1)
  }

  // 读取文件内容
  let prompt = initialPrompt
  if (options.file) {
    const fs = await import('fs')
    try {
      const fileContent = fs.readFileSync(options.file, 'utf-8')
      prompt = `${prompt || ''}\n\n文件内容:\n${fileContent}`
    } catch (err) {
      console.error(`无法读取文件: ${options.file}`)
      process.exit(1)
    }
  }

  // 渲染Ink应用
  render(<InteractiveApp initialPrompt={prompt} />)
}

export default startInteractiveMode
