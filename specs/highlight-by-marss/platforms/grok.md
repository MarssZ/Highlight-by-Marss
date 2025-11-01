# Grok 平台适配器

> **平台 URL**: https://grok.com
> **适配器代码**: `src/platform/grok-adapter.js`
> **验证状态**: ✅ 完整功能验证通过

## 概述

Grok 平台是适配器开发中遇到的**最复杂平台**，成功适配后总结出了 **3 个关键陷阱**，形成了标准化开发流程。

## 平台特征

### DOM 结构

```
对话容器 (flex flex-col group/conversationTurn)
├── 用户消息容器 (items-end)
│   ├── 消息气泡 (.message-bubble 但有宽度限制)
│   └── 操作按钮区域 (.action-buttons)
└── AI 消息容器 (items-start) ← 关键区分点
    ├── 消息气泡 (.message-bubble.w-full) ← 关键区分点
    └── 操作按钮区域 (.action-buttons)
```

### 关键选择器

```javascript
// 消息气泡
'.message-bubble'

// 操作按钮区域
'.action-buttons'

// 复制按钮
'button[aria-label="复制"]'
```

### AI vs 用户消息区分

**问题**：所有消息都使用相同的 `.message-bubble` class

**解决方案**：通过布局和宽度区分
```javascript
// AI 消息特征
parent.classList.contains('items-start') &&    // 左对齐
messageBubble.classList.contains('w-full')      // 全宽

// 用户消息特征
parent.classList.contains('items-end') &&       // 右对齐
!messageBubble.classList.contains('w-full')     // 限制宽度
```

## 三大关键陷阱 ⚠️

### 陷阱 1：DOM 结构理解错误

**错误假设**：`.message-bubble` 和 `.action-buttons` 是父子关系
```javascript
// ❌ 错误代码
element.querySelector('.action-buttons')
```

**实际情况**：它们是**兄弟关系**，需要向上查找共同父容器
```javascript
// ✅ 正确代码
function findCommonParent(element) {
    let current = element;
    while (current && current !== document.body) {
        const bubble = current.querySelector('.message-bubble');
        const actions = current.querySelector('.action-buttons');
        if (bubble && actions) return current;
        current = current.parentElement;
    }
    return null;
}
```

**教训**：不要基于 DOM 片段假设结构，必须在完整页面中分析

---

### 陷阱 2：用户 vs AI 消息混淆

**问题**：所有消息使用相同 class，导致误选用户消息

**错误方案**：只检查 `.message-bubble` 存在性
```javascript
// ❌ 错误：会选中用户消息
if (container.querySelector('.message-bubble')) {
    return container;
}
```

**正确方案**：基于布局方向和宽度区分
```javascript
// ✅ 正确：只选 AI 消息
const isAIResponse = parent.classList.contains('items-start') &&
                    messageBubble.classList.contains('w-full');
```

**验证方法**：
```javascript
// 页面有 2 个 AI 回复 + 2 个用户消息 = 4 个 .message-bubble
// 适配器应该只识别 2 个 AI 容器
console.log('AI 容器数量:', adapter.findResponseContainers().length);
// 期望输出: 2（不是 4！）
```

---

### 陷阱 3：逻辑一致性断链

**问题**：`isValidResponseContainer` 和 `getCopyButtonContainer` 使用不同逻辑

**错误模式**：双重实现
```javascript
// ❌ 错误：两个方法各自查找
isValidResponseContainer(element) {
    // 实现 A：直接查找
    return element.querySelector('.message-bubble') !== null;
}

getCopyButtonContainer(button) {
    // 实现 B：向上遍历
    let parent = button.parentElement;
    while (parent) {
        if (parent.querySelector('.message-bubble')) return parent;
        parent = parent.parentElement;
    }
}
```

**结果**：高亮功能正常（用了实现 A），但复制功能失败（用了实现 B）

**正确模式**：统一核心逻辑
```javascript
// ✅ 正确：统一逻辑源
class GrokAdapter {
    // 核心逻辑：只实现一次
    _findCommonParent(startElement) {
        let parent = startElement.parentElement;
        while (parent && parent !== document.body) {
            const bubble = parent.querySelector('.message-bubble');
            const actions = parent.querySelector('.action-buttons');

            if (bubble && actions && this._isAIResponse(parent, bubble)) {
                return parent;
            }
            parent = parent.parentElement;
        }
        return null;
    }

    // 所有方法复用核心逻辑
    isValidResponseContainer(element) {
        return this._findCommonParent(element) !== null;
    }

    getCopyButtonContainer(button) {
        return this._findCommonParent(button.closest('.action-buttons'));
    }
}
```

**教训**："消除特殊情况" - 同一个问题只应该有一个解决方法

---

## 开发经验总结

### 时间分配

**预期**：60% 分析 + 30% 实现 + 10% 调试
**实际**：40% 分析 + 30% 实现 + 30% 调试修复 ❌

**教训**：DOM 结构分析投入不足导致后期大量调试时间

### 标准检查清单

在编写代码前，必须确认：

- [ ] **DOM 层次关系**：是父子还是兄弟？是否需要向上查找？
- [ ] **元素数量验证**：适配器识别数 = 实际 AI 回复数（不是全部消息数）
- [ ] **消息类型区分**：如何区分用户消息和 AI 回复？
- [ ] **逻辑统一性**：所有方法是否使用相同的核心查找逻辑？

### 功能验证

✅ **已验证的完整功能**：
- 基础高亮功能：选中 AI 回复文本立即变黄
- 评论功能：点击高亮弹出输入框，保存成功
- 复制功能：点击复制按钮带出完整的高亮和评论标签

### 适配器统计

```javascript
// 在 Grok 页面控制台运行
const adapter = new GrokAdapter();
console.log('AI 容器数量:', adapter.findResponseContainers().length);
console.log('复制按钮数量:', adapter.findCopyButtons().length);
// 两个数量应该相等，且等于实际 AI 回复数
```

## 代码实现要点

### 核心方法

```javascript
class GrokAdapter extends PlatformAdapter {
    detectPlatform() {
        return window.location.hostname.includes('grok.com');
    }

    findResponseContainers() {
        // 基于 action-buttons 反向查找
        const actionButtons = document.querySelectorAll('.action-buttons');
        return this._filterAIContainers(actionButtons);
    }

    findCopyButtons() {
        // 复用容器查找逻辑
        const buttons = document.querySelectorAll('button[aria-label="复制"]');
        return Array.from(buttons).filter(btn =>
            this.getCopyButtonContainer(btn) !== null
        );
    }

    // 核心逻辑：统一的 AI 容器查找
    _findCommonParent(startElement) {
        // 见上文"陷阱 3"的正确实现
    }

    // AI 识别逻辑
    _isAIResponse(parent, messageBubble) {
        return parent.classList.contains('items-start') &&
               messageBubble.classList.contains('w-full');
    }
}
```

## 对未来开发的启示

Grok 平台的适配经验形成了 **标准化开发流程**：

1. **60% 时间用于 DOM 分析** - 不能低于这个比例
2. **统一核心逻辑** - 消除所有重复实现
3. **严格验证数量** - 识别数必须等于实际数
4. **文档化陷阱** - 避免后续平台重复踩坑

## 相关文档

- **平台适配开发指南**：[README.md](README.md)
- **核心架构**：[../ARCHITECTURE.md](../ARCHITECTURE.md)
- **验证报告**：[../verify.md](../verify.md)
