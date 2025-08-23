# AI Highlight Assistant - 渐进式实现任务清单（含评论功能）

## 阶段1：基础架构 - 立即可见

- [x] 1. 创建最小Chrome扩展
  - 需求：REQ-3.1 自动激活高亮功能
  - 文件：`manifest.json`, `src/content.js`
  - 验证：**已完成** - 在Chrome扩展管理页面看到扩展加载成功，在Gemini页面控制台看到"AI Highlight Assistant loaded"消息

- [x] 2. 实现基础文本高亮功能
  - 需求：REQ-1.2 高亮显示选中文本
  - 文件：`src/content.js`（扩展）
  - 验证：**已完成** - 在Gemini页面选中任意文本，文本立即变成黄色背景
  
  - [x] 2.1 监听文本选择事件
    - document.addEventListener('mouseup')
  - [x] 2.2 应用高亮样式
    - 用span包装，添加background-color: yellow

## 阶段2：高亮控制优化 - 已完成

- [x] 3. **已跳过** - 右键菜单功能（用户反馈：多此一举）
  - 理由：选中即高亮更直观，右键菜单增加操作复杂度

- [x] 4. 实现CSS.highlights API高亮功能  
  - 需求：REQ-1.2 支持跨元素文本高亮
  - 文件：`src/content.js`（重构）
  - 验证：**已完成** - 支持跨越多个元素的复杂文本选择，无DOM污染

- [x] 5. 实现Ctrl+点击取消高亮功能
  - 需求：REQ-1.3 精确移除高亮
  - 文件：`src/content.js`（扩展）
  - 验证：**已完成** - Ctrl+单击黄色高亮文本移除，避免误触

## 阶段3：增强现有复制功能 - 无需新UI

- [x] 6. 识别并监听Gemini现有的复制按钮
  - 需求：REQ-2.1 劫持现有复制功能
  - 文件：`src/copy-enhancer.js`
  - 验证：**已完成** - 精确识别AI回复复制按钮，成功监听点击事件

- [x] 7. 实现智能复制逻辑 + 修复高亮范围限制
  - 需求：REQ-2.2, REQ-2.4 检测高亮并生成带标签内容
  - 文件：`src/copy-enhancer.js`（扩展）, `src/content.js`（修复）
  - 验证：**已完成** - 点击有高亮的AI回复复制按钮，粘贴时看到带`<highlight>`标签的内容
  - 修复：限制高亮功能仅在AI回复区域内生效
  - **需要升级**：任务9将更新此功能以支持评论格式

## 阶段4：评论功能 - 按用户价值优先级 🆕

### 4A. 最小可见功能 - 立即可见的UI效果

- [x] 8. 点击高亮显示评论输入
  - 需求：REQ-3.1 点击高亮文本显示输入框
  - 文件：`src/content.js`（简单扩展）
  - 验证：**已完成** - 点击高亮文本→弹出prompt输入框→输入评论→控制台显示评论内容
  - **MVP方案**：使用prompt输入，后续美化
  - **重要修复**：添加300ms防误触机制，避免划词高亮后立即触发评论

### 4B. 核心交互 - 评论的核心价值循环

- [x] 9. 实现评论复制集成（核心价值）
  - 需求：REQ-3.5 复制时包含评论信息  
  - 文件：`src/copy-enhancer.js`（扩展），`src/content.js`（评论存储）
  - 验证：**已完成** - 高亮文本→点击添加评论→点击复制按钮→粘贴看到`<highlight comment="评论">文本</highlight>`
  - **核心价值**：用户能立即体验完整的评论工作流
  - **关键特性**：XML安全转义、智能文本排序、有无评论自动识别

- [x] 10. 美化评论输入界面
  - 需求：REQ-3.1 改善用户体验
  - 文件：`src/comment-manager.js`（新建），`styles/comment.css`（新建）
  - 验证：**已完成** - 点击高亮→显示美观的浮动输入框→保存评论→体验更好
  - **价值提升**：从prompt升级为专业UI
  - **设计优化**：简洁标题设计，直接显示截断的高亮内容 `🔖 高亮文本...`

### 4C. 交互完善 - 更好的用户体验

