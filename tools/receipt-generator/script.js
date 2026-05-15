/* ===================== 比例配置 ===================== */
const RATIO_CONFIG = {
    '3:4':   { label: '3:4',   width: 900,  height: 1200 },
    '3:5':   { label: '3:5',   width: 900,  height: 1500 },
    '1:2':   { label: '1:2',   width: 900,  height: 1800  },
    'custom':{ label: '自定义', width: 900,  height: null }
};

/* ===================== 数据状态 ===================== */
let state = {
    /* 比例与尺寸 */
    ratio: '3:4',
    baseWidth: 900,
    /* 基本信息 */
    tableNo: 'A668',
    peopleCount: '2',
    serialNo: 'Read-20260214-1314',
    datetime: '2026-02-14 13:14:00',
    operator: 'Dao_Mouse',
    /* 备注与标语 */
    note: '一灯能除千年暗，一智能灭万年愚。',
    slogan: "THE HEART'S LAMP ALONE ENDURES THE AGES",
    showBarcode: true,
    /* 品项 */
    items: [
        { no: '01', name: '堂吉诃德·风车拿铁', qty: 1, price: 40.5, recipe: '骑士小说+现实荒诞|堂吉诃德x桑丘', note: '他不是在跟风车打架，是在给世界整活。' },
        { no: '02', name: '1984·双重思想冰沙', qty: 1, price: 19.84, recipe: '反乌托邦+监控惊悚|温斯顿x茱莉亚', note: '老大哥在看着你——但这杯挺好喝，真的。' }
    ],
    desserts: [
        { no: '01', name: '傲慢与偏见·达西酥饼', qty: 1, price: 28.0, recipe: '浪漫+阶级差异|达西x伊丽莎白', note: '凡是有钱的单身汉，总得啃块酥饼。' }
    ],
    drinks: [
        { no: '01', name: '哈利波特·黄油啤酒(麻瓜版)', qty: 1, price: 9.75, recipe: '魔法+校园冒险|哈利x赫敏x罗恩', note: '你是个巫师，哈利——可惜驾照还是得考。' }
    ]
};

const canvas = document.getElementById('receiptCanvas');
const ctx = canvas.getContext('2d');
const FONT = '"HuiwenMincho", serif';
const FONT_EN = '"Times New Roman", serif';

/* ===================== 初始化 ===================== */
function init() {
    populateForm();
    renderSizeSelector();
    renderItemForms();
    setCanvasSize();
    draw();
}

/* ===================== 尺寸选择器 ===================== */
function renderSizeSelector() {
    const container = document.getElementById('sizeSelector');
    container.innerHTML = '';
    Object.entries(RATIO_CONFIG).forEach(([key, cfg]) => {
        const btn = document.createElement('button');
        btn.className = 'size-btn' + (key === state.ratio ? ' active' : '');
        const pixelInfo = cfg.height
            ? `${cfg.width}×${cfg.height}`
            : `${cfg.width}×自适应`;
        btn.innerHTML = `<span class="size-label">${cfg.label}</span><span class="size-pixels">${pixelInfo}</span>`;
        btn.onclick = () => setRatio(key, btn);
        container.appendChild(btn);
    });
    /* 自定义宽度输入 */
    const customGroup = document.getElementById('customWidthGroup');
    if (state.ratio === 'custom') {
        customGroup.classList.add('show');
    } else {
        customGroup.classList.remove('show');
    }
    document.getElementById('customWidthInput').value = state.baseWidth;
}

function setRatio(ratio, btn) {
    document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.ratio = ratio;
    if (ratio === 'custom') {
        state.baseWidth = parseInt(document.getElementById('customWidthInput').value) || 900;
        document.getElementById('customWidthGroup').classList.add('show');
    } else {
        state.baseWidth = RATIO_CONFIG[ratio].width;
        document.getElementById('customWidthGroup').classList.remove('show');
    }
    setCanvasSize();
    draw();
}

function applyCustomWidth() {
    const val = parseInt(document.getElementById('customWidthInput').value);
    if (val && val >= 400 && val <= 2000) {
        state.baseWidth = val;
        setCanvasSize();
        draw();
    }
}

