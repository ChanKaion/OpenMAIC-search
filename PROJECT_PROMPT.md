# OpenMAIC 项目描述

## 项目概述

**OpenMAIC** (Open Multi-Agent Interactive Classroom) 是一个开源的AI互动课堂平台，能够将任何主题或文档转化为丰富的互动学习体验。该项目基于多智能体协作引擎，可以自动生成演示幻灯片、测验、交互式模拟实验和项目制学习活动，由AI教师和AI同学进行语音讲解、白板绘图，并与用户展开实时讨论。

### 核心特性

- **一键生成课堂** - 描述一个主题或附上学习材料，AI几分钟内构建完整课堂
- **多智能体课堂** - AI老师和智能体同学实时授课、讨论、互动
- **丰富的场景类型** - 幻灯片、测验、HTML交互式模拟、项目制学习（PBL）
- **白板&语音** - 智能体实时绘制图表、书写公式、语音讲解
- **灵活导出** - 下载可编辑的`.pptx`幻灯片或交互式`.html`网页
- **OpenClaw集成** - 通过AI助手在飞书、Slack、Telegram等20+聊天应用中直接生成课堂

## 技术栈

### 前端框架
- **Next.js 16** - React框架，使用App Router
- **React 19** - UI框架
- **TypeScript 5** - 类型安全
- **Tailwind CSS 4** - 样式框架
- **Zustand** - 状态管理

### AI & 机器学习
- **LangGraph 1.1** - 多智能体编排
- **Vercel AI SDK** - AI流式生成
- **@ai-sdk/anthropic, @ai-sdk/google, @ai-sdk/openai** - 多LLM提供商支持
- **@modelcontextprotocol/sdk** - MCP协议支持

### 核心依赖
- **ProseMirror** - 富文本编辑器
- **KaTeX** - LaTeX数学公式渲染
- **ECharts** - 图表库
- **Motion** - 动画库
- **Dexie** - IndexedDB封装
- **Zod** - 数据验证

### 开发工具
- **pnpm** - 包管理器
- **ESLint** - 代码检查
- **Prettier** - 代码格式化

## 项目结构

```
OpenMAIC/
├── app/                        # Next.js App Router
│   ├── api/                    # 服务端API路由（约18个端点）
│   │   ├── generate/           # 场景生成流水线（大纲、内容、图片、TTS…）
│   │   ├── generate-classroom/ # 异步课堂生成提交与轮询
│   │   ├── chat/               # 多智能体讨论（SSE流式传输）
│   │   ├── pbl/                # 项目制学习端点
│   │   └── ...                 # quiz-grade, parse-pdf, web-search, transcription等
│   ├── classroom/[id]/         # 课堂回放页面
│   └── page.tsx                # 首页（生成输入）
│
├── lib/                        # 核心业务逻辑
│   ├── generation/             # 两阶段课堂生成流水线
│   ├── orchestration/          # LangGraph多智能体编排（导演图）
│   ├── playback/               # 回放状态机（idle → playing → live）
│   ├── action/                # 动作执行引擎（语音、白板、特效）
│   ├── ai/                    # LLM服务商抽象层
│   ├── api/                   # Stage API门面（幻灯片/画布/场景操作）
│   ├── store/                 # Zustand状态管理
│   ├── types/                 # 集中式TypeScript类型定义
│   ├── audio/                 # TTS & ASR服务商
│   ├── media/                 # 图片&视频生成服务商
│   ├── export/                # PPTX & HTML导出
│   ├── hooks/                 # React自定义Hooks（55+）
│   ├── i18n/                  # 国际化（zh-CN, en-US）
│   └── ...                   # prosemirror, storage, pdf, web-search, utils
│
├── components/                 # React UI组件
│   ├── slide-renderer/         # 基于Canvas的幻灯片编辑器和渲染器
│   │   ├── Editor/Canvas/      # 交互式编辑画布
│   │   └── components/element/ # 元素渲染器（文本、图片、形状、表格、图表…）
│   ├── scene-renderers/        # 测验、交互、PBL场景渲染器
│   ├── generation/             # 课堂生成工具栏和进度
│   ├── chat/                  # 聊天区域和会话管理
│   ├── settings/              # 设置面板（服务商、TTS、ASR、媒体…）
│   ├── whiteboard/            # 基于SVG的白板绘图
│   ├── agent/                 # 智能体头像、配置、信息栏
│   ├── ui/                    # 基础UI组件（shadcn/ui + Radix）
│   └── ...                   # audio, roundtable, stage, ai-elements
│
├── packages/                   # 工作区子包
│   ├── pptxgenjs/            # 定制化PowerPoint生成
│   └── mathml2omml/          # MathML → Office Math转换
│
├── skills/                     # OpenClaw / ClawHub skills
│   └── openmaic/              # OpenMAIC引导式SOP skill
│       ├── SKILL.md           # 轻量路由层 + 确认规则
│       └── references/        # 按需加载的SOP分段
│
├── configs/                    # 共享常量（形状、字体、快捷键、主题…）
└── public/                     # 静态资源（logo、头像）
```

