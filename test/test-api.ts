#!/usr/bin/env bun
/**
 * API Key 测试脚本
 * 验证各提供商的API是否可用
 */

import { APIClient } from '../src/services/api/client.js'
import { PROVIDER_CONFIGS, ALL_MODELS } from '../src/constants/models.js'
import chalk from 'chalk'

// 提供商测试配置
const TEST_CONFIGS: Record<string, { model: string; testMessage: string }> = {
  volcano: {
    model: 'doubao-seed-2.0-code',
    testMessage: '你好，请用一句话介绍自己'
  },
  deepseek: {
    model: 'deepseek-chat',
    testMessage: '你好，请用一句话介绍自己'
  },
  kimi: {
    model: 'moonshot-v1-8k',
    testMessage: '你好，请用一句话介绍自己'
  },
  zhipu: {
    model: 'glm-4-flash',
    testMessage: '你好，请用一句话介绍自己'
  },
  qwen: {
    model: 'qwen-turbo',
    testMessage: '你好，请用一句话介绍自己'
  }
}

// 测试单个提供商
async function testProvider(provider: string, apiKey: string): Promise<boolean> {
  const config = TEST_CONFIGS[provider]
  if (!config) {
    console.log(chalk.yellow(`⚠️  未找到 ${provider} 的测试配置，跳过`))
    return false
  }

  const providerConfig = PROVIDER_CONFIGS[provider as keyof typeof PROVIDER_CONFIGS]
  console.log(chalk.blue(`\n🔍 测试 ${providerConfig?.displayName || provider}...`))
  console.log(chalk.gray(`   模型: ${config.model}`))
  console.log(chalk.gray(`   端点: ${providerConfig?.baseUrl}`))

  try {
    const client = new APIClient(
      provider as any,
      { method: 'api_key', apiKey },
      config.model
    )

    // 测试认证
    console.log(chalk.gray('   步骤1: 验证认证...'))
    const isValid = await client.validateAuth()
    if (!isValid) {
      console.log(chalk.red('   ✗ 认证失败'))
      return false
    }
    console.log(chalk.green('   ✓ 认证通过'))

    // 测试聊天
    console.log(chalk.gray('   步骤2: 测试对话...'))
    const startTime = Date.now()
    
    const response = await client.chat({
      model: config.model,
      messages: [
        { role: 'system', content: '你是Xiaomi Code助手，简洁专业。' },
        { role: 'user', content: config.testMessage }
      ],
      temperature: 0.7,
      max_tokens: 100
    })

    const duration = Date.now() - startTime
    const content = response.choices[0]?.message?.content || '(无响应)'
    
    console.log(chalk.green(`   ✓ 对话成功 (${duration}ms)`))
    console.log(chalk.cyan('   响应:'), content.substring(0, 100) + (content.length > 100 ? '...' : ''))
    
    // 显示用量
    if (response.usage) {
      console.log(chalk.gray(`   Token用量: 输入${response.usage.prompt_tokens} / 输出${response.usage.completion_tokens}`))
    }

    return true
  } catch (error: any) {
    console.log(chalk.red(`   ✗ 测试失败: ${error.message}`))
    if (process.env.DEBUG) {
      console.error(error)
    }
    return false
  }
}

// 测试流式响应
async function testStreaming(provider: string, apiKey: string): Promise<boolean> {
  const config = TEST_CONFIGS[provider]
  if (!config) return false

  console.log(chalk.blue(`\n🌊 测试流式响应 (${provider})...`))

  try {
    const client = new APIClient(
      provider as any,
      { method: 'api_key', apiKey },
      config.model
    )

    const stream = client.chatStream({
      model: config.model,
      messages: [{ role: 'user', content: '写一句励志的话' }],
      temperature: 0.7
    })

    let content = ''
    let chunkCount = 0
    const startTime = Date.now()

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content
      if (delta) {
        content += delta
        chunkCount++
        process.stdout.write(chalk.cyan('.'))
      }
    }

    const duration = Date.now() - startTime
    console.log('\n' + chalk.green(`   ✓ 流式响应成功 (${duration}ms, ${chunkCount} chunks)`))
    console.log(chalk.cyan('   响应:'), content.substring(0, 100))

    return true
  } catch (error: any) {
    console.log(chalk.red(`\n   ✗ 流式测试失败: ${error.message}`))
    return false
  }
}

// 主测试函数
async function main() {
  console.log(chalk.hex('#FF6900')(`
╔══════════════════════════════════════╗
║     Xiaomi Code API 测试工具         ║
║     为发烧而生                        ║
╚══════════════════════════════════════╝
`))

  // 从命令行获取API Key
  const args = process.argv.slice(2)
  let apiKey = args[0]
  let provider = args[1] || 'volcano'

  // 如果没有提供API Key，尝试从环境变量获取
  if (!apiKey) {
    const envVar = PROVIDER_CONFIGS[provider as keyof typeof PROVIDER_CONFIGS]?.apiKeyEnvVar
    apiKey = process.env[envVar] || ''
    
    if (apiKey) {
      console.log(chalk.gray(`从环境变量 ${envVar} 读取API Key`))
    }
  }

  if (!apiKey) {
    console.log(chalk.yellow('用法: bun test/test-api.ts <API_KEY> [provider]'))
    console.log(chalk.gray('或设置环境变量: ARK_API_KEY, DEEPSEEK_API_KEY 等'))
    console.log(chalk.gray('\n支持的提供商: volcano, deepseek, kimi, zhipu, qwen'))
    process.exit(1)
  }

  // 隐藏部分API Key用于显示
  const maskedKey = apiKey.substring(0, 8) + '****' + apiKey.substring(apiKey.length - 4)
  console.log(chalk.blue('API Key:'), maskedKey)
  console.log(chalk.blue('提供商:'), provider)
  console.log('')

  // 运行测试
  const results: Record<string, boolean> = {}

  if (provider === 'all') {
    // 测试所有提供商
    for (const p of Object.keys(TEST_CONFIGS)) {
      results[p] = await testProvider(p, apiKey)
    }
  } else {
    // 测试指定提供商
    results[provider] = await testProvider(provider, apiKey)
    
    // 如果基础测试通过，测试流式响应
    if (results[provider]) {
      await testStreaming(provider, apiKey)
    }
  }

  // 测试总结
  console.log(chalk.hex('#FF6900')('\n═══════════════════════════════════════'))
  console.log(chalk.bold('测试结果总结:'))
  console.log(chalk.hex('#FF6900')('═══════════════════════════════════════\n'))

  for (const [p, success] of Object.entries(results)) {
    const name = PROVIDER_CONFIGS[p as keyof typeof PROVIDER_CONFIGS]?.displayName || p
    if (success) {
      console.log(chalk.green(`✓ ${name}: 通过`))
    } else {
      console.log(chalk.red(`✗ ${name}: 失败`))
    }
  }

  const passed = Object.values(results).filter(r => r).length
  const total = Object.values(results).length

  console.log(chalk.hex('#FF6900')('\n═══════════════════════════════════════'))
  console.log(chalk.bold(`总计: ${passed}/${total} 通过`))
  console.log(chalk.hex('#FF6900')('═══════════════════════════════════════'))

  process.exit(passed === total ? 0 : 1)
}

main().catch(console.error)
