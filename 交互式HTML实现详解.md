# OpenMAIC 交互式HTML实现详解

## 📋 目录

- [概述](#概述)
- [架构设计](#架构设计)
- [核心流程](#核心流程)
- [关键代码文件](#关键代码文件)
- [技术栈与框架](#技术栈与框架)
- [Prompt模板系统](#prompt模板系统)
- [数据流详解](#数据流详解)
- [实现细节](#实现细节)
- [使用示例](#使用示例)

---

## 概述

OpenMAIC的交互式HTML功能允许AI自动生成**自包含的交互式学习页面**，用户可以在浏览器中直接与科学概念进行交互式探索。该功能通过三阶段AI生成流程实现：

1. **科学建模阶段** - 提取核心公式、机制、约束条件
2. **HTML生成阶段** - 生成完整的交互式HTML文档
3. **后处理阶段** - LaTeX转换、KaTeX注入、DOM监听

### 核心特性

- ✅ **自包含设计** - 所有HTML、CSS、JS在单个文件中
- ✅ **科学准确性** - 基于严格的科学约束生成
- ✅ **数学公式支持** - 自动渲染LaTeX公式
- ✅ **响应式布局** - 使用Tailwind CSS适配不同屏幕
- ✅ **沙箱安全** - iframe隔离执行环境
- ✅ **实时渲染** - MutationObserver监听动态内容

---

## 架构设计

### 系统架构图

```
┌─────────────────────────────────────────────────────────────┐
│                        用户输入                               │
│  (概念名称、学科、概述、关键点、设计思路)                       │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              阶段1: 科学建模 (Scientific Modeling)            │
│  Prompt: interactive-scientific-model                        │
│  输出: ScientificModel (公式、机制、约束、错误)               │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              阶段2: HTML生成 (HTML Generation)               │
│  Prompt: interactive-html                                    │
│  输出: 完整的HTML5文档 (包含Tailwind CSS + 纯JS交互)           │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              阶段3: 后处理 (Post-Processing)                  │
│  - LaTeX分隔符转换 ($$...$$ → \[...\])                       │
│  - KaTeX库注入 (CSS + JS + auto-render)                      │
│  - MutationObserver监听DOM变化                                │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              阶段4: 动作生成 (Action Generation)               │
│  Prompt: interactive-actions                                 │
│  输出: Speech动作数组 (语音指导)                              │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              阶段5: 渲染展示 (Rendering)                       │
│  - InteractiveRenderer组件                                   │
│  - iframe沙箱环境                                             │
│  - CSS补丁 (修复iframe布局问题)                               │
└─────────────────────────────────────────────────────────────┘
```

### 模块依赖关系

```
lib/generation/
├── scene-generator.ts          # 主生成逻辑
├── interactive-post-processor.ts  # HTML后处理
└── prompts/
    ├── index.ts                # Prompt ID定义
    └── templates/
        ├── interactive-scientific-model/
        │   ├── system.md       # 科学建模系统提示词
        │   └── user.md         # 科学建模用户提示词
        ├── interactive-html/
        │   ├── system.md       # HTML生成系统提示词
        │   └── user.md         # HTML生成用户提示词
        └── interactive-actions/
            ├── system.md       # 动作生成系统提示词
            └── user.md         # 动作生成用户提示词

components/scene-renderers/
└── interactive-renderer.tsx    # React渲染组件

lib/types/
├── stage.ts                     # InteractiveContent类型
└── generation.ts               # GeneratedInteractiveContent类型
```

---

## 核心流程

### 完整生成流程

```typescript
// 1. 场景大纲生成 (Stage 1)
const sceneOutline: SceneOutline = {
  type: 'interactive',
  title: '牛顿第二定律',
  description: '通过交互式实验理解力、质量与加速度的关系',
  keyPoints: ['力与加速度成正比', '质量与加速度成反比', 'F=ma公式'],
  interactiveConfig: {
    conceptName: '牛顿第二定律',
    conceptOverview: '描述物体加速度与作用力、质量之间的关系',
    designIdea: '通过滑块调节力和质量，实时显示加速度变化',
    subject: '物理学'
  }
}

// 2. 交互式内容生成 (Stage 2)
const interactiveContent = await generateInteractiveContent(
  sceneOutline,
  aiCall,
  'zh-CN'
)

// 3. 动作生成 (Stage 3)
const actions = await generateSceneActions(
  sceneOutline,
  interactiveContent,
  aiCall
)

// 4. 创建完整场景
const scene = await createSceneWithActions(
  sceneOutline,
  interactiveContent,
  actions,
  api
)

// 5. 渲染展示
<InteractiveRenderer content={interactiveContent} mode="playback" />
```

### 三阶段详细流程

#### 阶段1: 科学建模

**文件**: [lib/generation/scene-generator.ts:742-766](lib/generation/scene-generator.ts#L742-L766)

```typescript
// 构建科学建模Prompt
const modelPrompts = buildPrompt(
  PROMPT_IDS.INTERACTIVE_SCIENTIFIC_MODEL,
  {
    subject: config.subject || '',
    conceptName: config.conceptName,
    conceptOverview: config.conceptOverview,
    keyPoints: outline.keyPoints.map((p, i) => `${i + 1}. ${p}`).join('\n'),
    designIdea: config.designIdea,
  }
)

// 调用AI生成科学模型
const modelResponse = await aiCall(modelPrompts.system, modelPrompts.user)
const parsed = parseJsonResponse<ScientificModel>(modelResponse)

// 输出结构
{
  core_formulas: ['F = ma', 'a = F/m'],
  mechanism: ['力是改变物体运动状态的原因', '质量是惯性大小的量度'],
  constraints: ['加速度方向与力的方向一致', '质量必须为正数'],
  forbidden_errors: ['力与速度成正比', '质量与加速度成正比']
}
```

#### 阶段2: HTML生成

**文件**: [lib/generation/scene-generator.ts:787-810](lib/generation/scene-generator.ts#L787-L810)

```typescript
// 格式化科学约束
const scientificConstraints = `
Core Formulas: ${scientificModel.core_formulas.join('; ')}
Mechanisms: ${scientificModel.mechanism.join('; ')}
Must Obey: ${scientificModel.constraints.join('; ')}
Forbidden Errors: ${scientificModel.forbidden_errors.join('; ')}
`

// 构建HTML生成Prompt
const htmlPrompts = buildPrompt(PROMPT_IDS.INTERACTIVE_HTML, {
  conceptName: config.conceptName,
  subject: config.subject || '',
  conceptOverview: config.conceptOverview,
  keyPoints: outline.keyPoints.map((p, i) => `${i + 1}. ${p}`).join('\n'),
  scientificConstraints,
  designIdea: config.designIdea,
  language,
})

// 调用AI生成HTML
const htmlResponse = await aiCall(htmlPrompts.system, htmlPrompts.user)
const rawHtml = extractHtml(htmlResponse)
```

#### 阶段3: 后处理

**文件**: [lib/generation/interactive-post-processor.ts:16-26](lib/generation/interactive-post-processor.ts#L16-L26)

```typescript
// LaTeX分隔符转换
let processed = convertLatexDelimiters(html)
// $$...$$ → \[...\] (显示公式)
// $...$ → \(...\) (行内公式)

// 注入KaTeX资源
if (!processed.toLowerCase().includes('katex')) {
  processed = injectKatex(processed)
}

// 注入内容包括:
// - KaTeX CSS
// - KaTeX JS
// - auto-render扩展
// - MutationObserver监听器
// - 定时检查机制
```

---

## 关键代码文件

### 1. 类型定义

#### [lib/types/stage.ts:101-106](lib/types/stage.ts#L101-L106)

```typescript
/**
 * Interactive content - Interactive web page (iframe)
 */
export interface InteractiveContent {
  type: 'interactive';
  url: string;           // 外部URL（可选）
  html?: string;         // 嵌入的HTML内容
}
```

#### [lib/types/generation.ts:165-181](lib/types/generation.ts#L165-L181)

```typescript
/**
 * Scientific model output from scientific modeling stage
 */
export interface ScientificModel {
  core_formulas: string[];
  mechanism: string[];
  constraints: string[];
  forbidden_errors: string[];
}

/**
 * AI-generated interactive content
 */
export interface GeneratedInteractiveContent {
  html: string;
  scientificModel?: ScientificModel;
}

/**
 * Interactive-specific config in SceneOutline
 */
interface InteractiveConfig {
  conceptName: string;
  conceptOverview: string;
  designIdea: string;
  subject?: string;
}
```

### 2. 主生成逻辑

#### [lib/generation/scene-generator.ts:735-820](lib/generation/scene-generator.ts#L735-L820)

```typescript
async function generateInteractiveContent(
  outline: SceneOutline,
  aiCall: AICallFn,
  language: 'zh-CN' | 'en-US' = 'zh-CN',
): Promise<GeneratedInteractiveContent | null> {
  const config = outline.interactiveConfig!;

  // Step 1: Scientific modeling (with fallback on failure)
  let scientificModel: ScientificModel | undefined;
  try {
    const modelPrompts = buildPrompt(PROMPT_IDS.INTERACTIVE_SCIENTIFIC_MODEL, {
      subject: config.subject || '',
      conceptName: config.conceptName,
      conceptOverview: config.conceptOverview,
      keyPoints: (outline.keyPoints || []).map((p, i) => `${i + 1}. ${p}`).join('\n'),
      designIdea: config.designIdea,
    });

    if (modelPrompts) {
      log.info(`Step 1: Scientific modeling for: ${outline.title}`);
      const modelResponse = await aiCall(modelPrompts.system, modelPrompts.user);
      const parsed = parseJsonResponse<ScientificModel>(modelResponse);
      if (parsed && parsed.core_formulas) {
        scientificModel = parsed;
        log.info(
          `Scientific model: ${parsed.core_formulas.length} formulas, ${parsed.constraints?.length || 0} constraints`,
        );
      }
    }
  } catch (error) {
    log.warn(`Scientific modeling failed, continuing without: ${error}`);
  }

  // Format scientific constraints for HTML generation prompt
  let scientificConstraints = 'No specific scientific constraints available.';
  if (scientificModel) {
    const lines: string[] = [];
    if (scientificModel.core_formulas?.length) {
      lines.push(`Core Formulas: ${scientificModel.core_formulas.join('; ')}`);
    }
    if (scientificModel.mechanism?.length) {
      lines.push(`Mechanisms: ${scientificModel.mechanism.join('; ')}`);
    }
    if (scientificModel.constraints?.length) {
      lines.push(`Must Obey: ${scientificModel.constraints.join('; ')}`);
    }
    if (scientificModel.forbidden_errors?.length) {
      lines.push(`Forbidden Errors: ${scientificModel.forbidden_errors.join('; ')}`);
    }
    scientificConstraints = lines.join('\n');
  }

  // Step 2: HTML generation
  const htmlPrompts = buildPrompt(PROMPT_IDS.INTERACTIVE_HTML, {
    conceptName: config.conceptName,
    subject: config.subject || '',
    conceptOverview: config.conceptOverview,
    keyPoints: (outline.keyPoints || []).map((p, i) => `${i + 1}. ${p}`).join('\n'),
    scientificConstraints,
    designIdea: config.designIdea,
    language,
  });

  if (!htmlPrompts) {
    log.error(`Failed to build HTML prompt for: ${outline.title}`);
    return null;
  }

  log.info(`Step 2: Generating HTML for: ${outline.title}`);
  const htmlResponse = await aiCall(htmlPrompts.system, htmlPrompts.user);
  // Extract HTML from response
  const rawHtml = extractHtml(htmlResponse);
  if (!rawHtml) {
    log.error(`Failed to extract HTML from response for: ${outline.title}`);
    return null;
  }

  // Step 3: Post-process HTML (LaTeX delimiter conversion + KaTeX injection)
  const processedHtml = postProcessInteractiveHtml(rawHtml);
  log.info(`Post-processed HTML (${processedHtml.length} chars) for: ${outline.title}`);

  return {
    html: processedHtml,
    scientificModel,
  };
}
```

### 3. HTML提取逻辑

#### [lib/generation/scene-generator.ts:872-903](lib/generation/scene-generator.ts#L872-L903)

```typescript
/**
 * Extract HTML document from AI response.
 * Tries to find <!DOCTYPE html>...</html> first, then falls back to code block extraction.
 */
function extractHtml(response: string): string | null {
  // Strategy 1: Find complete HTML document
  const doctypeStart = response.indexOf('<!DOCTYPE html>');
  const htmlTagStart = response.indexOf('<html');
  const start = doctypeStart !== -1 ? doctypeStart : htmlTagStart;

  if (start !== -1) {
    const htmlEnd = response.lastIndexOf('</html>');
    if (htmlEnd !== -1) {
      return response.substring(start, htmlEnd + 7);
    }
  }

  // Strategy 2: Extract from code block
  const codeBlockMatch = response.match(/```(?:html)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    const content = codeBlockMatch[1].trim();
    if (content.includes('<html') || content.includes('<!DOCTYPE')) {
      return content;
    }
  }

  // Strategy 3: If response itself looks like HTML
  const trimmed = response.trim();
  if (trimmed.startsWith('<!DOCTYPE') || trimmed.startsWith('<html')) {
    return trimmed;
  }

  log.error('Could not extract HTML from response');
  log.error('Response preview:', response.substring(0, 200));
  return null;
}
```

### 4. 后处理模块

#### [lib/generation/interactive-post-processor.ts](lib/generation/interactive-post-processor.ts)

**LaTeX分隔符转换** (第36-67行):

```typescript
function convertLatexDelimiters(html: string): string {
  const scriptBlocks: string[] = [];

  // Protect script tags by replacing them with placeholders
  let processed = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, (match) => {
    scriptBlocks.push(match);
    return `__SCRIPT_BLOCK_${scriptBlocks.length - 1}__`;
  });

  // Convert display math: $$...$$ → \[...\]
  processed = processed.replace(/\$\$([^$]+)\$\$/g, '\\[$1\\]');

  // Convert inline math: $...$ → \(...\)
  processed = processed.replace(/\$([^$\n]+?)\$/g, '\\($1\\)');

  // Restore script blocks
  for (let i = 0; i < scriptBlocks.length; i++) {
    const placeholder = `__SCRIPT_BLOCK_${i}__`;
    const idx = processed.indexOf(placeholder);
    if (idx !== -1) {
      processed =
        processed.substring(0, idx) +
        scriptBlocks[i] +
        processed.substring(idx + placeholder.length);
    }
  }

  return processed;
}
```

**KaTeX注入** (第73-160行):

```typescript
function injectKatex(html: string): string {
  const katexInjection = `
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
<script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js"></script>
<script>
document.addEventListener("DOMContentLoaded", function() {
    const katexOptions = {
        delimiters: [
            {left: '\\\\[', right: '\\\\]', display: true},
            {left: '\\\\(', right: '\\\\)', display: false},
            {left: '$$', right: '$$', display: true},
            {left: '$', right: '$', display: false}
        ],
        throwOnError: false,
        strict: false,
        trust: true
    };

    let renderTimeout;
    function safeRender() {
        if (renderTimeout) clearTimeout(renderTimeout);
        renderTimeout = setTimeout(() => {
            renderMathInElement(document.body, katexOptions);
        }, 100);
    }

    renderMathInElement(document.body, katexOptions);

    const observer = new MutationObserver((mutations) => {
        let shouldRender = false;
        mutations.forEach((mutation) => {
            if (mutation.target &&
                mutation.target.className &&
                typeof mutation.target.className === 'string' &&
                mutation.target.className.includes('katex')) {
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

    setInterval(() => {
        const text = document.body.innerText;
        if (text.includes('\\\\(') || text.includes('$$')) {
            safeRender();
        }
    }, 2000);
});
</script>`;

  // Inject before </head> or </body>
  const headCloseIdx = html.indexOf('</head>');
  if (headCloseIdx !== -1) {
    return (
      html.substring(0, headCloseIdx) +
      katexInjection +
      '\n</head>' +
      html.substring(headCloseIdx + 7)
    );
  }

  const bodyCloseIdx = html.indexOf('</body>');
  if (bodyCloseIdx !== -1) {
    return (
      html.substring(0, bodyCloseIdx) +
      katexInjection +
      '\n</body>' +
      html.substring(bodyCloseIdx + 7)
    );
  }

  return html + katexInjection;
}
```

### 5. 渲染组件

#### [components/scene-renderers/interactive-renderer.tsx](components/scene-renderers/interactive-renderer.tsx)

```typescript
'use client';

import { useMemo } from 'react';
import type { InteractiveContent } from '@/lib/types/stage';

interface InteractiveRendererProps {
  readonly content: InteractiveContent;
  readonly mode: 'autonomous' | 'playback';
  readonly sceneId: string;
}

export function InteractiveRenderer({ content, mode: _mode, sceneId }: InteractiveRendererProps) {
  const patchedHtml = useMemo(
    () => (content.html ? patchHtmlForIframe(content.html) : undefined),
    [content.html],
  );

  return (
    <div className="w-full h-full relative">
      <iframe
        srcDoc={patchedHtml}
        src={patchedHtml ? undefined : content.url}
        className="absolute inset-0 w-full h-full border-0"
        title={`Interactive Scene ${sceneId}`}
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
      />
    </div>
  );
}

/**
 * Patch embedded HTML to display correctly inside an iframe.
 */
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

  // Insert after <head>
  const headIdx = html.indexOf('<head>');
  if (headIdx !== -1) {
    const insertPos = headIdx + 6;
    return html.substring(0, insertPos) + '\n' + iframeCss + html.substring(insertPos);
  }

  const headWithAttrs = html.indexOf('<head ');
  if (headWithAttrs !== -1) {
    const closeAngle = html.indexOf('>', headWithAttrs);
    if (closeAngle !== -1) {
      const insertPos = closeAngle + 1;
      return html.substring(0, insertPos) + '\n' + iframeCss + html.substring(insertPos);
    }
  }

  return iframeCss + html;
}
```

### 6. 动作生成

#### [lib/generation/scene-generator.ts:981-1000](lib/generation/scene-generator.ts#L981-L1000)

```typescript
// Generate actions for interactive scenes
if (outline.type === 'interactive') {
  const prompts = buildPrompt(PROMPT_IDS.INTERACTIVE_ACTIONS, {
    title: outline.title,
    conceptName: outline.interactiveConfig?.conceptName,
    description: outline.description,
    designIdea: outline.interactiveConfig?.designIdea,
    keyPoints: (outline.keyPoints || []).map((p, i) => `${i + 1}. ${p}`).join('\n'),
    courseContext: buildCourseContext(ctx),
    agents: agentsText,
  });

  if (prompts) {
    const response = await aiCall(prompts.system, prompts.user);
    const parsed = parseJsonResponse<{ type: string; content: string }[]>(response);
    if (parsed) {
      return parsed.map((item) => ({
        id: nanoid(),
        type: 'speech' as ActionType,
        content: item.content,
        timestamp: 0,
      }));
    }
  }
}
```

---

## 技术栈与框架

### 前端框架

| 技术 | 版本 | 用途 |
|------|------|------|
| **Next.js** | 16 | React框架，App Router |
| **React** | 19 | UI框架 |
| **TypeScript** | 5 | 类型安全 |
| **Tailwind CSS** | 4 | 样式框架（生成HTML中使用） |

### AI & 机器学习

| 技术 | 版本 | 用途 |
|------|------|------|
| **Vercel AI SDK** | latest | AI流式生成 |
| **@ai-sdk/openai** | latest | OpenAI GPT集成 |
| **@ai-sdk/anthropic** | latest | Anthropic Claude集成 |
| **@ai-sdk/google** | latest | Google Gemini集成 |

### 核心依赖

| 技术 | 版本 | 用途 |
|------|------|------|
| **KaTeX** | 0.16.9 | LaTeX数学公式渲染 |
| **ProseMirror** | latest | 富文本编辑器（其他场景） |
| **Zustand** | latest | 状态管理 |
| **nanoid** | latest | 唯一ID生成 |

### 开发工具

| 技术 | 版本 | 用途 |
|------|------|------|
| **pnpm** | 10+ | 包管理器 |
| **ESLint** | latest | 代码检查 |
| **Prettier** | latest | 代码格式化 |

---

## Prompt模板系统

### Prompt ID定义

**文件**: [lib/generation/prompts/index.ts:23-33](lib/generation/prompts/index.ts#L23-L33)

```typescript
export const PROMPT_IDS = {
  REQUIREMENTS_TO_OUTLINES: 'requirements-to-outlines',
  SLIDE_CONTENT: 'slide-content',
  QUIZ_CONTENT: 'quiz-content',
  SLIDE_ACTIONS: 'slide-actions',
  QUIZ_ACTIONS: 'quiz-actions',
  INTERACTIVE_SCIENTIFIC_MODEL: 'interactive-scientific-model',
  INTERACTIVE_HTML: 'interactive-html',
  INTERACTIVE_ACTIONS: 'interactive-actions',
  PBL_ACTIONS: 'pbl-actions',
} as const;
```

### 1. 科学建模Prompt

#### System Prompt: [lib/generation/prompts/templates/interactive-scientific-model/system.md](lib/generation/prompts/templates/interactive-scientific-model/system.md)

```markdown
# Scientific Modeling Expert

You are a scientific education expert. Your task is to perform rigorous scientific modeling for a given concept, extracting core formulas, principles, mechanisms, and constraints that must be strictly followed in any interactive visualization.

## Core Task

Analyze the provided concept and produce a structured scientific model that will guide the creation of an interactive learning page. The model must ensure scientific accuracy in all generated visualizations and simulations.

## Output Requirements

You must output a JSON object with the following structure:

```json
{
  "core_formulas": ["Formula or law 1", "Formula or law 2"],
  "mechanism": ["Physical/logical mechanism 1", "Mechanism 2"],
  "constraints": ["Constraint that must be obeyed 1", "Constraint 2"],
  "forbidden_errors": ["Common scientific error that must NOT appear 1", "Error 2"]
}
```

### Field Descriptions

| Field            | Description                                                              |
| ---------------- | ------------------------------------------------------------------------ |
| core_formulas    | Core formulas, laws, concepts, or logical rules involved in this concept |
| mechanism        | Specific physical/logical mechanisms that explain how the concept works  |
| constraints      | Scientific constraints that any simulation must obey                     |
| forbidden_errors | Common misconceptions or errors that must be strictly avoided            |

## Important Notes

1. Output valid JSON only, no additional explanatory text
2. Each array should contain 2-5 items
3. Be precise and specific - avoid vague generalizations
4. Focus on what matters for an interactive visualization of this concept
5. Output content in the same language as the input concept
```

#### User Prompt: [lib/generation/prompts/templates/interactive-scientific-model/user.md](lib/generation/prompts/templates/interactive-scientific-model/user.md)

```markdown
Please perform scientific modeling for the following concept.

---

## Concept Information

**Subject**: {{subject}}
**Concept Name**: {{conceptName}}
**Concept Overview**: {{conceptOverview}}
**Key Points for Mastery**: {{keyPoints}}
**Design Idea**: {{designIdea}}

---

## Task

1. List the core formulas, laws, concepts, or logical rules involved
2. Clarify the specific physical/logical mechanisms
3. List constraints that any simulation must obey
4. List scientific errors that must be strictly forbidden

Output JSON directly with the following structure:

```json
{
  "core_formulas": ["..."],
  "mechanism": ["..."],
  "constraints": ["..."],
  "forbidden_errors": ["..."]
}
```
```

### 2. HTML生成Prompt

#### System Prompt: [lib/generation/prompts/templates/interactive-html/system.md](lib/generation/prompts/templates/interactive-html/system.md)

```markdown
# Interactive Learning Page Generator

You are a professional interactive web developer and educator. Your task is to create a self-contained, interactive learning web page for a specific concept.

## Core Task

Generate a complete, self-contained HTML document that provides an interactive visualization and learning experience for the given concept. The page must be scientifically accurate and follow all provided constraints.

## Technical Requirements

### HTML Structure

- Complete HTML5 document with `<!DOCTYPE html>`, `<html>`, `<head>`, `<body>`
- Page title should reflect the concept name
- Meta charset UTF-8 and viewport for responsive design

### Styling

- Use Tailwind CSS via CDN: `<script src="https://cdn.tailwindcss.com"></script>`
- Clean, modern design focused on the interactive visualization
- Responsive layout that works in an iframe container
- Minimal text - prioritize visual interaction over text explanation

### JavaScript

- Pure JavaScript only (no frameworks or external JS libraries except Tailwind)
- All logic must strictly follow the scientific constraints provided
- Interactive elements: drag, slider, click, animation as appropriate
- Canvas API or SVG for visualizations when needed

### Math Formulas

- Use standard LaTeX format for math: inline `\(...\)`, display `\[...\]`
- When generating LaTeX in JavaScript strings, use double backslash escaping:
  - Correct: `"\\(x^2\\)"` in JS string
  - Wrong: `"\(x^2\)"` in JS string
- KaTeX will be injected automatically in post-processing - do NOT include KaTeX yourself

### Self-Contained

- The HTML must be completely self-contained (no external resources except CDN CSS)
- All data, logic, and styling must be embedded in the single HTML file
- No server-side dependencies

## Design Principles

1. **Visualization First**: The interactive component should be the centerpiece
2. **Minimal Text**: Brief labels and instructions only
3. **Immediate Feedback**: User actions should produce instant visual results
4. **Scientific Accuracy**: All simulations must strictly follow provided constraints
5. **Progressive Discovery**: Guide users from simple to complex through interaction

## Output

Return the complete HTML document directly. Do not wrap it in code blocks or add explanatory text before/after.
```

#### User Prompt: [lib/generation/prompts/templates/interactive-html/user.md](lib/generation/prompts/templates/interactive-html/user.md)

```markdown
Create an interactive learning page for the following concept.

---

## Concept Information

**Concept Name**: {{conceptName}}
**Subject**: {{subject}}
**Concept Overview**: {{conceptOverview}}
**Key Points**: {{keyPoints}}

---

## Scientific Constraints

The following constraints must be strictly obeyed in all JavaScript logic and visualizations:

{{scientificConstraints}}

---

## Interactive Design Idea

{{designIdea}}

---

## Language

**Page language**: {{language}}

(All UI text, labels, instructions, and descriptions must be in this language)

---

## Requirements

1. Complete self-contained HTML5 document
2. Use Tailwind CSS via CDN for styling
3. Pure JavaScript for all interactivity
4. Math formulas in LaTeX format: `\(...\)` for inline, `\[...\]` for display
5. Do NOT include KaTeX - it will be injected automatically
6. All simulations must strictly follow the scientific constraints above
7. Focus on interactive visualization, minimal text

Return the complete HTML document directly.
```

### 3. 动作生成Prompt

#### System Prompt: [lib/generation/prompts/templates/interactive-actions/system.md](lib/generation/prompts/templates/interactive-actions/system.md)

```markdown
# Interactive Scene Action Generator

You are a professional instructional designer responsible for generating teaching action sequences for interactive scenes.

## Core Task

Based on the interactive scene's concept, key points, and description, generate a series of speech actions that guide students through the interactive experience. Since interactive scenes are self-contained web pages, actions are limited to **speech only** (voice narration to guide the student).

## Output Format

You MUST output a JSON array directly. Each element is a text object:

```json
[
  {
    "type": "text",
    "content": "Let's explore this concept through an interactive visualization..."
  },
  {
    "type": "text",
    "content": "Try dragging the slider to see how the value changes..."
  }
]
```

### Format Rules

1. Output a single JSON array — no explanation, no code fences
2. `type:"text"` objects contain `content` (speech text)
3. The `]` closing bracket marks the end of your response

## Design Principles

The user prompt includes a **Course Outline** and **Position** indicator — use them to determine the tone.

**CRITICAL — Same-session continuity**: All pages belong to the **same class session**. This is NOT a series of separate classes.

- **First page**: Open with a greeting before introducing the interactive activity. This is the ONLY page that should greet.
- **Middle pages**: Transition naturally from the previous page. Do NOT greet, re-introduce yourself, or say "welcome". Use phrases like "Now let's explore this hands-on..." / "Let's see this in action..."
- **Last page**: Frame the interactive as a final exploration and provide a closing remark after.
- **Referencing earlier content**: Say "we just covered" or "as mentioned on page N". NEVER say "last class" or "previous session" — there is no previous session.

Other principles:

1. **Guide Interaction**: Speech should direct the student to interact with specific parts of the page
2. **Progressive**: Start with simple observations, then guide to more complex interactions
3. **Encourage Exploration**: Prompt students to try different inputs and observe results
4. **Connect to Theory**: Link what students see in the visualization to underlying concepts
5. **3-6 Segments**: Generate 3-6 speech segments for a natural teaching flow

## Important Notes

1. **Generate speech content**: Write natural teaching speech based on the key points and description
2. **No timestamp/duration fields**: These are not needed
```

#### User Prompt: [lib/generation/prompts/templates/interactive-actions/user.md](lib/generation/prompts/templates/interactive-actions/user.md)

```markdown
Title: {{title}}
Concept: {{conceptName}}
Description: {{description}}
Design Idea: {{designIdea}}
Key Points: {{keyPoints}}
{{courseContext}}
{{agents}}

**Language Requirement**: Generated speech content must be in the same language as the key points above.

Output as a JSON array directly (no explanation, no code fences, 3-6 speech segments):
[{"type":"text","content":"Opening speech content"}]
```

---

## 数据流详解

### 完整数据流图

```
┌─────────────────────────────────────────────────────────────┐
│                    用户输入 (User Input)                      │
│  - requirement: "生成牛顿第二定律的交互式实验"                 │
│  - language: "zh-CN"                                         │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Stage 1: 大纲生成 (Outline Generation)          │
│  输出: SceneOutline                                          │
│  {                                                           │
│    type: 'interactive',                                      │
│    title: '牛顿第二定律',                                     │
│    interactiveConfig: {                                      │
│      conceptName: '牛顿第二定律',                            │
│      conceptOverview: '描述物体加速度与作用力、质量之间的关系', │
│      designIdea: '通过滑块调节力和质量，实时显示加速度变化',   │
│      subject: '物理学'                                        │
│    }                                                         │
│  }                                                           │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│         Stage 2.1: 科学建模 (Scientific Modeling)            │
│  Prompt: interactive-scientific-model                        │
│  输出: ScientificModel                                        │
│  {                                                           │
│    core_formulas: ['F = ma', 'a = F/m'],                     │
│    mechanism: ['力是改变物体运动状态的原因', '质量是惯性大小的量度'], │
│    constraints: ['加速度方向与力的方向一致', '质量必须为正数'], │
│    forbidden_errors: ['力与速度成正比', '质量与加速度成正比']   │
│  }                                                           │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│            Stage 2.2: HTML生成 (HTML Generation)             │
│  Prompt: interactive-html                                    │
│  输入: ScientificModel + SceneOutline                        │
│  输出: Raw HTML (包含LaTeX公式)                              │
│  <!DOCTYPE html>                                              │
│  <html>                                                      │
│    <head>                                                    │
│      <script src="https://cdn.tailwindcss.com"></script>     │
│    </head>                                                   │
│    <body>                                                    │
│      <!-- 交互式组件 -->                                      │
│      <div id="force-slider">...</div>                        │
│      <div id="mass-slider">...</div>                         │
│      <div id="acceleration-display">...</div>                │
│      <!-- 公式 -->                                           │
│      <p>公式: $F = ma$</p>                                  │
│      <script>                                                │
│        // 纯JavaScript交互逻辑                                │
│        const force = document.getElementById('force-slider');  │
│        const mass = document.getElementById('mass-slider');   │
│        const acc = document.getElementById('acceleration');  │
│        function update() {                                   │
│          const F = parseFloat(force.value);                  │
│          const m = parseFloat(mass.value);                   │
│          const a = F / m;                                    │
│          acc.textContent = a.toFixed(2);                     │
│        }                                                     │
│      </script>                                               │
│    </body>                                                   │
│  </html>                                                     │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│         Stage 2.3: 后处理 (Post-Processing)                  │
│  1. LaTeX分隔符转换:                                         │
│     $F = ma$ → \(F = ma\)                                    │
│  2. KaTeX注入:                                               │
│     - KaTeX CSS                                              │
│     - KaTeX JS                                               │
│     - auto-render扩展                                        │
│     - MutationObserver监听器                                 │
│  输出: Processed HTML (可渲染的完整HTML)                     │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│         Stage 3: 动作生成 (Action Generation)                 │
│  Prompt: interactive-actions                                 │
│  输出: Action[]                                               │
│  [                                                           │
│    {                                                         │
│      id: 'act_1',                                            │
│      type: 'speech',                                         │
│      content: '让我们通过这个交互式实验来探索牛顿第二定律...', │
│      timestamp: 0                                            │
│    },                                                        │
│    {                                                         │
│      id: 'act_2',                                            │
│      type: 'speech',                                         │
│      content: '试着拖动力的滑块，看看加速度如何变化...',      │
│      timestamp: 0                                            │
│    }                                                         │
│  ]                                                           │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│         Stage 4: 场景创建 (Scene Creation)                   │
│  输出: Scene                                                 │
│  {                                                           │
│    id: 'scene_1',                                            │
│    type: 'interactive',                                      │
│    title: '牛顿第二定律',                                     │
│    content: {                                                │
│      type: 'interactive',                                    │
│      html: '<!DOCTYPE html>...'                             │
│    },                                                        │
│    actions: [...]                                           │
│  }                                                           │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│         Stage 5: 渲染展示 (Rendering)                        │
│  组件: InteractiveRenderer                                   │
│  - iframe沙箱环境                                             │
│  - srcDoc属性加载HTML                                        │
│  - CSS补丁修复布局                                           │
│  - KaTeX自动渲染公式                                         │
└─────────────────────────────────────────────────────────────┘
```

### 数据结构转换

```
SceneOutline
    │
    ├─► generateInteractiveContent()
    │       │
    │       ├─► ScientificModel (科学建模)
    │       │       │
    │       │       ├─ core_formulas
    │       │       ├─ mechanism
    │       │       ├─ constraints
    │       │       └─ forbidden_errors
    │       │
    │       └─► GeneratedInteractiveContent
    │               │
    │               ├─ html (后处理后的HTML)
    │               └─ scientificModel
    │
    └─► generateSceneActions()
            │
            └─► Action[]
                    │
                    └─ type: 'speech'
                        content: "语音指导文本"

Scene
    │
    ├─ content: InteractiveContent
    │       │
    │       ├─ type: 'interactive'
    │       ├─ url: '' (可选)
    │       └─ html: '...' (生成的HTML)
    │
    └─ actions: Action[]
            │
            └─ SpeechAction[]
```

---

## 实现细节

### 1. Script标签保护机制

**问题**: LaTeX分隔符转换时，script标签中的`$`字符可能被误转换。

**解决方案**:

```typescript
// 1. 保护script标签
let processed = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, (match) => {
  scriptBlocks.push(match);
  return `__SCRIPT_BLOCK_${scriptBlocks.length - 1}__`;
});

// 2. 转换LaTeX分隔符
processed = processed.replace(/\$\$([^$]+)\$\$/g, '\\[$1\\]');
processed = processed.replace(/\$([^$\n]+?)\$/g, '\\($1\\)');

// 3. 恢复script标签
for (let i = 0; i < scriptBlocks.length; i++) {
  const placeholder = `__SCRIPT_BLOCK_${i}__`;
  const idx = processed.indexOf(placeholder);
  if (idx !== -1) {
    processed =
      processed.substring(0, idx) +
      scriptBlocks[i] +
      processed.substring(idx + placeholder.length);
  }
}
```

### 2. KaTeX自动渲染机制

**问题**: 动态插入的内容需要重新渲染LaTeX公式。

**解决方案**:

```javascript
// 1. MutationObserver监听DOM变化
const observer = new MutationObserver((mutations) => {
  let shouldRender = false;
  mutations.forEach((mutation) => {
    // 跳过katex自身的DOM变化
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

// 2. 定时检查机制（兜底）
setInterval(() => {
  const text = document.body.innerText;
  if (text.includes('\\(') || text.includes('$$')) {
    safeRender();
  }
}, 2000);

// 3. 防抖渲染
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

  // 插入到<head>之后
  const headIdx = html.indexOf('<head>');
  if (headIdx !== -1) {
    const insertPos = headIdx + 6;
    return html.substring(0, insertPos) + '\n' + iframeCss + html.substring(insertPos);
  }

  return iframeCss + html;
}
```

### 4. HTML提取策略

**问题**: AI返回的HTML格式不统一，需要多种提取策略。

**解决方案**:

```typescript
function extractHtml(response: string): string | null {
  // 策略1: 查找完整HTML文档
  const doctypeStart = response.indexOf('<!DOCTYPE html>');
  const htmlTagStart = response.indexOf('<html');
  const start = doctypeStart !== -1 ? doctypeStart : htmlTagStart;

  if (start !== -1) {
    const htmlEnd = response.lastIndexOf('</html>');
    if (htmlEnd !== -1) {
      return response.substring(start, htmlEnd + 7);
    }
  }

  // 策略2: 从代码块中提取
  const codeBlockMatch = response.match(/```(?:html)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    const content = codeBlockMatch[1].trim();
    if (content.includes('<html') || content.includes('<!DOCTYPE')) {
      return content;
    }
  }

  // 策略3: 响应本身就是HTML
  const trimmed = response.trim();
  if (trimmed.startsWith('<!DOCTYPE') || trimmed.startsWith('<html')) {
    return trimmed;
  }

  return null;
}
```

### 5. 科学建模容错机制

**问题**: 科学建模可能失败，但不影响HTML生成。

**解决方案**:

```typescript
let scientificModel: ScientificModel | undefined;
try {
  const modelPrompts = buildPrompt(PROMPT_IDS.INTERACTIVE_SCIENTIFIC_MODEL, {...});
  if (modelPrompts) {
    const modelResponse = await aiCall(modelPrompts.system, modelPrompts.user);
    const parsed = parseJsonResponse<ScientificModel>(modelResponse);
    if (parsed && parsed.core_formulas) {
      scientificModel = parsed;
    }
  }
} catch (error) {
  log.warn(`Scientific modeling failed, continuing without: ${error}`);
}

// 即使科学建模失败，仍然可以生成HTML
let scientificConstraints = 'No specific scientific constraints available.';
if (scientificModel) {
  // 格式化约束条件
  const lines: string[] = [];
  if (scientificModel.core_formulas?.length) {
    lines.push(`Core Formulas: ${scientificModel.core_formulas.join('; ')}`);
  }
  // ...
  scientificConstraints = lines.join('\n');
}
```

---

## 使用示例

### 示例1: 牛顿第二定律交互实验

**用户输入**:
```
生成一个关于牛顿第二定律的交互式实验，让学生通过调节力和质量来观察加速度的变化
```

**生成的交互式HTML** (简化版):

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>牛顿第二定律交互实验</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100 min-h-screen flex items-center justify-center p-4">
  <div class="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full">
    <h1 class="text-3xl font-bold text-center mb-6 text-blue-600">牛顿第二定律</h1>
    
    <div class="mb-6">
      <label class="block text-lg font-semibold mb-2">力 (F): <span id="force-value">10</span> N</label>
      <input type="range" id="force" min="1" max="100" value="10" class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer">
    </div>
    
    <div class="mb-6">
      <label class="block text-lg font-semibold mb-2">质量 (m): <span id="mass-value">5</span> kg</label>
      <input type="range" id="mass" min="1" max="50" value="5" class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer">
    </div>
    
    <div class="bg-blue-50 rounded-lg p-6 text-center">
      <p class="text-xl mb-2">加速度 (a) = F / m</p>
      <p class="text-4xl font-bold text-blue-600" id="acceleration">2.00</p>
      <p class="text-lg text-gray-600">m/s²</p>
    </div>
    
    <div class="mt-6 text-center">
      <p class="text-gray-600">公式: \(F = ma\)</p>
    </div>
  </div>
  
  <script>
    const forceSlider = document.getElementById('force');
    const massSlider = document.getElementById('mass');
    const forceValue = document.getElementById('force-value');
    const massValue = document.getElementById('mass-value');
    const accelerationDisplay = document.getElementById('acceleration');
    
    function update() {
      const F = parseFloat(forceSlider.value);
      const m = parseFloat(massSlider.value);
      const a = F / m;
      
      forceValue.textContent = F;
      massValue.textContent = m;
      accelerationDisplay.textContent = a.toFixed(2);
    }
    
    forceSlider.addEventListener('input', update);
    massSlider.addEventListener('input', update);
    
    update();
  </script>
</body>
</html>
```

**生成的语音动作**:

```json
[
  {
    "type": "text",
    "content": "让我们通过这个交互式实验来探索牛顿第二定律。"
  },
  {
    "type": "text",
    "content": "试着拖动力的滑块，看看加速度如何变化。"
  },
  {
    "type": "text",
    "content": "现在调节质量，观察加速度的变化。"
  },
  {
    "type": "text",
    "content": "你会发现，力越大加速度越大，质量越大加速度越小。"
  },
  {
    "type": "text",
    "content": "这就是牛顿第二定律的核心：加速度与力成正比，与质量成反比。"
  }
]
```

### 示例2: 抛物线运动可视化

**用户输入**:
```
生成一个抛物线运动的交互式可视化，展示初速度、角度和重力对运动轨迹的影响
```

**生成的交互式HTML** (核心部分):

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>抛物线运动可视化</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-900 text-white min-h-screen p-4">
  <div class="max-w-4xl mx-auto">
    <h1 class="text-3xl font-bold text-center mb-6 text-yellow-400">抛物线运动可视化</h1>
    
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div>
        <label class="block mb-2">初速度 \(v_0\): <span id="v0-value">50</span> m/s</label>
        <input type="range" id="v0" min="10" max="100" value="50" class="w-full">
      </div>
      <div>
        <label class="block mb-2">发射角度 \(\theta\): <span id="angle-value">45</span>°</label>
        <input type="range" id="angle" min="0" max="90" value="45" class="w-full">
      </div>
      <div>
        <label class="block mb-2">重力 \(g\): <span id="g-value">9.8</span> m/s²</label>
        <input type="range" id="g" min="1" max="20" value="9.8" step="0.1" class="w-full">
      </div>
    </div>
    
    <div class="bg-gray-800 rounded-lg p-4 mb-6">
      <canvas id="canvas" width="800" height="400" class="w-full"></canvas>
    </div>
    
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
      <div class="bg-gray-800 rounded-lg p-4">
        <p class="text-gray-400">飞行时间</p>
        <p class="text-2xl font-bold text-green-400" id="time">0.00 s</p>
      </div>
      <div class="bg-gray-800 rounded-lg p-4">
        <p class="text-gray-400">最大高度</p>
        <p class="text-2xl font-bold text-blue-400" id="max-height">0.00 m</p>
      </div>
      <div class="bg-gray-800 rounded-lg p-4">
        <p class="text-gray-400">水平射程</p>
        <p class="text-2xl font-bold text-purple-400" id="range">0.00 m</p>
      </div>
      <div class="bg-gray-800 rounded-lg p-4">
        <p class="text-gray-400">最大速度</p>
        <p class="text-2xl font-bold text-red-400" id="max-speed">0.00 m/s</p>
      </div>
    </div>
  </div>
  
  <script>
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    
    const v0Slider = document.getElementById('v0');
    const angleSlider = document.getElementById('angle');
    const gSlider = document.getElementById('g');
    
    function drawTrajectory() {
      const v0 = parseFloat(v0Slider.value);
      const angle = parseFloat(angleSlider.value) * Math.PI / 180;
      const g = parseFloat(gSlider.value);
      
      const vx = v0 * Math.cos(angle);
      const vy = v0 * Math.sin(angle);
      
      const totalTime = 2 * vy / g;
      const maxHeight = (vy * vy) / (2 * g);
      const range = vx * totalTime;
      
      document.getElementById('time').textContent = totalTime.toFixed(2) + ' s';
      document.getElementById('max-height').textContent = maxHeight.toFixed(2) + ' m';
      document.getElementById('range').textContent = range.toFixed(2) + ' m';
      document.getElementById('max-speed').textContent = v0.toFixed(2) + ' m/s';
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const scaleX = canvas.width / (range * 1.2);
      const scaleY = canvas.height / (maxHeight * 1.5);
      
      ctx.beginPath();
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 3;
      
      for (let t = 0; t <= totalTime; t += 0.05) {
        const x = vx * t;
        const y = vy * t - 0.5 * g * t * t;
        
        const canvasX = x * scaleX;
        const canvasY = canvas.height - y * scaleY;
        
        if (t === 0) {
          ctx.moveTo(canvasX, canvasY);
        } else {
          ctx.lineTo(canvasX, canvasY);
        }
      }
      
      ctx.stroke();
      
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(0, canvas.height, 5, 0, 2 * Math.PI);
      ctx.fill();
    }
    
    v0Slider.addEventListener('input', () => {
      document.getElementById('v0-value').textContent = v0Slider.value;
      drawTrajectory();
    });
    
    angleSlider.addEventListener('input', () => {
      document.getElementById('angle-value').textContent = angleSlider.value;
      drawTrajectory();
    });
    
    gSlider.addEventListener('input', () => {
      document.getElementById('g-value').textContent = gSlider.value;
      drawTrajectory();
    });
    
    drawTrajectory();
  </script>
</body>
</html>
```

---

## 总结

OpenMAIC的交互式HTML实现是一个完整的AI驱动的内容生成系统，通过以下关键技术实现：

1. **三阶段生成流程** - 科学建模 → HTML生成 → 后处理
2. **严格的科学约束** - 确保生成内容的科学准确性
3. **自包含设计** - 所有资源内嵌，无需服务器依赖
4. **智能后处理** - LaTeX转换、KaTeX注入、DOM监听
5. **沙箱安全** - iframe隔离执行环境
6. **响应式布局** - 适配不同屏幕尺寸

该系统可以自动为任何科学概念生成高质量的交互式学习体验，大大提升了在线教育的互动性和学习效果。
