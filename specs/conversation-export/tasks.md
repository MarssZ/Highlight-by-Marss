# 任务清单：对话导出功能

## MVP范围
- ✅ 点击扩展图标 → 复制整个对话到剪贴板
- ✅ Markdown格式化（轮次、时间戳、平台名称）
- ✅ 显示成功/失败通知
- ✅ 支持Gemini平台（Phase 1验证）

---

## Phase 1：核心功能（Gemini平台）

### 🎯 验证策略：先做能立即看到效果的

---

### 1秒验证 - 用户可见效果

- [ ] 1. 实现扩展图标点击通知功能
  - 需求：REQ-1（一键复制全部对话）
  - 文件：`highlight-by-marss/src/background.js`
  - 验证：点击扩展图标 → 1秒内看到通知（"未检测到对话内容" 或其他提示）

- [ ] 2. 添加manifest.json配置
  - 需求：技术约束
  - 文件：`highlight-by-marss/manifest.json`
  - 验证：
    - 刷新扩展 → F12无报错
    - 检查 `manifest.json` → 包含 `notifications` 权限
    - 检查 `content_scripts.js` → 包含 `conversation-exporter.js`

---

### 5秒验证 - 简单操作验证

- [ ] 3. 实现Gemini平台用户消息提取
  - 需求：REQ-3（平台识别与适配）+ REQ-5（数据提取准确性）
  - 文件：`highlight-by-marss/src/platform/gemini-adapter.js`
  - 验证：
    - Gemini页面（2轮对话）→ F12运行 `window.platformAdapter.findUserMessages()`
    - 输出：`[<user-query>, <user-query>]` (2个元素)
    - F12显示："GeminiAdapter: found 2 user messages"

- [ ] 4. 实现Gemini平台文本提取
  - 需求：REQ-5（数据提取准确性）
  - 文件：`highlight-by-marss/src/platform/gemini-adapter.js`
  - 验证：
    - F12运行 `window.platformAdapter.extractText(userMessages[0])`
    - 输出：用户输入的原始文本（如 "你好啊"）
    - 无UI元素、无按钮文字

- [ ] 5. 实现Gemini平台名称获取
  - 需求：REQ-3（平台识别与适配）
  - 文件：`highlight-by-marss/src/platform/gemini-adapter.js`
  - 验证：
    - F12运行 `window.platformAdapter.getPlatformDisplayName()`
    - 输出：`"Gemini"`

---

### Console验证 - 技术验证（有具体输出）

- [ ] 6. 实现对话数据提取逻辑
  - 需求：REQ-5（数据提取准确性）
  - 文件：`highlight-by-marss/src/conversation-exporter.js`
  - 验证：
    - Gemini页面（3轮对话）→ F12运行 `window.conversationExporter.export()`
    - F12显示：
      ```
      提取到 3 条用户消息
      提取到 3 条AI回复
      配对后共 6 条消息
      ```
    - 返回 `{success: true, rounds: 3}`

- [ ] 7. 实现DOM排序逻辑
  - 需求：REQ-5（数据提取准确性 - 时间顺序）
  - 文件：`highlight-by-marss/src/conversation-exporter.js`
  - 验证：
    - F12运行导出函数 → 检查 `conversationData` 数组
    - 第1个元素：`{role: 'user', content: '第一个问题', ...}`
    - 第2个元素：`{role: 'assistant', content: '第一个回答', ...}`
    - 顺序与页面显示一致

- [ ] 8. 实现Markdown格式化
  - 需求：REQ-2（Markdown格式化）
  - 文件：`highlight-by-marss/src/conversation-exporter.js`
  - 验证：
    - F12运行格式化函数 → 复制输出到文本编辑器
    - 包含标题：`## 对话记录 2025-01-15 14:30`
    - 包含平台：`**平台：** Gemini`
    - 包含轮次：`### 第1轮`、`### 第2轮`
    - 格式正确：`**用户：**\n内容` 和 `**Gemini：**\n内容`

---

### 手动测试验证 - 需要复制粘贴

- [ ] 9. 实现剪贴板写入
  - 需求：REQ-1（一键复制全部对话）
  - 文件：`highlight-by-marss/src/conversation-exporter.js`
  - 验证：
    - Gemini页面 → F12运行 `window.conversationExporter.export()`
    - 粘贴到文本编辑器 → 看到格式化的Markdown
    - 内容与页面对话一致

- [ ] 10. 集成background.js消息传递
  - 需求：REQ-1（一键复制全部对话）
  - 文件：`highlight-by-marss/src/background.js`
  - 验证：
    - Gemini页面（3轮对话）→ 点击扩展图标
    - 1秒内显示通知："已复制 3 轮对话"
    - 粘贴到文本编辑器 → 看到完整Markdown

- [ ] 11. 集成content.js消息监听
  - 需求：REQ-1（一键复制全部对话）
  - 文件：`highlight-by-marss/src/content.js`
  - 验证：
    - 点击扩展图标 → 通知显示成功
    - F12 Network标签 → 无报错
    - F12 Console → 显示 "收到exportConversation消息"

---

### 错误处理验证 - 边缘情况

- [ ] 12. 实现空页面错误处理
  - 需求：REQ-1（错误提示）
  - 文件：`highlight-by-marss/src/conversation-exporter.js`
  - 验证：
    - Gemini空白页面（无对话）→ 点击扩展图标
    - 显示通知："未检测到对话内容"

- [ ] 13. 实现未支持平台错误处理
  - 需求：REQ-1（错误提示）
  - 文件：`highlight-by-marss/src/background.js`
  - 验证：
    - 打开 google.com → 点击扩展图标
    - 显示通知："当前页面不支持此功能"

- [ ] 14. 实现单条消息提取失败处理
  - 需求：REQ-5（某条消息提取失败 - 跳过继续）
  - 文件：`highlight-by-marss/src/conversation-exporter.js`
  - 验证：
    - 模拟：手动修改DOM破坏一条消息
    - 点击扩展图标 → 仍然成功
    - F12显示："跳过1条提取失败的消息"
    - 粘贴 → 包含其他消息，缺失破坏的那条

---

### 架构任务 - 最后验证（Console输出）

- [ ] 15. 扩展平台适配器接口
  - 需求：技术架构
  - 文件：`highlight-by-marss/src/platform/platform-adapter.js`
  - 验证：
    - 打开任意适配器文件 → 检查是否实现3个新方法
    - F12运行 `window.platformAdapter.findUserMessages` → 不报错
    - F12运行 `window.platformAdapter.extractText` → 不报错
    - F12运行 `window.platformAdapter.getPlatformDisplayName` → 不报错

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
  - 1秒验证：2个
  - 5秒验证：3个
  - Console验证：4个
  - 手动测试：3个
  - 错误处理：3个

- **Phase 2（平台支持）**：3个任务
- **Phase 3（完善测试）**：2个任务

**总计：20个任务**

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

1. ✅ **任务1-2完成** → 扩展图标能点击、能显示通知
2. ✅ **任务3-5完成** → Gemini平台数据提取能work
3. ✅ **任务6-9完成** → 能生成完整Markdown
4. ✅ **任务10-11完成** → 完整流程打通（点击图标 → 复制到剪贴板）
5. ✅ **任务12-14完成** → 错误处理完善
6. ✅ **Phase 1全部完成** → Gemini平台可用
7. ✅ **Phase 2完成** → 4个平台全部可用

---

## 备注

- **每个任务都有明确的验证标准**
- **优先做能立即看到效果的任务**（避免错误传染）
- **Console验证必须有具体输出**（不是"系统正常"）
- **Phase 2的3个任务可以并行做**（不同平台互不影响）
