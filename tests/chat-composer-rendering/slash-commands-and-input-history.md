# Slash commands and composer input history

### Feature: Slash commands and composer input history

#### Prerequisites

- Start the isolated development instance with a writable project selected.
- Open an existing thread and keep the production instance on port 5900 running.

#### Steps

1. Type `/` and filter each supported command by entering part of its name.
2. Use ArrowUp/ArrowDown, Enter/Tab, Escape, mouse, and touch to operate the command menu.
3. Verify `/model`, `/reasoning`, `/plan`, `/status`, `/mcp`, and `/review` reach their mapped UI action.
4. Run `/compact` with an app-server that advertises `thread/compact/start`, then repeat with the method unavailable.
5. Submit three distinct text prompts, type an unsent draft, and navigate with ArrowUp/ArrowDown.
6. Repeat history navigation in a multiline draft from the first, middle, and last logical lines.
7. Switch threads, navigate history, refresh the page, and navigate again.
8. Type an unknown command and submit it.

#### Expected Results

- Slash commands appear only at the beginning of the composer and do not trigger for file paths.
- Command-menu keyboard handling takes priority over history navigation and message sending.
- Each supported command performs its real UI or RPC action; unavailable compact reports an English error.
- History is isolated per thread, stores at most 50 submitted text values, and restores the unsent draft after navigating forward.
- Unknown commands are sent as ordinary text.
- The production service on port 5900 keeps the same process and remains responsive.

#### Rollback/Cleanup

- Stop only the `codexapp-fork` Compose project and remove `/opt/codexapp-fork` if the isolated instance is no longer needed.
- Do not stop or edit `codexapp.service`.
