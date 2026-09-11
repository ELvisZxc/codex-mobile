### User message hover copy and edit icons

#### Feature/Change Name
User message hover actions render copy and edit as compact icon buttons without visible labels.

#### Prerequisites/Setup
1. Dev server running (`pnpm run dev`)
2. An existing thread with at least one completed user/assistant turn

#### Steps
1. Open a thread with completed turns.
2. Hover a user message in light theme.
3. Confirm its toolbar shows the timestamp and icon-only copy and edit buttons.
4. Hover each icon and confirm its tooltip identifies the action.
5. Click the copy icon and confirm the tooltip changes to the copied state.
6. Click the edit icon and confirm the original user text is loaded into the composer.
7. Repeat steps 2-3 in dark theme.

#### Expected Results
- User-message copy and edit actions show icons without `Copy` or `Edit message` text.
- The action names remain available through tooltips and accessible labels.
- Copying still places the user question text on the clipboard.
- Editing still loads the original user question into the composer.
- Assistant response actions keep their existing labels and behavior.

#### Rollback/Cleanup
- Re-send the edited message if the rollback path needs to be recreated.
