# 交互式HTML生成 - PlantUML流程图说明

本文档包含三个PlantUML流程图，详细描述OpenMAIC交互式HTML生成的业务流程、模型调用和数据流转。

## 📊 流程图列表

### 1. [交互式HTML生成流程图.puml](./交互式HTML生成流程图.puml)
**类型**: 活动图 (Activity Diagram)
**内容**: 完整的业务流程，包含所有阶段和决策点

### 2. [交互式HTML生成-数据流图.puml](./交互式HTML生成-数据流图.puml)
**类型**: 时序图 (Sequence Diagram)
**内容**: 详细的组件间交互和数据流转

### 3. [交互式HTML生成-组件架构图.puml](./交互式HTML生成-组件架构图.puml)
**类型**: 组件图 (Component Diagram)
**内容**: 系统架构和组件依赖关系

---

## 🎯 核心流程概述

### 三阶段生成流程

```
用户输入 → 科学建模 → HTML生成 → 后处理 → 动作生成 → 场景创建 → 渲染展示
```

### 阶段详解

#### 阶段1: 大纲生成
- **输入**: 用户输入的概念信息
- **输出**: SceneOutline对象
- **关键数据**: 
  - 概念名称、学科、概述
  - 关键点列表
  - 交互设计思路

#### 阶段2: 科学建模
- **Prompt**: `interactive-scientific-model`
- **AI模型**: OpenAI GPT-4o-mini
- **输出**: ScientificModel
- **容错机制**: 失败时继续执行，使用默认约束

#### 阶段3: HTML生成
- **Prompt**: `interactive-html`
- **AI模型**: OpenAI GPT-4o-mini
- **输出**: 完整的HTML5文档
- **技术要求**: Tailwind CSS + 纯JavaScript + LaTeX支持

#### 阶段4: HTML提取
- **策略1**: 查找`<!DOCTYPE html>`
- **策略2**: 从代码块` ```html ```提取
- **策略3**: 检查响应本身是否为HTML

#### 阶段5: 后处理
- **LaTeX转换**: `$...$` → `\(...\)`, `$$...$$` → `\[...\]`
- **KaTeX注入**: CSS + JS + auto-render + MutationObserver
- **Script保护**: 防止误转换script标签内容

#### 阶段6: 动作生成
- **Prompt**: `interactive-actions`
- **AI模型**: OpenAI GPT-4o-mini
- **输出**: Speech动作数组
- **用途**: 语音指导学生交互

#### 阶段7: 场景创建
- **输入**: InteractiveContent + Action[]
- **输出**: Scene对象
- **存储**: Zustand Store

#### 阶段8: 渲染展示
- **组件**: InteractiveRenderer (React)
- **环境**: Iframe沙箱
- **功能**: CSS补丁 + KaTeX自动渲染

---

## 🤖 AI模型调用详情

### 模型配置

| 参数 | 值 |
|------|------|
| **模型** | OpenAI GPT-4o-mini |
| **Temperature** | 0.7 |
| **输出格式** | JSON / HTML |
| **SDK** | Vercel AI SDK |

### Prompt调用次数

每次生成交互式HTML需要调用AI模型**2-3次**：

1. **科学建模** (可选，1次调用)
   - Prompt: `interactive-scientific-model`
   - 输出: ScientificModel (JSON)

2. **HTML生成** (必需，1次调用)
   - Prompt: `interactive-html`
   - 输出: HTML文档

3. **动作生成** (必需，1次调用)
   - Prompt: `interactive-actions`
   - 输出: Action数组 (JSON)

### Prompt模板系统

#### 1. 科学建模Prompt

**System Prompt** (`interactive-scientific-model/system.md`):
```
# Scientific Modeling Expert

You are a scientific education expert. Your task is to perform rigorous scientific modeling for a given concept, extracting core formulas, principles, mechanisms, and constraints that must be strictly followed in any interactive visualization.

## Output Requirements

You must output a JSON object with the following structure:
{
  "core_formulas": ["Formula or law 1", "Formula or law 2"],
  "mechanism": ["Physical/logical mechanism 1", "Mechanism 2"],
  "constraints": ["Constraint that must be obeyed 1", "Constraint 2"],
  "forbidden_errors": ["Common scientific error that must NOT appear 1", "Error 2"]
}
```

**User Prompt** (`interactive-scientific-model/user.md`):
```
Please perform scientific modeling for the following concept.

