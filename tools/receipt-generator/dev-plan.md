# 留台单生成器 - 重构开发文档

## 一、项目现状分析

### 当前文件结构
```
receipt-generator/
├── index.html          # 所有代码混合（HTML + CSS + JS，共684行）
└── 汇文明朝体.otf      # 本地字体（未使用）
```

### 存在的问题

| # | 问题 | 严重程度 | 说明 |
|---|------|----------|------|
| 1 | 代码未分离 | 中 | HTML/CSS/JS 全部混合在 index.html 中，难以维护 |
| 2 | 字体未使用本地文件 | 高 | 代码使用系统字体 "Songti SC" 等，未加载目录下的 `汇文明朝体.otf`，不同设备渲染效果不一致 |
| 3 | Canvas 绘制不精准 | 高 | 使用 `fillText` 整段绘制 + 硬编码偏移量，导致排版错乱、文字重叠 |
| 4 | 尺寸切换功能简陋 | 中 | 仅4个预设比例，无自定义选项，像素值不可配置 |

---

## 二、重构目标

### 2.1 三分离
将单文件拆分为三个独立文件：
- `index.html` — 纯结构（HTML 标签）
- `style.css` — 纯样式（CSS 规则）
- `script.js` — 纯逻辑（JavaScript）

### 2.2 本地字体加载
- 使用 `@font-face` 加载 `汇文明朝体.otf`
- 字体名称定义为 `HuiwenMincho`
- 预览区和 Canvas 绘制统一使用该字体
- 确保字体加载完成后再进行首次绘制

### 2.3 精准绘制方案（核心重构）

**核心思路：HTML 预览 → 测量 → 逐字绘制**

```
用户表单数据
    ↓
① 构建 HTML 预览元素（隐藏的 DOM 节点，与最终输出同尺寸同样式）
    ↓
② 使用 getBoundingClientRect() / getComputedStyle() 测量每个文字元素的实际位置和大小
    ↓
③ 将测量结果映射到 Canvas 坐标系
    ↓
④ 逐文字调用 ctx.fillText() 绘制到 Canvas（保证精准对齐）
```

**具体实现步骤：**

1. **创建预览容器**：一个与 Canvas 逻辑尺寸相同的隐藏 `div`，应用与最终输出一致的 CSS 样式
2. **构建预览内容**：根据表单数据，动态生成与最终排版一致的 HTML 结构
3. **测量阶段**：遍历预览容器中的所有文字节点，记录每个文字的：
   - 绝对位置 (x, y)
   - 字体大小 (fontSize)
   - 字体粗细 (fontWeight)
   - 行高 (lineHeight)
4. **绘制阶段**：将测量数据映射到 Canvas 坐标，逐字绘制

### 2.4 尺寸切换改进

**预设比例配置：**
```javascript
const RATIO_CONFIG = {
    '1:1':   { label: '1:1',   width: 900,  height: 900  },
    '3:4':   { label: '3:4',   width: 900,  height: 1200 },
    '4:3':   { label: '4:3',   width: 900,  height: 675  },
    '9:16':  { label: '9:16',  width: 810,  height: 1440 },
    '16:9':  { label: '16:9',  width: 1440, height: 810  },
    '2:3':   { label: '2:3',   width: 800,  height: 1200 },
    'custom':{ label: '自定义', width: 900,  height: null }, // height 由内容决定
};
```

**自定义模式：**
- 固定宽度（默认900px，可调整）
- 高度自动根据内容撑开
- 用户可输入自定义宽度值

---

## 三、重构后文件结构

```
receipt-generator/
├── index.html          # HTML 结构
├── style.css           # CSS 样式
├── script.js           # JavaScript 逻辑
├── 汇文明朝体.otf      # 本地字体
└── dev-plan.md         # 本开发文档
```

---

## 四、实施步骤

### 步骤1：三分离
- [ ] 从 index.html 提取所有 `<style>` 内容到 style.css
- [ ] 从 index.html 提取所有 `<script>` 内容到 script.js
- [ ] 在 index.html 中添加 `<link>` 和 `<script>` 引用
- [ ] 验证功能不变

### 步骤2：本地字体加载
- [ ] 在 style.css 中添加 `@font-face` 规则
- [ ] 将所有字体引用从 "Songti SC" 系列改为 "HuiwenMincho"
- [ ] 添加字体加载检测（`document.fonts.ready`）
- [ ] 验证字体渲染效果

### 步骤3：精准绘制重构
- [ ] 设计 HTML 预览模板结构（与最终输出一致的 DOM 结构）
- [ ] 实现 `buildPreview()` 函数：根据表单数据生成预览 HTML
- [ ] 实现 `measureElements()` 函数：遍历预览 DOM，采集每个文字节点的位置/样式信息
- [ ] 实现 `drawFromMeasurements()` 函数：根据测量数据逐字绘制到 Canvas
- [ ] 替换原有的 `draw()` 函数
- [ ] 验证各品项区域排版正确、无重叠

### 步骤4：尺寸切换改进
- [ ] 实现 RATIO_CONFIG 配置对象
- [ ] 重构尺寸选择 UI：显示比例缩略图 + 像素值标注
- [ ] 实现自定义模式（固定宽度 + 高度自适应）
- [ ] 验证各比例切换正常

### 步骤5：验证与清理
- [ ] 完整功能测试：表单编辑、预览更新、图片下载
- [ ] 检查并删除未使用的变量、函数、CSS 规则
- [ ] 确认代码注释完整清晰

---

## 五、关键技术细节

### 5.1 字体加载方案
```css
@font-face {
    font-family: 'HuiwenMincho';
    src: url('汇文明朝体.otf') format('opentype');
    font-weight: normal;
    font-style: normal;
    font-display: block; /* 确保字体加载完成后再渲染 */
}
```

```javascript
// 等待字体加载完成
document.fonts.ready.then(() => { init(); });
```

### 5.2 HTML 预览 → Canvas 绘制映射

预览容器需满足：
- 与 Canvas 逻辑尺寸完全一致（width × height 像素）
- 使用 `position: relative` 作为定位参考
- 内部元素使用实际 CSS 样式（字体、大小、间距等）

测量方法：
```javascript
function measureElement(el, container) {
    const elRect = el.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    const style = window.getComputedStyle(el);
    return {
        x: elRect.left - containerRect.left,
        y: elRect.top - containerRect.top,
        width: elRect.width,
        height: elRect.height,
        fontSize: parseFloat(style.fontSize),
        fontWeight: style.fontWeight,
        lineHeight: parseFloat(style.lineHeight),
        text: el.textContent
    };
}
```

逐字绘制：
```javascript
function drawChar(ctx, char, x, y, fontSize, fontWeight) {
    ctx.font = `${fontWeight} ${fontSize}px "HuiwenMincho"`;
    ctx.textBaseline = 'top';
    ctx.fillText(char, x, y);
}
```

### 5.3 DPR 适配
Canvas 需要处理设备像素比（DPR），但预览 DOM 使用 CSS 像素，因此：
- 预览容器尺寸 = Canvas 逻辑尺寸（CSS 像素）
- Canvas 物理尺寸 = 逻辑尺寸 × DPR
- 绘制时 `ctx.scale(dpr, dpr)` 后使用逻辑坐标
