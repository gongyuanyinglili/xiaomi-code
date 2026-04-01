#!/bin/bash
# Xiaomi Code 开发模式启动脚本

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR"

echo "🟠 Xiaomi Code 开发模式"
echo ""

# 检查依赖
if [ ! -d "node_modules" ]; then
    echo "📦 安装依赖..."
    bun install
fi

# 启动开发服务器
echo "🚀 启动开发模式..."
echo ""

# 使用bun直接运行源代码
exec bun run src/entrypoints/cli.tsx "$@"