## 核心架构

### 1. 生成流水线 (Generation Pipeline)
**位置**: `lib/generation/`

两阶段生成流程：
- **阶段1 - 大纲生成**: AI分析用户输入，生成结构化的课堂大纲
- **阶段2 - 场景生成**: 每个大纲条目生成为丰富的场景——幻灯片、测验、交互模块或PBL活动

关键文件：
- `generation-pipeline.ts` - 流水线入口
- `outline-generator.ts` - 大纲生成器
- `scene-generator.ts` - 场景生成器
- `scene-builder.ts` - 场景构建器
- `pipeline-runner.ts` - 流水线执行器

### 2. 多智能体编排 (Multi-Agent Orchestration)
**位置**: `lib/orchestration/`

基于LangGraph的状态机，管理智能体轮次和讨论：
- **导演图**: 统一的图拓扑结构，适用于单智能体和多智能体
- **导演节点**: 决定哪个智能体发言
- **智能体生成节点**: 运行单个智能体的生成

关键文件：
- `director-graph.ts` - LangGraph状态图
- `director-prompt.ts` - 导演提示词构建
- `prompt-builder.ts` - 提示词构建器
- `ai-sdk-adapter.ts` - AI SDK适配器

### 3. 回放引擎 (Playback Engine)
**位置**: `lib/playback/`

驱动课堂回放和实时互动的状态机：
- **状态**: idle → playing → paused → live
- **功能**: 执行场景动作、管理讨论、处理用户中断

关键文件：
- `engine.ts` - 回放引擎核心
- `types.ts` - 回放类型定义
- `derived-state.ts` - 派生状态计算

### 4. 动作引擎 (Action Engine)
**位置**: `lib/action/`

执行28+种动作类型：
- **即时动作**: spotlight、laser（立即返回）
- **同步动作**: speech、whiteboard、discussion（等待完成）

动作类型：
- `speech` - 语音讲解
- `spotlight` - 聚光灯效果
- `laser` - 激光笔效果
- `wb_open/close` - 打开/关闭白板
- `wb_draw_text/shape/chart/latex/table/line` - 白板绘图
- `wb_clear/delete` - 白板清除/删除
- `play_video` - 视频播放
- `discussion` - 讨论触发

关键文件：
- `engine.ts` - 动作执行引擎
- `types/action.ts` - 动作类型定义

## API端点

### 生成相关
- `POST /api/generate/scene-outlines-stream` - 生成场景大纲（流式）
- `POST /api/generate/scene-content` - 生成场景内容
- `POST /api/generate/scene-actions` - 生成场景动作
- `POST /api/generate/image` - 生成图片
- `POST /api/generate/video` - 生成视频
- `POST /api/generate/tts` - 生成语音
- `POST /api/generate/agent-profiles` - 生成智能体配置
- `POST /api/generate-classroom` - 提交异步课堂生成任务
- `GET /api/generate-classroom/[jobId]` - 查询生成任务状态

### 聊天与互动
- `POST /api/chat` - 多智能体聊天（SSE流式）
- `POST /api/pbl/chat` - PBL聊天
- `POST /api/classroom` - 课堂操作

### 功能服务
- `POST /api/parse-pdf` - PDF解析
- `POST /api/transcription` - 语音转文字
- `POST /api/web-search` - 网络搜索
- `POST /api/quiz-grade` - 测验评分
- `GET /api/azure-voices` - Azure语音列表

### 配置与验证
- `GET /api/server-providers` - 获取服务器提供商配置
- `POST /api/verify-model` - 验证模型
- `POST /api/verify-image-provider` - 验证图片提供商
- `POST /api/verify-video-provider` - 验证视频提供商
- `POST /api/verify-pdf-provider` - 验证PDF提供商

### 其他
- `GET /api/health` - 健康检查
- `GET /api/proxy-media` - 媒体代理

## 数据类型