function setCanvasSize() {
    const cfg = RATIO_CONFIG[state.ratio];
    const w = state.baseWidth;
    const h = cfg.height || w * 4 / 3;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
}

/* ===================== 品项表单管理 ===================== */
function createItemForm(item, index, type) {
    return `
    <div class="item-card">
        <button class="remove-btn" onclick="removeItem('${type}', ${index})">×</button>
        <div class="form-row">
            <div class="form-group" style="flex:0 0 60px">
                <label>编号</label>
                <input type="text" value="${item.no}" oninput="updateItem('${type}', ${index}, 'no', this.value)" placeholder="01">
            </div>
            <div class="form-group" style="flex:1">
                <label>名称</label>
                <input type="text" value="${item.name}" oninput="updateItem('${type}', ${index}, 'name', this.value)">
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>数量</label>
                <input type="number" value="${item.qty}" step="1" oninput="updateItem('${type}', ${index}, 'qty', parseFloat(this.value)||0)">
            </div>
            <div class="form-group">
                <label>单价</label>
                <input type="number" value="${item.price}" step="0.1" oninput="updateItem('${type}', ${index}, 'price', parseFloat(this.value)||0)">
            </div>
        </div>
        <div class="form-group">
            <label>配方</label>
            <input type="text" value="${item.recipe}" oninput="updateItem('${type}', ${index}, 'recipe', this.value)">
        </div>
        <div class="form-group">
            <label>附注</label>
            <input type="text" value="${item.note}" oninput="updateItem('${type}', ${index}, 'note', this.value)">
        </div>
    </div>`;
}

function renderItemForms() {
    document.getElementById('itemsContainer').innerHTML = state.items.map((item, i) => createItemForm(item, i, 'items')).join('');
    document.getElementById('dessertContainer').innerHTML = state.desserts.map((item, i) => createItemForm(item, i, 'desserts')).join('');
    document.getElementById('drinkContainer').innerHTML = state.drinks.map((item, i) => createItemForm(item, i, 'drinks')).join('');
}

function updateItem(type, index, field, value) {
    state[type][index][field] = value;
    draw();
}

function removeItem(type, index) {
    state[type].splice(index, 1);
    renderItemForms();
    draw();
}

function addItem() {
    const nextNo = String(state.items.length + 1).padStart(2, '0');
    state.items.push({ no: nextNo, name: '新品项', qty: 1, price: 0, recipe: '', note: '' });
    renderItemForms();
    draw();
}

function addDessert() {
    const nextNo = String(state.desserts.length + 1).padStart(2, '0');
    state.desserts.push({ no: nextNo, name: '新甜品', qty: 1, price: 0, recipe: '', note: '' });
    renderItemForms();
    draw();
}

function addDrink() {
    const nextNo = String(state.drinks.length + 1).padStart(2, '0');
    state.drinks.push({ no: nextNo, name: '新酒水', qty: 1, price: 0, recipe: '', note: '' });
    renderItemForms();
    draw();
}

/* ===================== 配置更新与表单回填 ===================== */
function setConfig(key, value) {
    state[key] = value;
    draw();
}

function populateForm() {
    document.getElementById('tableNo').value = state.tableNo;
    document.getElementById('peopleCount').value = state.peopleCount;
    document.getElementById('serialNo').value = state.serialNo;
    document.getElementById('datetime').value = state.datetime;
    document.getElementById('operator').value = state.operator;
    document.getElementById('note').value = state.note;
    document.getElementById('slogan').value = state.slogan;
    document.getElementById('showBarcode').checked = state.showBarcode;
    document.getElementById('customWidthInput').value = state.baseWidth;
}

