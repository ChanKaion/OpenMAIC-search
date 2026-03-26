# 交互式HTML生成 - PlantUML查看指南

## 📝 重要说明

**PlantUML已经被官方弃用**，推荐使用以下替代方案查看流程图：

1. **在线渲染**（推荐，无需安装）
2. **VS Code插件**（推荐，方便编辑和预览）
3. **Mermaid替代**（PlantUML的现代替代品）

---

## 🌐 方案1: 在线渲染（推荐）

### 访问在线PlantUML渲染器

访问以下网站，将`.puml`文件内容粘贴进去即可渲染：

1. **PlantUML官方服务器** (推荐)
   - 网址: https://plantuml.com/plantuml/uml/
   - 支持所有PlantUML语法
   - 可导出PNG、SVG、PDF

2. **PlantText** (快速预览)
   - 网址: https://app.timelessq.com/office/plantuml-editor
   - 实时预览
   - 支持多种图表类型

### 使用步骤

1. 打开 `.puml` 文件（如`交互式HTML生成流程图.puml`）
2. 复制全部内容
3. 粘贴到在线渲染器
4. 查看生成的图表
5. 可以下载为PNG、SVG或PDF

---

## 🔌 方案2: VS Code插件（推荐）

### 安装PlantUML插件

在VS Code中安装以下插件之一：

#### 选项1: PlantUML (官方插件)

```bash
# 在VS Code中按 Ctrl+Shift+X
# 搜索 "PlantUML"
# 点击安装
```

**功能**:
- 实时预览
- 导出PNG、SVG
- 支持所有PlantUML语法

#### 选项2: Markdown Preview Enhanced

```bash
# 在VS Code中按 Ctrl+Shift+X
# 搜索 "Markdown Preview Enhanced"
# 点击安装
```

**功能**:
- 支持PlantUML和Mermaid
- 实时预览
- 导出多种格式

### 使用步骤

1. 在VS Code中打开`.puml`文件
2. 按 `Ctrl+Shift+P` (Windows/Linux) 或 `Cmd+Shift+P` (Mac)
3. 输入 "PlantUML: Preview Current Diagram"
4. 选择预览或导出

---

## 🔄 方案3: Mermaid替代方案

PlantUML已被弃用，推荐使用Mermaid作为替代品。

### Mermaid vs PlantUML对比

| 特性 | PlantUML | Mermaid |
|------|-----------|---------|
| 状态 | 已弃用 | 活跃维护 |
| 语法 | 特殊语法 | 更简洁 |
| 渲染 | 需要Java | 纯JavaScript |
| 集成 | 有限 | 广泛支持 |

### 在线Mermaid渲染器

访问 https://mermaid.live/ 即可在线渲染Mermaid图表。

### VS Code Mermaid插件

```bash
# 在VS Code中按 Ctrl+Shift+X
# 搜索 "Mermaid Preview"
# 点击安装
```

---

## 📊 查看当前流程图

### 方法1: 使用在线渲染器

1. 打开 `交互式HTML生成流程图.puml`
2. 复制全部内容
3. 访问 https://plantuml.com/plantuml/uml/
4. 粘贴内容
5. 查看渲染结果

### 方法2: 使用VS Code插件

1. 安装 "PlantUML" 插件
2. 在VS Code中打开 `.puml` 文件
3. 按 `Ctrl+Shift+P`
4. 输入 "PlantUML: Preview"
5. 查看预览

### 方法3: 查看文本版本

如果无法渲染，可以查看 `交互式HTML生成-PlantUML说明.md` 文件，其中包含详细的文字说明。

---

## 🎯 推荐方案

**最简单**: 使用在线渲染器 https://plantuml.com/plantuml/uml/

**最方便**: 安装VS Code插件 "PlantUML"

**最现代**: 考虑迁移到Mermaid

---

## 📚 相关资源

- [PlantUML官方文档](https://plantuml.com/zh/)
- [Mermaid官方文档](https://mermaid.js.org/intro/)
- [VS Code插件市场](https://marketplace.visualstudio.com/)

---

## 💡 快速开始

如果你想立即查看流程图，请：

1. **打开** `交互式HTML生成流程图.puml`
2. **复制** 全部内容
3. **访问** https://plantuml.com/plantuml/uml/
4. **粘贴** 内容
5. **查看** 渲染的流程图

或者：

1. **安装** VS Code插件 "PlantUML"
2. **打开** `.puml` 文件
3. **预览** 实时渲染的图表
