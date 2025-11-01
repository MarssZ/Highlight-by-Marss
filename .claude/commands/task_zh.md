---
description: 基于设计文档生成实施任务清单
argument-hint: [功能名称]
---

# 核心铁律：按验证容易程度排序

**越容易发现bug的功能，越早做 - 避免错误传染**

## 任务格式标准

```markdown
- [ ] N. 动词+名词（具体目标）
  - 需求：REQ-X.Y
  - 文件：具体文件路径
  - 验证：做X操作 → 看到Y结果（优先用户可见效果）
```

## 设计原则

### 任务排序：按验证容易程度（避免错误传染）

1. **1秒验证** - 立即可见效果（选中→变黄色）
2. **5秒验证** - 简单操作验证（点击→复制→粘贴检查）
3. **状态验证** - 需要特殊条件（刷新→检查数据）
4. **Console验证** - 技术验证（架构任务用具体输出）
5. **难以验证** - 异常边缘情况（最后做）

**Console输出必须具体：**
✅ `"GeminiAdapter loaded: found 5 containers"`
❌ `"系统正常工作"`

### ⚠️ Chrome Extension 特殊验证策略

**问题**：Chrome Extension Content Scripts 运行在 **Isolated World**：
- ✅ 共享 DOM（可操作页面元素）
- ❌ 不共享 JavaScript 全局对象（控制台无法访问 `window.xxx` 扩展变量）
- ✅ 共享 console（日志输出到同一控制台）

**影响**：
- ❌ **不可行**：`F12运行 window.platformAdapter.findUserMessages()`
- ✅ **可行**：在代码中添加 `console.log` → 触发功能 → 查看日志

**验证策略调整**：

1. **Console验证任务** → 改为以下方式：
   ```markdown
   - 验证：
     - 在代码中添加 console.log 输出关键信息
     - 点击扩展图标/执行操作触发功能
     - F12 Console → 显示 "GeminiAdapter: found 3 buttons"
     - 检查实际效果（通知、粘贴结果等）
   ```

2. **架构验证任务** → 可通过自动验证代码：
   ```markdown
   - 验证：
     - 添加自动验证代码（content.js末尾）
     - 刷新页面 → 等待自动验证 → 查看控制台输出
   ```

3. **需要访问扩展变量的验证** → 无法手动运行：
   - 添加调试日志输出关键状态
   - 通过用户交互触发验证
   - 观察 console + 通知 + 实际效果

## 执行标准

1. 读取 `specs/{feature_name}/design.md`
2. 按验证容易程度排序任务
3. 每个任务必须能独立验证成功/失败

## 验证时间标准

❌ `验证：架构合理` （无法验证）
✅ `验证：选中文本 → 1秒内变黄色` （立即验证）
✅ `验证：点击按钮 → F12显示 "GeminiAdapter: found 3 buttons"` （具体输出）

### Chrome Extension 验证示例

**❌ 错误示例**（Isolated World 下不可行）：
```markdown
- 验证：F12运行 window.platformAdapter.findUserMessages()
```

**✅ 正确示例**（通过触发+日志）：
```markdown
- 验证：
  - 刷新页面 → 等待3秒 → 查看控制台自动验证输出
  - 或：点击扩展图标 → F12 Console显示 "提取到 3 条用户消息"
  - 或：添加调试日志 → 执行操作 → 检查日志+实际效果
```

---

**任务：基于 `specs/{feature_name}/design.md` 生成任务清单**