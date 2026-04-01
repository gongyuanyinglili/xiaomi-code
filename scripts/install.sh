#!/bin/bash
# Xiaomi Code 安装脚本
# 为发烧而生

set -e

# 颜色定义
ORANGE='\033[38;5;208m'
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 打印函数
print_logo() {
    echo ""
    echo -e "${ORANGE}░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░${NC}"
    echo -e "${ORANGE}░░░░░░░░░░░░░▒▓██████▓░░░░░░░░░░░░░${NC}"
    echo -e "${ORANGE}░░░░░░░░░░░░▓██████████▒░░░░░░░░░░░${NC}"
    echo -e "${ORANGE}░░░░░░░░░░░███▓▒▒▒▒▓█████░░░░░░░░░░${NC}"
    echo -e "${ORANGE}░░░░░░░░░░▒██░░░░░░▒▓████▒░░░░░░░░░${NC}"
    echo -e "${ORANGE}░░░░░░░░░░▒█▓▒▒▒░░▒▓▓████▒░░░░░░░░░${NC}"
    echo ""
    echo -e "         ${ORANGE}Xiaomi Code${NC}"
    echo -e "         ${ORANGE}为发烧而生${NC}"
    echo ""
}

print_info() {
    echo -e "${ORANGE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[OK]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查依赖
check_dependencies() {
    print_info "检查依赖..."
    
    # 检查 Bun
    if ! command -v bun &> /dev/null; then
        print_error "未找到 Bun，正在安装..."
        curl -fsSL https://bun.sh/install | bash
        export PATH="$HOME/.bun/bin:$PATH"
    fi
    print_success "Bun 已安装: $(bun --version)"
    
    # 检查 Node.js
    if ! command -v node &> /dev/null; then
        print_error "未找到 Node.js，请先安装 Node.js 18+"
        exit 1
    fi
    print_success "Node.js 已安装: $(node --version)"
}

# 安装项目
install_project() {
    print_info "安装 Xiaomi Code..."
    
    PROJECT_DIR="$HOME/.xiaomi-code"
    
    # 克隆或更新仓库
    if [ -d "$PROJECT_DIR" ]; then
        print_info "更新现有安装..."
        cd "$PROJECT_DIR"
        git pull origin main
    else
        print_info "克隆仓库..."
        git clone https://github.com/xiaomi/xiaomi-code.git "$PROJECT_DIR"
        cd "$PROJECT_DIR"
    fi
    
    # 安装依赖
    print_info "安装依赖..."
    bun install
    
    # 构建项目
    print_info "构建项目..."
    bun run build
    
    print_success "项目构建完成"
}

# 创建启动器
create_launcher() {
    print_info "创建启动器..."
    
    INSTALL_DIR="$HOME/.xiaomi-code"
    BIN_DIR="$HOME/.local/bin"
    
    # 创建bin目录
    mkdir -p "$BIN_DIR"
    
    # 创建启动脚本
    cat > "$BIN_DIR/xiaomi-code" << 'EOF'
#!/bin/bash
exec "$HOME/.xiaomi-code/dist/xiaomi-code" "$@"
EOF
    chmod +x "$BIN_DIR/xiaomi-code"
    
    # 创建mi快捷方式
    ln -sf "$BIN_DIR/xiaomi-code" "$BIN_DIR/mi-code"
    ln -sf "$BIN_DIR/xiaomi-code" "$BIN_DIR/mi"
    
    print_success "启动器已创建"
}

# 配置环境
setup_environment() {
    print_info "配置环境..."
    
    # 添加到PATH
    SHELL_CONFIG=""
    if [ -f "$HOME/.zshrc" ]; then
        SHELL_CONFIG="$HOME/.zshrc"
    elif [ -f "$HOME/.bashrc" ]; then
        SHELL_CONFIG="$HOME/.bashrc"
    fi
    
    if [ -n "$SHELL_CONFIG" ]; then
        if ! grep -q "$HOME/.local/bin" "$SHELL_CONFIG"; then
            echo 'export PATH="$HOME/.local/bin:$PATH"' >> "$SHELL_CONFIG"
            print_info "已添加到 $SHELL_CONFIG"
        fi
    fi
    
    print_success "环境配置完成"
}

# 运行设置向导
run_setup() {
    print_info "启动设置向导..."
    
    # 确保PATH包含.local/bin
    export PATH="$HOME/.local/bin:$PATH"
    
    # 运行设置
    xiaomi-code setup || true
}

# 主函数
main() {
    print_logo
    
    print_info "开始安装 Xiaomi Code..."
    
    check_dependencies
    install_project
    create_launcher
    setup_environment
    
    print_logo
    print_success "安装完成！"
    echo ""
    echo "使用方法:"
    echo "  xiaomi-code --help    显示帮助"
    echo "  xiaomi-code setup     运行设置向导"
    echo "  xiaomi-code           启动交互模式"
    echo "  mi                    快捷方式"
    echo ""
    echo "请重新加载终端或运行: source ~/.bashrc (或 ~/.zshrc)"
    echo ""
    
    # 询问是否运行设置
    read -p "是否现在运行设置向导? [Y/n] " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]] || [[ -z $REPLY ]]; then
        run_setup
    fi
}

# 运行主函数
main "$@"
