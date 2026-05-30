// 默认书籍封面 SVG (data URI)
const DEFAULT_COVER = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
  <rect width="400" height="300" fill="#f5f0e8"/>
  <rect x="60" y="40" width="280" height="220" rx="4" fill="#fff" stroke="#d4c8b8" stroke-width="2"/>
  <line x1="80" y1="70" x2="320" y2="70" stroke="#d4c8b8" stroke-width="1"/>
  <line x1="80" y1="90" x2="280" y2="90" stroke="#d4c8b8" stroke-width="1"/>
  <line x1="80" y1="110" x2="300" y2="110" stroke="#d4c8b8" stroke-width="1"/>
  <line x1="80" y1="130" x2="260" y2="130" stroke="#d4c8b8" stroke-width="1"/>
  <line x1="80" y1="150" x2="290" y2="150" stroke="#d4c8b8" stroke-width="1"/>
  <rect x="80" y="180" width="100" height="60" rx="2" fill="#e8e0d4"/>
  <text x="200" y="260" font-family="serif" font-size="14" fill="#a09080" text-anchor="middle">默认封面</text>
</svg>`)));

let generatedCanvases = [];
let localCoverDataUrl = '';

function setStatus(msg) {
  document.getElementById('status').textContent = msg;
}

function toggleCollapse() {
  const body = document.getElementById('styleSettings');
  const icon = document.getElementById('styleToggleIcon');
  body.classList.toggle('open');
  icon.classList.toggle('open');
}

function getSettings() {
  const baseSize = parseInt(document.getElementById('baseSize').value) || 42;
  return {
    bookName: document.getElementById('bookName').value,
    chapterName: document.getElementById('chapterName').value,
    progressType: document.getElementById('progressType').value,
    progressValue: document.getElementById('progressValue').value,
    coverUrl: document.getElementById('coverUrl').value.trim(),
    quoteText: document.getElementById('quoteText').value,
    noteText: document.getElementById('noteText').value,
    pageWidth: parseInt(document.getElementById('pageWidth').value) || 1200,
    marginTop: parseInt(document.getElementById('marginTop').value) || 100,
    marginX: parseInt(document.getElementById('marginX').value) || 140,
    marginBottom: parseInt(document.getElementById('marginBottom').value) || 100,
    imageRatio: (parseInt(document.getElementById('imageRatio').value) || 24) / 100,
    imgRadius: parseInt(document.getElementById('imgRadius').value) || 8,
    titleSize: Math.round(baseSize * parseFloat(document.getElementById('titleRatio').value || 1.6)),
    chapterSize: Math.round(baseSize * parseFloat(document.getElementById('chapterRatio').value || 1.0)),
    titleColor: document.getElementById('titleColor').value || '#c5213d',
    quoteSize: Math.round(baseSize * parseFloat(document.getElementById('quoteRatio').value || 0.85)),
    quoteLineHeight: parseFloat(document.getElementById('quoteLineHeight').value) || 1.8,
    quoteBg: document.getElementById('quoteBg').value || '#f7f5f0',
    quoteColor: document.getElementById('quoteColor').value || '#4a4a4a',
    quotePaddingX: Math.round(baseSize * parseFloat(document.getElementById('quotePaddingXRatio').value || 1.0)),
    quotePaddingY: Math.round(baseSize * parseFloat(document.getElementById('quotePaddingYRatio').value || 1.5)),
    quoteRadius: parseInt(document.getElementById('quoteRadius').value) || 6,
    noteSize: Math.round(baseSize * parseFloat(document.getElementById('noteRatio').value || 0.8)),
    noteLineHeight: parseFloat(document.getElementById('noteLineHeight').value) || 1.9,
    noteColor: document.getElementById('noteColor').value || '#333333',
    paraGap: Math.round(baseSize * parseFloat(document.getElementById('paraGapRatio').value || 0.7)),
    footerSize: Math.round(baseSize * parseFloat(document.getElementById('footerRatio').value || 0.6)),
    footerColor: document.getElementById('footerColor').value || '#999999',
  };
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('图片加载失败: ' + src));
    img.src = src;
  });
}

async function waitFonts() {
  setStatus('正在加载字体...');
  try {
    await document.fonts.load('16px "HuiwenMincho"');
    await document.fonts.load('16px "LXGWWenKai"');
    await document.fonts.load('16px "Yozai"');
    await new Promise(r => setTimeout(r, 600));
    setStatus('字体加载完成');
  } catch (e) {
    setStatus('字体加载中，使用备用字体...');
    await new Promise(r => setTimeout(r, 800));
  }
}

// 不可出现在行首的标点（中文标点 + 英文标点）
function cannotStartLine(ch) {
  return /[，。、；：？！"」』》）】〉》.,;:!?)」'"]/.test(ch);
}
// 不可出现在行尾的标点
function cannotEndLine(ch) {
  return /[「《『（【〈《<({\['"]/.test(ch);
}

// 逐字测量文本换行（支持中英文混排 + 禁则处理）
// maxWidth 为文字可用的最大宽度，不包含首行缩进
function wrapText(ctx, text, maxWidth) {
  const lines = [];
  let currentLine = '';
  let currentWidth = 0;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    // 处理换行符
    if (char === '\n' || char === '\r') {
      if (char === '\r' && i + 1 < text.length && text[i+1] === '\n') {
        i++; // skip \n
      }
      lines.push(currentLine);
      currentLine = '';
      currentWidth = 0;
      continue;
    }

    const charWidth = ctx.measureText(char).width;

    // 如果当前行宽度加上这个字符超过最大宽度，且当前行不为空
    if (currentWidth + charWidth > maxWidth && currentLine.length > 0) {
      // 禁则处理：char 不可出现在行首，或当前行末字符不可出现在行尾
      if (cannotStartLine(char) || (cannotEndLine(currentLine[currentLine.length - 1]) && currentLine.length >= 2)) {
        const lastChar = currentLine[currentLine.length - 1];
        const lastCharWidth = ctx.measureText(lastChar).width;
        currentLine = currentLine.slice(0, -1);
        currentWidth -= lastCharWidth;
        lines.push(currentLine);
        currentLine = lastChar + char;
        currentWidth = lastCharWidth + charWidth;
      } else {
        lines.push(currentLine);
        currentLine = char;
        currentWidth = charWidth;
      }
    } else {
      currentLine += char;
      currentWidth += charWidth;
    }
  }

  if (currentLine.length > 0) {
    lines.push(currentLine);
  }

  return lines;
}

// 两端对齐绘制单行文本
// isLastLine: 是否为段落最后一行（最后一行左对齐，其余两端对齐）
function drawJustifiedLine(ctx, text, x, maxTextWidth, y, isLastLine) {
  if (isLastLine || text.length <= 1) {
    ctx.fillText(text, x, y);
    return;
  }
  // 测量文本总宽度
  let totalWidth = 0;
  const charWidths = [];
  for (const ch of text) {
    const w = ctx.measureText(ch).width;
    charWidths.push(w);
    totalWidth += w;
  }
  // 如果文本宽度已达到目标宽度的98%以上，不需要拉伸
  if (totalWidth >= maxTextWidth * 0.98) {
    ctx.fillText(text, x, y);
    return;
  }
  // 将额外空间均匀分配到字符之间
  const gap = (maxTextWidth - totalWidth) / (text.length - 1);
  let currentX = x;
  for (let i = 0; i < text.length; i++) {
    ctx.fillText(text[i], currentX, y);
    currentX += charWidths[i] + gap;
  }
}

// 段落分行（按段落分割，每段分别wrap）
function wrapParagraphs(ctx, text, maxWidth) {
  // 统一换行符为 \n，然后按双换行分段
  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const paragraphs = normalized.split(/\n\n+/);
  const result = [];
  for (const para of paragraphs) {
    const trimmed = para.trim();
    if (!trimmed) continue;
    const lines = wrapText(ctx, trimmed, maxWidth);
    result.push({ lines, isParagraph: true });
  }
  return result;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// 将段落结构拍扁为统一的逐行列表
// 每行包含: text, firstLine(是否段落首行,需缩进), lastLine(是否段落末行,左对齐), newPara(新段落前需加间距)
function flattenNoteLines(noteParagraphs) {
  const allLines = [];
  for (const para of noteParagraphs) {
    for (let li = 0; li < para.lines.length; li++) {
      allLines.push({
        text: para.lines[li],
        firstLine: li === 0,
        lastLine: li === para.lines.length - 1,
        newPara: li === 0 && allLines.length > 0
      });
    }
  }
  return allLines;
}

// 逐行分页：将扁平行列表按页面容量拆分
function paginateLines(allLines, pageContentHeight, s) {
  const pages = [];
  let currentPage = [];
  let currentY = 0;

  for (const entry of allLines) {
    const lineH = s.noteSize * s.noteLineHeight;
    const extraGap = (entry.newPara && currentPage.length > 0) ? s.paraGap : 0;

    if (currentY + extraGap + lineH > pageContentHeight && currentPage.length > 0) {
      pages.push(currentPage);
      currentPage = [];
      currentY = 0;
    }

    currentY += extraGap + lineH;
    currentPage.push(entry);
  }
  if (currentPage.length > 0) pages.push(currentPage);

  return pages;
}

// 在指定canvas context上绘制笔记行（从startY开始），用于第一页
function drawNoteLines(ctx, lineEntries, startY, s, pageWidth) {
  let pageY = startY;
  ctx.font = `${s.noteSize}px "Yozai", sans-serif`;
  ctx.fillStyle = s.noteColor;
  ctx.textAlign = 'left';
  const noteIndent = s.noteSize * 2;
  const contentWidth = pageWidth - s.marginX * 2;
  const noteTextWidth = contentWidth - noteIndent;

  for (const entry of lineEntries) {
    if (entry.newPara) pageY += s.paraGap;
    const lineX = s.marginX + (entry.firstLine ? noteIndent : 0);
    const targetWidth = entry.firstLine ? noteTextWidth : contentWidth;
    drawJustifiedLine(ctx, entry.text, lineX, targetWidth, pageY + s.noteSize, entry.lastLine);
    pageY += s.noteSize * s.noteLineHeight;
  }
}

// 为后续页创建完整canvas（从marginTop开始绘制）
function drawNotePage(s, lineEntries, pageNum, totalPages, pageWidth, pageHeight) {
  const canvas = document.createElement('canvas');
  canvas.width = pageWidth * 2;
  canvas.height = pageHeight * 2;
  const ctx = canvas.getContext('2d');
  ctx.scale(2, 2);

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, pageWidth, pageHeight);

  drawNoteLines(ctx, lineEntries, s.marginTop, s, pageWidth);
  drawFooter(ctx, s, pageNum, totalPages, pageHeight);
  generatedCanvases.push(canvas);
}

function drawFooter(ctx, s, pageNum, totalPages, pageHeight) {
  const footerY = pageHeight - s.marginBottom + s.footerSize;
  ctx.font = `${s.footerSize}px "Yozai", sans-serif`;
  ctx.fillStyle = s.footerColor;

  // 日期格式：YYYY-MM-DD，居左
  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;

  // 进度/页码信息（居右）
  const rightParts = [];
  if (s.progressValue) {
    if (s.progressType === 'percent') rightParts.push(`进度：${s.progressValue}`);
    else if (s.progressType === 'page') rightParts.push(`第 ${s.progressValue} 页`);
    else rightParts.push(`章节内第 ${s.progressValue} 页`);
  }
  if (totalPages > 1) {
    rightParts.push(`第 ${pageNum} 页 / 共 ${totalPages} 页`);
  }

  const leftText = dateStr;
  const rightText = rightParts.join('  ·  ');

  ctx.textAlign = 'left';
  ctx.fillText(leftText, s.marginX, footerY);

  if (rightText) {
    ctx.textAlign = 'right';
    ctx.fillText(rightText, s.pageWidth - s.marginX, footerY);
  }

  ctx.textAlign = 'left';
}

async function generate() {
  setStatus('正在生成...');
  const s = getSettings();
  const pageWidth = s.pageWidth;
  const pageHeight = Math.round(pageWidth * 297 / 210);
  const contentWidth = pageWidth - s.marginX * 2;

  generatedCanvases = [];

  // 加载封面图（优先使用本地选择的图片）
  let coverImg = null;
  try {
    const coverSrc = localCoverDataUrl || s.coverUrl || DEFAULT_COVER;
    coverImg = await loadImage(coverSrc);
  } catch (e) {
    try {
      coverImg = await loadImage(DEFAULT_COVER);
    } catch (e2) {
      setStatus('默认封面加载失败');
      return;
    }
  }

  // 等待字体
  await waitFonts();

  // ===== 第一页 =====
  const canvas1 = document.createElement('canvas');
  canvas1.width = pageWidth * 2;  // 高分辨率
  canvas1.height = pageHeight * 2;
  const ctx1 = canvas1.getContext('2d');
  ctx1.scale(2, 2);

  // 白色背景
  ctx1.fillStyle = '#ffffff';
  ctx1.fillRect(0, 0, pageWidth, pageHeight);

  let currentY = s.marginTop;

  // 1. 顶部图片区域
  const imgAreaHeight = pageHeight * s.imageRatio;
  const imgMaxW = contentWidth * 0.55;
  const imgMaxH = imgAreaHeight * 0.7;

  let imgDrawW, imgDrawH;
  const imgRatio = coverImg.width / coverImg.height;
  const maxRatio = imgMaxW / imgMaxH;

  if (imgRatio > maxRatio) {
    imgDrawW = imgMaxW;
    imgDrawH = imgMaxW / imgRatio;
  } else {
    imgDrawH = imgMaxH;
    imgDrawW = imgMaxH * imgRatio;
  }

  const imgX = (pageWidth - imgDrawW) / 2;
  const imgY = currentY + (imgAreaHeight - imgDrawH) / 2;

  if (s.imgRadius > 0) {
    ctx1.save();
    roundRect(ctx1, imgX, imgY, imgDrawW, imgDrawH, s.imgRadius);
    ctx1.clip();
    ctx1.drawImage(coverImg, imgX, imgY, imgDrawW, imgDrawH);
    ctx1.restore();
  } else {
    ctx1.drawImage(coverImg, imgX, imgY, imgDrawW, imgDrawH);
  }

  currentY = s.marginTop + imgAreaHeight + 24;

  // 2. 书名（玫红色，霞鹜文楷）
  ctx1.font = `bold ${s.titleSize}px "LXGWWenKai", sans-serif`;
  ctx1.fillStyle = s.titleColor;
  ctx1.textAlign = 'center';
  ctx1.fillText(s.bookName, pageWidth / 2, currentY + s.titleSize * 0.85);
  currentY += s.titleSize + 14;

  // 3. 章节名
  ctx1.font = `${s.chapterSize}px "LXGWWenKai", sans-serif`;
  ctx1.fillStyle = s.titleColor;
  ctx1.fillText(s.chapterName, pageWidth / 2, currentY + s.chapterSize * 0.85);
  currentY += s.chapterSize + 32;

  // 4. 摘抄内容（汇文明朝体，无背景）
  ctx1.font = `${s.quoteSize}px "HuiwenMincho", serif`;

  // 判断摘抄是否为多段落
  const quoteNormalized = s.quoteText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const quoteParagraphsRaw = quoteNormalized.split(/\n\n+/).filter(p => p.trim());
  const isMultiParaQuote = quoteParagraphsRaw.length > 1;
  const indentSize = s.quoteSize * 2;
  const quoteTextWidth = contentWidth - (isMultiParaQuote ? indentSize : 0);

  const quoteParaLines = [];
  let totalQuoteLines = 0;
  for (const para of quoteParagraphsRaw) {
    const lines = wrapText(ctx1, para.trim(), quoteTextWidth);
    quoteParaLines.push(lines);
    totalQuoteLines += lines.length;
  }

  const quoteLineH = s.quoteSize * s.quoteLineHeight;
  const quoteStartY = currentY;

  ctx1.fillStyle = s.quoteColor;
  ctx1.textAlign = 'left';
  let quoteY = quoteStartY + s.quoteSize;
  for (let pi = 0; pi < quoteParaLines.length; pi++) {
    const lines = quoteParaLines[pi];
    const isMultiPara = quoteParaLines.length > 1 && isMultiParaQuote;
    for (let li = 0; li < lines.length; li++) {
      const isFirstLine = (li === 0);
      const isLastLine = (li === lines.length - 1);
      let lineX, lineTargetWidth;
      if (isMultiPara && isFirstLine) {
        lineX = s.marginX + indentSize;
        lineTargetWidth = quoteTextWidth;
      } else if (isMultiPara) {
        lineX = s.marginX;
        lineTargetWidth = contentWidth;
      } else {
        lineX = s.marginX;
        lineTargetWidth = contentWidth;
      }
      drawJustifiedLine(ctx1, lines[li], lineX, lineTargetWidth, quoteY, isLastLine);
      quoteY += quoteLineH;
    }
  }

  // 虚线分隔线（摘抄与笔记之间）
  const quoteEndY = quoteStartY + totalQuoteLines * quoteLineH;
  currentY = quoteEndY + 40;
  ctx1.save();
  ctx1.strokeStyle = '#ccc8bf';
  ctx1.lineWidth = 2;
  ctx1.setLineDash([14, 10]);
  ctx1.beginPath();
  ctx1.moveTo(s.marginX, currentY);
  ctx1.lineTo(pageWidth - s.marginX, currentY);
  ctx1.stroke();
  ctx1.setLineDash([]);
  ctx1.restore();
  currentY += 64;

  // 5. 笔记区域（悠哉字体）—— 逐行分页，段落可跨页
  const footerReserve = s.footerSize * 2;

  ctx1.font = `${s.noteSize}px "Yozai", sans-serif`;
  const noteIndent = s.noteSize * 2;
  const noteTextWidth = contentWidth - noteIndent;
  const noteParagraphs = wrapParagraphs(ctx1, s.noteText, noteTextWidth);

  // 拍扁为逐行列表
  const allNoteLines = flattenNoteLines(noteParagraphs);

  // 第一页笔记可用高度
  const firstPageContentHeight = pageHeight - s.marginBottom - footerReserve - currentY;

  // 逐行分页: 第一页与后续页共用高度基准
  const pageContentHeight = pageHeight - s.marginTop - s.marginBottom - footerReserve;

  // 第一页能放的行数（用实际可用高度重新计算）
  let firstPageCount = 0;
  let firstPageY = 0;
  for (const entry of allNoteLines) {
    const lineH = s.noteSize * s.noteLineHeight;
    const extraGap = (entry.newPara && firstPageCount > 0) ? s.paraGap : 0;
    if (firstPageY + extraGap + lineH > firstPageContentHeight) break;
    firstPageY += extraGap + lineH;
    firstPageCount++;
  }

  // 总页数
  const totalPages = 1 + (allNoteLines.length > firstPageCount ?
    paginateLines(allNoteLines.slice(firstPageCount), pageContentHeight, s).length : 0);

  // 绘制第一页笔记
  if (firstPageCount > 0) {
    drawNoteLines(ctx1, allNoteLines.slice(0, firstPageCount), currentY, s, pageWidth);
  }

  // 页脚
  drawFooter(ctx1, s, 1, totalPages, pageHeight);
  generatedCanvases.push(canvas1);

  // ===== 后续页 =====
  if (allNoteLines.length > firstPageCount) {
    const remainingLines = allNoteLines.slice(firstPageCount);
    const subsequentPages = paginateLines(remainingLines, pageContentHeight, s);
    for (let pi = 0; pi < subsequentPages.length; pi++) {
      drawNotePage(s, subsequentPages[pi], pi + 2, totalPages, pageWidth, pageHeight);
    }
  }

  renderPreview();
  setStatus(`生成完成，共 ${totalPages} 页 · 分辨率 ${pageWidth*2}×${pageHeight*2}`);
}

function renderPreview() {
  const wrapper = document.getElementById('previewWrapper');
  wrapper.innerHTML = '';

  // 判断是否为移动端
  const isMobile = window.innerWidth <= 768;
  const panelWidth = isMobile ? 0 : (document.getElementById('panel')?.offsetWidth || 400);
  const maxPreviewWidth = Math.min(700, window.innerWidth - panelWidth - 60);

  generatedCanvases.forEach((canvas, idx) => {
    const label = document.createElement('div');
    label.className = 'page-label';
    label.textContent = `第 ${idx + 1} 页 / 共 ${generatedCanvases.length} 页`;
    wrapper.appendChild(label);

    // 创建预览用低分辨率副本（保持比例）
    const preview = document.createElement('canvas');
    const scale = Math.max(0.1, maxPreviewWidth / canvas.width);
    preview.width = Math.floor(maxPreviewWidth);
    preview.height = Math.floor(canvas.height * scale);
    const pctx = preview.getContext('2d');
    pctx.drawImage(canvas, 0, 0, preview.width, preview.height);
    preview.style.maxWidth = '100%';
    wrapper.appendChild(preview);
  });
}

function downloadAll() {
  if (generatedCanvases.length === 0) {
    alert('请先生成卡片');
    return;
  }
  const s = getSettings();
  const book = s.bookName || '读书卡片';
  generatedCanvases.forEach((canvas, idx) => {
    const link = document.createElement('a');
    link.download = `${book}_卡片_${idx + 1}页.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  });
  setStatus('下载已开始');
}

