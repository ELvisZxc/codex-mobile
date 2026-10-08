### First user message is visible immediately in new chats

#### Feature/Change Name
New-thread sends render the submitted user message immediately, even when the backend thread read lags behind the assistant response.

#### Prerequisites/Setup
1. Create a fresh isolated `CODEX_HOME`.
2. Start local Vite: `CODEX_HOME=<temp-home> npm run dev -- --host 127.0.0.1 --port 4173`.
3. Use an explicit test project folder to avoid projectless folder-name collisions from repeated `hi` tests.

#### Steps
1. In light theme, open `http://127.0.0.1:4173/?openProjectPath=<encoded-test-project-path>`.
2. Send `hi` in a new unauthenticated chat and confirm the conversation pane immediately shows the user row `hi`.
3. Copy `/Users/igor/.codex/auth.json` to `<temp-home>/auth.json`.
4. Restart the same Vite server with the same `CODEX_HOME`.
5. Open the same project path, create another new chat, and send `hi`.
6. Confirm the conversation pane immediately shows the user row `hi`, then wait for the assistant response.
7. Select `GPT-5.4-mini` in a post-auth new chat, send `hi`, and confirm the user row appears before the assistant response finishes.
8. Repeat in dark theme and confirm the user row remains visible before and after the assistant response.

#### Expected Results
- The submitted first user message appears in the conversation pane immediately after send.
- Backend refreshes that contain only the assistant item do not temporarily remove the optimistic user row.
- When the backend later returns the real user item, the optimistic row is replaced without a duplicate.
- Completion events refresh the selected thread even when it was already marked loaded by an optimistic first message.
- Delayed GPT-5.4-mini replies appear automatically when the completion notification arrives; no manual refresh is required.
- Light and dark theme message rows remain readable.

#### Rollback/Cleanup
- Stop the temporary Vite server.
- Remove the temporary isolated `CODEX_HOME` and test project folder.

---

### 图片消息的本地预显示与服务端回显对账

#### 变更说明
发送图片后，服务端可能同时回显 `localImage` 和同一路径的文件描述。消息对账应仅保留正式用户行，不能因同一图片的两种表示而保留重复的本地预显示行；非图片附件须按路径匹配，不能只比较数量。

#### 前置条件
1. 使用包含本修复的独立测试构建，不覆盖当前 5900/5910 部署。
2. 准备两张不同的图片及两个路径不同的文档。
3. 使用独立测试会话；失败用例通过测试环境的响应桩模拟，不主动占用模型容量。

#### 操作步骤
1. 在浅色主题的新会话中附加一张图片，输入唯一标记并只发送一次。
2. 在服务端尚未回显用户项时检查预显示行仍在；随后等待包含同路径图片文件描述的正式回显。
3. 分别重复多图、图片加文档、同一图片同时出现在图片列表和显式文件列表的情况。
4. 在响应桩中模拟 `Selected model is at capacity` 失败，再回读含图片及同路径文件描述的失败 turn；不要重发。
5. 在响应桩中将文档替换为另一条路径（附件数量不变），再检查对账结果。
6. 在深色主题重复上述步骤；刷新后检查正式历史消息。

#### 预期结果
- 每次操作只调用一次 `turn/start`；正式回显到达后只有一条对应的用户消息。
- 用户项尚未回显时，本地预显示行不消失。
- 单图、多图、图片加文档及容量失败后的历史回读均不留下重复用户行。
- 文档顺序变化不影响等价判定；数量相同但路径不同的文档不被误合并。
- 正式消息的图片、文件 chip 和失败诊断仍保留原有展示；本修复不删除附件或改变重试、队列行为。
- 浅色、深色主题均只显示对应的一条正式用户行，刷新后无重复。

#### 回滚与清理
- 清理测试会话及响应桩，不重启或改动线上 5900/5910 服务。
- 需要回滚代码时，仅在功能分支中撤销本次修复提交。
