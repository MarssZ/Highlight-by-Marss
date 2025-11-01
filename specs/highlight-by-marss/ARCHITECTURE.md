# AI Highlight Assistant - 核心架构

## 概述

AI Highlight Assistant 是一个 Chrome 浏览器扩展，为 AI 聊天平台提供文本高亮和评论功能。

**核心价值**：允许用户标记 AI 回复中的重要内容，添加个人评论，并在复制时自动包含高亮标记。

## 设计原则（Linus 哲学）

### 1. "好品味"(Good Taste) - 消除特殊情况
- 使用统一的平台适配器接口，避免为每个平台写特殊逻辑
- 用数据结构设计替代复杂的条件判断
- 清晰的单向数据流：DOM → 数据 → Markdown

### 2. "Never break userspace" - 零破坏性
- 劫持原生复制按钮而非创建新 UI，保持用户习惯
- 新增平台支持不影响现有功能
- 向后兼容是铁律
- 新功能完全独立，不影响现有高亮/评论功能

### 3. 实用主义 - 解决真实问题
- 最小依赖原则：仅引入必要的、成熟的、零依赖的第三方库（如 Turndown）
- 零 DOM 污染：使用 CSS.highlights API 而非修改 DOM
- 简洁代码：Less is More
- 不重新造轮子：HTML→Markdown用成熟库而非自己实现

### 4. 简洁执念 - 控制复杂度
- 每个模块只做一件事并做好
- 核心逻辑平台无关，差异通过适配器隔离
- 新增对话导出功能 < 550行代码（含详细注释）

## 核心架构

```mermaid
graph TD
    A[AI平台网页] --> B[Platform Adapter 层]
    B --> |Gemini| BA[GeminiAdapter]
    B --> |ChatGPT| BB[ChatGPTAdapter]
    B --> |Claude| BC[ClaudeAdapter]
    B --> |Grok| BD[GrokAdapter]

    BA --> C[Core Logic 层]
    BB --> C
    BC --> C
    BD --> C

    C --> E[Content Script - 高亮功能]
    C --> F[Copy Enhancer - 复制增强]
    C --> G[Comment Manager - 评论管理]

    E --> H[CSS.highlights API]
    F --> I[Clipboard API]
    G --> J[评论存储]
```

## 平台适配器接口

**核心抽象** - 每个平台必须实现 8 个方法：

```javascript
interface PlatformAdapter {
  // 平台检测
  detectPlatform(): boolean;

  // DOM 元素识别（高亮/复制功能）
  findResponseContainers(): Element[];  // 查找所有 AI 回复容器
  findCopyButtons(): Element[];         // 查找所有复制按钮

  // 业务逻辑验证（高亮/复制功能）
  isValidResponseContainer(element: Element): boolean;  // 验证容器有效性
  getCopyButtonContainer(button: Element): Element;     // 获取按钮对应的容器

  // 🆕 对话导出功能（新增3个方法）
  findUserMessages(): Element[];                    // 查找所有用户消息容器
  extractText(container: Element): string;          // 提取文本内容（HTML→Markdown）
  getPlatformDisplayName(): string;                 // 获取平台显示名称
}
```

**设计原则**：
- 所有平台差异都通过这 8 个方法隔离
- 核心逻辑完全平台无关
- 新平台支持仅需实现适配器（85-120 行代码）
- 对话导出功能复用现有适配器架构，无需重构

## 核心模块

### 1. Content Script (content.js)
**职责**：高亮功能的核心逻辑

- 监听 AI 回复区域内的文本选择
- 使用 CSS.highlights API 应用高亮（支持跨元素）
- 智能降级到传统 DOM 高亮
- Ctrl+点击移除高亮，Ctrl+Z 撤销
- 通过适配器验证 AI 回复容器
- 🆕 监听来自background的导出对话消息（content.js:466-482）

**平台无关性**：✅ 100% 平台无关

### 2. Copy Enhancer (copy-enhancer.js)
**职责**：劫持和增强原生复制功能

- 通过适配器识别 AI 回复的复制按钮
- 监听复制按钮点击事件
- 检测消息容器中的高亮内容
- 获取高亮关联的评论数据
- 生成带 `<highlight comment="">` 标签的增强文本
- 覆写剪贴板内容

**平台依赖性**：仅依赖适配器提供 DOM 元素

### 3. Comment Manager (comment-manager.js)
**职责**：评论功能管理

- 管理高亮文本的评论数据
- 显示 Material Design 风格的评论输入界面
- 处理评论的保存和编辑
- 显示评论指示器（🔖）和工具提示
- 评论数据的内存存储

**平台无关性**：✅ 100% 平台无关

### 4. 🆕 Conversation Exporter (conversation-exporter.js)
**职责**：完整对话导出功能

- 提取当前页面所有用户消息和AI回复
- 按DOM顺序排序消息（使用 `compareDocumentPosition`）
- 配对消息（用户问题 + AI回答 = 一轮对话）
- 格式化为结构化Markdown（轮次、时间戳、平台名称）
- 返回Markdown文本给background.js写入剪贴板
- 错误处理（空页面、未支持平台、单条消息失败）

**核心方法**：
- `export()` - 主入口，协调整个导出流程
- `_extractMessages()` - 提取用户消息和AI回复
- `_sortMessagesByDOM()` - DOM顺序排序
- `_pairMessages()` - 配对为对话轮次
- `_formatMarkdown()` - 格式化为Markdown