// ===== 本地存储：自动保存/恢复所有设置 =====
const STORAGE_KEY = 'reading_card_settings';

function saveSettings() {
  const data = {
    bookName: document.getElementById('bookName').value,
    chapterName: document.getElementById('chapterName').value,
    progressType: document.getElementById('progressType').value,
    progressValue: document.getElementById('progressValue').value,
    coverUrl: document.getElementById('coverUrl').value.trim(),
    quoteText: document.getElementById('quoteText').value,
    noteText: document.getElementById('noteText').value,
    baseSize: document.getElementById('baseSize').value,
    pageWidth: document.getElementById('pageWidth').value,
    marginTop: document.getElementById('marginTop').value,
    marginX: document.getElementById('marginX').value,
    marginBottom: document.getElementById('marginBottom').value,
    imageRatio: document.getElementById('imageRatio').value,
    imgRadius: document.getElementById('imgRadius').value,
    titleRatio: document.getElementById('titleRatio').value,
    chapterRatio: document.getElementById('chapterRatio').value,
    titleColor: document.getElementById('titleColor').value,
    quoteRatio: document.getElementById('quoteRatio').value,
    quoteLineHeight: document.getElementById('quoteLineHeight').value,
    quoteBg: document.getElementById('quoteBg').value,
    quoteColor: document.getElementById('quoteColor').value,
    quotePaddingXRatio: document.getElementById('quotePaddingXRatio').value,
    quotePaddingYRatio: document.getElementById('quotePaddingYRatio').value,
    quoteRadius: document.getElementById('quoteRadius').value,
    noteRatio: document.getElementById('noteRatio').value,
    noteLineHeight: document.getElementById('noteLineHeight').value,
    noteColor: document.getElementById('noteColor').value,
    paraGapRatio: document.getElementById('paraGapRatio').value,
    footerRatio: document.getElementById('footerRatio').value,
    footerColor: document.getElementById('footerColor').value,
    localCoverDataUrl: localCoverDataUrl,
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    // localStorage 满了，尝试不保存封面图
    if (localCoverDataUrl) {
      data.localCoverDataUrl = '';
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (_) {}
    }
  }
}

function restoreSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    const setVal = (id, val) => { if (val !== undefined && val !== null) { const el = document.getElementById(id); if (el) el.value = val; } };
    setVal('bookName', data.bookName);
    setVal('chapterName', data.chapterName);
    setVal('progressType', data.progressType);
    setVal('progressValue', data.progressValue);
    setVal('coverUrl', data.coverUrl);
    setVal('quoteText', data.quoteText);
    setVal('noteText', data.noteText);
    setVal('baseSize', data.baseSize);
    setVal('pageWidth', data.pageWidth);
    setVal('marginTop', data.marginTop);
    setVal('marginX', data.marginX);
    setVal('marginBottom', data.marginBottom);
    setVal('imageRatio', data.imageRatio);
    setVal('imgRadius', data.imgRadius);
    setVal('titleRatio', data.titleRatio);
    setVal('chapterRatio', data.chapterRatio);
    setVal('titleColor', data.titleColor);
    setVal('quoteRatio', data.quoteRatio);
    setVal('quoteLineHeight', data.quoteLineHeight);
    setVal('quoteBg', data.quoteBg);
    setVal('quoteColor', data.quoteColor);
    setVal('quotePaddingXRatio', data.quotePaddingXRatio);
    setVal('quotePaddingYRatio', data.quotePaddingYRatio);
    setVal('quoteRadius', data.quoteRadius);
    setVal('noteRatio', data.noteRatio);
    setVal('noteLineHeight', data.noteLineHeight);
    setVal('noteColor', data.noteColor);
    setVal('paraGapRatio', data.paraGapRatio);
    setVal('footerRatio', data.footerRatio);
    setVal('footerColor', data.footerColor);
    if (data.localCoverDataUrl) {
      localCoverDataUrl = data.localCoverDataUrl;
    }
    return true;
  } catch (e) {
    return false;
  }
}

