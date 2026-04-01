#!/usr/bin/env bun
/**
 * 测试Endpoint配置
 * 火山引擎需要使用Endpoint ID
 */

const API_KEY = process.argv[2]
const BASE_URL = 'https://ark.cn-beijing.volces.com/api/v3'

if (!API_KEY) {
  console.log('❌ 请提供API Key')
  process.exit(1)
}

console.log(`
🔍 火山引擎 Endpoint 测试
══════════════════════════════════════════
`)

// 常见模型对应的Endpoint ID前缀
const TEST_ENDPOINTS = [
  // 豆包系列
  { model: 'doubao-pro-32k', endpoint: 'doubao-pro-32k-240828' },
  { model: 'doubao-lite-32k', endpoint: 'doubao-lite-32k-240828' },
  { model: 'doubao-pro-128k', endpoint: 'doubao-pro-128k-240628' },
  { model: 'doubao-pro-4k', endpoint: 'doubao-pro-4k-240515' },
  
  // DeepSeek
  { model: 'deepseek-v3', endpoint: 'deepseek-v3-241226' },
  { model: 'deepseek-r1', endpoint: 'deepseek-r1-250120' },
  
  // Kimi
  { model: 'kimi-k2', endpoint: 'kimi-k2-250711' },
  
  // 豆包1.5
  { model: 'doubao-1.5-pro-32k', endpoint: 'doubao-1-5-pro-32k-250115' },
  { model: 'doubao-1.5-lite-32k', endpoint: 'doubao-1-5-lite-32k-250115' },
  
  // Seed
  { model: 'doubao-seed-1.6', endpoint: 'doubao-seed-1-6-250615' },
]

async function testEndpoint(endpoint: string) {
  try {
    const res = await fetch(`${BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: endpoint,
        messages: [{ role: 'user', content: '你好' }],
        max_tokens: 10
      })
    })
    
    if (res.ok) {
      return { success: true, status: res.status }
    } else {
      const data = await res.json().catch(() => ({}))
      return { 
        success: false, 
        status: res.status, 
        error: data.error?.code || data.error?.message 
      }
    }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

async function main() {
  console.log('测试可用Endpoint...\n')
  
  const results = []
  
  for (const { model, endpoint } of TEST_ENDPOINTS) {
    process.stdout.write(`⏳ ${model}... `)
    const result = await testEndpoint(endpoint)
    
    if (result.success) {
      console.log(`✅ 可用`)
      results.push({ model, endpoint, available: true })
    } else {
      console.log(`❌ ${result.error || result.status}`)
      results.push({ model, endpoint, available: false, error: result.error })
    }
    
    // 小延迟避免触发限流
    await new Promise(r => setTimeout(r, 100))
  }
  
  console.log('\n══════════════════════════════════════════')
  console.log('📋 可用Endpoint列表:')
  console.log('══════════════════════════════════════════')
  
  const available = results.filter(r => r.available)
  
  if (available.length === 0) {
    console.log('\n⚠️  没有可用的Endpoint')
    console.log('\n可能原因:')
    console.log('  1. API Key 需要在控制台开通模型权限')
    console.log('  2. 需要创建推理Endpoint')
    console.log('  3. 账户余额不足')
    console.log('\n请访问: https://console.volcengine.com/ark/')
  } else {
    available.forEach(r => {
      console.log(`  ✅ ${r.model}`)
      console.log(`     Endpoint: ${r.endpoint}`)
    })
    console.log(`\n共 ${available.length} 个可用Endpoint`)
  }
  
  console.log('══════════════════════════════════════════\n')
}

main().catch(console.error)
