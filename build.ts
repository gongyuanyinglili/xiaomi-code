/**
 * Xiaomi Code 构建脚本
 * 使用Bun构建可执行文件
 */

import { build } from 'bun'
import { existsSync, mkdirSync, writeFileSync, copyFileSync } from 'fs'
import { join } from 'path'

// 特性开关
const featureFlags = {
  // 核心功能
  DEBUG_MODE: process.env.DEBUG === 'true',
  STRIP_DEBUG: process.env.NODE_ENV === 'production',
  
  // 认证模式
  SUPPORT_API_KEY: true,
  SUPPORT_OAUTH: false,  // 暂不支持OAuth
  
  // 功能开关
  ENABLE_STREAMING: true,
  ENABLE_TOOLS: false,   // 暂不启用工具调用
  ENABLE_VOICE: false,   // 暂不启用语音
}

// 宏定义
const macros = {
  'MACRO.VERSION': JSON.stringify(process.env.npm_package_version || '1.0.0'),
  'MACRO.BUILD_TIME': JSON.stringify(new Date().toISOString()),
  'MACRO.PRODUCT_NAME': JSON.stringify('Xiaomi Code'),
}

async function buildProject() {
  console.log('🟠 开始构建 Xiaomi Code...\n')

  const startTime = Date.now()

  // 确保输出目录存在
  const distDir = join(import.meta.dir, 'dist')
  if (!existsSync(distDir)) {
    mkdirSync(distDir, { recursive: true })
  }

  // 构建主程序
  console.log('📦 构建主程序...')
  const result = await build({
    entrypoints: ['./src/entrypoints/cli.tsx'],
    outdir: './dist',
    target: 'node',
    format: 'esm',
    splitting: false,
    sourcemap: featureFlags.DEBUG_MODE ? 'inline' : 'none',
    minify: featureFlags.STRIP_DEBUG,
    define: {
      ...Object.fromEntries(
        Object.entries(featureFlags).map(([k, v]) => [`FEATURE.${k}`, String(v)])
      ),
      ...macros,
    },
    external: [
      // 外部依赖
    ],
  })

  if (!result.success) {
    console.error('❌ 构建失败:')
    for (const log of result.logs) {
      console.error(log)
    }
    process.exit(1)
  }

  // 重命名为xiaomi-code
  const entryOutput = result.outputs[0]
  console.log(`✓ 主程序: ${entryOutput.path}`)
  console.log(`  大小: ${(entryOutput.size / 1024 / 1024).toFixed(2)} MB`)

  // 创建启动脚本
  console.log('\n📄 创建启动脚本...')
  
  const shellScript = `#!/bin/bash
# Xiaomi Code 启动脚本
# 为发烧而生

set -e

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "\${BASH_SOURCE[0]}")" && pwd)"

# 运行CLI
exec bun "\${SCRIPT_DIR}/dist/cli.js" "$@"
`

  writeFileSync(join(distDir, 'xiaomi-code'), shellScript, { mode: 0o755 })
  console.log('✓ xiaomi-code')

  // 创建Windows批处理脚本
  const batchScript = `@echo off
:: Xiaomi Code 启动脚本
:: 为发烧而生

set SCRIPT_DIR=%~dp0
bun "%SCRIPT_DIR%\\dist\\cli.js" %*
`

  writeFileSync(join(distDir, 'xiaomi-code.bat'), batchScript)
  console.log('✓ xiaomi-code.bat')

  // 统计构建信息
  const endTime = Date.now()
  const duration = ((endTime - startTime) / 1000).toFixed(2)

  console.log(`\n✅ 构建完成! (${duration}s)`)
  console.log('\n使用方式:')
  console.log('  ./dist/xiaomi-code --help')
  console.log('  ./dist/xiaomi-code setup')
}

// 运行构建
buildProject().catch((error) => {
  console.error('❌ 构建失败:', error)
  process.exit(1)
})
