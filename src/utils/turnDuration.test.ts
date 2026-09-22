import { describe, expect, it } from 'vitest'
import { formatConversationTimestamp, formatProcessedDuration } from './turnDuration'

describe('turn duration display', () => {
  it('formats today question timestamps with the local minute', () => {
    const nowMs = new Date(2026, 8, 22, 18, 0, 0).getTime()
    const sentAtMs = new Date(2026, 8, 22, 17, 24, 36).getTime()

    expect(formatConversationTimestamp(sentAtMs, nowMs)).toBe('今天 17:24')
  })

  it('formats yesterday and older question timestamps', () => {
    const nowMs = new Date(2026, 8, 22, 18, 0, 0).getTime()

    expect(formatConversationTimestamp(new Date(2026, 8, 21, 9, 5, 0).getTime(), nowMs)).toBe('昨天 09:05')
    expect(formatConversationTimestamp(new Date(2026, 8, 20, 9, 5, 0).getTime(), nowMs)).toBe('09月20日 09:05')
  })

  it('formats live and completed processing duration in Chinese', () => {
    expect(formatProcessedDuration(0)).toBe('已处理 0秒')
    expect(formatProcessedDuration(62_000)).toBe('已处理 1分钟 2秒')
    expect(formatProcessedDuration(3_723_000)).toBe('已处理 1小时 2分钟 3秒')
  })
})
