/**
 * CLI 命令定义
 * Xiaomi Code 命令行接口
 */

import { Command } from 'commander'
import { PRODUCT_NAME, PRODUCT_VERSION } from '../constants/product.js'
import { ALL_MODELS, getProviderByModel, PROVIDER_CONFIGS } from '../constants/models.js'
import { getAuthManager } from '../services/auth/manager.js'
import chalk from 'chalk'
import inquirer from 'inquirer'

const program = new Command()

// 主命令配置
program
  .name('xiaomi-code')
  .description(`${PRODUCT_NAME} - 为发烧友打造的智能编程工具`)
  .version(PRODUCT_VERSION, '-v, --version', '显示版本号')
  .helpOption('-h, --help', '显示帮助信息')
  .option('-m, --model <model>', '指定使用的模型')
  .option('-p, --provider <provider>', '指定模型提供商')
  .option('--api-key <key>', '指定API Key')
  .option('--bare', '裸模式运行（跳过初始化）')
  .option('-d, --debug', '启用调试模式')
  .option('--no-stream', '禁用流式输出')

// 登录命令
program
  .command('login')
  .description('登录到模型提供商')
  .option('-p, --provider <provider>', '指定提供商')
  .action(async (options) => {
    console.log(chalk.hex('#FF6900')('\n  🟠 Xiaomi Code 登录\n'))
    
    const auth = getAuthManager()
    
    let provider = options.provider
    if (!provider) {
      const { selectedProvider } = await inquirer.prompt([{
        type: 'list',
        name: 'selectedProvider',
        message: '选择模型提供商:',
        choices: [
          { name: '火山引擎 (豆包/DeepSeek/Kimi)', value: 'volcano' },
          { name: 'DeepSeek (官方)', value: 'deepseek' },
          { name: 'Moonshot Kimi', value: 'kimi' },
          { name: '智谱AI', value: 'zhipu' },
          { name: '通义千问', value: 'qwen' },
        ]
      }])
      provider = selectedProvider
    }

    const config = PROVIDER_CONFIGS[provider as keyof typeof PROVIDER_CONFIGS]
    
    const { method } = await inquirer.prompt([{
      type: 'list',
      name: 'method',
      message: '选择认证方式:',
      choices: [
        { name: 'API Key', value: 'api_key' },
        ...(config.oauthConfig ? [{ name: 'OAuth', value: 'oauth' }] : []),
      ]
    }])

    if (method === 'api_key') {
      const { apiKey } = await inquirer.prompt([{
        type: 'password',
        name: 'apiKey',
        message: `输入 ${config.displayName} API Key:`,
        mask: '*'
      }])

      try {
        await auth.setApiKey(provider, apiKey)
        console.log(chalk.green('\n  ✓ 登录成功!'))
        console.log(chalk.gray(`  API Key已保存到 ${auth.getConfigDir()}`))
      } catch (error) {
        console.log(chalk.red('\n  ✗ 登录失败'), error)
      }
    }
  })

// 注销命令
program
  .command('logout')
  .description('注销当前账号')
  .option('-p, --provider <provider>', '指定要注销的提供商')
  .action(async (options) => {
    const auth = getAuthManager()
    
    if (options.provider) {
      await auth.clearCredentials(options.provider)
      console.log(chalk.green(`✓ 已注销 ${options.provider}`))
    } else {
      await auth.clearAllCredentials()
      console.log(chalk.green('✓ 已注销所有账号'))
    }
  })

// 配置命令
program
  .command('config')
  .description('管理配置')
  .option('--get <key>', '获取配置项')
  .option('--set <key> <value>', '设置配置项')
  .option('--list', '列出所有配置')
  .action(async (options) => {
    if (options.list) {
      const auth = getAuthManager()
      const providers = await auth.getConfiguredProviders()
      
      console.log(chalk.hex('#FF6900')('\n  🟠 已配置的提供商:\n'))
      for (const provider of providers) {
        const isValid = await auth.validateCredentials(provider)
        console.log(`  ${isValid ? chalk.green('✓') : chalk.red('✗')} ${PROVIDER_CONFIGS[provider].displayName}`)
      }
    }
  })