**平台依赖性**：依赖适配器的3个新方法
- `findUserMessages()` - 查找用户消息容器
- `extractText()` - 提取文本内容
- `getPlatformDisplayName()` - 获取平台名称

**代码行数**：~230行（含详细注释）

### 5. 🆕 HTML to Markdown Converter (utils/html-to-markdown.js)
**职责**：HTML→Markdown转换封装

- 封装Turndown库，提供统一的转换接口
- 配置Turndown选项（代码块风格、标题风格等）
- 自定义规则：处理代码块的语言标识
- 优雅降级：Turndown不可用时返回原HTML

**核心功能**：
```javascript
function htmlToMarkdown(html) {
  // 创建Turndown实例
  const turndownService = new TurndownService({
    codeBlockStyle: 'fenced',  // 使用 ``` 而非缩进
    headingStyle: 'atx',       // 使用 # 而非下划线
    bulletListMarker: '-',
    hr: '---',
    br: '\n'
  });

  // 自定义代码块规则
  turndownService.addRule('fencedCodeBlock', { ... });

  return turndownService.turndown(html);
}
```

**平台无关性**：✅ 100% 平台无关

**代码行数**：~76行

### 6. 🆕 Turndown Library (libs/turndown.js)
**来源**：第三方库（https://github.com/mixmark-io/turndown）

**选择原因**：
- ✅ 成熟稳定：16.7k stars，8年开发历史
- ✅ 零依赖：无需引入其他库
- ✅ 轻量级：26KB（压缩后）
- ✅ 功能完整：支持代码块、列表、表格等所有Markdown元素

**核心价值**：
- 避免重新造轮子（自己实现HTML→Markdown转换需要数千行代码）
- 完美保留Markdown格式（代码块、列表、加粗等）
- 打破"零依赖"原则的唯一例外（Linus：实用主义优先）

**集成方式**：
- 在manifest.json中先于其他脚本加载
- 暴露全局对象 `TurndownService`
- 通过 `html-to-markdown.js` 封装调用

### 7. Background Script (background.js)
**职责**：扩展后台服务

- 监听扩展图标点击事件（background.js:9-47）
- 发送消息到content script请求导出对话
- 接收导出结果，通过 `chrome.scripting.executeScript` 写入剪贴板
- 显示成功/失败通知

**新增功能**（对话导出相关）：
- 扩展图标点击处理（~99行）
- 剪贴板写入逻辑（executeScript方式，避免content script权限问题）

**平台无关性**：✅ 100% 平台无关

## 数据模型

### 内存中高亮数据存储
```javascript
// window.highlights Map 存储
{
  1: {
    range: Range对象,
    text: "决策树",
    comment: "这个算法很直观",
    timestamp: 1640995200000,
    hasComment: true
  },
  2: {
    range: Range对象,
    text: "神经网络",
    comment: "",
    timestamp: 1640995300000,
    hasComment: false
  }
}
```

### 生成的复制内容格式
```
机器学习中，<highlight comment="这个算法很直观">决策树</highlight>容易理解，
随机森林准确率高，但<highlight>神经网络</highlight>需要更多数据。
```

## 技术决策

### 为什么选择 CSS.highlights API？
- **无 DOM 污染**：不修改页面 HTML 结构，性能更佳
- **跨元素支持**：原生支持复杂文本选择
- **现代化**：Chrome 原生 API，专为高亮场景设计
- **智能降级**：不支持时自动降级到传统 DOM 方法

### 为什么劫持原生复制按钮？
- **用户习惯**：保持原有操作流程，学习成本为零
- **界面简洁**：不添加额外 UI 元素
- **稳定性**：不依赖自定义 UI 的显示/隐藏逻辑
- **未来兼容**：平台 UI 更新时影响最小

### 为什么限制高亮范围在 AI 回复区域？
- **精确定位**：只在有意义的内容区域工作
- **避免误操作**：防止在侧边栏、输入框等地方误触
- **符合使用场景**：用户只需要高亮 AI 的回复内容

### 🆕 为什么引入Turndown库打破"零依赖"原则？
- **实用主义优先**：自己实现HTML→Markdown转换需要数千行代码
- **成熟稳定**：16.7k stars，8年开发历史，零依赖
- **完美保留格式**：代码块、列表、表格等所有Markdown元素
- **符合Linus哲学**："不重新造轮子" - 理论完美不如实用可靠
- **最小依赖原则**：仅引入必要的、成熟的、零依赖的第三方库

## 相关文档

- **核心功能详细说明**：[CORE-FEATURES.md](CORE-FEATURES.md) - 包含完整对话导出功能章节
- **平台适配器开发指南**：[platforms/README.md](platforms/README.md)
- **各平台适配器文档**：[platforms/](platforms/)
- **需求文档**：[requirements.md](requirements.md)
- **任务清单**：[tasks.md](tasks.md)
- **技术验证报告**：[verify.md](verify.md)
- **🆕 对话导出功能**：
  - [conversation-export/requirements.md](../conversation-export/requirements.md) - 需求文档
  - [conversation-export/design.md](../conversation-export/design.md) - 设计文档
  - [conversation-export/tasks.md](../conversation-export/tasks.md) - 任务清单
