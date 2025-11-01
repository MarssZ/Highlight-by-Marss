
## 项目类型
- **Chrome 扩展** (Manifest V3)
- 为 AI 聊天平台提供高亮和评论功能

## 技术栈
- **语言**：原生 JavaScript (ES6+)
- **样式**：CSS (Material Design)
- **核心 API**：CSS.highlights API, Content Scripts, Chrome Extension APIs
- **架构模式**：平台适配器模式 (Platform Adapter Pattern)
- **无构建工具**：直接加载，无需编译
- **第三方库**：[Turndown](https://github.com/mixmark-io/turndown) (HTML→Markdown 转换)

## 本地环境
- **操作系统**：Windows 11
- **工作目录**：`E:\MarssPython\highlight-by-marss`
- **扩展目录**：`highlight-by-marss/` (可直接加载到 Chrome)

## 开发约定
- 使用中文注释和文档
- **最小依赖原则**：仅引入必要的、成熟的、零依赖的第三方库（如 Turndown）
- 零DOM污染：使用 CSS.highlights API 而不是修改 DOM
- 始终保持代码简洁，less is More

## 📁 项目结构（ASCII树形图）

```整体项目结构
工作区根目录/                          # 开发环境
│
├── highlight-by-marss/               # ← Chrome扩展的实际根目录（123KB）     
│   ├── manifest.json                 # ← Chrome识别的入口
│   ├── src/                          # ← 扩展的源代码
│   ├── styles/                       # ← 扩展的样式
│   └── icons/                        # ← 扩展的图标
│
├── docs/                             # 开发文档（不会被打包）
├── specs/                            # 规范文档（不会被打包）
├── .claude/                          # Claude配置（不会被打包）
└── README.md                         # 项目说明（不会被打包）
```

```Chrome插件的详细内容
highlight-by-marss/
├── manifest.json           # Chrome扩展配置
├── src/
│   ├── libs/               # 🆕 第三方库
│   │   └── turndown.js     # 🆕 HTML→Markdown 转换库
│   ├── utils/              # 🆕 工具模块
│   │   └── html-to-markdown.js  # 🆕 HTML→Markdown 包装器
│   ├── platform/           # 平台适配器架构
│   │   ├── platform-adapter.js  # 适配器基础接口
│   │   ├── gemini-adapter.js    # Gemini平台适配器
│   │   ├── claude-adapter.js    # Claude平台适配器
│   │   ├── grok-adapter.js      # Grok平台适配器
│   │   ├── chatgpt-adapter.js   # ChatGPT平台适配器
│   │   └── doubao-adapter.js    # 豆包平台适配器
│   ├── content.js          # 主要逻辑（高亮功能+适配器集成）
│   ├── copy-enhancer.js    # 复制功能增强（按钮识别+智能复制）
│   ├── comment-manager.js  # 评论功能管理（UI+指示器+交互）
│   ├── conversation-exporter.js  # 对话导出功能
│   └── background.js       # 后台脚本
├── styles/
│   ├── content.css         # 高亮样式
│   └── comment.css         # 评论UI样式（Material Design）
└── specs/                  # 📚 规范文档（按模块组织）
    └── highlight-by-marss/
        ├── ARCHITECTURE.md     # 核心架构设计
        ├── CORE-FEATURES.md    # 核心功能详解
        ├── platforms/          # 平台适配器文档
        │   ├── README.md       #     平台开发指南
        │   ├── gemini.md       #     Gemini平台
        │   ├── claude.md       #     Claude平台
        │   ├── grok.md         #     Grok平台（含3个陷阱）
        │   └── chatgpt.md      #     ChatGPT平台
        ├── requirements.md     # 需求文档
        ├── tasks.md           # 任务清单
        └── verify.md          # 技术验证报告

```

## 相关文档

### 核心文档
- **架构设计**: [specs/highlight-by-marss/ARCHITECTURE.md](specs/highlight-by-marss/ARCHITECTURE.md) - 设计原则、核心架构、技术决策
- **核心功能**: [specs/highlight-by-marss/CORE-FEATURES.md](specs/highlight-by-marss/CORE-FEATURES.md) - 高亮、评论、复制功能详解
- **需求文档**: [specs/highlight-by-marss/requirements.md](specs/highlight-by-marss/requirements.md) - 功能需求和验收标准

### 平台适配
- **开发指南**: [specs/highlight-by-marss/platforms/README.md](specs/highlight-by-marss/platforms/README.md) - 标准开发流程、陷阱清单
- **Grok平台**: [specs/highlight-by-marss/platforms/grok.md](specs/highlight-by-marss/platforms/grok.md) - **必读！包含3个关键陷阱**
- **其他平台**: [specs/highlight-by-marss/platforms/](specs/highlight-by-marss/platforms/) - Gemini、Claude、ChatGPT 等

### 其他
- **技术验证**: [specs/highlight-by-marss/verify.md](specs/highlight-by-marss/verify.md) - API验证、平台测试结果
- **任务清单**: [specs/highlight-by-marss/tasks.md](specs/highlight-by-marss/tasks.md) - 开发进度跟踪 