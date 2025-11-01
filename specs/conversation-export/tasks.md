# 任务清单：对话导出功能

## MVP范围
- ✅ 点击扩展图标 → 复制整个对话到剪贴板
- ✅ Markdown格式化（轮次、时间戳、平台名称）
- ✅ 显示成功/失败通知
- ✅ 支持Gemini平台（Phase 1验证）

---

## Phase 1：核心功能（Gemini平台）

### 🎯 验证策略：先做能立即看到效果的

### ⚠️ 重要技术说明：Chrome Extension Isolated World

**问题**：Chrome Extension 的 Content Scripts 运行在"隔离世界"（Isolated World）：
- ✅ 共享 DOM - 可以操作同一个页面元素
- ❌ 不共享 JavaScript 全局对象 - `window.xxx` 在页面控制台无法访问
- ✅ 共享 console - 日志输出到同一个控制台

**影响**：
- 控制台无法直接运行 `window.platformAdapter.findUserMessages()` 等命令
- 所有需要访问扩展变量的验证都无法在控制台手动执行

**解决方案**：
- ✅ 已在 `content.js:484-520` 添加自动验证代码
- 刷新页面后等待 3 秒，自动执行任务 3-5 的验证并输出结果
- 后续任务如需验证，可采用类似自动验证方式

---

### 1秒验证 - 用户可见效果

- [x] 1. 实现扩展图标点击通知功能
  - 需求：REQ-1（一键复制全部对话）
  - 文件：`highlight-by-marss/src/background.js`
  - 验证：点击扩展图标 → 1秒内看到通知（"未检测到对话内容" 或其他提示）
  - ✅ 已完成：background.js:9-47

- [x] 2. 添加manifest.json配置
  - 需求：技术约束
  - 文件：`highlight-by-marss/manifest.json`
  - 验证：
    - 刷新扩展 → F12无报错
    - 检查 `manifest.json` → 包含 `notifications` 权限
    - 检查 `content_scripts.js` → 包含 `conversation-exporter.js`
  - ✅ 已完成：manifest.json:10 (notifications权限) + :24 (conversation-exporter.js)

---

### 5秒验证 - 简单操作验证

- [x] 3. 实现Gemini平台用户消息提取
  - 需求：REQ-3（平台识别与适配）+ REQ-5（数据提取准确性）
  - 文件：`highlight-by-marss/src/platform/gemini-adapter.js`
  - 验证：
    - ⚠️ **注意**：由于 Chrome Extension Isolated World 隔离，控制台无法直接访问 `window.platformAdapter`
    - 验证方式：刷新 Gemini 页面 → 等待 3 秒 → 查看控制台自动验证输出
    - 预期输出：
      ```
      🧪 自动验证任务3: findUserMessages()
      ✅ 验证成功！
      📊 找到用户消息数量: 2
      📋 用户消息列表: [user-query, user-query]
      ```
  - ✅ 已完成：
    - gemini-adapter.js:149-153 (findUserMessages方法)
    - content.js:484-520 (自动验证代码)

- [x] 4. 实现Gemini平台文本提取
  - 需求：REQ-5（数据提取准确性）
  - 文件：`highlight-by-marss/src/platform/gemini-adapter.js`
  - 验证：
    - 查看任务3的自动验证输出
    - 预期输出：
      ```
      🧪 自动验证任务4: extractText()
      ✅ 第一条消息文本: 你好啊
      ```
    - 确认无UI元素、无按钮文字
  - ✅ 已完成：gemini-adapter.js:160-177 (extractText方法) + :193-206 (清理引用标记)

- [x] 5. 实现Gemini平台名称获取
  - 需求：REQ-3（平台识别与适配）
  - 文件：`highlight-by-marss/src/platform/gemini-adapter.js`
  - 验证：
    - 查看任务3的自动验证输出
    - 预期输出：
      ```
      🧪 自动验证任务5: getPlatformDisplayName()
      ✅ 平台名称: Gemini
      ```
  - ✅ 已完成：gemini-adapter.js:183-185 (getPlatformDisplayName方法)

---

### Console验证 - 技术验证（有具体输出）

⚠️ **验证方式调整**：由于 Isolated World 限制，任务6-9无法在控制台手动运行。改为以下验证方式：
1. **实现代码** → **点击扩展图标** → **查看通知和控制台日志**
2. **粘贴到文本编辑器** → **检查格式和内容**

- [x] 6. 实现对话数据提取逻辑
  - 需求：REQ-5（数据提取准确性）
  - 文件：`highlight-by-marss/src/conversation-exporter.js`
  - 验证方式：
    - Gemini页面（3轮对话）→ **点击扩展图标**
    - 控制台日志显示提取过程（建议添加 console.log）：
      ```
      提取到 3 条用户消息
      提取到 3 条AI回复
      配对后共 6 条消息
      ```
    - 通知显示："已复制 3 轮对话" 或 详细错误信息
  - ✅ **已完成**：conversation-exporter.js:66-122 实现完整提取逻辑，支持错误处理

