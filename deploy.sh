#!/bin/bash
# Xiaomi Code 快速部署脚本
# 将项目部署到 ~/xiaomi-code 目录

set -e

# 颜色
ORANGE='\033[38;5;208m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${ORANGE}"
cat << 'EOF'
░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
░░░░░░░░░░░░░▒▓██████▓░░░░░░░░░░░░░
░░░░░░░░░░░░▓██████████▒░░░░░░░░░░░
░░░░░░░░░░░███▓▒▒▒▒▓█████░░░░░░░░░░
░░░░░░░░░░▒██░░░░░░▒▓████▒░░░░░░░░░
░░░░░░░░░░▒█▓▒▒▒░░▒▓▓████▒░░░░░░░░░
░░░░░░░░░░░█▒▓▓█▒▒▓▓█████░░░░░░░░░░
EOF
echo -e "${NC}"
echo -e "${ORANGE}         Xiaomi Code 部署工具${NC}"
echo ""

# 配置
SOURCE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TARGET_DIR="$HOME/xiaomi-code"

echo "📂 源目录: $SOURCE_DIR"
echo "🎯 目标目录: $TARGET_DIR"
echo ""

# 创建目标目录
echo "📁 创建目标目录..."
mkdir -p "$TARGET_DIR"

# 复制文件
echo "📋 复制项目文件..."
rsync -av --exclude='node_modules' --exclude='dist' --exclude='.git' "$SOURCE_DIR/" "$TARGET_DIR/"

# 进入目标目录
cd "$TARGET_DIR"

# 检查并安装依赖
echo ""
echo "📦 检查依赖..."
if ! command -v bun &> /dev/null; then
    echo "  安装 Bun..."
    curl -fsSL https://bun.sh/install | bash
    export PATH="$HOME/.bun/bin:$PATH"
fi
echo "  ✓ Bun: $(bun --version)"

# 安装项目依赖
echo ""
echo "📦 安装项目依赖..."
if [ ! -d "node_modules" ]; then
    bun install
else
    echo "  依赖已存在，跳过安装"
fi

# 创建启动器
echo ""
echo "🚀 创建启动器..."

# 创建全局可用的 mi 命令
BIN_DIR="$HOME/.local/bin"
mkdir -p "$BIN_DIR"

cat > "$BIN_DIR/mi" << 'EOF'
#!/bin/bash
# Xiaomi Code 启动器
XIAOMI_CODE_HOME="$HOME/xiaomi-code"
BUN_BIN="$HOME/.bun/bin/bun"

# 检查构建
if [ ! -f "$XIAOMI_CODE_HOME/dist/entrypoints/cli.js" ]; then
    echo "🟠 Xiaomi Code 未构建，正在构建..."
    cd "$XIAOMI_CODE_HOME"
    bun run build
fi

# 启动
exec "$BUN_BIN" "$XIAOMI_CODE_HOME/dist/entrypoints/cli.js" "$@"
EOF

chmod +x "$BIN_DIR/mi"

# 创建软链接
ln -sf "$BIN_DIR/mi" "$BIN_DIR/xiaomi-code"
ln -sf "$BIN_DIR/mi" "$BIN_DIR/mi-code"

echo "  ✓ mi 命令已创建"
echo "  ✓ xiaomi-code 命令已创建"
echo "  ✓ mi-code 命令已创建"

# 添加到 PATH
echo ""
echo "🔧 配置环境变量..."

SHELL_RC=""
if [ -f "$HOME/.zshrc" ]; then
    SHELL_RC="$HOME/.zshrc"
elif [ -f "$HOME/.bashrc" ]; then
    SHELL_RC="$HOME/.bashrc"
fi

if [ -n "$SHELL_RC" ] && ! grep -q "$HOME/.local/bin" "$SHELL_RC"; then
    echo "" >> "$SHELL_RC"
    echo "# Xiaomi Code" >> "$SHELL_RC"
    echo 'export PATH="$HOME/.local/bin:$PATH"' >> "$SHELL_RC"
    echo "  ✓ 已添加到 $SHELL_RC"
fi

# 构建项目
echo ""
echo "🔨 构建项目..."
bun run build

echo ""
echo -e "${GREEN}✅ 部署完成！${NC}"
echo ""
echo "使用方法:"
echo "  mi setup        运行设置向导"
echo "  mi --help       显示帮助"
echo "  mi              启动交互模式"
echo ""
echo "配置文件位置: $TARGET_DIR"
echo ""
echo "提示: 请运行 'source $SHELL_RC' 或重新打开终端以使用 mi 命令"
echo ""

# 询问是否运行设置
read -p "是否现在运行设置向导? [Y/n] " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]] || [[ -z $REPLY ]]; then
    export PATH="$HOME/.local/bin:$PATH"
    mi setup
fi
