# 交互式HTML生成器 Demo

基于 Vue3 + Vercel AI SDK 的交互式HTML生成器演示项目。

## 功能特性

- 🤖 使用 Vercel AI SDK 调用 OpenAI GPT-4o-mini 模型
- 📝 自动生成自包含的交互式HTML页面
- 🎨 使用 Tailwind CSS 进行样式设计
- 🧮 支持 LaTeX 数学公式渲染（通过 KaTeX）
- 🔄 实时预览生成的交互式页面

## 技术栈

- **Vue 3** - 渐进式JavaScript框架
- **TypeScript** - 类型安全
- **Vercel AI SDK** - AI流式生成
- **Tailwind CSS** - 实用优先的CSS框架
- **KaTeX** - LaTeX数学公式渲染

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

创建 `.env.local` 文件并配置 OpenAI API Key：

```env
VITE_OPENAI_API_KEY=your_openai_api_key_here
```

### 3. 启动开发服务器

```bash
npm run dev
```

### 4. 访问应用

在浏览器中打开 `http://localhost:5173`

## 使用示例

### 示例1：牛顿第二定律

**概念名称**: 牛顿第二定律

**学科**: 物理学

**概念概述**: 描述物体加速度与作用力、质量之间的关系

**关键点**:
- 力与加速度成正比
- 质量与加速度成反比
- F=ma公式

**交互设计思路**: 通过滑块调节力和质量，实时显示加速度变化

### 示例2：抛物线运动

**概念名称**: 抛物线运动

**学科**: 物理学

**概念概述**: 物体在重力作用下的曲线运动

**关键点**:
- 水平方向匀速运动
- 竖直方向匀加速运动
- 运动轨迹为抛物线

**交互设计思路**: 通过Canvas绘制轨迹，可调节初速度和发射角度

## 项目结构

```
interactive-html-demo/
├── src/
│   ├── App.vue                 # 主应用组件
│   ├── main.ts                 # 应用入口
│   ├── templates/              # HTML模板
│   │   └── interactive-template.html
│   └── assets/                 # 静态资源
├── public/                    # 公共资源
├── .env.local                 # 环境变量
├── package.json               # 项目配置
└── vite.config.ts            # Vite配置
```

## 核心功能说明

### 1. HTML生成流程

```
用户输入 → AI生成 → HTML提取 → 后处理 → 预览渲染
```

### 2. 后处理功能

- **LaTeX分隔符转换**: `$...$` → `\(...\)`, `$$...$$` → `\[...\]`
- **KaTeX注入**: 自动注入KaTeX库和自动渲染脚本
- **DOM监听**: MutationObserver监听动态内容变化

### 3. 安全特性

- **Iframe沙箱**: 限制iframe权限，确保安全执行
- **Script标签保护**: 防止LaTeX转换时误修改script内容

## 开发命令

```bash
# 开发服务器
npm run dev

# 生产构建
npm run build

# 预览生产构建
npm run preview

# 类型检查
npm run type-check

# 代码检查
npm run lint
```

## 注意事项

1. **API Key安全**: 不要将 `.env.local` 文件提交到版本控制
2. **API费用**: 使用 OpenAI API 会产生费用，请注意控制使用量
3. **网络要求**: 需要能够访问 OpenAI API 和 CDN 资源

## 许可证

MIT

## 相关资源

- [Vue 3 文档](https://vuejs.org/)
- [Vercel AI SDK 文档](https://sdk.vercel.ai/)
- [Tailwind CSS 文档](https://tailwindcss.com/)
- [KaTeX 文档](https://katex.org/)
