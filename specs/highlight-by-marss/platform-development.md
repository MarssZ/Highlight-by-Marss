# 平台适配开发标准流程

## 基于Grok平台开发经验制定的标准化流程

---

## 开发时间分配原则

- **60%** - DOM结构深度分析
- **30%** - 标准化代码实现  
- **10%** - 调试和验证

> "在编写第一行适配器代码之前，必须完全理解目标平台的DOM层次结构" - 来自Grok适配开发的教训

---

## 阶段1：DOM结构分析（60%时间）

### 1.1 获取完整DOM结构
- 访问目标平台，进行完整对话（至少2轮问答）
- 使用浏览器开发工具导出完整HTML结构
- 创建 `dom_[platform].md` 文件保存结构

### 1.2 基础元素统计
在浏览器控制台运行：
```javascript
console.log('=== 基础结构统计 ===');
console.log('Message bubbles:', document.querySelectorAll('.message-bubble, .message, [class*="message"]').length);
console.log('Action buttons:', document.querySelectorAll('.action-buttons, .actions, [class*="action"]').length);  
console.log('Copy buttons:', document.querySelectorAll('button[aria-label*="复制"], button[aria-label*="Copy"], button[title*="copy"]').length);
console.log('All buttons:', document.querySelectorAll('button').length);

// 显示前10个按钮的标识
Array.from(document.querySelectorAll('button')).slice(0, 10).forEach((btn, i) => {
    const label = btn.getAttribute('aria-label') || btn.getAttribute('title') || btn.textContent.trim();
    if (label) console.log(`  按钮${i+1}: ${label}`);
});
```

### 1.3 用户vs AI消息区分
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

### 1.4 DOM层次关系图
绘制关键元素的层次结构：
```
平台根容器
├── 对话容器1
│   ├── 用户消息bubble
│   └── 用户操作按钮区域
├── 对话容器2
│   ├── AI消息bubble
│   └── AI操作按钮区域
└── ...
```

### 1.5 验证预期数量
- 确认实际AI回复数量
- 确认每个AI回复的复制按钮数量
- 识别可能的干扰元素（广告、提示等）

---

## 阶段2：适配器开发（30%时间）

### 2.1 使用标准模板
复制 `docs/platform-adapter-guide.md` 中的代码模板

### 2.2 核心方法实现顺序
1. **detectPlatform()** - 简单域名检查
2. **findResponseContainers()** - 基于action-buttons反向查找
3. **findCopyButtons()** - 复用容器查找逻辑
4. **isValidResponseContainer()** - 与findResponseContainers相同逻辑  
5. **getCopyButtonContainer()** - 与isValidResponseContainer相同逻辑

### 2.3 关键实现原则
- **统一逻辑**：所有方法使用相同的"共同父容器查找"模式
- **AI区分**：必须区分用户消息和AI回复
- **向上遍历**：从子元素向上查找，不假设直接父子关系
- **双重验证**：同时检查message-bubble和action-buttons存在

---

## 阶段3：调试验证（10%时间）

### 3.1 分层调试策略
```javascript
// 1. 基础统计验证
const adapter = new PlatformAdapter();
console.log('适配器测试结果:', adapter.testAdapterMethods());

// 2. 逐个方法验证
console.log('Container count:', adapter.findResponseContainers().length);
console.log('Button count:', adapter.findCopyButtons().length);

// 3. 关联性测试
const containers = adapter.findResponseContainers();
const buttons = adapter.findCopyButtons();
buttons.forEach((btn, i) => {
    const container = adapter.getCopyButtonContainer(btn);
    console.log(`按钮${i+1} -> 容器:`, !!container);
});
```

### 3.2 功能验证清单
- [ ] 高亮功能：选中AI回复文本 → 立即变黄
- [ ] 评论功能：点击高亮 → 弹出输入框 → 保存成功
- [ ] 复制功能：点击复制 → 粘贴带`<highlight>`标签内容

### 3.3 数量验证
- [ ] 适配器容器数 = 实际AI回复数
- [ ] 适配器按钮数 = 实际AI复制按钮数  
- [ ] 不会误选用户消息按钮

---

## 常见陷阱检查清单

### DOM结构陷阱
- [ ] 是否假设了错误的父子关系？
- [ ] 是否基于DOM片段而非完整页面分析？
- [ ] 共同父容器位置是否正确识别？

### 消息类型陷阱
- [ ] 用户消息和AI回复是否正确区分？
- [ ] 布局方向（左对齐vs右对齐）是否考虑？
- [ ] 宽度限制（全宽vs限制宽度）是否检查？

### 逻辑一致性陷阱
- [ ] isValidResponseContainer和getCopyButtonContainer是否使用相同逻辑？
- [ ] findResponseContainers和findCopyButtons是否基于相同原理？
- [ ] 是否存在特殊情况需要消除？

---

## 质量保证标准

### 代码质量
- 所有方法共享核心逻辑，避免重复实现
- 清理调试信息，只保留最终统计结果
- 使用一致的变量命名和注释风格

### 功能完整性
- 3个核心流程必须全部通过
- 边界情况测试（跨元素选择、滚动等）
- 与其他平台适配器行为一致

### 文档完整性
- 更新 `tasks.md` 记录开发过程和经验
- 创建 DOM结构分析文档
- 添加平台特定的验证要点

---

## 文件组织结构

新平台开发应创建/更新的文件：
```
├── dom_[platform].md          # DOM结构分析
├── src/platform/[platform]-adapter.js  # 适配器实现
├── specs/highlight-by-marss/
│   ├── tasks.md              # 更新开发记录
│   └── verify.md             # 添加验证要点
└── manifest.json             # 添加域名权限
```

---

## 成功标准

当满足以下所有条件时，平台适配开发完成：

1. **功能标准**：3个核心流程完全正常
2. **质量标准**：代码遵循统一模式，无重复逻辑
3. **数量标准**：适配器识别数量与实际页面完全匹配
4. **一致标准**：与现有平台行为保持一致
5. **文档标准**：开发过程和经验得到完整记录

记住：**慢就是快，快就是慢**。前期分析投入越多，后期调试时间越少！