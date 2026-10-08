# Per-thread reasoning effort preference

## Scope

Remember a manually selected `model_reasoning_effort` independently for each Codex thread in the browser UI.

## Confirmed behavior

- A manual selection is saved under the current thread ID.
- Returning to a thread restores its saved selection, including after a page refresh.
- A thread without a manual selection uses the current app-server `config/read` value as its fallback.
- A manual thread selection takes precedence over later global config refreshes.
- The new-thread composer uses a separate `__new-thread__` context until a real thread ID exists.
- Invalid or malformed saved values are ignored and fall back to the global config.
- Persistence is browser-local; server-side synchronization across devices is out of scope.

## Data contract

Storage key:

```text
codex-web-local.selected-reasoning-effort-by-context.v1
```

Example:

```json
{
  "thread-id": "high",
  "__new-thread__": "medium"
}
```

## Resolution order

```text
thread-specific saved value
  -> new-thread saved value
  -> app-server config/read reasoning effort
  -> existing frontend default
```

## Non-goals

- Do not change the Codex CLI or app-server protocol.
- Do not persist completed turn parameters separately from thread history.
- Do not synchronize this preference between browsers or devices.
- Do not change model, collaboration mode, queue, steer, or approval behavior.

## Acceptance matrix

| ID | Requirement | Contract test | Acceptance |
|---|---|---|---|
| RE-001 | Manual effort is isolated per thread | `useDesktopState.test.ts` | Thread A and B retain different selections after switching |
| RE-002 | Saved effort survives page recreation | `useDesktopState.test.ts` | A recreated state restores the thread value |
| RE-003 | Saved effort wins over global refresh | `useDesktopState.test.ts` | Later `config/read` changes do not overwrite a manual value |
| RE-004 | New-thread preference is used as fallback | `useDesktopState.test.ts` | A thread without a specific value inherits `__new-thread__` |
| RE-005 | Invalid saved values are safe | `useDesktopState.test.ts` | Invalid values fall back to global config |

## Review status

Design confirmed by the user before implementation on 2026-10-08. Contract tests were run against the pre-fix implementation and failed only for the missing persistence behavior.
