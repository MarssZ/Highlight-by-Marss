# 平台适配器开发指南

> 本指南基于 Gemini、Claude、Grok、ChatGPT 四个平台的实战经验总结。

## 已支持平台

| 平台 | 状态 | 特点 | 适配难度 | 文档 |
|-----|------|-----|---------|-----|
| **Gemini** | ✅ MVP 基础平台 | 语义化选择器，结构简单 | ⭐ 简单 | [gemini.md](gemini.md) |
| **Claude** | ✅ 架构验证平台 | data-testid 属性，稳定性高 | ⭐ 简单 | [claude.md](claude.md) |
| **ChatGPT** | ✅ 最简适配器 | 极致语义化，20 行代码 | ⭐ 最简单 | [chatgpt.md](chatgpt.md) |
| **Grok** | ✅ 复杂度挑战平台 | 需区分用户/AI 消息 | ⭐⭐⭐ 复杂 | [grok.md](grok.md) |

## 平台适配器接口

每个平台适配器必须实现以下 5 个方法：

```javascript
class PlatformAdapter {
    // 1. 平台检测
    detectPlatform(): boolean

    // 2. 查找所有 AI 回复容器
    findResponseContainers(): Element[]

    // 3. 查找所有复制按钮
    findCopyButtons(): Element[]

    // 4. 验证元素是否为有效的 AI 回复容器
    isValidResponseContainer(element: Element): boolean

    // 5. 获取复制按钮对应的消息容器
    getCopyButtonContainer(button: Element): Element
}
```

## 标准开发流程

基于 Grok 平台开发经验，强烈建议按以下流程进行：

### 时间分配原则

- **60%** - DOM 结构深度分析 ⚠️ **不能低于这个比例！**
- **30%** - 标准化代码实现
- **10%** - 调试和验证

> "在编写第一行适配器代码之前，必须完全理解目标平台的 DOM 层次结构" - Grok 开发教训

---

## 阶段 1：DOM 结构分析（60% 时间）

### 1.1 获取完整 DOM 结构

1. 访问目标平台，进行完整对话（至少 2 轮问答）
2. 使用浏览器开发工具导出完整 HTML 结构
3. 创建 `dom_[platform].md` 文件保存结构

### 1.2 基础元素统计

在浏览器控制台运行：

```javascript
console.log('=== 基础结构统计 ===');
console.log('Message bubbles:', document.querySelectorAll('.message-bubble, .message, [class*="message"]').length);
console.log('Action buttons:', document.querySelectorAll('.action-buttons, .actions, [class*="action"]').length);
console.log('Copy buttons:', document.querySelectorAll('button[aria-label*="复制"], button[aria-label*="Copy"], button[title*="copy"]').length);

// 显示前 10 个按钮的标识
Array.from(document.querySelectorAll('button')).slice(0, 10).forEach((btn, i) => {
    const label = btn.getAttribute('aria-label') || btn.getAttribute('title') || btn.textContent.trim();
    if (label) console.log(`  按钮${i+1}: ${label}`);
});
```

### 1.3 用户 vs AI 消息区分

```javascript
console.log('=== 消息类型分析 ===');
document.querySelectorAll('.message-bubble, .message').forEach((msg, i) => {
    const parent = msg.closest('[class*="group"], [class*="container"]');
    console.log(`消息${i+1}:`, {
        classes: msg.className,
        parentClasses: parent?.className,
        width: getComputedStyle(msg).width,
        alignment: getComputedStyle(parent || msg).alignItems || 'unknown'
    });
});
```

### 1.4 绘制 DOM 层次关系图

```
平台根容器
├── 对话容器 1
│   ├── 用户消息 bubble
│   └── 用户操作按钮区域
├── 对话容器 2
│   ├── AI 消息 bubble
│   └── AI 操作按钮区域
└── ...
```

### 1.5 验证预期数量

- 确认实际 AI 回复数量
- 确认每个 AI 回复的复制按钮数量
- 识别可能的干扰元素（广告、提示等）

---

## 阶段 2：适配器开发（30% 时间）

### 2.1 核心方法实现顺序

1. **detectPlatform()** - 简单域名检查
2. **findResponseContainers()** - 基于明确的语义化选择器
3. **findCopyButtons()** - 复用容器查找逻辑
4. **isValidResponseContainer()** - 与 findResponseContainers 相同逻辑
5. **getCopyButtonContainer()** - 与 isValidResponseContainer 相同逻辑

### 2.2 关键实现原则

**"消除特殊情况" - Linus 哲学**

- ✅ **统一逻辑**：所有方法使用相同的核心查找模式
- ✅ **AI 区分**：必须区分用户消息和 AI 回复
- ✅ **向上遍历**：从子元素向上查找，不假设直接父子关系
- ✅ **双重验证**：同时检查 message-bubble 和 action-buttons 存在

### 2.3 代码模板

#### 简单平台（有语义化属性）