// 模型列表命令
program
  .command('models')
  .description('列出可用的模型')
  .option('-p, --provider <provider>', '按提供商筛选')
  .action((options) => {
    console.log(chalk.hex('#FF6900')('\n  🟠 可用模型列表\n'))
    
    let models = ALL_MODELS
    if (options.provider) {
      models = models.filter(m => m.provider === options.provider)
    }

    const grouped = models.reduce((acc, model) => {
      if (!acc[model.provider]) acc[model.provider] = []
      acc[model.provider].push(model)
      return acc
    }, {} as Record<string, typeof models>)

    for (const [provider, providerModels] of Object.entries(grouped)) {
      const providerName = PROVIDER_CONFIGS[provider as keyof typeof PROVIDER_CONFIGS]?.displayName || provider
      console.log(chalk.cyan(`\n  ${providerName}:`))
      
      for (const model of providerModels) {
        const isDefault = model.id === 'doubao-seed-2.0-code'
        console.log(`    ${isDefault ? chalk.green('→') : ' '} ${chalk.bold(model.id)}`)
        console.log(`      ${chalk.gray(model.description)}`)
        console.log(`      ${chalk.gray(`上下文: ${model.contextWindow.toLocaleString()} tokens`)}`)
        if (model.tags.length > 0) {
          console.log(`      ${chalk.gray(`标签: ${model.tags.join(', ')}`)}`)
        }
      }
    }
    console.log()
  })

// 交互模式
program
  .command('chat [prompt]')
  .description('启动交互式对话或直接发送提示')
  .option('-f, --file <file>', '读取文件内容作为输入')
  .action(async (prompt, options) => {
    // 这里将启动主交互循环
    const { startInteractiveMode } = await import('./interactive.js')
    await startInteractiveMode(prompt, options)
  })

// 设置命令
program
  .command('setup')
  .description('初始化配置向导')
  .action(async () => {
    console.log(chalk.hex('#FF6900')(`
  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
  ░░░░░░░░░░░░░░▒▓██████▓░░░░░░░░░░░░
  ░░░░░░░░░░░░▓██████████▒░░░░░░░░░░░
  ░░░░░░░░░░░███▓▒▒▒▒▓█████░░░░░░░░░░
  ░░░░░░░░░░▒██░░░░░░▒▓████▒░░░░░░░░░
  ░░░░░░░░░░▒█▓▒▒▒░░▒▓▓████▒░░░░░░░░░
  ░░░░░░░░░░░█▒▓▓█▒▒▓▓█████░░░░░░░░░░
  ░░░░░░░░░░░▒▒░░░░▒▓▒▒▓███░░░░░░░░░░
  
         雷军 · 为发烧而生
    `))

    console.log(chalk.white('  欢迎使用 Xiaomi Code 设置向导\n'))

    const auth = getAuthManager()
    
    const { provider } = await inquirer.prompt([{
      type: 'list',
      name: 'provider',
      message: '选择默认模型提供商:',
      choices: [
        { name: '火山引擎 - 支持豆包/DeepSeek/Kimi', value: 'volcano' },
        { name: 'DeepSeek - 高性价比推理模型', value: 'deepseek' },
        { name: 'Moonshot Kimi - 长文本专家', value: 'kimi' },
        { name: '智谱AI - GLM系列模型', value: 'zhipu' },
        { name: '通义千问 - 阿里大模型', value: 'qwen' },
      ]
    }])

    const config = PROVIDER_CONFIGS[provider]
    
    console.log(chalk.gray(`\n  请从 ${config.consoleUrl} 获取 API Key\n`))

    const { apiKey } = await inquirer.prompt([{
      type: 'password',
      name: 'apiKey',
      message: '输入 API Key:',
      mask: '*'
    }])

    // 验证API Key
    const spinner = await import('ora').then(m => m.default)('正在验证...')
    spinner.start()

    try {
      await auth.setApiKey(provider, apiKey)
      const isValid = await auth.validateCredentials(provider)
      
      if (isValid) {
        spinner.succeed('验证成功!')
        console.log(chalk.green('\n  ✓ 设置完成! 你现在可以使用 xiaomi-code 了'))
        console.log(chalk.gray(`  配置已保存到: ${auth.getConfigDir()}`))
      } else {
        spinner.fail('验证失败')
        console.log(chalk.red('\n  ✗ API Key 验证失败，请检查后重试'))
      }
    } catch (error) {
      spinner.fail('验证失败')
      console.log(chalk.red(`\n  ✗ 错误: ${error}`))
    }
  })

export default program
