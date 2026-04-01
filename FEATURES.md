# Xiaomi Code 功能说明

## 🎯 核心特性

### 1. 完全隔离的Claude配置

Xiaomi Code 完全移除了原 cloud-code 中的所有 Anthropic/Claude 依赖：

| 原组件 | 新实现 | 说明 |
|--------|--------|------|
| Anthropic SDK | 统一API客户端 | 支持所有OpenAI兼容API |
| Claude OAuth | API Key + OAuth | 支持国产模型认证方式 |
| Claude AI API | 火山引擎/DeepSeek等 | 国内直连，无需代理 |
| claude.com | 本地配置 | 完全离线配置管理 |

### 2. 小米品牌元素

- **Logo**: 小米橙色ASCII艺术Logo
- **配色**: 小米橙(#FF6900)为主色调
- **标语**: "为发烧而生" / "Born for Innovation"
- **UI组件**: 小米风格的按钮、卡片、徽章

### 3. 国产模型支持

#### 支持的提供商

| 提供商 | 环境变量 | 官网 |
|--------|----------|------|
| 火山引擎 | `ARK_API_KEY` | https://console.volcengine.com |
| DeepSeek | `DEEPSEEK_API_KEY` | https://platform.deepseek.com |
| Kimi | `MOONSHOT_API_KEY` | https://platform.moonshot.cn |
| 智谱AI | `ZHIPU_API_KEY` | https://open.bigmodel.cn |
| 通义千问 | `DASHSCOPE_API_KEY` | https://dashscope.console.aliyun.com |
| 百川智能 | `BAICHUAN_API_KEY` | https://platform.baichuan-ai.com |
| 零一万物 | `YI_API_KEY` | https://platform.lingyiwanwu.com |
| MiniMax | `MINIMAX_API_KEY` | https://platform.minimaxi.com |

#### 支持的模型

**火山引擎 (推荐)**
- `doubao-seed-2.0-code` - 代码生成专用
- `doubao-1.5-pro-32k/256k` - 通用对话
- `deepseek-v3-241226` - 高性能通用
- `deepseek-r1-250120` - 推理模型
- `kimi-k2-250905` - 200K长文本

**DeepSeek 官方**
- `deepseek-chat` - 高性价比
- `deepseek-reasoner` - 推理模型
- `deepseek-coder` - 代码专用

**Kimi 官方**
- `moonshot-v1-8k/32k/128k` - 多档上下文

### 4. CLI 完整能力

```bash
# 基础命令
xiaomi-code                    # 启动交互模式
xiaomi-code "prompt"           # 直接执行
xiaomi-code -m <model>         # 指定模型
xiaomi-code -p <provider>      # 指定提供商

# 认证管理
xiaomi-code login              # 交互式登录
xiaomi-code logout             # 注销
xiaomi-code config --list      # 查看配置

# 模型管理
xiaomi-code models             # 列出模型
xiaomi-code models -p volcano  # 筛选
xiaomi-code setup              # 设置向导

# 快捷方式
mi                             # 同 xiaomi-code
mi-code                        # 同 xiaomi-code
```

### 5. 交互式界面

基于 Ink (React for CLI) 构建的终端UI：

- 实时流式响应显示
- 小米橙色主题
- 模型标签显示
- 打字机效果光标
- 键盘快捷键支持

### 6. 配置管理

```
~/.xiaomi-code/
├── credentials.json    # 加密的API密钥
├── settings.json       # 用户设置
└── history/            # 会话历史
```

## 🔧 技术架构

### 项目结构

```
xiaomi-code/
├── src/
│   ├── constants/      # 常量和配置
│   │   ├── product.ts  # 产品信息、颜色、Logo
│   │   └── models.ts   # 模型定义、提供商配置
│   ├── services/       # 核心服务
│   │   ├── api/        # API客户端
│   │   │   └── client.ts
│   │   └── auth/       # 认证管理
│   │       └── manager.ts
│   ├── components/     # UI组件
│   │   ├── XiaomiLogo.tsx
│   │   └── XiaomiTheme.tsx
│   ├── cli/            # CLI命令
│   │   ├── commands.ts
│   │   └── interactive.ts
│   ├── utils/          # 工具函数
│   │   └── helpers.ts
│   └── entrypoints/    # 入口文件
│       └── cli.tsx
├── scripts/            # 脚本
│   ├── install.sh      # 安装脚本
│   └── dev.sh          # 开发启动
├── build.ts            # 构建配置
├── deploy.sh           # 部署脚本
└── README.md
```

### 核心技术栈

- **运行时**: Bun (Node.js兼容)
- **语言**: TypeScript
- **UI框架**: Ink (React for Terminal)
- **HTTP客户端**: Axios
- **CLI框架**: Commander.js

## 🚀 快速部署

### 方式一：使用 deploy.sh (推荐)

```bash
# 在项目目录执行
./deploy.sh
```

这将：
1. 复制项目到 ~/xiaomi-code
2. 安装依赖
3. 构建项目
4. 创建 mi 命令
5. 运行设置向导

### 方式二：手动部署

```bash
# 1. 复制项目
cp -r xiaomi-code ~/xiaomi-code
cd ~/xiaomi-code

# 2. 安装依赖
bun install

# 3. 构建
bun run build

# 4. 创建软链接
ln -s $(pwd)/dist/xiaomi-code /usr/local/bin/mi

# 5. 运行
mi setup
```

## 📝 使用示例

### 基础对话

```bash
# 启动交互模式
$ mi
🟠 Xiaomi Code v1.0.0

> 你好
你好！我是 Xiaomi Code，很高兴为你服务。

> 帮我写一个快速排序
[生成代码...]
```

### 代码分析

```bash
# 分析文件
$ mi "分析这个文件的复杂度" -f src/main.ts

# 批量处理
$ mi "给这些代码加上注释" -f *.js
```

### 多模型对比

```bash
# 使用不同模型
$ mi -m deepseek-v3 "解释闭包"
$ mi -m kimi-k2 "解释闭包"
```

## 🔒 安全特性

- API Key 本地加密存储
- 环境变量支持
- 无云端数据上传
- 会话隔离

## 🎨 自定义主题

通过环境变量自定义：

```bash
export XIAOMI_CODE_PRIMARY_COLOR="#FF6900"
export XIAOMI_CODE_THEME="dark"
export XIAOMI_CODE_NO_LOGO=1
```

## 📊 性能指标

- 启动时间: < 500ms
- 首Token延迟: < 1s (国内模型)
- 内存占用: ~50MB
- 构建大小: ~5MB

## 🔮 路线图

- [ ] 工具调用 (Function Calling)
- [ ] 插件系统
- [ ] 多会话管理
- [ ] Web界面
- [ ] 移动端支持
- [ ] 团队协作功能
