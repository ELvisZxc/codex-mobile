# Persistent turn duration history

## Scope

5910 must show how long every completed Codex turn took, including after refresh, reconnect, thread navigation, and later questions.

## Confirmed design

- Use the authoritative `durationMs` stored on each turn returned by `thread/read`.
- If `durationMs` is absent, derive it from numeric `startedAt` and `completedAt` values.
- Normalize each completed turn into one `worked` system message associated with that turn.
- Keep the realtime completion summary for immediate feedback, but replace only the summary for the same turn.
- Do not persist synthetic duration messages separately and do not change app-server data.

## Acceptance matrix

| ID | Requirement | Contract test | Acceptance |
|---|---|---|---|
| TD-001 | Refresh restores the duration from turn history | `normalizers/v2.test.ts` duration case | A completed turn with `durationMs: 27869` renders `已处理 28秒` |
| TD-002 | Older app-server payloads remain supported | `normalizers/v2.test.ts` timestamp fallback case | Numeric start/end timestamps produce the duration |
| TD-003 | Realtime completion preserves older summaries | `useDesktopState.test.ts` multi-turn case | Adding the newest duration does not remove previous turn durations |

## Non-goals

- Do not modify 5900.
- Do not change the app-server protocol.
- Do not add duration rows for active turns.
- Do not estimate a duration when neither duration nor valid timestamps exist.

## Review status

Design confirmed from the user report and live 5910 payloads on 2026-09-22. Contract tests are frozen before production implementation.