- [x] 7. 实现DOM排序逻辑
  - 需求：REQ-5（数据提取准确性 - 时间顺序）
  - 文件：`highlight-by-marss/src/conversation-exporter.js`
  - 验证方式：
    - 在 export() 函数中添加 console.log 输出对话数据数组
    - 点击扩展图标 → 查看控制台日志
    - 确认顺序：第1个元素是用户问题，第2个是AI回答，依此类推
    - 顺序与页面显示一致
  - ✅ **已完成**：conversation-exporter.js:130-156 使用 compareDocumentPosition 实现DOM顺序排序

- [x] 8. 实现Markdown格式化
  - 需求：REQ-2（Markdown格式化）
  - 文件：`highlight-by-marss/src/conversation-exporter.js`
  - 验证方式：
    - 点击扩展图标 → 粘贴到文本编辑器
    - 检查格式：
      - 包含标题：`## 对话记录 2025-01-15 14:30`
      - 包含平台：`**平台：** Gemini`
      - 包含轮次：`### 第1轮`、`### 第2轮`
      - 格式正确：`**用户：**\n内容` 和 `**Gemini：**\n内容`
  - ✅ **已完成**：conversation-exporter.js:203-234 + 集成 Turndown 库实现 HTML→Markdown 转换
  - 🆕 **技术方案**：引入 [Turndown](https://github.com/mixmark-io/turndown) 库（16.7k stars），保留完整格式（代码块、列表、加粗等）

---

### 手动测试验证 - 需要复制粘贴

- [x] 9. 实现剪贴板写入
  - 需求：REQ-1（一键复制全部对话）
  - 文件：`highlight-by-marss/src/conversation-exporter.js`
  - 验证方式：
    - Gemini页面 → **点击扩展图标**
    - Ctrl+V 粘贴到文本编辑器 → 看到格式化的Markdown
    - 内容与页面对话一致
  - 💡 **提示**：剪贴板写入必须用 `navigator.clipboard.writeText()`，在 content script 上下文有权限
  - ✅ **已完成**：background.js:82-107 使用 chrome.scripting.executeScript 在页面上下文写入剪贴板

- [x] 10. 集成background.js消息传递
  - 需求：REQ-1（一键复制全部对话）
  - 文件：`highlight-by-marss/src/background.js`
  - 验证：
    - Gemini页面（3轮对话）→ 点击扩展图标
    - 1秒内显示通知："已复制 3 轮对话"
    - 粘贴到文本编辑器 → 看到完整Markdown
  - ✅ **已完成**：background.js:9-76 实现完整消息传递流程

- [x] 11. 集成content.js消息监听
  - 需求：REQ-1（一键复制全部对话）
  - 文件：`highlight-by-marss/src/content.js`
  - 验证方式：
    - 点击扩展图标 → 通知显示成功
    - F12 Network标签 → 无报错
    - F12 Console → 查看是否有消息传递相关日志（可选添加 console.log）
  - 💡 **提示**：content.js:466-482 已有消息监听代码，调用 `conversationExporter.export()`
  - ✅ **已完成**：content.js:466-482 已实现消息监听

---

### 错误处理验证 - 边缘情况

- [x] 12. 实现空页面错误处理
  - 需求：REQ-1（错误提示）
  - 文件：`highlight-by-marss/src/conversation-exporter.js`
  - 验证：
    - Gemini空白页面（无对话）→ 点击扩展图标
    - 显示通知："未检测到对话内容"

- [x] 13. 实现未支持平台错误处理
  - 需求：REQ-1（错误提示）
  - 文件：`highlight-by-marss/src/background.js`
  - 验证：
    - 打开 google.com → 点击扩展图标
    - 显示通知："当前页面不支持此功能"
  - ✅ **已完成**：background.js:58-75 捕获异常并显示错误通知

- [x] 14. 实现单条消息提取失败处理
  - 需求：REQ-5（某条消息提取失败 - 跳过继续）
  - 文件：`highlight-by-marss/src/conversation-exporter.js`
  - 验证：
    - 模拟：手动修改DOM破坏一条消息
    - 点击扩展图标 → 仍然成功
    - F12显示："跳过1条提取失败的消息"
    - 粘贴 → 包含其他消息，缺失破坏的那条
  - ✅ **已完成**：conversation-exporter.js:75-84, 101-109 使用 try-catch 跳过失败消息

---

### 架构任务 - 最后验证

- [x] 15. 扩展平台适配器接口
  - 需求：技术架构
  - 文件：`highlight-by-marss/src/platform/platform-adapter.js`
  - 验证方式：
    - ⚠️ **Isolated World 限制**：无法在控制台直接访问 `window.platformAdapter`
    - ✅ **已通过任务3-5验证**：自动验证代码成功调用了 3 个新方法
    - 检查代码实现：
      - `findUserMessages()` - gemini-adapter.js:149-153 ✅
      - `extractText()` - gemini-adapter.js:160-177 ✅
      - `getPlatformDisplayName()` - gemini-adapter.js:183-185 ✅
  - ✅ 已完成：接口扩展已验证，所有方法可正常调用

---

## Phase 2：其他平台支持（P1）

### Claude平台

- [ ] 16. 实现Claude平台适配器
  - 需求：REQ-3（平台识别与适配）
  - 文件：`highlight-by-marss/src/platform/claude-adapter.js`
  - 验证：
    - Claude页面（2轮对话）→ F12运行 `window.platformAdapter.findUserMessages()`
    - 输出：2个用户消息容器
    - 点击扩展图标 → 显示 "已复制 2 轮对话"

### ChatGPT平台

- [ ] 17. 实现ChatGPT平台适配器
  - 需求：REQ-3（平台识别与适配）
  - 文件：`highlight-by-marss/src/platform/chatgpt-adapter.js`
  - 验证：
    - ChatGPT页面（2轮对话）→ 点击扩展图标
    - 显示 "已复制 2 轮对话"
    - 粘贴 → 平台名称为 "ChatGPT"

### Grok平台

- [ ] 18. 实现Grok平台适配器
  - 需求：REQ-3（平台识别与适配）
  - 文件：`highlight-by-marss/src/platform/grok-adapter.js`
  - 验证：
    - Grok页面（2轮对话）→ 点击扩展图标
    - 显示 "已复制 2 轮对话"
    - 粘贴 → 平台名称为 "Grok"

---

## Phase 3：完善与测试（P2）

### 性能测试

- [ ] 19. 测试大量对话性能
  - 需求：非功能需求（性能）
  - 文件：无（测试任务）
  - 验证：
    - Gemini页面（100轮对话）→ F12运行 `console.time('export'); window.conversationExporter.export(); console.timeEnd('export')`
    - 输出时间 < 2000ms
    - 页面不卡顿

### 跨平台测试

- [ ] 20. 跨平台完整测试
  - 需求：技术约束（跨平台兼容）
  - 文件：无（测试任务）
  - 验证：
    - 在Gemini、Claude、ChatGPT、Grok各平台
    - 点击扩展图标 → 全部成功
    - 粘贴 → 格式一致、平台名称正确

---

## 任务统计

- **Phase 1（核心功能）**：15个任务
  - 1秒验证：2个 ✅ **已完成 2/2**
  - 5秒验证：3个 ✅ **已完成 3/3**
  - Console验证：4个 ✅ **已完成 4/4**
  - 手动测试：3个 ✅ **已完成 3/3**
  - 错误处理：3个 ✅ **已完成 3/3**
  - 架构任务：1个 ✅ **已完成 1/1**

- **Phase 2（平台支持）**：3个任务 ⬜ **待开始 0/3**
- **Phase 3（完善测试）**：2个任务 ⬜ **待开始 0/2**

**总计：20个任务 | 已完成：15个 (75%) | 进行中：0个 | 待开始：5个**

### ⚠️ 验证方式变更说明

由于 Chrome Extension Isolated World 机制，原计划在控制台手动运行的验证（任务6-9、15）已调整：
- **任务6-9**：改为"点击扩展图标 + 查看日志/通知 + 检查粘贴内容"
- **任务15**：已通过任务3-5的自动验证完成接口验证，标记为完成

---

## 验证时间估算

| 阶段 | 任务数 | 预计时间 |
|-----|-------|---------|
| Phase 1 | 15个 | 2-3小时 |
| Phase 2 | 3个 | 1-2小时 |
| Phase 3 | 2个 | 30分钟 |
| **总计** | **20个** | **4-6小时** |

---

## 关键里程碑

1. ✅ **任务1-2完成** → 扩展图标能点击、能显示通知 ✅ **已达成**
2. ✅ **任务3-5完成** → Gemini平台数据提取能work ✅ **已达成**
3. ✅ **任务15完成** → 平台适配器接口扩展验证 ✅ **已达成**
4. ✅ **任务6-9完成** → 能生成完整Markdown ✅ **已达成**
5. ✅ **任务10-11完成** → 完整流程打通（点击图标 → 复制到剪贴板）✅ **已达成**
6. ✅ **任务12-14完成** → 错误处理完善 ✅ **已达成**
7. ✅ **Phase 1全部完成** → Gemini平台可用 ✅ **已达成**
8. ⬜ **Phase 2完成** → 4个平台全部可用

---

## 备注

- **每个任务都有明确的验证标准**
- **优先做能立即看到效果的任务**（避免错误传染）
- **Console验证必须有具体输出**（不是"系统正常"）
- **Phase 2的3个任务可以并行做**（不同平台互不影响）
- ⚠️ **重要**：由于 Chrome Extension Isolated World 隔离机制，控制台无法直接访问扩展变量（`window.platformAdapter` 等），所有需要访问扩展内部状态的验证都改为：
  1. 在代码中添加 `console.log` 输出调试信息
  2. 点击扩展图标触发功能
  3. 查看控制台日志和通知结果
  4. 检查实际输出（如粘贴到文本编辑器）
