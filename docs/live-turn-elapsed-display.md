# Live turn elapsed display

## Scope

5910 must present question time and Codex processing time in the same visual positions as the desktop conversation view.

## Confirmed design

- Render every user question timestamp above the question, centered in the conversation column.
- Use relative date labels for today and yesterday, followed by the local `HH:mm` time.
- Show `已处理 ...` at the left edge of the assistant response area as soon as a turn starts.
- Update the live elapsed value once per second without rebuilding the message list or forcing the conversation to scroll.
- When the turn completes, stop the timer and render the authoritative persisted turn duration in the same left-aligned position.
- Persist each active thread's start time and turn ID in browser storage so a page refresh continues the same timer; discard it when the turn completes or the thread is idle.
- Reuse app-server turn timestamps and duration fields; do not add protocol fields or dependencies.

## Acceptance matrix

| ID | Requirement | Contract test | Acceptance |
|---|---|---|---|
| LTE-001 | Question time uses the requested relative date format | `turnDuration.test.ts` | A question sent today at 17:24 renders `今天 17:24` |
| LTE-002 | Live processing exposes an authoritative start time | `useDesktopState.test.ts` | `turn/started` exposes `startedAtMs` through `selectedLiveOverlay` |
| LTE-003 | Processing time uses Chinese elapsed text | `turnDuration.test.ts` | 1 minute 2 seconds renders `已处理 1分钟 2秒` |
| LTE-004 | Completed turns keep the final elapsed value | existing duration history tests | Realtime and restored summaries use the same `已处理 ...` format |
| LTE-005 | Refresh does not reset the active timer | `useDesktopState.test.ts` refresh case | Recreated page state restores the same `startedAtMs`, then removes it on completion |

## Non-goals

- Do not modify 5900.
- Do not change app-server or Codex CLI protocols.
- Do not add a global timer or refresh the whole conversation every second.
- Do not change command, reasoning, or approval rendering.

## Review status

Design confirmed from the user-provided screenshot on 2026-09-22. The refresh-persistence regression extends LTE-002 with LTE-005; its test failed before the implementation and now verifies refresh restoration, completion cleanup, and stale-turn isolation.
