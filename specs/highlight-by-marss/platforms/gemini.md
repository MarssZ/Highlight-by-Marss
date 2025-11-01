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
- **🆕 引用标记清理** - 自动清除 Gemini 的 `[cite_start]` 和 `[cite: X]` 标记

## 平台特殊挑战

### 引用标记污染问题 🆕

**问题描述**：

Gemini 平台在用户复制 AI 回复时，会自动插入引用标记，严重破坏内容格式：

**插入的标记**：
- `[cite_start]` - 标记引用内容的开始
- `[cite: 1]` 或 `[cite: 1, 2, 3]` - 引用来源的编号

**实际影响示例**：

```
原始 AI 回复：
这是一个关于 Python 的代码示例：

```python
def hello():
    print("Hello, World!")
    return True
```

Gemini 原生复制结果（格式被破坏）：
这是一个关于 Python 的代码示例：[cite_start][cite: 1]```pythondef hello():    print("Hello, World!")    return True```
```

**问题根源**：
- ❌ 引用标记插入到文本中，破坏可读性
- ❌ 代码块格式被压缩成一行（换行符丢失）
- ❌ 列表缩进结构丢失
- ❌ 段落分隔符消失

---

**解决方案**：

采用 **双层清理策略**，确保从两个层面彻底清除引用标记：

#### 1. 剪贴板级别清理

**文件**：`src/copy-enhancer.js`

**时机**：在读取剪贴板内容后立即清理

**代码实现**：
```javascript
function cleanGeminiCitations(text) {
  if (!text) return text;

  // 删除 [cite_start] 标记
  let cleaned = text.replace(/\[cite_start\]/g, '');

  // 删除 [cite: X] 标记（只删除标记本身，不删除周围的空白）
  cleaned = cleaned.replace(/\[cite:\s*[\d,\s]+\]/g, '');

  // 只清理连续的空格（不包括换行符）
  cleaned = cleaned.replace(/ {1,}/g, ' ');

  return cleaned;
}
```

**关键设计**：
- ✅ 正则表达式 `/\[cite:\s*[\d,\s]+\]/g` 精准匹配 `[cite: 1]` 和 `[cite: 1, 2, 3]`
- ✅ 只清理连续空格，**不触碰换行符 `\n` 和制表符 `\t`**
- ✅ 保留所有代码块、列表、段落格式

#### 2. DOM 级别清理

**文件**：`src/platform/gemini-adapter.js`

**时机**：在克隆容器后、提取 textContent 之前

**代码实现**：
```javascript
cleanClonedContainer(clonedContainer) {
  if (!clonedContainer) return;

  // 策略1: 删除 data-turn-source-index 属性，阻止CSS伪元素渲染
  const sups = clonedContainer.querySelectorAll('sup[data-turn-source-index]');
  sups.forEach(sup => sup.removeAttribute('data-turn-source-index'));

  // 策略2: 删除末尾的引用链接芯片
  const carousels = clonedContainer.querySelectorAll('sources-carousel-inline');
  carousels.forEach(carousel => carousel.remove());
}
```

**清理目标**：
- `<sup data-turn-source-index="1">` - 上标引用编号元素
- `<sources-carousel-inline>` - 末尾的引用来源链接

---

**常见陷阱与最佳实践**：

⚠️ **错误做法**（会破坏格式）：
```javascript
// ❌ 这会删除所有空白字符，包括换行符和制表符！
text.replace(/\s+/g, ' ')

// ❌ 这会删除引用标记前的换行符！
text.replace(/\s*\[cite:\s*[\d,\s]+\]/g, '')
```

✅ **正确做法**（只删除标记）：
```javascript
// ✅ 只删除标记本身，不动换行符
text.replace(/\[cite:\s*[\d,\s]+\]/g, '')

// ✅ 只清理连续空格，不动换行符
text.replace(/ {1,}/g, ' ')
```

---

**验证标准**：

测试用例：复制包含代码块的 AI 回复

| 测试项 | 验证方法 | 预期结果 |
|--------|----------|----------|
| 引用标记清除 | 搜索 `[cite` | ✅ 无任何 `[cite_start]` 或 `[cite: X]` |
| 代码块格式 | 检查换行符 | ✅ 保留所有 `\n` 换行符 |
| 代码缩进 | 检查制表符/空格 | ✅ 保留所有缩进 |
| 列表结构 | 检查段落分隔 | ✅ 保留所有段落换行 |

**实际验证命令**（在控制台）：
```javascript
// 复制 AI 回复后，执行：
navigator.clipboard.readText().then(text => {
  console.log('引用标记数量:', (text.match(/\[cite/g) || []).length); // 应为 0
  console.log('换行符数量:', (text.match(/\n/g) || []).length);      // 应 > 0
  console.log('前100字符:', text.substring(0, 100));
});
```

---

**开发时间线**：
- **问题发现**：2024-11 用户反馈复制代码块格式错乱
- **根因分析**：定位到 `replace(/\s+/g, ' ')` 删除了换行符
- **解决方案**：精准正则匹配 + 双层清理策略
- **验证完成**：所有格式保留，引用标记完全清除

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
