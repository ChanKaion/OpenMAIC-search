# 交互式HTML生成器 Demo - 快速开始指南

## 📦 项目简介

这是一个基于 Vue3 + Vercel AI SDK 的交互式HTML生成器演示项目，可以自动生成科学概念的交互式学习页面。

## 🚀 快速启动（3步）

### 步骤1: 配置API Key

在项目根目录下创建 `.env.local` 文件，并添加你的OpenAI API Key：

```env
VITE_OPENAI_API_KEY=sk-your-actual-api-key-here
```

**获取API Key**:
1. 访问 https://platform.openai.com/api-keys
2. 登录或注册OpenAI账号
3. 点击"Create new secret key"
4. 复制生成的API Key到 `.env.local` 文件

### 步骤2: 安装依赖

```bash
npm install
```

### 步骤3: 启动开发服务器

```bash
npm run dev
```

然后在浏览器中打开 `http://localhost:5173`

## 🎯 使用示例

### 示例1: 牛顿第二定律

在左侧表单中填写以下信息：

```
概念名称: 牛顿第二定律
学科: 物理学
概念概述: 描述物体加速度与作用力、质量之间的关系
关键点:
力与加速度成正比
质量与加速度成反比
F=ma公式
交互设计思路: 通过滑块调节力和质量，实时显示加速度变化
```

点击"生成交互式HTML"按钮，等待几秒钟后，右侧将显示可交互的物理实验页面。

### 示例2: 抛物线运动

```
概念名称: 抛物线运动
学科: 物理学
概念概述: 物体在重力作用下的曲线运动
关键点:
水平方向匀速运动
竖直方向匀加速运动
运动轨迹为抛物线
交互设计思路: 通过Canvas绘制轨迹，可调节初速度和发射角度
```

## 💡 核心功能

1. **AI生成**: 使用GPT-4o-mini模型生成交互式HTML
2. **LaTeX支持**: 自动渲染数学公式
3. **实时预览**: 在iframe中即时查看生成的页面
4. **安全执行**: 使用沙箱环境确保安全

## 🔧 技术栈

- Vue 3 (Composition API)
- TypeScript
- Vercel AI SDK
- Tailwind CSS
- KaTeX

## 📝 注意事项

1. **API费用**: 每次生成会消耗OpenAI API额度，请注意控制使用量
2. **网络要求**: 需要能够访问OpenAI API和CDN资源
3. **浏览器兼容**: 推荐使用Chrome、Firefox、Edge等现代浏览器

## 🆘 常见问题

### Q: 提示"请先在.env.local文件中配置OPENAI_API_KEY"
A: 请确保在项目根目录下创建了`.env.local`文件，并填写了有效的API Key。

### Q: 生成失败，提示API错误
A: 检查API Key是否正确，是否有足够的额度，网络连接是否正常。

### Q: 生成的HTML显示不正常
A: 确保浏览器支持JavaScript和CDN资源加载。

## 📚 更多信息

详细文档请参考 [README.md](./README.md)
