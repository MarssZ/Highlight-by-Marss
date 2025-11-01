# Gemini 平台适配器

> **平台 URL**: https://gemini.google.com
> **适配器代码**: `src/platform/gemini-adapter.js`
> **验证状态**: ✅ MVP 基础平台，所有功能完整验证

## 概述

Gemini 是 **MVP 基础平台**，最早实现并验证了所有核心功能。适配器架构重构时，将硬编码的 Gemini 逻辑提取为标准适配器。

## 平台特征

### DOM 结构

```
AI 回复容器 (.model-response-text)
├── 消息内容区域
└── 操作按钮容器 (.action-buttons)
    └── 复制按钮 (button[aria-label*="复制"])
```

### 关键选择器

```javascript
// AI 回复容器
'.model-response-text'

// 复制按钮
'button[aria-label*="复制"], button[aria-label*="Copy"]'
```

### 平台特点

- ✅ **语义化选择器** - `.model-response-text` 明确表示 AI 回复
- ✅ **结构简单** - AI 回复和用户消息使用不同 class，无需额外区分
- ✅ **稳定性好** - Google 平台，DOM 结构相对稳定

## 代码实现

```javascript
class GeminiAdapter extends PlatformAdapter {
    detectPlatform() {
        return window.location.hostname.includes('gemini.google.com');
    }

    findResponseContainers() {
        return Array.from(document.querySelectorAll('.model-response-text'));
    }

    findCopyButtons() {
        const buttons = document.querySelectorAll(
            'button[aria-label*="复制"], button[aria-label*="Copy"]'
        );
        return Array.from(buttons).filter(btn =>
            this.getCopyButtonContainer(btn) !== null
        );
    }

    isValidResponseContainer(element) {
        return element?.closest('.model-response-text') !== null;
    }

    getCopyButtonContainer(button) {
        return button.closest('.model-response-text');
    }
}
```

## 功能验证

✅ **已验证的完整功能**：
- 选中 AI 回复文本立即高亮（支持跨元素）
- Ctrl+点击移除高亮，Ctrl+Z 撤销
- 劫持 AI 回复复制按钮
- 智能生成带高亮标签的复制内容
- 点击高亮显示 Material Design 评论对话框
- 评论与高亮关联存储，🔖指示器显示和悬停
- 复制时包含评论信息格式化

## 开发经验

### MVP 实现路径

1. **阶段1** - 基础高亮功能（CSS.highlights API）
2. **阶段2** - 高亮控制优化（Ctrl+点击，Ctrl+Z）
3. **阶段3** - 劫持复制按钮，智能复制
4. **阶段4** - 评论功能完整实现
5. **阶段5** - 多平台架构重构

### 重构经验

**重构目标** - 零破坏性：
- ✅ 提取平台特定逻辑到适配器层
- ✅ 核心高亮/评论逻辑保持不变
- ✅ 统一适配器接口
- ✅ Gemini 用户体验完全不变

**验证标准** - 所有现有功能完全正常：
- 性能无退化
- 用户体验无变化
- Console 显示适配器信息

## 适配器统计

```javascript
// 在 Gemini 页面控制台运行
const adapter = new GeminiAdapter();
console.log('AI 容器数量:', adapter.findResponseContainers().length);
console.log('复制按钮数量:', adapter.findCopyButtons().length);
// 典型输出：6 个 AI 回复，6 个复制按钮
```

## 相关文档

- **平台适配开发指南**：[README.md](README.md)
- **核心架构**：[../ARCHITECTURE.md](../ARCHITECTURE.md)
- **核心功能**：[../CORE-FEATURES.md](../CORE-FEATURES.md)
