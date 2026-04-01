# 🟠 Xiaomi Code

> 为发烧友打造的智能编程工具

![Version](https://img.shields.io/badge/version-1.0.0-orange)
![License](https://img.shields.io/badge/license-MIT-blue)
![Platform](https://img.shields.io/badge/platform-macOS%20%7C%20Linux%20%7C%20Windows-lightgrey)

Xiaomi Code 是基于开源 cloud-code 重构的智能编程助手，全面支持国产大模型，为开发者提供高效、便捷的AI编程体验。

```
░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
░░░░░░░░░░░░░▒▓██████▓░░░░░░░░░░░░░
░░░░░░░░░░░░▓██████████▒░░░░░░░░░░░
░░░░░░░░░░░███▓▒▒▒▒▓█████░░░░░░░░░░
░░░░░░░░░░▒██░░░░░░▒▓████▒░░░░░░░░░
░░░░░░░░░░▒█▓▒▒▒░░▒▓▓████▒░░░░░░░░░
░░░░░░░░░░░█▒▓▓█▒▒▓▓█████░░░░░░░░░░
░░░░░░░░░░░▒▒░░░░▒▓▒▒▓███░░░░░░░░░░

         雷军 · 为发烧而生
```

## ✨ 特性

- 🔥 **纯国产模型支持** - 火山引擎/DeepSeek/Kimi/智谱/千问等
- 🔑 **多种认证方式** - 支持API Key和OAuth登录
- 🚀 **极速启动** - 无需等待，即开即用
- 🎨 **小米风格UI** - 熟悉的橙色主题设计
- 💻 **完整CLI能力** - 文件编辑、代码搜索、命令执行
- 🌐 **中英双语支持** - 无缝切换中英文界面

## 🚀 快速开始

### 安装

```bash
# 克隆仓库
git clone https://github.com/xiaomi/xiaomi-code.git
cd xiaomi-code

# 安装依赖
bun install

# 构建
bun run build

# 链接到全局
ln -sf $(pwd)/dist/xiaomi-code /usr/local/bin/xiaomi-code
ln -sf $(pwd)/dist/xiaomi-code /usr/local/bin/mi
```

### 初始化配置

```bash
# 运行设置向导
xiaomi-code setup

# 或手动登录
xiaomi-code login
```

### 开始使用

```bash
# 启动交互模式
xiaomi-code

# 或直接发送提示
xiaomi-code "帮我写一个Python爬虫"

# 指定模型
xiaomi-code -m deepseek-v3-241226 "解释这段代码"
```

## 🛠️ 支持的模型

| 提供商 | 模型 | 特点 |
|--------|------|------|
| **火山引擎** | doubao-seed-2.0-code | 代码生成专用，推荐 |
| | deepseek-v3-241226 | 高性能通用模型 |
| | deepseek-r1-250120 | 推理能力强，展示思维链 |
| | kimi-k2-250905 | 200K超长上下文 |
| **DeepSeek** | deepseek-chat | 官方API，高性价比 |
| | deepseek-reasoner | 推理模型 |
| **Kimi** | moonshot-v1-128k | 长文本处理专家 |
| **智谱AI** | glm-4-plus | 最强中文模型 |
| **通义千问** | qwen-max | 阿里旗舰模型 |

## 📖 命令参考

```bash
# 基本命令
xiaomi-code                    # 启动交互模式
xiaomi-code "prompt"           # 直接发送提示
xiaomi-code -m <model>         # 指定模型

# 认证管理
xiaomi-code login              # 登录
xiaomi-code logout             # 注销
xiaomi-code config --list      # 查看配置

# 模型管理
xiaomi-code models             # 列出可用模型
xiaomi-code models -p volcano  # 筛选提供商

# 设置向导
xiaomi-code setup              # 初始化配置
```

## 🔧 环境变量

```bash
# API Keys
export ARK_API_KEY='your-volcano-api-key'
export DEEPSEEK_API_KEY='your-deepseek-api-key'
export MOONSHOT_API_KEY='your-moonshot-api-key'

# 默认模型
export XIAOMI_CODE_MODEL='doubao-seed-2.0-code'

# 调试模式
export XIAOMI_CODE_DEBUG=true
```

## 🏗️ 项目结构

```
xiaomi-code/
├── src/
│   ├── constants/          # 常量和配置
│   │   ├── product.ts      # 产品信息
│   │   └── models.ts       # 模型定义
│   ├── services/           # 核心服务
│   │   ├── api/            # API客户端
│   │   └── auth/           # 认证管理
│   ├── components/         # UI组件
│   │   ├── XiaomiLogo.tsx  # 品牌Logo
│   │   └── XiaomiTheme.tsx # 主题组件
│   ├── cli/                # CLI命令
│   │   ├── commands.ts     # 命令定义
│   │   └── interactive.ts  # 交互模式
│   └── entrypoints/        # 入口文件
│       └── cli.tsx         # CLI入口
├── dist/                   # 构建输出
├── build.ts                # 构建脚本
└── README.md
```

## 🤝 贡献

欢迎提交Issue和PR！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

---

<p align="center">
  <sub>Built with 🔥 by Xiaomi Code Team</sub>
</p>
