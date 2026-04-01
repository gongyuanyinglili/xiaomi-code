/**
 * Xiaomi UI Theme 组件
 * 小米风格主题组件系统
 */

import React from 'react'
import { Box, Text, Spacer } from 'ink'
import { XIAOMI_COLORS } from '../constants/product.js'

// 主题按钮
interface ButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'ghost'
  disabled?: boolean
  onClick?: () => void
}

export const XiaomiButton: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary',
  disabled = false 
}) => {
  const colors = {
    primary: { bg: XIAOMI_COLORS.PRIMARY, fg: XIAOMI_COLORS.TEXT_PRIMARY },
    secondary: { bg: XIAOMI_COLORS.SECONDARY, fg: XIAOMI_COLORS.TEXT_PRIMARY },
    ghost: { bg: undefined, fg: XIAOMI_COLORS.PRIMARY },
  }

  const { bg, fg } = colors[variant]

  return (
    <Box 
      paddingX={2} 
      paddingY={1}
      backgroundColor={disabled ? XIAOMI_COLORS.TEXT_MUTED : bg}
    >
      <Text color={disabled ? XIAOMI_COLORS.TEXT_SECONDARY : fg}>
        {children}
      </Text>
    </Box>
  )
}

// 主题卡片
interface CardProps {
  children: React.ReactNode
  title?: string
  width?: number
}

export const XiaomiCard: React.FC<CardProps> = ({ children, title, width }) => {
  return (
    <Box 
      flexDirection="column" 
      borderStyle="single" 
      borderColor={XIAOMI_COLORS.PRIMARY}
      padding={1}
      width={width}
    >
      {title && (
        <Box marginBottom={1}>
          <Text bold color={XIAOMI_COLORS.PRIMARY}>{title}</Text>
        </Box>
      )}
      {children}
    </Box>
  )
}

// 信息提示
interface AlertProps {
  type: 'info' | 'success' | 'warning' | 'error'
  children: React.ReactNode
}

export const XiaomiAlert: React.FC<AlertProps> = ({ type, children }) => {
  const colors = {
    info: XIAOMI_COLORS.INFO,
    success: XIAOMI_COLORS.SUCCESS,
    warning: XIAOMI_COLORS.WARNING,
    error: XIAOMI_COLORS.ERROR,
  }

  const icons = {
    info: '\u2139',
    success: '\u2713',
    warning: '\u26A0',
    error: '\u2717',
  }

  return (
    <Box>
      <Text color={colors[type]}>{icons[type]} </Text>
      <Text color={colors[type]}>{children}</Text>
    </Box>
  )
}

// 状态徽章
interface BadgeProps {
  status: 'online' | 'offline' | 'busy' | 'idle'
  text?: string
}

export const XiaomiBadge: React.FC<BadgeProps> = ({ status, text }) => {
  const colors = {
    online: XIAOMI_COLORS.SUCCESS,
    offline: XIAOMI_COLORS.ERROR,
    busy: XIAOMI_COLORS.WARNING,
    idle: XIAOMI_COLORS.TEXT_MUTED,
  }

  const defaultTexts = {
    online: '在线',
    offline: '离线',
    busy: '忙碌',
    idle: '空闲',
  }

  return (
    <Box>
      <Text color={colors[status]}>{'\u25CF'}</Text>
      <Text> </Text>
      <Text color={XIAOMI_COLORS.TEXT_SECONDARY}>{text || defaultTexts[status]}</Text>
    </Box>
  )
}

// 模型标签
interface ModelTagProps {
  provider: string
  model: string
}

export const ModelTag: React.FC<ModelTagProps> = ({ provider, model }) => {
  const providerColors: Record<string, string> = {
    volcano: XIAOMI_COLORS.PRIMARY,
    deepseek: XIAOMI_COLORS.INFO,
    kimi: XIAOMI_COLORS.SUCCESS,
    zhipu: XIAOMI_COLORS.WARNING,
    qwen: XIAOMI_COLORS.ERROR,
    baichuan: XIAOMI_COLORS.INFO,
    yi: XIAOMI_COLORS.SUCCESS,
    minimax: XIAOMI_COLORS.WARNING,
  }

  const providerNames: Record<string, string> = {
    volcano: '火山',
    deepseek: 'DeepSeek',
    kimi: 'Kimi',
    zhipu: '智谱',
    qwen: '千问',
    baichuan: '百川',
    yi: '零一',
    minimax: 'MiniMax',
  }

  return (
    <Box>
      <Text color={providerColors[provider] || XIAOMI_COLORS.TEXT_SECONDARY}>
        [{providerNames[provider] || provider}]
      </Text>
      <Text> </Text>
      <Text color={XIAOMI_COLORS.TEXT_PRIMARY}>{model}</Text>
    </Box>
  )
}

// 进度条
interface ProgressBarProps {
  progress: number // 0-100
  width?: number
}

export const XiaomiProgressBar: React.FC<ProgressBarProps> = ({ progress, width = 30 }) => {
  const filled = Math.round((progress / 100) * width)
  const empty = width - filled

  return (
    <Box>
      <Text color={XIAOMI_COLORS.PRIMARY}>{'\u2588'.repeat(filled)}</Text>
      <Text color={XIAOMI_COLORS.TEXT_MUTED}>{'\u2591'.repeat(empty)}</Text>
      <Text> </Text>
      <Text color={XIAOMI_COLORS.TEXT_SECONDARY}>{progress}%</Text>
    </Box>
  )
}

// 代码块
interface CodeBlockProps {
  code: string
  language?: string
}

export const XiaomiCodeBlock: React.FC<CodeBlockProps> = ({ code, language }) => {
  return (
    <Box 
      flexDirection="column" 
      backgroundColor={XIAOMI_COLORS.BG_CARD}
      padding={1}
    >
      {language && (
        <Box marginBottom={1}>
          <Text color={XIAOMI_COLORS.TEXT_MUTED}>{language}</Text>
        </Box>
      )}
      <Text color={XIAOMI_COLORS.TEXT_PRIMARY}>{code}</Text>
    </Box>
  )
}

// 菜单项
interface MenuItemProps {
  label: string
  shortcut?: string
  active?: boolean
  onSelect?: () => void
}

export const XiaomiMenuItem: React.FC<MenuItemProps> = ({ 
  label, 
  shortcut, 
  active = false 
}) => {
  return (
    <Box backgroundColor={active ? XIAOMI_COLORS.PRIMARY : undefined}>
      <Text color={active ? XIAOMI_COLORS.TEXT_PRIMARY : XIAOMI_COLORS.TEXT_SECONDARY}>
        {active ? '> ' : '  '}
      </Text>
      <Text color={active ? XIAOMI_COLORS.TEXT_PRIMARY : XIAOMI_COLORS.TEXT_PRIMARY}>
        {label}
      </Text>
      {shortcut && (
        <>
          <Spacer />
          <Text color={active ? XIAOMI_COLORS.TEXT_PRIMARY : XIAOMI_COLORS.TEXT_MUTED}>
            {shortcut}
          </Text>
        </>
      )}
    </Box>
  )
}

export default {
  Button: XiaomiButton,
  Card: XiaomiCard,
  Alert: XiaomiAlert,
  Badge: XiaomiBadge,
  ModelTag,
  ProgressBar: XiaomiProgressBar,
  CodeBlock: XiaomiCodeBlock,
  MenuItem: XiaomiMenuItem,
}
