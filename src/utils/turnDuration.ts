export const WORKED_MESSAGE_TYPE = 'worked'

// formatTurnDuration 将毫秒时长格式化为紧凑的英文时间文本。
export function formatTurnDuration(durationMs: number): string {
  if (!Number.isFinite(durationMs) || durationMs <= 0) {
    return '<1s'
  }

  const totalSeconds = Math.max(1, Math.round(durationMs / 1000))
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  const parts: string[] = []

  if (hours > 0) {
    parts.push(`${hours}h`)
  }

  if (minutes > 0 || hours > 0) {
    parts.push(`${minutes}m`)
  }

  const displaySeconds = seconds > 0 || parts.length === 0 ? seconds : 0
  parts.push(`${displaySeconds}s`)
  return parts.join(' ')
}

// formatProcessedDuration 将实时或最终耗时格式化为对话区使用的中文文本。
export function formatProcessedDuration(durationMs: number): string {
  const safeDurationMs = Number.isFinite(durationMs) ? Math.max(0, durationMs) : 0
  const totalSeconds = Math.max(0, Math.round(safeDurationMs / 1000))
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  const parts: string[] = []

  if (hours > 0) {
    parts.push(`${hours}小时`)
  }
  if (minutes > 0 || hours > 0) {
    parts.push(`${minutes}分钟`)
  }
  parts.push(`${seconds}秒`)
  return `已处理 ${parts.join(' ')}`
}

function padTwoDigits(value: number): string {
  return String(value).padStart(2, '0')
}

function localDayOrdinal(date: Date): number {
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000
}

// formatConversationTimestamp 将提问时间格式化为桌面对话使用的相对日期文本。
export function formatConversationTimestamp(timestampMs: number, nowMs = Date.now()): string {
  const timestamp = new Date(timestampMs)
  const now = new Date(nowMs)
  if (Number.isNaN(timestamp.getTime()) || Number.isNaN(now.getTime())) return ''

  const dayDifference = localDayOrdinal(now) - localDayOrdinal(timestamp)
  const timeText = `${padTwoDigits(timestamp.getHours())}:${padTwoDigits(timestamp.getMinutes())}`
  if (dayDifference === 0) return `今天 ${timeText}`
  if (dayDifference === 1) return `昨天 ${timeText}`
  return `${padTwoDigits(timestamp.getMonth() + 1)}月${padTwoDigits(timestamp.getDate())}日 ${timeText}`
}