// 本地图片上传和拖拽处理
function setupImageUpload() {
  const dropZone = document.getElementById('dropZone');
  const coverFile = document.getElementById('coverFile');
  const coverUrl = document.getElementById('coverUrl');

  // 点击上传
  dropZone.addEventListener('click', () => coverFile.click());

  coverFile.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) handleImageFile(file);
  });

  // 拖拽事件
  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
  });
  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
  });
  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleImageFile(file);
    }
  });

  // URL输入变化时清除本地图片
  coverUrl.addEventListener('input', () => {
    if (coverUrl.value.trim()) {
      localCoverDataUrl = '';
    }
  });
}

function handleImageFile(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    localCoverDataUrl = e.target.result;
    document.getElementById('coverUrl').value = '';
    setStatus('图片已加载');
    saveSettings();
    generate().catch(console.error);
  };
  reader.readAsDataURL(file);
}

// 监听输入变化，防抖保存并重新生成
let debounceTimer;
const inputs = document.querySelectorAll('input, textarea, select');
inputs.forEach(el => {
  el.addEventListener('input', () => {
    saveSettings();
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => generate().catch(console.error), 800);
  });
});

// 事件绑定
document.getElementById('btnGenerate').addEventListener('click', () => generate().catch(console.error));
document.getElementById('btnDownload').addEventListener('click', downloadAll);
document.getElementById('styleHeader').addEventListener('click', toggleCollapse);

// 页面加载后恢复设置、自动生成
window.addEventListener('load', () => {
  const restored = restoreSettings();
  setupImageUpload();
  toggleCollapse();

  setTimeout(() => {
    generate().catch(err => {
      console.error(err);
      setStatus('首次生成可能需要等待字体加载，请稍后再试');
    });
  }, restored ? 1500 : 2000);
});

// 窗口大小变化时重新渲染预览
window.addEventListener('resize', () => {
  if (generatedCanvases.length > 0) {
    renderPreview();
  }
});
