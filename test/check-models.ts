#!/usr/bin/env bun
/**
 * 检查可用的模型列表
 */

const API_KEY = process.argv[2]
const BASE_URL = 'https://ark.cn-beijing.volces.com/api/v3'

if (!API_KEY) {
  console.log('❌ 请提供API Key')
  process.exit(1)
}

console.log('🔍 正在查询可用模型...\n')

fetch(`${BASE_URL}/models`, {
  headers: { 'Authorization': `Bearer ${API_KEY}` }
})
.then(res => res.json())
.then(data => {
  console.log('✅ 可用模型列表:')
  console.log('═'.repeat(50))
  
  if (data.data && data.data.length > 0) {
    data.data.forEach((m: any, i: number) => {
      console.log(`${i + 1}. ${m.id}`)
      console.log(`   所有者: ${m.owned_by}`)
      console.log('')
    })
  } else {
    console.log('暂无可用模型，请前往火山引擎控制台开通模型权限')
    console.log('https://console.volcengine.com/ark/')
  }
})
.catch(err => {
  console.log('❌ 查询失败:', err.message)
})
