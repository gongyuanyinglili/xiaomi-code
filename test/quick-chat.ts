#!/usr/bin/env bun
/**
 * 快速对话测试 - 使用豆包Seed 2.0
 */

const API_KEY = process.argv[2] || process.env.ARK_API_KEY || ''
const MODEL = process.argv[3] || 'doubao-seed-2-0-pro-260215'
const BASE_URL = 'https://ark.cn-beijing.volces.com/api/v3'

// 可用模型列表
const MODELS: Record<string, string> = {
  'seed2-pro': 'doubao-seed-2-0-pro-260215',
  'seed2-code': 'doubao-seed-2-0-code-preview-260215',
  'seed2-lite': 'doubao-seed-2-0-lite-260215',
  'seed2-mini': 'doubao-seed-2-0-mini-260215',
  '1.5-pro': 'doubao-1-5-pro-32k-250115',
  '1.5-lite': 'doubao-1-5-lite-32k-250115',
  'seed1.6': 'doubao-seed-1-6-250615'
}

const modelId = MODELS[MODEL] || MODEL

console.log(`
╔══════════════════════════════════════════╗
║     🌟 豆包Seed 2.0 快速测试             ║
╚══════════════════════════════════════════╝
`)

console.log(`🤖 模型: ${modelId}`)
console.log('⏳ 发送请求...\n')

async function chat() {
  const start = Date.now()
  
  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`
    },
    body: JSON.stringify({
      model: modelId,
      messages: [
        { role: 'system', content: '你是豆包Seed 2.0，为发烧友打造的智能助手' },
        { role: 'user', content: '请用一句话介绍豆包Seed 2.0的特点' }
      ],
      temperature: 0.7,
      max_tokens: 200
    })
  })
  
  const data = await res.json()
  const duration = Date.now() - start
  
  if (!res.ok) {
    console.log(`❌ 错误: ${data.error?.message || res.status}`)
    process.exit(1)
  }
  
  const reply = data.choices[0]?.message?.content
  console.log(`✅ 响应成功 (${duration}ms)`)
  console.log(`\n📝 回复:`)
  console.log('─'.repeat(50))
  console.log(reply)
  console.log('─'.repeat(50))
  
  if (data.usage) {
    console.log(`\n📊 Token: ${data.usage.prompt_tokens} in / ${data.usage.completion_tokens} out`)
  }
  
  console.log('\n✨ 豆包Seed 2.0 运行正常！\n')
}

chat().catch(console.error)
