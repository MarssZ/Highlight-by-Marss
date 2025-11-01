# Claude 平台适配器

> **平台 URL**: https://claude.ai
> **适配器代码**: `src/platform/claude-adapter.js`
> **验证状态**: ✅ 架构验证平台，完整功能通过

## 概述

Claude 是 **架构验证平台**，用于验证多平台适配器架构的可行性。成功适配证明了平台适配器模式的正确性。

## 平台特征

### DOM 结构

```
AI 回复容器 (.font-claude-response)
├── 消息内容区域
└── 操作按钮栏 ([data-testid="action-bar"])
    └── 复制按钮 ([data-testid="action-bar-copy"])
```

### 关键选择器

```javascript
// AI 回复容器
'.font-claude-response'

// 操作按钮栏
'[data-testid="action-bar"]'

// 复制按钮
'[data-testid="action-bar-copy"]'
```

### 平台特点

- ✅ **语义化选择器** - `.font-claude-response` 明确标识 Claude 回复
- ✅ **data-testid 属性** - Anthropic 使用测试属性，稳定性极高
- ✅ **结构清晰** - 操作栏和消息内容分离明确

## 代码实现

```javascript
class ClaudeAdapter extends PlatformAdapter {
    detectPlatform() {
        return window.location.hostname.includes('claude.ai');
    }

    findResponseContainers() {
        return Array.from(document.querySelectorAll('.font-claude-response'));
    }

    findCopyButtons() {
        const buttons = document.querySelectorAll('[data-testid="action-bar-copy"]');
        return Array.from(buttons).filter(btn =>
            this.getCopyButtonContainer(btn) !== null
        );
    }

    isValidResponseContainer(element) {
        return element?.closest('.font-claude-response') !== null;
    }

    getCopyButtonContainer(button) {
        // 从复制按钮向上查找包含 AI 回复的容器
        const actionBar = button.closest('[data-testid="action-bar"]');
        return actionBar?.closest('.font-claude-response') || null;
    }
}
```

## 功能验证

✅ **已验证的完整功能**：
- 基础高亮功能：选中 AI 回复文本立即变黄
- 评论功能：点击高亮弹出输入框，保存成功
- 复制功能：点击复制按钮带出 `<highlight>` 标签内容
- 适配器识别精确：找到正确数量的 AI 回复和复制按钮

## 开发经验

### 架构验证成果

**验证目标** - 确认多平台适配器架构的技术可行性：
- ✅ 所有平台差异都能抽象为 5 个基础方法
- ✅ 核心逻辑完全平台无关
- ✅ 新平台支持仅需实现适配器接口

**验证结果** - 架构验证成功：
- 核心高亮逻辑完全平台无关 ✅
- CSS.highlights API 跨平台通用 ✅
- 评论存储机制平台无关 ✅
- 复制增强逻辑只需适配器提供 DOM 元素 ✅

### 开发时间

**预期**：3-4 小时
**实际**：~3 小时

**时间分配**：
- DOM 结构分析：1 小时
- 适配器实现：1 小时
- 功能验证：1 小时

## 适配器统计

```javascript
// 在 Claude 页面控制台运行
const adapter = new ClaudeAdapter();
console.log('AI 容器数量:', adapter.findResponseContainers().length);
console.log('复制按钮数量:', adapter.findCopyButtons().length);
// 两个数量应该相等
```

## 相关文档

- **平台适配开发指南**：[README.md](README.md)
- **核心架构**：[../ARCHITECTURE.md](../ARCHITECTURE.md)
- **验证报告**：[../verify.md](../verify.md)