## Concept Information
- Subject: {{subject}}
- Concept Name: {{conceptName}}
- Concept Overview: {{conceptOverview}}
- Key Points: {{keyPoints}}
- Design Idea: {{designIdea}}

## Task
1. List the core formulas, laws, concepts, or logical rules involved
2. Clarify the specific physical/logical mechanisms
3. List constraints that any simulation must obey
4. List scientific errors that must be strictly forbidden

Output JSON directly.
```

#### 2. HTML生成Prompt

**System Prompt** (`interactive-html/system.md`):
```
# Interactive Learning Page Generator

You are a professional interactive web developer and educator. Your task is to create a self-contained, interactive learning web page for a specific concept.

## Technical Requirements
- Complete HTML5 document with <!DOCTYPE html>, <html>, <head>, <body>
- Use Tailwind CSS via CDN
- Pure JavaScript only (no frameworks)
- Math formulas in LaTeX format: \(...\) for inline, \[...\] for display
- Self-contained (no external resources except CDN CSS)

## Design Principles
1. Visualization First
2. Minimal Text
3. Immediate Feedback
4. Scientific Accuracy
5. Progressive Discovery

## Output
Return the complete HTML document directly.
```

**User Prompt** (`interactive-html/user.md`):
```
Create an interactive learning page for the following concept.

## Concept Information
- Concept Name: {{conceptName}}
- Subject: {{subject}}
- Concept Overview: {{conceptOverview}}
- Key Points: {{keyPoints}}

## Scientific Constraints
{{scientificConstraints}}

## Interactive Design Idea
{{designIdea}}

## Language
Page language: {{language}}

## Requirements
1. Complete self-contained HTML5 document
2. Use Tailwind CSS via CDN for styling
3. Pure JavaScript for all interactivity
4. Math formulas in LaTeX format
5. Do NOT include KaTeX - it will be injected automatically
6. All simulations must strictly follow scientific constraints above
7. Focus on interactive visualization, minimal text

Return the complete HTML document directly.
```

#### 3. 动作生成Prompt

**System Prompt** (`interactive-actions/system.md`):
```
# Interactive Scene Action Generator

You are a professional instructional designer responsible for generating teaching action sequences for interactive scenes.

## Core Task
Generate a series of speech actions that guide students through the interactive experience. Actions are limited to **speech only**.

## Output Format
You MUST output a JSON array directly:
[
  {
    "type": "text",
    "content": "Let's explore this concept..."
  },
  {
    "type": "text",
    "content": "Try dragging the slider..."
  }
]

## Design Principles
1. Guide Interaction
2. Progressive
3. Encourage Exploration
4. Connect to Theory
5. 3-6 Segments
```

**User Prompt** (`interactive-actions/user.md`):
```
Title: {{title}}
Concept: {{conceptName}}
Description: {{description}}
Design Idea: {{designIdea}}
Key Points: {{keyPoints}}
{{courseContext}}
{{agents}}

**Language Requirement**: Generated speech content must be in the same language as the key points above.

Output as a JSON array directly (3-6 speech segments).
```

---

## 🔄 数据流转详解

### 输入数据结构

```typescript
interface SceneOutline {
  id: string;
  type: 'interactive';
  title: string;
  description: string;
  keyPoints: string[];
  interactiveConfig: {
    conceptName: string;
    conceptOverview: string;
    designIdea: string;
    subject?: string;
  };
}
```

### 中间数据结构

```typescript
interface ScientificModel {
  core_formulas: string[];
  mechanism: string[];
  constraints: string[];
  forbidden_errors: string[];
}

interface GeneratedInteractiveContent {
  html: string;
  scientificModel?: ScientificModel;
}
```

### 输出数据结构

```typescript
interface InteractiveContent {
  type: 'interactive';
  url: string;
  html?: string;
}

