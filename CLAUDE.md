## 相关文档
none
- url: 
- why: 

## 项目架构
2507-lark-calendar-timestamp/
├── specs/               # 功能规格文档
│   └── feishu-calendar-timestamp/  # 飞书日历时间戳功能文档集
│       ├── requirements.md            # 需求文档
│       ├── design.md                  # 设计文档
│       ├── api-research.md            # API验证文档
│       ├── oauth-authorization-code-verification.md  # OAuth授权验证
│       ├── oauth-verification-report.md             # OAuth验证报告
│       └── tasks.md                   # 任务清单
├── src/                 # 核心业务代码
│   ├── step1_get_user_access_token.py # 基于授权码获取用户访问令牌
│   ├── step2_calendars_subscription.py # 日历订阅相关功能
│   ├── step3_calender_event_details.py # 日历事件详情处理
│   ├── step4_calendars_update.py       # 事件更新功能
│   ├── timestamp.py                    # 时间戳管理器 - 生成和添加创建时间戳
│   └── token_manager.py                # Token管理器
├── examples/            # 示例代码
│   ├── README.md       # 示例说明文档
│   ├── get_token.py    # 获取token示例
│   └── oauth_authorization_demo.py  # OAuth授权演示
├── tests/              # 单元测试
│   └── __init__.py     # 测试包初始化
├── docs/               # 项目文档
│   ├── builder_art.html # 构建艺术页面
│   ├── 获取 user_access_token - 服务端 API - 开发文档 - 飞书开放平台.md
│   └── 刷新 user_access_token - 服务端 API - 开发文档 - 飞书开放平台.md
├── main.py             # 主程序入口
├── pyproject.toml      # UV包管理器配置文件
├── requirements.txt    # 依赖包列表
├── uv.lock            # UV锁定文件
├── README.md          # 项目说明文档
├── CLAUDE.md          # Claude AI指令文档
├── LICENSE            # 许可证文件
└── 通鉴镜.md           # 项目相关文档

### 核心组件说明

**主要脚本：**
- `main.py` - 主程序入口，日历事件监听和时间戳添加服务
- `step1_get_user_access_token.py` -    基于授权码获取用户访问令牌
- `step2_calendars_subscription.py` - 日历订阅功能
- `step3_calender_event_details.py` - 日历事件详情处理
- `step4_calendars_update.py` - 事件更新功能
- `timestamp.py` - 时间戳管理器，生成和添加创建时间戳
- `token_manager.py` - Token管理器

## 本地环境信息
- **操作系统**：Windows11
- **Python版本**：3.12.9
- **工作目录**：E:\MarssPython\2507-lark-calendar-timestamp
- **项目结构**：`specs/{功能名称}/` 目录存放规范文档

## 开发约定
- 使用中文注释和文档
- 代码文件统一使用UTF-8编码
- 项目采用模块化结构
- **包管理器**：使用 uv 而不是 pip 管理Python依赖
- 始终保持代码简洁，less is More

## 编程原则
- 写代码时应遵循快速失败原则 ：任何异常情况都会立即抛出具体的错误，而不是静默处理