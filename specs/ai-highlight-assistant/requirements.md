# 需求文档

## 介绍

AI Highlight Assistant 是一个Chrome浏览器扩展，旨在增强用户与AI聊天平台的交互体验。该插件允许用户高亮AI回复中的关键内容，并在后续对话中自动引用这些高亮部分，让AI能够理解用户的关注点。

核心价值：减少重复引用的手动输入，让对话更聚焦于用户关注的特定内容。

## 架构演进

**阶段1 - MVP已完成：** 在Gemini平台(gemini.google.com)完成核心功能，验证可行性 ✅
**阶段2 - 多平台扩展：** 重构为平台适配器架构，支持ChatGPT、Claude、Grok等主流平台 🔄

## 支持平台规划

**优先级1（立即支持）：**
- ✅ Gemini (gemini.google.com) - 已完成
- 🎯 ChatGPT (chat.openai.com) - 目标平台
- 🎯 Claude (claude.ai) - 目标平台

**优先级2（后续扩展）：**
- Grok (grok.x.ai)
- Perplexity (perplexity.ai)
- 其他AI平台

## 需求

### 需求1：文本高亮功能
**用户故事：** 作为AI聊天用户，我希望能够高亮AI回复中的重要文本，以便标记和后续引用关键信息

#### 验收标准
1. WHEN 用户在AI回复中选择文本并点击右键 THEN 系统 SHALL 显示"高亮选中文本"选项
2. WHEN 用户选择高亮选项 THEN 系统 SHALL 将选中文本以黄色背景高亮显示
3. IF 用户在已高亮文本上点击 THEN 系统 SHALL 提供取消高亮选项
4. WHEN 页面刷新 THEN 系统 SHALL 保持之前的高亮状态

### 需求2：高亮内容复制引用
**用户故事：** 作为用户，我希望能够复制包含高亮标记的AI回复内容，以便在新的提问中引用

#### 验收标准
1. WHEN 存在高亮内容 THEN 系统 SHALL 显示"复制高亮内容"按钮
2. WHEN 用户点击"复制高亮内容"按钮 THEN 系统 SHALL 将包含高亮标签的原文复制到剪贴板
3. WHEN 复制高亮内容 THEN 系统 SHALL 保持原文的完整结构和上下文
4. WHEN 复制高亮内容 THEN 格式 SHALL 为：
   - 无评论的高亮：`<highlight>高亮文本</highlight>`
   - 有评论的高亮：`<highlight comment="用户评论">高亮文本</highlight>`
   - 示例："原文内容包含<highlight comment="这很重要">关键信息</highlight>的完整句子"

### 需求3：高亮文本评论功能
**用户故事：** 作为用户，我希望能对高亮的文本添加个人评论，以便记录我对这段内容的思考和理解

#### 验收标准
1. WHEN 用户点击已高亮的文本 THEN 系统 SHALL 显示评论输入框
2. WHEN 用户在评论框中输入文字并保存 THEN 系统 SHALL 将评论与该高亮文本关联存储
3. WHEN 高亮文本存在评论 THEN 系统 SHALL 在高亮文本旁显示评论指示器（如小图标）
4. WHEN 用户将鼠标悬停在有评论的高亮文本上 THEN 系统 SHALL 显示评论内容的工具提示
5. WHEN 用户复制高亮内容 THEN 系统 SHALL 包含评论信息，格式为：`<highlight comment="用户评论">高亮文本</highlight>`
6. WHEN 页面刷新 THEN 系统 SHALL 保持高亮文本及其关联的评论

### 需求4：平台适配器架构
**用户故事：** 作为开发者，我希望能够轻松扩展到新的AI平台，而不需要修改核心高亮逻辑

#### 验收标准
1. WHEN 系统检测到支持的AI平台 THEN 系统 SHALL 自动加载对应的平台适配器
2. WHEN 平台适配器加载完成 THEN 系统 SHALL 正确识别该平台的AI回复区域和复制按钮
3. WHEN 添加新平台支持 THEN 开发者 SHALL 只需实现平台适配器接口，无需修改核心逻辑
4. WHEN 平台适配器初始化失败 THEN 系统 SHALL 降级到通用检测逻辑并记录警告

#### 平台适配器接口规范
每个平台适配器必须实现以下方法：
```javascript
interface PlatformAdapter {
  detectPlatform(): boolean;           // 检测是否为目标平台
  findResponseContainers(): Element[]; // 查找AI回复容器
  findCopyButtons(): Element[];        // 查找复制按钮
  isValidResponseContainer(element: Element): boolean; // 验证容器有效性
  getCopyButtonContainer(button: Element): Element;    // 获取复制按钮对应的消息容器
}
```

### 需求5：多平台兼容性
**用户故事：** 作为用户，我希望在不同AI平台都能使用相同的高亮和评论功能

#### 验收标准
1. WHEN 用户访问支持的AI平台 THEN 系统 SHALL 自动激活高亮和评论功能
2. WHEN 用户在不同平台间切换 THEN 功能体验 SHALL 保持一致
3. WHEN 平台DOM结构发生变化 THEN 系统 SHALL 通过适配器隔离影响，核心功能不受影响
4. WHEN 新增平台支持 THEN 用户 SHALL 无需重新配置或学习新操作

