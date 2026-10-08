# Per-thread reasoning effort

## Prerequisites

- The Codex UI is signed in and has at least two existing threads.
- The model selector exposes more than one reasoning effort.

## Steps

1. Open thread A and select a non-default reasoning effort such as `high`.
2. Leave thread A, open thread B, and select a different effort such as `low`.
3. Return to thread A and confirm it still shows `high`.
4. Return to thread B and confirm it still shows `low`.
5. Refresh the page while thread A is selected and confirm it still shows `high`.
6. Change the global Codex reasoning configuration, refresh model metadata, and confirm the manually saved value remains selected in thread A.
7. Open a thread without a saved value and confirm it uses the current global configuration value.

## Expected result

- Reasoning effort is remembered independently for each thread.
- A saved thread value is not overwritten by page refresh or global configuration refresh.
- Threads without a saved value use the global configuration fallback.

## Cleanup

- Restore the desired reasoning effort for the test threads if needed.
