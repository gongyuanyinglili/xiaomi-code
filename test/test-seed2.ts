#!/usr/bin/env bun
/**
 * 测试豆包Seed 2.0系列模型
 */

const API_KEY = process.argv[2]
const BASE_URL = 'https://ark.cn-beijing.volces.com/api/v3'

if (!API_KEY) {
  console.log('❌ 请提供API Key')
  process.exit(1)
}

// 豆包Seed 2.0系列模型
const SEED2_MODELS = [
  { id: 'doubao-seed-2-0-lite-260215', name: '豆包Seed 2.0 Lite' },
  { id: 'doubao-seed-2-0-mini-260215', name: '豆包Seed 2.0 Mini' },
  { id: 'doubao-seed-2-0-pro-260215', name: '豆包Seed 2.0 Pro' },
  { id: 'doubao-seed-2-0-code-preview-260215', name: '豆包Seed 2.0 Code (预览)' }
]

console.log(`
╔══════════════════════════════════════════╗
║     豆包Seed 2.0 系列模型测试            ║
╚══════════════════════════════════════════╝
`)

async function testModel(modelId: string, name: string) {
  process.stdout.write(`⏳ 测试 ${name}... `)
  
  try {
    const res = await fetch(`${BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: modelId,
        messages: [{ role: 'user', content: '你好' }],
        max_tokens: 10
      })
    })
    
    if (res.ok) {
      console.log('✅ 可用')
      return { id: modelId, name, available: true }
    } else {
      const data = await res.json().catch(() => ({}))
      const error = data.error?.code || data.error?.message || `HTTP ${res.status}`
      console.log(`❌ ${error}`)
      return { id: modelId, name, available: false, error }
    }
  } catch (err: any) {
    console.log(`❌ ${err.message}`)
    return { id: modelId, name, available: false, error: err.message }
  }
}

async function main() {
  const results = []
  
  for (const model of SEED2_MODELS) {
    const result = await testModel(model.id, model.name)
    results.push(result)
    await new Promise(r => setTimeout(r, 200)) // 避免限流
  }
  
  console.log('\n══════════════════════════════════════════')
  console.log('📋 豆包Seed 2.0 测试结果')
  console.log('══════════════════════════════════════════')
  
  const available = results.filter(r => r.available)
  
  if (available.length === 0) {
    console.log('\n⚠️  暂无可用的Seed 2.0模型')
    console.log('\n可能原因：')
    console.log('  • 需要在控制台开通模型权限')
    console.log('  • 需要创建专门的推理Endpoint')
    console.log('  • 账户余额不足或配额限制')
    console.log('\n建议操作：')
    console.log('  1. 访问 https://console.volcengine.com/ark/')
    console.log('  2. 进入"在线推理"创建Endpoint')
    console.log('  3. 选择Seed 2.0系列模型并开通')
  } else {
    console.log('\n✅ 可用的Seed 2.0模型：')
    available.forEach(m => {
      console.log(`   • ${m.name}`)
      console.log(`     Endpoint: ${m.id}`)
    })
  }
  
  console.log('\n══════════════════════════════════════════')
  console.log('💡 您当前可用的其他模型：')
  console.log('   • 豆包1.5 Pro 32K (doubao-1-5-pro-32k-250115)')
  console.log('   • 豆包1.5 Lite 32K (doubao-1-5-lite-32k-250115)')
  console.log('   • 豆包Seed 1.6 (doubao-seed-1-6-250615)')
  console.log('══════════════════════════════════════════\n')
}

main().catch(console.error)