- [x] 11. 评论可见性指示器
  - 需求：REQ-3.3 显示评论指示器
  - 文件：`src/comment-manager.js`（扩展）
  - 验证：**已完成** - 有评论的高亮文本显示🔖书签图标，内联跟随高亮文本
  - **体验优化**：用户能一眼看出哪些高亮有评论
  - **关键修复**：从固定定位改为内联插入，避免滚动时"飘走"
  - **视觉优化**：使用🔖书签图标替代💬，提升白色背景下的可见度

- [x] 12. 评论悬停显示
  - 需求：REQ-3.4 悬停显示评论内容
  - 文件：`src/comment-manager.js`（扩展）
  - 验证：**已完成** - 鼠标悬停🔖指示器→显示实际评论内容→移开消失
  - **便捷查看**：不需点击就能快速查看评论内容
  - **智能截断**：评论超过100字符自动截断，保持UI整洁
  - **交互优化**：悬停格式为`🔖 评论内容`，点击可编辑

## 🎉 MVP核心功能已完成（高亮部分）

基础高亮功能（高亮、控制、智能复制）都已实现并验证通过！

## 🎉 评论核心功能已完成！

### 已完成功能
- ✅ **阶段4A**：最小可见功能 - 点击高亮显示评论输入
  - 用户可以点击高亮文本添加评论
  - 使用prompt输入框，评论数据存储到内存
  - 防误触机制，避免划词高亮后立即触发评论

- ✅ **阶段4B**：核心价值循环 - 评论复制集成
  - 复制时自动包含评论：`<highlight comment="评论">文本</highlight>`
  - 智能识别有无评论，生成对应格式
  - XML安全转义，支持特殊字符
  - **专业UI升级**：Material Design风格浮动对话框
  - **简洁设计**：标题直接显示高亮内容，智能文本截断
  - **完整交互**：键盘快捷键、点击外部关闭、成功提示

**🎉 完整评论系统已实现：** 从基础功能到专业UI，用户体验达到产品级水准！

### ✅ 视觉增强功能已完成！
- ✅ **任务11**：评论指示器 - 🔖书签图标，内联跟随，修复定位问题
- ✅ **任务12**：悬停显示 - 实际评论内容，智能截断，优化交互

**🎉 阶段4C交互完善全部完成！** 评论功能从核心到细节都已达到产品级水准

---

# 阶段5：多平台架构重构 🚀

## 设计原则
- **Never break userspace** - Gemini用户体验完全不变
- **渐进式重构** - 每步可验证，可回滚  
- **Console输出验证** - 架构任务通过具体Console输出验证

## 5A. 平台适配器基础架构

- [ ] 20. 创建平台适配器基础接口
  - 需求：REQ-4.1 建立平台抽象层
  - 文件：`src/platform/platform-adapter.js`（新建）
  - 验证：F12控制台显示 "Platform adapter interface loaded"
  
  - [ ] 20.1 定义适配器接口规范
    - 5个核心方法：detectPlatform, findResponseContainers, findCopyButtons, isValidResponseContainer, getCopyButtonContainer
  - [ ] 20.2 添加适配器工厂模式
    - 动态检测和加载对应平台适配器

- [ ] 21. 实现Gemini平台适配器
  - 需求：REQ-4.2 封装现有Gemini逻辑
  - 文件：`src/platform/gemini-adapter.js`（新建）
  - 验证：控制台输出 "GeminiAdapter loaded: detected hostname gemini.google.com"
  
  - [ ] 21.1 提取现有DOM选择器逻辑
    - 将content.js中的isAIResponseContainer逻辑迁移
  - [ ] 21.2 提取复制按钮识别逻辑  
    - 将copy-enhancer.js中的按钮查找逻辑迁移
  - [ ] 21.3 验证适配器方法返回正确结果
    - 控制台输出找到的容器和按钮数量

- [ ] 22. 重构核心逻辑使用适配器
  - 需求：REQ-4.3 解除平台硬编码依赖
  - 文件：`src/content.js`（重构），`src/copy-enhancer.js`（重构）
  - 验证：功能完全正常 + 控制台显示 "Using platform adapter: GeminiAdapter"
  
  - [ ] 22.1 修改content.js调用适配器接口
    - 替换isAIResponseContainer为adapter.isValidResponseContainer
  - [ ] 22.2 修改copy-enhancer.js调用适配器接口
    - 替换hardcode选择器为adapter方法调用
  - [ ] 22.3 确保所有现有功能完全正常
    - Gemini平台所有高亮、评论、复制功能不受影响

