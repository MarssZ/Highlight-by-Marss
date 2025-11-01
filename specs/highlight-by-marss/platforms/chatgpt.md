# ChatGPT 平台适配器

> **平台 URL**: https://chat.openai.com, https://chatgpt.com
> **适配器代码**: `src/platform/chatgpt-adapter.js`
> **验证状态**: ✅ 完整功能验证通过

## 概述

ChatGPT 是 **最简适配器**，得益于 OpenAI 优秀的语义化 HTML 设计，仅需 20 行代码即可完成适配。

## 平台特征

### DOM 结构

```
消息容器 ([data-message-author-role])
├── AI 消息 ([data-message-author-role="assistant"])
│   └── 操作按钮区域
│       └── 复制按钮 (button[data-message-author-role="assistant"])
└── 用户消息 ([data-message-author-role="user"])
```

### 关键选择器

```javascript
// AI 回复容器（语义化属性！）
'[data-message-author-role="assistant"]'

// 复制按钮（继承父容器属性）
'button[data-message-author-role="assistant"]'
```

### 平台特点

- ✅ **极致语义化** - `data-message-author-role="assistant"` 明确标识 AI 消息
- ✅ **天然区分** - 用户消息用 `"user"`，无需额外逻辑
- ✅ **最简实现** - 直接选择器，无需复杂遍历
- ✅ **双域名支持** - chat.openai.com 和 chatgpt.com

## 代码实现

```javascript
class ChatGPTAdapter extends PlatformAdapter {
    detectPlatform() {
        const hostname = window.location.hostname;
        return hostname.includes('chat.openai.com') ||
               hostname.includes('chatgpt.com');
    }

    findResponseContainers() {
        return Array.from(
            document.querySelectorAll('[data-message-author-role="assistant"]')
        );
    }

    findCopyButtons() {
        // ChatGPT 的复制按钮也在 assistant 容器内
        const containers = this.findResponseContainers();
        return containers.map(c => c.querySelector('button'))
                        .filter(b => b !== null);
    }

    isValidResponseContainer(element) {
        return element?.closest('[data-message-author-role="assistant"]') !== null;
    }

    getCopyButtonContainer(button) {
        return button.closest('[data-message-author-role="assistant"]');
    }
}
```

## 功能验证

✅ **已验证的完整功能**：
- 基础高亮功能正常
- 评论功能正常
- 复制功能正常
- AI 回复区域准确限制

## 开发经验

### 实现特点

**语义化设计的优势**：
- 无需分析复杂 DOM 结构
- 无需区分用户 vs AI 消息的逻辑
- 代码极其简洁（仅 20 行）

**开发时间**：
- DOM 分析：30 分钟（因为选择器太明显）
- 适配器实现：20 分钟
- 功能验证：20 分钟
- **总计：~1 小时**（最快适配平台）

### 设计启示

ChatGPT 的 HTML 设计给其他平台树立了标杆：
- 使用语义化的 `data-*` 属性
- 明确标识不同角色的消息
- 适配器开发时间可以缩短 50-70%

## 适配器统计

```javascript
// 在 ChatGPT 页面控制台运行
const adapter = new ChatGPTAdapter();
console.log('AI 容器数量:', adapter.findResponseContainers().length);
console.log('复制按钮数量:', adapter.findCopyButtons().length);
```

## 相关文档

- **平台适配开发指南**：[README.md](README.md)
- **核心架构**：[../ARCHITECTURE.md](../ARCHITECTURE.md)
- **对比：Grok 平台**：[grok.md](grok.md) - 查看复杂平台的对比
