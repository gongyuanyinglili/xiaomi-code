#!/usr/bin/env bun
/**
 * 简化版API测试 - 使用Bun内置fetch
 */

const API_KEY = process.argv[2] || process.env.ARK_API_KEY
const PROVIDER = process.argv[3] || 'volcano'

// 提供商配置
const CONFIGS: Record<string, { baseUrl: string; model: string; name: string }> = {
  volcano: {
    baseUrl: 'https://ark.cn-beijing.volces.com/api/v3',
    model: 'doubao-seed-2.0-code',
    name: '火山引擎'
  },
  deepseek: {
    baseUrl: 'https://api.deepseek.com/v1',
    model: 'deepseek-chat',
    name: 'DeepSeek'
  },
  kimi: {
    baseUrl: 'https://api.moonshot.cn/v1',
    model: 'moonshot-v1-8k',
    name: 'Moonshot Kimi'
  }
}

const config = CONFIGS[PROVIDER]

if (!API_KEY) {
  console.log('❌ 请提供API Key')
  console.log('用法: bun test/simple-test.ts <API_KEY> [provider]')
  process.exit(1)
}

console.log(`
╔══════════════════════════════════════╗
║     Xiaomi Code API 测试             ║
║     为发烧而生                        ║
╚══════════════════════════════════════╝
`)

console.log(`🔑 API Key: ${API_KEY.substring(0, 8)}****${API_KEY.slice(-4)}`)
console.log(`🌐 提供商: ${config.name}`)
console.log(`📍 端点: ${config.baseUrl}`)
console.log(`🤖 模型: ${config.model}\n`)

// 测试认证
async function testAuth() {
  console.log('⏳ 测试认证...')
  
  try {
    const response = await fetch(`${config.baseUrl}/models`, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`
      }
    })
    
    if (response.ok) {
      console.log('✅ 认证通过!\n')
      return true
    } else {
      const error = await response.text()
      console.log(`❌ 认证失败: ${response.status}`)
      console.log(`   ${error}\n`)
      return false
    }
  } catch (error: any) {
    console.log(`❌ 连接错误: ${error.message}\n`)
    return false
  }
}

// 测试对话
async function testChat() {
  console.log('⏳ 测试对话...')
  
  const startTime = Date.now()
  
  try {
    const response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: 'system', content: '你是Xiaomi Code助手' },
          { role: 'user', content: '你好！请用一句话介绍自己' }
        ],
        temperature: 0.7,
        max_tokens: 100
      })
    })
    
    const duration = Date.now() - startTime
    
    if (!response.ok) {
      const error = await response.text()
      console.log(`❌ 对话失败: ${response.status}`)
      console.log(`   ${error}`)
      return false
    }
    
    const data = await response.json()
    const content = data.choices?.[0]?.message?.content
    
    console.log(`✅ 对话成功! (${duration}ms)`)
    console.log(`\n📝 回复:`)
    console.log(`   ${content}\n`)
    
    if (data.usage) {
      console.log(`📊 Token用量: 输入${data.usage.prompt_tokens} / 输出${data.usage.completion_tokens}\n`)
    }
    
    return true
  } catch (error: any) {
    console.log(`❌ 请求错误: ${error.message}\n`)
    return false
  }
}

// 测试流式响应
async function testStream() {
  console.log('⏳ 测试流式响应...')
  
  const startTime = Date.now()
  
  try {
    const response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: 'user', content: '写一句励志的话' }
        ],
        temperature: 0.7,
        stream: true
      })
    })
    
    if (!response.ok) {
      console.log(`❌ 流式请求失败: ${response.status}`)
      return false
    }
    
    const reader = response.body?.getReader()
    if (!reader) {
      console.log('❌ 无法读取响应流')
      return false
    }
    
    let content = ''
    let chunkCount = 0
    
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      
      const chunk = new TextDecoder().decode(value)
      const lines = chunk.split('\n')
      
      for (const line of lines) {
        if (line.startsWith('data: ') && line !== 'data: [DONE]') {
          try {
            const data = JSON.parse(line.slice(6))
            const delta = data.choices?.[0]?.delta?.content
            if (delta) {
              content += delta
              chunkCount++
            }
          } catch (e) {}
        }
      }
    }
    
    const duration = Date.now() - startTime
    
    console.log(`✅ 流式响应成功! (${duration}ms, ${chunkCount} chunks)`)
    console.log(`\n📝 内容:`)
    console.log(`   ${content}\n`)
    
    return true
  } catch (error: any) {
    console.log(`❌ 流式错误: ${error.message}\n`)
    return false
  }
}

// 主函数
async function main() {
  const results = {
    auth: await testAuth(),
    chat: false,
    stream: false
  }
  
  if (results.auth) {
    results.chat = await testChat()
    results.stream = await testStream()
  }
  
  console.log('═══════════════════════════════════════')
  console.log('📋 测试总结:')
  console.log('═══════════════════════════════════════')
  console.log(`   认证: ${results.auth ? '✅ 通过' : '❌ 失败'}`)
  console.log(`   对话: ${results.chat ? '✅ 通过' : '❌ 失败'}`)
  console.log(`   流式: ${results.stream ? '✅ 通过' : '❌ 失败'}`)
  console.log('═══════════════════════════════════════')
  
  if (results.auth && results.chat) {
    console.log('\n🎉 API Key 测试全部通过！')
    console.log('   可以正常使用 Xiaomi Code\n')
  } else {
    console.log('\n⚠️ 测试未通过，请检查API Key')
  }
}

main().catch(console.error)