/* ===================== 构建预览 HTML ===================== */
function buildPreviewHTML(canvasHeight) {
    const w = state.baseWidth;
    const margin = 60;
    /* 固定比例时，用 flex 列把标语推到底部（减去条形码+底部空白约92px） */
    const wrapperStyle = canvasHeight
        ? `style="display:flex;flex-direction:column;min-height:${canvasHeight - 92}px;"`
        : '';

    let html = '';
    if (wrapperStyle) html += `<div ${wrapperStyle}>`;

    /* 顶部：桌号 + 标题 */
    html += `<div style="display:flex;justify-content:space-between;align-items:flex-end;padding:40px ${margin}px 0">`;
    html += `<div><span class="r-table-label" data-field="table-label">桌号：</span><span class="r-table-no" data-field="table-no">${state.tableNo}</span></div>`;
    html += `<span class="r-title" data-field="title">留台单</span>`;
    html += `</div>`;

    /* 信息行 */
    html += `<div style="padding:12px ${margin}px 0">`;
    html += `<div class="r-info" data-field="serial">营业流水：${state.serialNo}</div>`;
    html += `<div class="r-info" data-field="time">时间：${state.datetime}</div>`;
    html += `<div style="display:flex;justify-content:space-between">`;
    html += `<span class="r-info" data-field="operator">操作人：${state.operator}</span>`;
    html += `<span class="r-people" data-field="people">人数：${state.peopleCount}</span>`;
    html += `</div>`;
    html += `</div>`;

    /* 分隔线 */
    html += `<div class="r-divider" style="margin:12px ${margin}px 0;height:1px;background:#000"></div>`;

    /* 表头 */
    html += `<div style="display:flex;justify-content:space-between;align-items:center;padding:10px ${margin}px 0">`;
    html += `<span class="r-header" data-field="header-name">品项</span>`;
    html += `<div style="display:flex;gap:40px">`;
    html += `<span class="r-header" data-field="header-qty">数量</span>`;
    html += `<span class="r-header" data-field="header-price">单价</span>`;
    html += `</div>`;
    html += `</div>`;
    html += `<div class="r-divider" style="margin:4px ${margin}px 0;height:0.5px;background:#000"></div>`;

    /* 品项列表 */
    html += buildItemSectionHTML(state.items, margin, w);

    /* 甜品 */
    if (state.desserts.length > 0) {
        html += `<div style="display:flex;justify-content:space-between;align-items:center;padding:8px ${margin}px 0">`;
        html += `<span class="r-section-title" data-field="dessert-title">甜品品项</span>`;
        html += `<div style="display:flex;gap:40px">`;
        html += `<span class="r-section-title" data-field="dessert-qty">数量</span>`;
        html += `<span class="r-section-title" data-field="dessert-price">单价</span>`;
        html += `</div>`;
        html += `</div>`;
        html += `<div class="r-divider" style="margin:4px ${margin}px 0;height:0.5px;background:#000"></div>`;
        html += buildItemSectionHTML(state.desserts, margin, w);
    }

    /* 酒水 */
    if (state.drinks.length > 0) {
        html += `<div style="display:flex;justify-content:space-between;align-items:center;padding:8px ${margin}px 0">`;
        html += `<span class="r-section-title" data-field="drink-title">酒水品项</span>`;
        html += `<div style="display:flex;gap:40px">`;
        html += `<span class="r-section-title" data-field="drink-qty">数量</span>`;
        html += `<span class="r-section-title" data-field="drink-price">单价</span>`;
        html += `</div>`;
        html += `</div>`;
        html += `<div class="r-divider" style="margin:4px ${margin}px 0;height:0.5px;background:#000"></div>`;
        html += buildItemSectionHTML(state.drinks, margin, w);
    }

    /* 整单备注 */
    if (state.note) {
        html += `<div style="padding:12px ${margin}px 0">`;
        html += `<span class="r-note" data-field="note-prefix">整单备注：</span>`;
        html += `<span class="r-note" data-field="note-text">${state.note}</span>`;
        html += `</div>`;
    }

    /* 分隔线 + 合计 */
    let total = 0;
    [...state.items, ...state.desserts, ...state.drinks].forEach(item => {
        total += (parseFloat(item.qty) || 0) * (parseFloat(item.price) || 0);
    });
    total = Math.round(total * 10) / 10;
    document.getElementById('totalAmount').textContent = total.toFixed(1);

    html += `<div class="r-divider" style="margin:8px ${margin}px 0;height:1px;background:#000"></div>`;
    html += `<div style="padding:10px ${margin}px 0;text-align:right">`;
    html += `<span class="r-total" data-field="total">账单合计：${total.toFixed(1)}</span>`;
    html += `</div>`;

    /* flex spacer：固定比例时把标语推到底部 */
    if (canvasHeight) html += `<div style="flex:1;"></div>`;

    /* 英文标语 */
    if (state.slogan) {
        html += `<div style="padding:8px ${margin}px 0;text-align:center">`;
        html += `<span class="r-slogan" data-field="slogan">${state.slogan}</span>`;
        html += `</div>`;
    }

    if (wrapperStyle) html += `</div>`;

    return html;
}

