#!/usr/bin/env bun
/**
 * 对话测试 - 使用可用的模型
 */

const API_KEY = process.argv[2]
const MODEL = process.argv[3] || 'doubao-pro-32k-240828'
const BASE_URL = 'https://ark.cn-beijing.volces.com/api/v3'

if (!API_KEY) {
  console.log('❌ 请提供API Key')
  process.exit(1)
}

console.log(`
╔══════════════════════════════════════════╗
║        Xiaomi Code 对话测试              ║
╚══════════════════════════════════════════╝
`)

console.log(`🔑 API Key: ${API_KEY.substring(0, 8)}****${API_KEY.slice(-4)}`)
console.log(`🤖 模型: ${MODEL}\n`)

// 测试非流式对话
async function testChat() {
  console.log('⏳ 测试非流式对话...')
  
  const start = Date.now()
  
  try {
    const res = await fetch(`${BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: '你是Xiaomi Code，为发烧友打造的智能助手' },
          { role: 'user', content: '你好！请用一句话介绍自己' }
        ],
        temperature: 0.7,
        max_tokens: 100
      })
    })
    
    const data = await res.json()
    const duration = Date.now() - start
    
    if (!res.ok) {
      console.log(`❌ 失败: ${data.error?.message || res.status}`)
      return false
    }
    
    const reply = data.choices[0]?.message?.content
    console.log(`✅ 成功! (${duration}ms)`)
    console.log(`📝 回复: ${reply}\n`)
    
    if (data.usage) {
      console.log(`📊 Token: ${data.usage.prompt_tokens} in / ${data.usage.completion_tokens} out\n`)
    }
    
    return true
  } catch (err: any) {
    console.log(`❌ 错误: ${err.message}\n`)
    return false
  }
}

// 测试流式对话
async function testStream() {
  console.log('⏳ 测试流式对话...')
  
  const start = Date.now()
  
  try {
    const res = await fetch(`${BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'user', content: '写一句关于编程的励志名言' }
        ],
        stream: true,
        temperature: 0.7
      })
    })
    
    if (!res.ok) {
      console.log(`❌ 流式请求失败: ${res.status}`)
      return false
    }
    
    const reader = res.body?.getReader()
    if (!reader) return false
    
    let content = ''
    let chunks = 0
    
    process.stdout.write('📝 回复: ')
    
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      
      const text = new TextDecoder().decode(value)
      const lines = text.split('\n')
      
      for (const line of lines) {
        if (line.startsWith('data: ') && line !== 'data: [DONE]') {
          try {
            const data = JSON.parse(line.slice(6))
            const delta = data.choices?.[0]?.delta?.content
            if (delta) {
              content += delta
              chunks++
              process.stdout.write(delta)
            }
          } catch (e) {}
        }
      }
    }
    
    const duration = Date.now() - start
    console.log(`\n\n✅ 流式成功! (${duration}ms, ${chunks} chunks)\n`)
    
    return true
  } catch (err: any) {
    console.log(`\n❌ 错误: ${err.message}\n`)
    return false
  }
}

// 代码生成测试
async function testCodeGen() {
  console.log('⏳ 测试代码生成...')
  
  const start = Date.now()
  
  try {
    const res = await fetch(`${BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'user', content: '用Python写一个快速排序函数，带注释' }
        ],
        temperature: 0.3,
        max_tokens: 500
      })
    })
    
    const data = await res.json()
    const duration = Date.now() - start
    
    if (!res.ok) {
      console.log(`❌ 失败: ${data.error?.message || res.status}`)
      return false
    }
    
    const code = data.choices[0]?.message?.content
    console.log(`✅ 成功! (${duration}ms)`)
    console.log('\n📝 生成的代码:')
    console.log('─'.repeat(50))
    console.log(code)
    console.log('─'.repeat(50) + '\n')
    
    return true
  } catch (err: any) {
    console.log(`❌ 错误: ${err.message}\n`)
    return false
  }
}

// 主函数
async function main() {
  const results = {
    chat: await testChat(),
    stream: await testStream(),
    code: await testCodeGen()
  }
  
  console.log('══════════════════════════════════════════')
  console.log('📋 测试总结')
  console.log('══════════════════════════════════════════')
  console.log(`  基础对话: ${results.chat ? '✅ 通过' : '❌ 失败'}`)
  console.log(`  流式响应: ${results.stream ? '✅ 通过' : '❌ 失败'}`)
  console.log(`  代码生成: ${results.code ? '✅ 通过' : '❌ 失败'}`)
  console.log('══════════════════════════════════════════')
  
  const passed = Object.values(results).filter(r => r).length
  console.log(`\n🎉 ${passed}/3 测试通过!`)
  
  if (passed === 3) {
    console.log('\n✨ API Key 完全可用！')
    console.log('   可以愉快地使用 Xiaomi Code 了 🚀\n')
  }
}

main().catch(console.error)