```javascript
class SimplePlatformAdapter extends PlatformAdapter {
    detectPlatform() {
        return window.location.hostname.includes('platform.com');
    }

    findResponseContainers() {
        // 直接选择语义化选择器
        return Array.from(document.querySelectorAll('.ai-response, [data-role="assistant"]'));
    }

    findCopyButtons() {
        const buttons = document.querySelectorAll('button[aria-label*="复制"]');
        return Array.from(buttons).filter(btn =>
            this.getCopyButtonContainer(btn) !== null
        );
    }

    isValidResponseContainer(element) {
        return element?.closest('.ai-response') !== null;
    }

    getCopyButtonContainer(button) {
        return button.closest('.ai-response');
    }
}
```

#### 复杂平台（需要遍历和区分）

参考 [grok.md](grok.md) 的完整实现，特别是 **三大陷阱** 部分。

---

## 阶段 3：调试验证（10% 时间）

### 3.1 分层调试策略

```javascript
// 1. 基础统计验证
const adapter = new PlatformAdapter();
console.log('AI 容器数量:', adapter.findResponseContainers().length);
console.log('复制按钮数量:', adapter.findCopyButtons().length);

// 2. 关联性测试
const containers = adapter.findResponseContainers();
const buttons = adapter.findCopyButtons();
buttons.forEach((btn, i) => {
    const container = adapter.getCopyButtonContainer(btn);
    console.log(`按钮${i+1} -> 容器:`, !!container);
});
```

### 3.2 功能验证清单

- [ ] **高亮功能**：选中 AI 回复文本 → 立即变黄
- [ ] **评论功能**：点击高亮 → 弹出输入框 → 保存成功
- [ ] **复制功能**：点击复制 → 粘贴带 `<highlight>` 标签内容

### 3.3 数量验证

- [ ] 适配器容器数 = 实际 AI 回复数
- [ ] 适配器按钮数 = 实际 AI 复制按钮数
- [ ] 不会误选用户消息按钮

---

## 常见陷阱检查清单

### DOM 结构陷阱

- [ ] 是否假设了错误的父子关系？
- [ ] 是否基于 DOM 片段而非完整页面分析？
- [ ] 共同父容器位置是否正确识别？

### 消息类型陷阱

- [ ] 用户消息和 AI 回复是否正确区分？
- [ ] 布局方向（左对齐 vs 右对齐）是否考虑？
- [ ] 宽度限制（全宽 vs 限制宽度）是否检查？

### 逻辑一致性陷阱

- [ ] `isValidResponseContainer` 和 `getCopyButtonContainer` 是否使用相同逻辑？
- [ ] `findResponseContainers` 和 `findCopyButtons` 是否基于相同原理？
- [ ] 是否存在特殊情况需要消除？

---

## 质量保证标准

### 代码质量

- 所有方法共享核心逻辑，避免重复实现
- 清理调试信息，只保留最终统计结果
- 使用一致的变量命名和注释风格

### 功能完整性

- 3 个核心流程必须全部通过
- 边界情况测试（跨元素选择、滚动等）
- 与其他平台适配器行为一致

### 文档完整性

- 更新本目录下对应的平台文档
- 添加平台特定的验证要点
- 记录开发过程中的关键决策

---

## 文件组织结构

新平台开发应创建/更新的文件：

```
specs/highlight-by-marss/
├── platforms/
│   ├── README.md              # 本文件 - 开发指南
│   ├── [platform].md          # 🆕 新平台文档
│   ├── gemini.md
│   ├── claude.md
│   ├── grok.md
│   └── chatgpt.md
├── ARCHITECTURE.md            # 核心架构（无需修改）
├── CORE-FEATURES.md           # 核心功能（无需修改）
└── tasks.md                   # 更新开发记录

highlight-by-marss/
├── src/platform/
│   └── [platform]-adapter.js  # 🆕 适配器实现
└── manifest.json              # 添加域名权限
```

---

## 成功标准

当满足以下所有条件时，平台适配开发完成：

1. **功能标准**：3 个核心流程完全正常
2. **质量标准**：代码遵循统一模式，无重复逻辑
3. **数量标准**：适配器识别数量与实际页面完全匹配
4. **一致标准**：与现有平台行为保持一致
5. **文档标准**：开发过程和经验得到完整记录

---

## 重要提醒

**慢就是快，快就是慢。**

前期 DOM 分析投入越多，后期调试时间越少！

Grok 平台的实际经验：
- 预期：60% 分析 + 30% 实现 + 10% 调试
- 实际：40% 分析 + 30% 实现 + 30% 调试修复 ❌

**不要重蹈覆辙！严格遵循 60/30/10 分配原则。**

---

## 相关文档

- **核心架构**：[../ARCHITECTURE.md](../ARCHITECTURE.md)
- **核心功能**：[../CORE-FEATURES.md](../CORE-FEATURES.md)
- **验证报告**：[../verify.md](../verify.md)
- **需求文档**：[../requirements.md](../requirements.md)

## 平台文档

- [Gemini 平台](gemini.md) - MVP 基础平台
- [Claude 平台](claude.md) - 架构验证平台
- [ChatGPT 平台](chatgpt.md) - 最简适配器
- [Grok 平台](grok.md) - **必读！包含 3 个关键陷阱**