function buildItemSectionHTML(items, margin, w) {
    let html = '';
    items.forEach(item => {
        html += `<div style="display:flex;justify-content:space-between;align-items:baseline;padding:10px ${margin}px 0">`;
        html += `<div>`;
        html += `<span class="r-item-no" data-field="item-no">${item.no ? 'NO.' + item.no : ''}</span>`;
        html += `<span class="r-item-name" data-field="item-name" style="margin-left:12px">${item.name || ''}</span>`;
        html += `</div>`;
        html += `<div style="display:flex;gap:40px;align-items:baseline">`;
        html += `<span class="r-item-qty" data-field="item-qty">x${item.qty || 1}</span>`;
        html += `<span class="r-item-price" data-field="item-price">${item.price || 0}</span>`;
        html += `</div>`;
        html += `</div>`;
        /* 配方 */
        if (item.recipe) {
            html += `<div style="padding:2px ${margin + 16}px 0">`;
            html += `<span class="r-item-detail" data-field="item-recipe">配方：${item.recipe}</span>`;
            html += `</div>`;
        }
        /* 附注 */
        if (item.note) {
            html += `<div style="padding:2px ${margin + 16}px 0">`;
            html += `<span class="r-item-detail" data-field="item-note">附注：${item.note}</span>`;
            html += `</div>`;
        }
    });
    return html;
}

/* ===================== 测量预览元素 ===================== */
function measurePreview(container) {
    const containerRect = container.getBoundingClientRect();
    const measurements = [];
    const elements = container.querySelectorAll('[data-field]');

    elements.forEach(el => {
        const elRect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);
        const text = el.textContent;
        if (!text) return;

        const x = elRect.left - containerRect.left;
        const y = elRect.top - containerRect.top;
        const fontSize = parseFloat(style.fontSize);
        const fontWeight = style.fontWeight;
        const isSlogan = el.classList.contains('r-slogan');
        const fontFamily = isSlogan ? FONT_EN : FONT;

        /* 逐字测量宽度 */
        const tempSpan = document.createElement('span');
        tempSpan.style.cssText = `position:fixed;visibility:hidden;white-space:nowrap;font:${fontWeight} ${fontSize}px ${fontFamily}`;
        document.body.appendChild(tempSpan);

        let charX = x;
        for (let i = 0; i < text.length; i++) {
            const ch = text[i];
            tempSpan.textContent = ch;
            let charWidth = tempSpan.getBoundingClientRect().width;
            /* DOM 测量空格/零宽字符可能为 0，回退到 Canvas measureText */
            if (charWidth === 0) {
                ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
                charWidth = ctx.measureText(ch).width;
            }
            measurements.push({
                char: ch,
                x: charX,
                y: y,
                width: charWidth,
                height: elRect.height,
                fontSize: fontSize,
                fontWeight: fontWeight,
                fontFamily: fontFamily
            });
            charX += charWidth;
        }
        document.body.removeChild(tempSpan);
    });

    /* 测量分隔线 */
    const dividers = container.querySelectorAll('.r-divider');
    const dividerMeasurements = [];
    dividers.forEach(div => {
        const divRect = div.getBoundingClientRect();
        dividerMeasurements.push({
            x: divRect.left - containerRect.left,
            y: divRect.top - containerRect.top,
            width: divRect.width,
            height: divRect.height
        });
    });

    return { chars: measurements, dividers: dividerMeasurements, totalHeight: container.scrollHeight };
}