## 5B. 新平台支持

- [ ] 23. 实现ChatGPT平台适配器
  - 需求：REQ-5.1 支持ChatGPT平台
  - 文件：`src/platform/chatgpt-adapter.js`（新建）
  - 验证：在chat.openai.com控制台显示 "ChatGPTAdapter loaded: found X response containers, Y copy buttons"
  
  - [ ] 23.1 实现ChatGPT DOM选择器
    - 查找[data-message-author-role="assistant"]容器
  - [ ] 23.2 实现ChatGPT复制按钮识别
    - 识别复制按钮特征和位置关系
  - [ ] 23.3 测试基础高亮功能
    - 在ChatGPT页面选中AI回复文本能正常高亮

- [ ] 24. 实现Claude平台适配器  
  - 需求：REQ-5.1 支持Claude平台
  - 文件：`src/platform/claude-adapter.js`（新建）
  - 验证：在claude.ai控制台显示 "ClaudeAdapter loaded: found X response containers, Y copy buttons"
  
  - [ ] 24.1 实现Claude DOM选择器
    - 根据Claude页面结构识别AI回复区域
  - [ ] 24.2 实现Claude复制按钮识别
    - 识别Claude特有的复制按钮样式
  - [ ] 24.3 测试基础高亮功能
    - 在Claude页面选中AI回复文本能正常高亮

## 5C. 平台检测与配置

- [ ] 25. 更新Chrome扩展配置支持多域名
  - 需求：REQ-4.4 扩展权限配置
  - 文件：`manifest.json`（修改）
  - 验证：扩展能在gemini.google.com, chat.openai.com, claude.ai三个域名自动激活
  
  - [ ] 25.1 添加多域名匹配规则
    - content_scripts添加ChatGPT和Claude域名
  - [ ] 25.2 确保权限最小化原则
    - 只请求必要的域名权限

- [ ] 26. 实现智能平台检测和初始化
  - 需求：REQ-4.1 自动平台识别
  - 文件：`src/content.js`（扩展）
  - 验证：控制台显示 "Platform detected: [platform-name], initializing [AdapterName]"
  
  - [ ] 26.1 平台检测优先级逻辑
    - 按域名准确匹配对应适配器
  - [ ] 26.2 适配器加载失败降级处理
    - 控制台警告 + 尝试通用检测逻辑
  - [ ] 26.3 初始化完整性验证
    - 确保适配器方法都正常工作

## 验证重点

### Gemini平台验证（零破坏性）
- ✅ 所有现有功能完全正常
- ✅ 性能无退化  
- ✅ 用户体验无变化
- ✅ Console显示适配器信息

### 新平台验证
- ✅ 基础高亮功能正常
- ✅ 复制按钮正确识别
- ✅ AI回复区域准确限制
- ✅ Console输出检测结果

## 后续增强功能（可选）

### 数据持久化功能（评论功能稳定后再考虑）

- [ ] 13. 实现存储数据结构（高亮+评论）
  - 需求：REQ-1.4, REQ-3.6 页面刷新保持高亮和评论
  - 文件：`src/storage.js`
  - 验证：高亮和评论数据后，Chrome扩展存储中看到保存的完整数据

- [ ] 14. 实现页面加载时恢复高亮和评论
  - 需求：REQ-1.4, REQ-3.6 保持完整状态
  - 文件：`src/restore.js`
  - 验证：高亮+评论→刷新页面→高亮和评论效果依然存在

- [ ] 15. 优化存储键生成逻辑
  - 需求：数据可靠性
  - 文件：`src/storage.js`（优化）
  - 验证：在不同Gemini对话中高亮评论，数据不会互相干扰

### 稳定性增强功能

- [ ] 16. 添加动态内容监听优化
  - 需求：处理动态加载的AI回复
  - 文件：`src/content.js`, `src/comment-manager.js`（MutationObserver优化）
  - 验证：在长对话中新生成的AI回复也能正常高亮、评论和复制

- [ ] 17. 实现错误处理和降级
  - 需求：稳定性保证
  - 文件：`src/error-handler.js`
  - 验证：在异常情况下功能降级但不崩溃