### 场景类型 (SceneType)
- `slide` - 幻灯片场景
- `quiz` - 测验场景
- `interactive` - 交互式场景
- `pbl` - 项目制学习场景

### 动作类型 (ActionType)
- **即时动作**: `spotlight`, `laser`
- **同步动作**: `speech`, `play_video`, `wb_open`, `wb_draw_text`, `wb_draw_shape`, `wb_draw_chart`, `wb_draw_latex`, `wb_draw_table`, `wb_draw_line`, `wb_clear`, `wb_delete`, `wb_close`, `discussion`

### 智能体配置 (AgentConfig)
- `id` - 智能体ID
- `name` - 智能体名称
- `avatar` - 头像
- `color` - 颜色
- `persona` - 人设描述
- `allowedActions` - 允许的动作类型

## 状态管理

使用Zustand进行状态管理，主要Store：
- `canvas` - 画布状态
- `stage` - 舞台状态
- `settings` - 设置状态
- `media-generation` - 媒体生成状态
- `user-profile` - 用户配置状态
- `snapshot` - 快照状态

## 国际化

支持的语言：
- `zh-CN` - 简体中文
- `en-US` - 英语

## 开发指南

### 环境要求
- Node.js >= 18
- pnpm >= 10

### 安装依赖
```bash
pnpm install
```

### 配置环境变量
复制`.env.example`到`.env.local`，配置至少一个LLM提供商的API Key：
```env
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=...
```

### 启动开发服务器
```bash
pnpm dev
```

### 构建生产版本
```bash
pnpm build && pnpm start
```

### 代码检查
```bash
pnpm lint
pnpm check
```

### 代码格式化
```bash
pnpm format
```

## 核心功能模块

### 1. 幻灯片渲染器 (Slide Renderer)
基于Canvas的幻灯片编辑和渲染系统，支持：
- 文本、图片、形状、表格、图表等元素
- 元素操作（移动、缩放、旋转、删除）
- 对齐线和网格辅助
- LaTeX公式渲染

### 2. 白板系统 (Whiteboard)
SVG-based白板绘图系统，支持：
- 文本、形状、图表、公式、表格绘制
- 线条和箭头
- 元素删除和清除
- 动画效果

### 3. 聊天系统 (Chat)
多智能体聊天系统，支持：
- SSE流式传输
- 智能体轮次管理
- 讨论模式
- 语音输入/输出

### 4. 媒体生成 (Media Generation)
图片和视频生成系统，支持多个提供商：
- Kling
- Qwen Image
- Seedance
- Seedream
- Veo
- Nano Banana

### 5. 导出功能 (Export)
支持导出为：
- PowerPoint (.pptx) - 可编辑的幻灯片
- 交互式HTML - 自包含的网页

### 6. 项目制学习 (PBL)
基于MCP协议的项目制学习系统，支持：
- 角色选择
- 里程碑管理
- 智能体协作
- 交付物生成

## 依赖说明

### AI SDK
- `@ai-sdk/anthropic` - Anthropic Claude集成
- `@ai-sdk/google` - Google Gemini集成
- `@ai-sdk/openai` - OpenAI GPT集成
- `@ai-sdk/react` - React流式AI组件
- `ai` - Vercel AI SDK核心

### LangGraph
- `@langchain/core` - LangChain核心
- `@langchain/langgraph` - LangGraph状态图

### UI组件
- `@radix-ui/*` - Radix UI基础组件
- `lucide-react` - 图标库
- `motion` - 动画库
- `sonner` - Toast通知

### 编辑器
- `prosemirror-*` - ProseMirror富文本编辑器
- `katex` - LaTeX公式渲染
- `temml` - 数学公式渲染

### 数据处理
- `zod` - 数据验证
- `js-yaml` - YAML解析
- `jsonrepair` - JSON修复

### 存储
- `dexie` - IndexedDB封装
- `use-stick-to-bottom` - 自动滚动到底部

### 工具库
- `lodash` - 工具函数
- `nanoid` - 唯一ID生成
- `mitt` - 事件总线
- `sharp` - 图片处理

## 部署选项

### Vercel部署
支持一键部署到Vercel，需要配置环境变量。

### Docker部署
使用Docker Compose进行容器化部署。

### 自托管
支持本地自托管，需要配置LLM提供商API Key。

## 许可证

本项目基于GNU Affero General Public License v3.0 (AGPL-3.0)开源。

## 贡献指南

欢迎社区贡献！贡献流程：
1. Fork仓库
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 提交Pull Request

## 联系方式

商业授权合作请联系：thu_maic@tsinghua.edu.cn