/* ===================== 核心绘制逻辑 ===================== */
function draw() {
    const w = state.baseWidth;
    const cfg = RATIO_CONFIG[state.ratio];

    /* 1. 构建预览 DOM */
    let previewContainer = document.getElementById('previewContainer');
    if (!previewContainer) {
        previewContainer = document.createElement('div');
        previewContainer.id = 'previewContainer';
        previewContainer.className = 'preview-container';
        document.body.appendChild(previewContainer);
    }
    previewContainer.style.width = w + 'px';
    previewContainer.innerHTML = buildPreviewHTML(cfg.height);

    /* 2. 测量 */
    const { chars, dividers, totalHeight } = measurePreview(previewContainer);

    /* 3. 确定画布高度 */
    const h = cfg.height || Math.max(totalHeight + 80, w * 0.5);
    const dpr = window.devicePixelRatio || 1;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);

    /* 4. 根据预览区计算显示尺寸 */
    fitCanvasDisplay(w, h);

    /* 5. 清空画布 */
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);

    /* 6. 绘制分隔线 */
    ctx.strokeStyle = '#000000';
    dividers.forEach(d => {
        ctx.lineWidth = d.height;
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x + d.width, d.y);
        ctx.stroke();
    });

    /* 7. 逐字绘制 */
    ctx.fillStyle = '#000000';
    chars.forEach(m => {
        ctx.font = `${m.fontWeight} ${m.fontSize}px ${m.fontFamily}`;
        /* 使用 textBaseline = 'top'，y 坐标直接使用测量值 */
        ctx.textBaseline = 'top';
        ctx.fillText(m.char, m.x, m.y);
    });

    /* 8. 条形码：固定比例在画布底部，自定义模式跟随内容 */
    if (state.showBarcode) {
        if (cfg.height) {
            /* 固定比例：条形码紧贴画布底部，预留 2rem 底部空白 */
            drawBarcode(w / 2, h - 60 - 32, 300, 60);
        } else {
            /* 自定义模式：跟随内容定位 */
            let lastY = 0;
            chars.forEach(m => { if (m.y + m.height > lastY) lastY = m.y + m.height; });
            dividers.forEach(d => { if (d.y > lastY) lastY = d.y; });
            drawBarcode(w / 2, lastY + 8, 300, 60);
        }
    }
}

/* ===================== 辅助函数 ===================== */
function drawBarcode(centerX, y, width, height) {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width * 2;
    tempCanvas.height = height * 2;
    try {
        JsBarcode(tempCanvas, state.serialNo || 'RECEIPT', {
            format: "CODE128",
            lineColor: "#000",
            width: 2,
            height: height * 2,
            displayValue: false,
            margin: 0
        });
        const x = centerX - width / 2;
        ctx.drawImage(tempCanvas, x, y, width, height);
    } catch(e) {
        ctx.fillStyle = '#000';
        for (let i = 0; i < width; i += 3) {
            if (Math.random() > 0.5) {
                ctx.fillRect(centerX - width/2 + i, y, 2, height);
            }
        }
        ctx.fillStyle = '#000';
    }
}

/* ===================== 画布自适应显示 ===================== */
function fitCanvasDisplay(w, h) {
    const previewArea = document.querySelector('.preview-area');
    if (!previewArea) return;
    const maxW = previewArea.clientWidth - 40;
    const maxH = previewArea.clientHeight - 160;
    const ratio = w / h;
    let displayW = Math.min(w, maxW);
    let displayH = displayW / ratio;
    if (displayH > maxH) {
        displayH = maxH;
        displayW = displayH * ratio;
    }
    canvas.style.width = Math.floor(displayW) + 'px';
    canvas.style.height = Math.floor(displayH) + 'px';
}

function downloadImage() {
    const link = document.createElement('a');
    link.download = '留台单_' + state.tableNo + '_' + Date.now() + '.png';
    link.href = canvas.toDataURL('image/png', 1.0);
    link.click();
}

/* ===================== 启动 ===================== */
document.fonts.load('20px "HuiwenMincho"').then(() => {
    init();
    window.addEventListener('resize', () => {
        const cfg = RATIO_CONFIG[state.ratio];
        const w = state.baseWidth;
        const h = cfg.height || parseInt(canvas.height) / (window.devicePixelRatio || 1);
        fitCanvasDisplay(w, h);
    });
}).catch(() => {
    init();
});