### 用户体验增强功能

- [ ] 18. 添加评论快捷键支持
  - 需求：快速操作
  - 文件：`src/comment-manager.js`（扩展）
  - 验证：选中高亮文本后按快捷键快速添加评论

- [ ] 19. 实现评论模板功能
  - 需求：提高效率
  - 文件：`src/comment-templates.js`
  - 验证：可以选择预设的评论模板快速添加

## 每步验证方法

### 阶段1验证
- ✅ 打开Chrome扩展管理页面 → 看到扩展已加载
- ✅ 访问gemini.google.com → F12控制台看到初始化消息
- ✅ 选中页面任意文本 → 立即变黄色

### 阶段2验证  
- ✅ 选中简单文本 → 立即变黄色高亮
- ✅ 选中跨元素复杂文本 → 正常高亮（解决surroundContents错误）
- ✅ Ctrl+单击高亮文本 → 高亮消失
- ✅ Ctrl+Z快捷键 → 撤销最后一个高亮
- ✅ 普通点击高亮文本 → 不受影响（避免误触）

### 阶段3验证 ✅ 已完成
- ✅ 识别AI回复现有复制按钮 → 控制台显示找到的按钮数量
- ✅ 高亮AI回复文本 → 不改变页面UI
- ✅ 点击AI回复的复制按钮 → 控制台显示"Copy button clicked"
- ✅ 点击AI回复的复制按钮（有高亮）→ 粘贴板中有带`<highlight>`标签的内容
- ✅ 点击AI回复的复制按钮（无高亮）→ 粘贴板中是普通文本
- ✅ 修复：只能在AI回复区域内高亮，不能在页面其他位置高亮

### 阶段4验证 🆕 按用户价值优先级测试

**4A验证 - 最小可见功能** ✅ 已完成
- [x] 点击高亮文本 → 弹出prompt输入框
- [x] 输入评论文字并确认 → 控制台显示评论内容
- [x] 刚完成高亮后立即点击 → 不误触评论（300ms保护期）

**4B验证 - 核心价值循环** ✅ 完整功能已完成
- [x] 高亮文本→添加评论→点击复制 → 粘贴出`<highlight comment="评论">文本</highlight>`
- [x] 高亮文本（无评论）→点击复制 → 粘贴出`<highlight>文本</highlight>`
- [x] XML特殊字符正确转义 → 评论包含引号、尖括号等不会破坏格式
- [x] 点击高亮→美观浮动输入框 → Material Design风格专业UI
- [x] 智能定位和键盘支持 → Ctrl+Enter保存，Escape取消，点击外部关闭
- [x] 简洁设计优化 → 标题直接显示高亮内容，减少冗余信息

**4C验证 - 交互完善** ✅ 已完成
- [x] 有评论的高亮文本 → 显示🔖书签指示器，内联跟随文本
- [x] 鼠标悬停🔖指示器 → 显示实际评论内容工具提示
- [x] 鼠标移开 → 工具提示消失
- [x] 指示器跟随滚动 → 修复定位问题，不再"飘走"
- [x] 点击🔖指示器 → 可直接编辑评论内容

**通用验证** ✅ 已完成
- [x] Ctrl+点击带评论的高亮 → 同时删除高亮和评论
- [x] 再次点击已有评论的高亮 → 可以编辑评论内容
- [x] 点击🔖指示器 → 同样可以编辑评论内容（双重入口）

## 当前项目结构（含评论功能）

```
ai-highlight-assistant/
├── manifest.json           # Chrome扩展配置
├── src/
│   ├── content.js         # 主要逻辑（高亮功能+范围限制）
│   ├── background.js      # 后台脚本（预留）
│   ├── copy-enhancer.js   # 复制功能增强（按钮识别+智能复制+评论）
│   └── comment-manager.js # 🆕 评论功能管理（输入框+存储+显示）
└── styles/
    ├── content.css        # 高亮样式
    └── comment.css        # 🆕 评论UI样式
```

### 可选增强文件（后续功能）
```
├── src/
│   ├── storage.js         # 存储管理（持久化）
│   ├── restore.js         # 恢复逻辑（持久化）
│   └── error-handler.js   # 错误处理（稳定性）
```