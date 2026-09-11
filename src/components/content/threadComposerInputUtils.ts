export type SlashCommandName = 'model' | 'reasoning' | 'plan' | 'status' | 'mcp' | 'review' | 'compact'

export type SlashCommandDefinition = {
  name: SlashCommandName
  description: string
}

export type SlashCommandTrigger = {
  start: number
  end: number
  query: string
}

export type ComposerInputHistoryState = {
  history: string[]
  index: number
  draftSnapshot: string
  currentDraft: string
  direction: 'up' | 'down'
}

export type ComposerInputHistoryResult = {
  index: number
  draftSnapshot: string
  value: string
}

export const COMPOSER_INPUT_HISTORY_LIMIT = 50
const COMPOSER_INPUT_HISTORY_STORAGE_PREFIX = 'codex-web-local.thread-input-history.v1.'

export const SLASH_COMMANDS: readonly SlashCommandDefinition[] = [
  { name: 'model', description: 'Choose the model for the next turn' },
  { name: 'reasoning', description: 'Choose the reasoning effort for the next turn' },
  { name: 'plan', description: 'Toggle plan mode' },
  { name: 'status', description: 'Show the current composer status' },
  { name: 'mcp', description: 'Open MCP servers and skills' },
  { name: 'review', description: 'Open the review panel' },
  { name: 'compact', description: 'Compact the current thread context' },
] as const

/** resolveSlashCommandTrigger 识别光标前是否只有一个以斜杠开头的命令词。 */
export function resolveSlashCommandTrigger(text: string, cursor: number): SlashCommandTrigger | null {
  const safeCursor = Math.max(0, Math.min(cursor, text.length))
  const beforeCursor = text.slice(0, safeCursor)
  const match = beforeCursor.match(/^\s*\/([^\s/]*)$/u)
  if (!match) return null
  const tokenStart = beforeCursor.lastIndexOf('/')
  return {
    start: tokenStart,
    end: safeCursor,
    query: match[1] ?? '',
  }
}

/** filterSlashCommands 按命令名称和说明过滤候选项。 */
export function filterSlashCommands(
  query: string,
  commands: readonly SlashCommandDefinition[] = SLASH_COMMANDS,
): SlashCommandDefinition[] {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return [...commands]
  return commands.filter((command) => (
    command.name.toLowerCase().includes(normalized)
    || command.description.toLowerCase().includes(normalized)
  ))
}

/** moveSlashCommandHighlight 在候选列表中循环移动高亮位置。 */
export function moveSlashCommandHighlight(
  currentIndex: number,
  itemCount: number,
  direction: 'up' | 'down',
): number {
  if (itemCount <= 0) return 0
  const normalized = Math.max(0, Math.min(currentIndex, itemCount - 1))
  return direction === 'down'
    ? (normalized + 1) % itemCount
    : (normalized + itemCount - 1) % itemCount
}

/** appendComposerInputHistory 追加一条成功提交的文字并限制历史长度。 */
export function appendComposerInputHistory(
  history: readonly string[],
  text: string,
  limit = COMPOSER_INPUT_HISTORY_LIMIT,
): string[] {
  const normalized = text.trim()
  if (!normalized) return [...history]
  if (history[history.length - 1] === normalized) return [...history]
  const next = [...history, normalized]
  return next.slice(-Math.max(1, limit))
}

/** navigateComposerInputHistory 在历史与进入历史前的草稿之间移动。 */
export function navigateComposerInputHistory(state: ComposerInputHistoryState): ComposerInputHistoryResult {
  const historyLength = state.history.length
  if (historyLength === 0) {
    return { index: 0, draftSnapshot: state.draftSnapshot, value: state.currentDraft }
  }

  if (state.direction === 'up') {
    const startingAtDraft = state.index >= historyLength
    const nextIndex = Math.max(0, startingAtDraft ? historyLength - 1 : state.index - 1)
    return {
      index: nextIndex,
      draftSnapshot: startingAtDraft ? state.currentDraft : state.draftSnapshot,
      value: state.history[nextIndex] ?? state.currentDraft,
    }
  }

  const nextIndex = Math.min(historyLength, state.index + 1)
  return {
    index: nextIndex,
    draftSnapshot: state.draftSnapshot,
    value: nextIndex === historyLength ? state.draftSnapshot : (state.history[nextIndex] ?? state.currentDraft),
  }
}

/** canNavigateComposerInputHistory 仅允许在多行输入边界且没有选区时拦截方向键。 */
export function canNavigateComposerInputHistory(
  text: string,
  selectionStart: number,
  selectionEnd: number,
  direction: 'up' | 'down',
): boolean {
  if (selectionStart !== selectionEnd) return false
  const cursor = Math.max(0, Math.min(selectionStart, text.length))
  if (direction === 'up') {
    const firstNewline = text.indexOf('\n')
    return firstNewline < 0 || cursor <= firstNewline
  }
  const lastNewline = text.lastIndexOf('\n')
  return lastNewline < 0 || cursor > lastNewline
}

/** getComposerInputHistoryStorageKey 返回线程隔离的浏览器存储键。 */
export function getComposerInputHistoryStorageKey(threadId: string): string {
  return `${COMPOSER_INPUT_HISTORY_STORAGE_PREFIX}${threadId.trim()}`
}

/** parseComposerInputHistory 安全解析历史数据，损坏内容按空历史处理。 */
export function parseComposerInputHistory(raw: string | null): string[] {
  if (!raw) return []
  try {
    const value = JSON.parse(raw) as unknown
    if (!Array.isArray(value)) return []
    return value
      .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
      .map((item) => item.trim())
      .slice(-COMPOSER_INPUT_HISTORY_LIMIT)
  } catch {
    return []
  }
}
