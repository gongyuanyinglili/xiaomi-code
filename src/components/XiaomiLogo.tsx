/**
 * Xiaomi Logo 组件
 * 小米品牌标识和ASCII艺术
 */

import React from 'react'
import { Box, Text } from 'ink'
import { XIAOMI_COLORS, XIAOMI_LOGO_ASCII, XIAOMI_TAGLINES } from '../constants/product.js'

interface LogoProps {
  showTagline?: boolean
  compact?: boolean
  animated?: boolean
}

// 完整Logo
export const XiaomiLogo: React.FC<LogoProps> = ({ 
  showTagline = true, 
  compact = false,
  animated = false 
}) => {
  if (compact) {
    return <CompactLogo />
  }

  const tagline = XIAOMI_TAGLINES[Math.floor(Math.random() * XIAOMI_TAGLINES.length)]

  return (
    <Box flexDirection="column" alignItems="center" padding={1}>
      <Text color={XIAOMI_COLORS.PRIMARY}>
        {XIAOMI_LOGO_ASCII}
      </Text>
      {showTagline && (
        <Box marginTop={1}>
          <Text color={XIAOMI_COLORS.TEXT_SECONDARY} dimColor>
            {tagline}
          </Text>
        </Box>
      )}
    </Box>
  )
}

// 紧凑Logo
export const CompactLogo: React.FC = () => {
  return (
    <Box>
      <Text bold color={XIAOMI_COLORS.PRIMARY}>
        {'\u25A0'} 
      </Text>
      <Text bold> </Text>
      <Text bold color={XIAOMI_COLORS.PRIMARY}>
        Xiaomi Code
      </Text>
    </Box>
  )
}

// 迷你Logo (单行)
export const MiniLogo: React.FC<{ showVersion?: boolean }> = ({ showVersion = false }) => {
  return (
    <Box>
      <Text color={XIAOMI_COLORS.PRIMARY}>{'\u25A0'}</Text>
      <Text> </Text>
      <Text bold>Xiaomi Code</Text>
      {showVersion && (
        <Text color={XIAOMI_COLORS.TEXT_MUTED}> v1.0.0</Text>
      )}
    </Box>
  )
}

// 加载动画
export const LoadingLogo: React.FC<{ text?: string }> = ({ text = '加载中...' }) => {
  return (
    <Box flexDirection="column" alignItems="center">
      <Text color={XIAOMI_COLORS.PRIMARY}>
        {XIAOMI_LOGO_ASCII}
      </Text>
      <Box marginTop={1}>
        <Text color={XIAOMI_COLORS.PRIMARY}>{text}</Text>
      </Box>
    </Box>
  )
}

// 品牌分隔线
export const BrandSeparator: React.FC<{ width?: number }> = ({ width = 50 }) => {
  const line = '─'.repeat(width)
  return (
    <Box>
      <Text color={XIAOMI_COLORS.PRIMARY}>{line.slice(0, width / 2)}</Text>
      <Text color={XIAOMI_COLORS.TEXT_SECONDARY}>{'\u25A0'}</Text>
      <Text color={XIAOMI_COLORS.PRIMARY}>{line.slice(width / 2 + 1)}</Text>
    </Box>
  )
}

export default XiaomiLogo
