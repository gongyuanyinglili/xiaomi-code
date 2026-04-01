# Xiaomi Code 测试指南

## 🔧 API Key 测试

### 命令行测试

```bash
# 进入项目目录
cd ~/xiaomi-code

# 方式1: 直接传入API Key
bun test/test-api.ts <你的API_KEY> volcano

# 方式2: 设置环境变量后测试
export ARK_API_KEY=<你的API_KEY>
bun test/test-api.ts

# 测试其他提供商
bun test/test-api.ts <API_KEY> deepseek
bun test/test-api.ts <API_KEY> kimi
bun test/test-api.ts <API_KEY> zhipu
bun test/test-api.ts <API_KEY> qwen
```

### 测试内容

测试脚本会验证:
1. ✅ API Key 认证
2. ✅ 模型列表获取
3. ✅ 非流式对话
4. ✅ 流式响应 (如果支持)
5. ✅ Token 用量统计

### 预期输出

```
🔍 测试 火山引擎...
   模型: doubao-seed-2.0-code
   端点: https://ark.cn-beijing.volces.com/api/v3
   步骤1: 验证认证...
   ✓ 认证通过
   步骤2: 测试对话...
   ✓ 对话成功 (1250ms)
   响应: 你好！我是豆包，一个AI助手...
   Token用量: 输入25 / 输出35
```

---

## 🌐 Web 界面测试

### 启动 Web 服务器

```bash
# 方式1: 使用 Python
python3 -m http.server 8080 --directory web

# 方式2: 使用 Node.js
npx serve web -p 8080

# 方式3: 使用 Bun
bunx serve web -p 8080
```

### 访问界面

打开浏览器访问: http://localhost:8080

### 使用步骤

1. **输入 API Key**
   - 在顶部设置面板输入你的 API Key
   - 支持密码隐藏显示

2. **选择提供商**
   - 火山引擎 (推荐)
   - DeepSeek
   - Kimi
   - 智谱AI
   - 通义千问

3. **选择模型**
   - 根据提供商自动加载可用模型
   - 常用: 豆包 Seed 2.0 Code, DeepSeek V3

4. **开始对话**
   - 点击输入框或按 Enter 发送
   - Shift+Enter 换行
   - 支持流式响应显示

### 界面预览

```
┌─────────────────────────────────────────┐
│  [mi] Xiaomi Code                       │
│  为发烧而生                              │
├─────────────────────────────────────────┤
│  ⚙️ API 配置                             │
│  API Key: [************]                │
│  提供商: [火山引擎 ▼]                    │
│  模型:   [豆包 Seed 2.0 Code ▼]          │
├─────────────────────────────────────────┤
│                                         │
│  你                              mi     │
│  ┌──────────┐              ┌──────────┐ │
│  │ 你好     │              │ 你好！...│ │
│  └──────────┘              └──────────┘ │
│                                         │
│  [输入消息...          ] [➤]           │
│  ● 就绪          模型: 豆包 Seed 2.0   │
└─────────────────────────────────────────┘
```

---

## 🐛 故障排除

### API Key 无效

```
✗ 认证失败
```

**解决:**
- 检查 API Key 是否正确
- 确认 Key 未过期
- 验证 Key 是否有额度

### 连接超时

```
✗ 测试失败: timeout
```

**解决:**
- 检查网络连接
- 确认能访问提供商域名
- 尝试使用代理

### 模型不存在

```
✗ 模型未找到: xxx
```

**解决:**
- 检查模型 ID 是否正确
- 确认账户有权限使用该模型

---

## 📊 性能基准

正常情况下的响应时间:

| 提供商 | 首Token延迟 | 完整响应(100token) |
|--------|-------------|-------------------|
| 火山引擎 | 500-1000ms | 1-2s |
| DeepSeek | 800-1500ms | 1.5-3s |
| Kimi | 1000-2000ms | 2-4s |

如果响应时间超过 5s，可能是:
- 网络问题
- 模型负载高
- 参数设置不当
