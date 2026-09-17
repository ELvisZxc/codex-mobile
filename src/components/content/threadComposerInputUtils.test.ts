import { describe, expect, it } from 'vitest'
import {
  SLASH_COMMANDS,
  appendComposerInputHistory,
  canNavigateComposerInputHistory,
  filterSlashCommands,
  getComposerInputHistoryStorageKey,
  moveSlashCommandHighlight,
  navigateComposerInputHistory,
  parseComposerInputHistory,
  resolveSlashCommandTrigger,
  shouldNavigateComposerInputHistory,
} from './threadComposerInputUtils'

describe('composer slash commands', () => {
  it('exposes the supported command registry', () => {
    expect(SLASH_COMMANDS.map((command) => command.name)).toEqual([
      'model',
      'reasoning',
      'plan',
      'status',
      'mcp',
      'review',
      'compact',
    ])
  })

  it('recognizes a slash command only at the beginning of the draft', () => {
    expect(resolveSlashCommandTrigger('/', 1)).toEqual({ start: 0, end: 1, query: '' })
    expect(resolveSlashCommandTrigger('  /mo', 5)).toEqual({ start: 2, end: 5, query: 'mo' })
    expect(resolveSlashCommandTrigger('open /mo', 8)).toBeNull()
    expect(resolveSlashCommandTrigger('src/app', 7)).toBeNull()
  })

  it('filters by name or description and cycles the highlighted row', () => {
    expect(filterSlashCommands('reas').map((command) => command.name)).toEqual(['reasoning'])
    expect(filterSlashCommands('context').map((command) => command.name)).toContain('compact')
    expect(moveSlashCommandHighlight(0, 3, 'up')).toBe(2)
    expect(moveSlashCommandHighlight(2, 3, 'down')).toBe(0)
    expect(moveSlashCommandHighlight(0, 0, 'down')).toBe(0)
  })
})

describe('composer input history', () => {
  it('ignores blank entries, removes adjacent duplicates, and enforces the limit', () => {
    expect(appendComposerInputHistory(['one'], '   ')).toEqual(['one'])
    expect(appendComposerInputHistory(['one'], ' one ')).toEqual(['one'])
    expect(appendComposerInputHistory(['one'], 'two')).toEqual(['one', 'two'])
    expect(appendComposerInputHistory(['one', 'two'], 'three', 2)).toEqual(['two', 'three'])
  })

  it('moves backward and forward while restoring the draft snapshot', () => {
    const first = navigateComposerInputHistory({
      history: ['one', 'two'],
      index: 2,
      draftSnapshot: '',
      currentDraft: 'unfinished',
      direction: 'up',
    })
    expect(first).toEqual({ index: 1, draftSnapshot: 'unfinished', value: 'two' })

    const oldest = navigateComposerInputHistory({
      history: ['one', 'two'],
      index: first.index,
      draftSnapshot: first.draftSnapshot,
      currentDraft: first.value,
      direction: 'up',
    })
    expect(oldest.value).toBe('one')

    const newest = navigateComposerInputHistory({
      history: ['one', 'two'],
      index: oldest.index,
      draftSnapshot: oldest.draftSnapshot,
      currentDraft: oldest.value,
      direction: 'down',
    })
    const restored = navigateComposerInputHistory({
      history: ['one', 'two'],
      index: newest.index,
      draftSnapshot: newest.draftSnapshot,
      currentDraft: newest.value,
      direction: 'down',
    })
    expect(restored).toEqual({ index: 2, draftSnapshot: 'unfinished', value: 'unfinished' })
  })

  it('only opens history from an empty draft, browsing state, or explicit Alt+ArrowUp', () => {
    expect(shouldNavigateComposerInputHistory({
      text: '',
      selectionStart: 0,
      selectionEnd: 0,
      direction: 'up',
      isBrowsing: false,
      altKey: false,
      isDraftEmpty: true,
    })).toBe(true)
    expect(shouldNavigateComposerInputHistory({
      text: 'unfinished',
      selectionStart: 9,
      selectionEnd: 9,
      direction: 'up',
      isBrowsing: false,
      altKey: false,
      isDraftEmpty: false,
    })).toBe(false)
    expect(shouldNavigateComposerInputHistory({
      text: 'unfinished',
      selectionStart: 9,
      selectionEnd: 9,
      direction: 'up',
      isBrowsing: false,
      altKey: true,
      isDraftEmpty: false,
    })).toBe(true)
    expect(shouldNavigateComposerInputHistory({
      text: 'history',
      selectionStart: 7,
      selectionEnd: 7,
      direction: 'down',
      isBrowsing: true,
      altKey: false,
      isDraftEmpty: false,
    })).toBe(true)
    expect(shouldNavigateComposerInputHistory({
      text: '',
      selectionStart: 0,
      selectionEnd: 0,
      direction: 'down',
      isBrowsing: false,
      altKey: false,
      isDraftEmpty: true,
    })).toBe(false)
  })

  it('only intercepts arrows at logical multiline boundaries without selections or modifiers', () => {
    expect(canNavigateComposerInputHistory('first\nsecond', 2, 2, 'up')).toBe(true)
    expect(canNavigateComposerInputHistory('first\nsecond', 8, 8, 'up')).toBe(false)
    expect(canNavigateComposerInputHistory('first\nsecond', 8, 8, 'down')).toBe(true)
    expect(canNavigateComposerInputHistory('first\nsecond', 2, 3, 'up')).toBe(false)
  })

  it('uses per-thread storage keys and rejects malformed persisted data', () => {
    expect(getComposerInputHistoryStorageKey(' thread-1 ')).toBe('codex-web-local.thread-input-history.v1.thread-1')
    expect(parseComposerInputHistory('["one","two"]')).toEqual(['one', 'two'])
    expect(parseComposerInputHistory('["one",3,null,"two"]')).toEqual(['one', 'two'])
    expect(parseComposerInputHistory('{"value":"wrong"}')).toEqual([])
    expect(parseComposerInputHistory('not-json')).toEqual([])
  })
})