interface Scene {
  id: string;
  type: 'interactive';
  title: string;
  content: InteractiveContent;
  actions?: Action[];
}
```

---

## 🛠️ 关键技术实现

### 1. LaTeX分隔符转换

**问题**: AI生成的HTML使用`$`和`$$`作为LaTeX分隔符，但KaTeX需要`\(`和`\[`。

**解决方案**:
```typescript
// 保护script标签
let processed = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, (match) => {
  scriptBlocks.push(match);
  return `__SCRIPT_BLOCK_${scriptBlocks.length - 1}__`;
});

// 转换LaTeX分隔符
processed = processed.replace(/\$\$([^$]+)\$\$/g, '\\[$1\\]');
processed = processed.replace(/\$([^$\n]+?)\$/g, '\\($1\\)');

// 恢复script标签
for (let i = 0; i < scriptBlocks.length; i++) {
  const placeholder = `__SCRIPT_BLOCK_${i}__`;
  const idx = processed.indexOf(placeholder);
  if (idx !== -1) {
    processed = processed.substring(0, idx) + scriptBlocks[i] + processed.substring(idx + placeholder.length);
  }
}
```

### 2. KaTeX自动渲染

**问题**: 动态插入的内容需要重新渲染LaTeX公式。

**解决方案**:
```javascript
// MutationObserver监听DOM变化
const observer = new MutationObserver((mutations) => {
  let shouldRender = false;
  mutations.forEach((mutation) => {
    if (mutation.target.className?.includes('katex')) {
      return;
    }
    shouldRender = true;
  });
  
  if (shouldRender) {
    safeRender();
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
  characterData: true
});

// 定时检查机制（兜底）
setInterval(() => {
  const text = document.body.innerText;
  if (text.includes('\\(') || text.includes('$$')) {
    safeRender();
  }
}, 2000);

// 防抖渲染
function safeRender() {
  if (renderTimeout) clearTimeout(renderTimeout);
  renderTimeout = setTimeout(() => {
    renderMathInElement(document.body, katexOptions);
  }, 100);
}
```

### 3. Iframe布局修复

**问题**: 生成的HTML可能使用`min-h-screen`等Tailwind类，在iframe中显示异常。

**解决方案**:
```typescript
function patchHtmlForIframe(html: string): string {
  const iframeCss = `<style data-iframe-patch>
  html, body {
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    overflow-x: hidden;
    overflow-y: auto;
  }
  body { min-height: 100vh; }
</style>`;

  const headIdx = html.indexOf('<head>');
  if (headIdx !== -1) {
    const insertPos = headIdx + 6;
    return html.substring(0, insertPos) + '\n' + iframeCss + html.substring(insertPos);
  }

  return iframeCss + html;
}
```

---

## 📝 使用PlantUML

### 安装PlantUML

```bash
# 使用npm安装
npm install -g @plantuml/plantuml

# 或使用Docker
docker run -d -p 8080:8080 plantuml/plantuml:latest
```

### 渲染流程图

```bash
# 渲染为PNG
plantuml 交互式HTML生成流程图.puml

# 渲染为SVG
plantuml -tsvg 交互式HTML生成流程图.puml

# 渲染为PDF
plantuml -tpdf 交互式HTML生成流程图.puml
```

### 在线渲染

访问 https://plantuml.com/plantuml/uml/ 并粘贴PlantUML代码即可在线渲染。

---

## 🎨 流程图说明

### 图例说明

| 图层 | 说明 |
|------|------|
| **用户层** | 用户交互和输入 |
| **生成层** | AI生成逻辑和业务处理 |
| **渲染层** | 前端渲染和展示 |

### 颜色说明

| 颜色 | 说明 |
|------|------|
| **蓝色 (#E8F5E9)** | 主要处理流程 |
| **黄色 (#FFF9C4)** | 重要提示和说明 |
| **红色 (#FF5722)** | 错误和警告 |

### 符号说明

| 符号 | 说明 |
|------|------|
| `→` | 数据流向 |
| `→→` | 控制流 |
| `if/else` | 条件判断 |
| `note` | 注释说明 |
| `partition` | 分组区域 |

---

## 📚 相关文档

- [交互式HTML实现详解.md](./交互式HTML实现详解.md) - 完整的技术实现文档
- [OpenMAIC项目](https://github.com/ChanKaion/OpenMAIC-search) - 项目源代码

---

## 🔗 快速链接

1. **主流程图**: [交互式HTML生成流程图.puml](./交互式HTML生成流程图.puml)
2. **数据流图**: [交互式HTML生成-数据流图.puml](./交互式HTML生成-数据流图.puml)
3. **架构图**: [交互式HTML生成-组件架构图.puml](./交互式HTML生成-组件架构图.puml)
