<template>
  <div class="slash-command-menu" role="listbox" aria-label="Slash commands">
    <button
      v-for="(command, index) in commands"
      :key="command.name"
      class="slash-command-row"
      :class="{ 'is-active': index === highlightedIndex }"
      type="button"
      role="option"
      :aria-selected="index === highlightedIndex"
      @mouseenter="$emit('highlight', index)"
      @pointerdown.prevent="$emit('select', command)"
    >
      <span class="slash-command-name">/{{ command.name }}</span>
      <span class="slash-command-description">{{ command.description }}</span>
    </button>
    <div v-if="commands.length === 0" class="slash-command-empty">No matching commands</div>
  </div>
</template>

<script setup lang="ts">
import type { SlashCommandDefinition } from './threadComposerInputUtils'

defineProps<{
  commands: readonly SlashCommandDefinition[]
  highlightedIndex: number
}>()

defineEmits<{
  highlight: [index: number]
  select: [command: SlashCommandDefinition]
}>()
</script>

<style scoped>
@reference "tailwindcss";

.slash-command-menu {
  @apply absolute bottom-[calc(100%+8px)] left-0 right-0 z-40 max-h-64 overflow-y-auto rounded-xl border border-zinc-200 bg-white p-1 shadow-lg;
}

.slash-command-row {
  @apply flex w-full items-start gap-3 rounded-lg border-0 bg-transparent px-3 py-2 text-left transition hover:bg-zinc-100;
}

.slash-command-row.is-active {
  @apply bg-zinc-100;
}

.slash-command-name {
  @apply min-w-24 shrink-0 font-mono text-sm font-medium text-zinc-900;
}

.slash-command-description {
  @apply min-w-0 text-xs leading-5 text-zinc-500;
}

.slash-command-empty {
  @apply px-3 py-2 text-xs text-zinc-500;
}
</style>
