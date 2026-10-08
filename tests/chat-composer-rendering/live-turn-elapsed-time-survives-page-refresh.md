# Live elapsed timer survives page refresh

## Prerequisites

- A browser session is signed in to the Codex UI.
- A thread can be kept running long enough to observe the elapsed timer.

## Steps

1. Start a turn and wait until the `已处理 ...` timer is visible.
2. Note the displayed elapsed time, then refresh the page while the turn is still running.
3. Reopen the same thread and wait for its in-progress state to load.
4. Confirm the timer continues from the original turn start rather than starting again near zero.
5. Let the turn complete, refresh once more, and confirm the final duration remains in the conversation.
6. Start another turn in the same thread and confirm it gets a new start time.

## Expected result

- Refreshing does not reset elapsed time for the active turn.
- Completion removes the active timer state while preserving the completed duration in thread history.
- A later turn does not inherit a previous turn's start time.

## Cleanup

- No cleanup is required; active timer state is removed when the turn completes or is confirmed idle.
