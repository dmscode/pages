/* ============================================================
   手帐尺寸速查 · app.js
   ES2017 经典脚本（Chrome 61 基线）· 无内联事件 · addEventListener
   架构：视图注册表 + 配置驱动 Tab + 纯函数渲染器
   三期：compare 尺寸对比 / ruler 孔标尺 / print 拼版打印（packItems 靠边密排）
   ============================================================ */
(function () {
  'use strict';

  var DB = window.DB;
  var sizeById = {};
  var systemById = {};
  DB.sizes.forEach(function (s) { sizeById[s.id] = s; });
  DB.systems.forEach(function (s) { systemById[s.id] = s; });

  var CAT_COLORS = {
    '大型': { deep: '#3fa98b', soft: '#d3f0e4' },
    '中型': { deep: '#e86a92', soft: '#ffd6e3' },
    '小型': { deep: '#8a66c6', soft: '#e6dbf6' }
  };

  /* ---------- 基础工具 ---------- */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined && text !== null) n.textContent = text;
    return n;
  }
  function storeGet(k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } }
  function storeSet(k, v) { try { window.localStorage.setItem(k, String(v)); } catch (e) { /* 隐私模式等场景忽略 */ } }

  /* flex gap 行为检测（css-compatibility.md 规范写法，仅检测一次） */
  function supportsFlexGap() {
    var flex = document.createElement('div');
    flex.style.position = 'absolute';
    flex.style.visibility = 'hidden';
    flex.style.display = 'flex';
    flex.style.flexDirection = 'column';
    flex.style.rowGap = '1px';
    flex.appendChild(document.createElement('div'));
    flex.appendChild(document.createElement('div'));
    document.body.appendChild(flex);
    var supported = flex.scrollHeight === 1;
    flex.parentNode.removeChild(flex);
    return supported;
  }

  var SVGNS = 'http://www.w3.org/2000/svg';
  function svgEl(tag, attrs) {
    var n = document.createElementNS(SVGNS, tag);
    for (var k in attrs) { if (attrs[k] !== undefined) n.setAttribute(k, attrs[k]); }
    return n;
  }

  /* ---------- 纸片 SVG 渲染器（纯函数，二期对比/打印复用） ----------
     opts.heightPx   : 目标显示高度（速查页默认）
     opts.scaleMmPerPx : 统一比例尺 mm/px（对比页传同一值即可并排等比） */
  function renderPaperSVG(entry, opts) {
    opts = opts || {};
    var w = entry.w, h = entry.h;
    var maxDim = Math.max(w, h);
    /* plain：无标注留白的纯纸片（叠放对比用，纸角真实对齐） */
    if (opts.plain) {
      var cPl = CAT_COLORS[entry.category] || CAT_COLORS['中型'];
      var svgP = svgEl('svg', {
        viewBox: '0 0 ' + w + ' ' + h,
        width: Math.round(w * opts.scaleMmPerPx * 10) / 10,
        height: Math.round(h * opts.scaleMmPerPx * 10) / 10,
        role: 'img'
      });
      svgP.appendChild(svgEl('rect', {
        x: 0, y: 0, width: w, height: h, rx: maxDim * 0.03,
        fill: cPl.soft, 'fill-opacity': 0.82,
        stroke: cPl.deep, 'stroke-width': maxDim * 0.009
      }));
      var patP = (entry.patterns && entry.patterns[0]) || null;
      if (patP && patP.gaps) {
        var cxP = Math.min(w * 0.12, 9);
        var spanP = 0, iP;
        for (iP = 0; iP < patP.gaps.length; iP++) spanP += patP.gaps[iP];
        var yP = (h - spanP) / 2;
        var rP = maxDim * 0.022 + 0.7;
        for (iP = 0; iP <= patP.gaps.length; iP++) {
          svgP.appendChild(svgEl('circle', { cx: cxP, cy: yP, r: rP, fill: '#ffffff', stroke: cPl.deep, 'stroke-width': maxDim * 0.006 }));
          if (iP < patP.gaps.length) yP += patP.gaps[iP];
        }
      }
      return svgP;
    }
    var fs = maxDim * 0.085;                       // 标注字号(mm)
    var fs = maxDim * 0.085;                       // 标注字号(mm)
    var padL = fs * 1.4, padR = fs * 2.4, padT = fs * 1.1, padB = fs * 1.9;
    var vw = w + padL + padR, vh = h + padT + padB;
    var color = CAT_COLORS[entry.category] || CAT_COLORS['中型'];

    var svg = svgEl('svg', { viewBox: '0 0 ' + vw + ' ' + vh, role: 'img' });
    var targetH = opts.heightPx || 92;
    var targetW = targetH * vw / vh;
    if (opts.scaleMmPerPx) {
      targetW = vw * opts.scaleMmPerPx;
      targetH = vh * opts.scaleMmPerPx;
    }
    svg.setAttribute('width', Math.round(targetW * 10) / 10);
    svg.setAttribute('height', Math.round(targetH * 10) / 10);

    svg.appendChild(svgEl('rect', {
      x: padL, y: padT, width: w, height: h,
      rx: maxDim * 0.03,
      fill: color.soft, 'fill-opacity': 0.85,
      stroke: color.deep, 'stroke-width': maxDim * 0.009
    }));

    var pat = (entry.patterns && entry.patterns[0]) || null;
    if (pat && pat.gaps) {
      var cx = padL + Math.min(w * 0.12, 9);
      var span = 0, i;
      for (i = 0; i < pat.gaps.length; i++) span += pat.gaps[i];
      var y = padT + (h - span) / 2;
      var r = maxDim * 0.022 + 0.7;
      for (i = 0; i <= pat.gaps.length; i++) {
        svg.appendChild(svgEl('circle', {
          cx: cx, cy: y, r: r,
          fill: '#ffffff', stroke: color.deep, 'stroke-width': maxDim * 0.006
        }));
        if (i < pat.gaps.length) y += pat.gaps[i];
      }
    } else {
      svg.appendChild(svgEl('line', {
        x1: padL + Math.min(w * 0.12, 9), y1: padT + h * 0.12,
        x2: padL + Math.min(w * 0.12, 9), y2: padT + h * 0.88,
        stroke: color.deep, 'stroke-width': maxDim * 0.006,
        'stroke-dasharray': '2.2 2.2', 'stroke-opacity': 0.55
      }));
    }

    var tx = padL + w / 2, ty = padT + h + padB * 0.66;
    var tW = svgEl('text', { x: tx, y: ty, 'text-anchor': 'middle', 'font-size': fs, fill: '#9a8577' });
    tW.textContent = w;
    var hx = padL + w + padR * 0.52, hy = padT + h / 2;
    var tH = svgEl('text', {
      x: hx, y: hy, 'text-anchor': 'middle', 'font-size': fs, fill: '#9a8577',
      'dominant-baseline': 'central',
      transform: 'rotate(90 ' + hx + ' ' + hy + ')'
    });
    tH.textContent = h;
    svg.appendChild(tW);
    svg.appendChild(tH);
    return svg;
  }

  /* 孔距点阵图（孔位体系页） */
  function renderDotsSVG(gaps) {
    var span = 0, i;
    for (i = 0; i < gaps.length; i++) span += gaps[i];
    var pad = 8, r = 2.3, vh = 12;
    var vw = span + pad * 2;
    var maxW = 340;
    var dispW = Math.min(maxW, Math.max(150, span)), dispH = dispW * vh / vw;
    var svg = svgEl('svg', { viewBox: '0 0 ' + vw + ' ' + vh, width: dispW, height: dispH, role: 'img' });
    var x = pad;
    for (i = 0; i <= gaps.length; i++) {
      svg.appendChild(svgEl('circle', { cx: x, cy: vh / 2, r: r, fill: '#ffffff', stroke: '#b08d6e', 'stroke-width': 0.7 }));
      if (i < gaps.length) x += gaps[i];
    }
    return svg;
  }

  /* ---------- 状态 ---------- */
  var state = {
    tab: storeGet('tab') || 'browse',
    filters: { bd: '不限', xi: '不限', se: '不限' },
    q: ''
  };
  try {
    var savedFilters = JSON.parse(storeGet('filters') || '{}');
    if (savedFilters && typeof savedFilters === 'object') {
      state.filters.bd = savedFilters.bd || '不限';
      state.filters.xi = savedFilters.xi || '不限';
      state.filters.se = savedFilters.se || '不限';
    }
  } catch (e) { /* 忽略坏数据 */ }
  var browseCards = [];   // {el, cat, tags, search, cmpBtn, id}

  /* ---------- 二期状态：对比 / 标尺 / 打印 ---------- */
  var compareIds = [];
  try {
    var parsed = JSON.parse(storeGet('compareIds') || '[]');
    if (parsed instanceof Array) {
      parsed.forEach(function (id) { if (sizeById[id] && compareIds.length < 4) compareIds.push(id); });
    }
  } catch (e) { compareIds = []; }

  var rulerState = {
    sizeId: storeGet('rulerSize') || 'personal',
    patternIdx: 0,
    orientation: storeGet('rulerOrient') === 'h' ? 'h' : 'v'
  };
  if (!sizeById[rulerState.sizeId]) rulerState.sizeId = 'personal';

  var printState = {
    paperId: 'a4', paperOrient: 'v',
    margin: 5, gap: 3, allowRotate: true,
    marks: true, holeMarks: false,
    marksOnly: false, markStyle: 'solid', markWidth: 0.3,
    items: [{ sizeId: 'a7_standard', name: 'A7标准', w: 80, h: 120, spread: false, holeSide: 'left', qty: 1 }]
  };
  try {
    var ps = JSON.parse(storeGet('printState') || '{}');
    if (ps && typeof ps === 'object') {
      if (typeof ps.paperId === 'string') printState.paperId = ps.paperId;
      if (ps.paperOrient === 'h') printState.paperOrient = 'h';
      if (typeof ps.margin === 'number') printState.margin = ps.margin;
      if (typeof ps.gap === 'number') printState.gap = ps.gap;
      printState.allowRotate = ps.allowRotate !== false;
      printState.marks = ps.marks !== false;
      printState.holeMarks = ps.holeMarks === true;
      printState.marksOnly = ps.marksOnly === true;
      if (ps.markStyle === 'dashed' || ps.markStyle === 'solid') printState.markStyle = ps.markStyle;
      if (ps.markWidth === 0.18 || ps.markWidth === 0.3 || ps.markWidth === 0.45) printState.markWidth = ps.markWidth;
      if (ps.items instanceof Array) {
        var okItems = ps.items.filter(function (it) {
          return it && typeof it.name === 'string' && it.w > 0 && it.h > 0;
        });
        if (okItems.length) printState.items = okItems;
      } else if (sizeById[ps.sizeId]) {
        var os = sizeById[ps.sizeId];
        printState.items = [{ sizeId: os.id, name: os.name, w: os.w, h: os.h, spread: false, holeSide: 'left', qty: 1 }];
      }
    }
  } catch (e) { /* 忽略坏数据 */ }
  var customPapers = [];
  try {
    var cp = JSON.parse(storeGet('customPapers') || '[]');
    if (cp instanceof Array) {
      customPapers = cp.filter(function (p) {
        return p && typeof p.name === 'string' && p.w > 0 && p.h > 0;
      });
    }
  } catch (e) { customPapers = []; }

  function persistPrintState() { storeSet('printState', JSON.stringify(printState)); }
  function persistCustomPapers() { storeSet('customPapers', JSON.stringify(customPapers)); }

  /* 轻提示 */
  var toastTimer = null;
  function toast(msg) {
    var t = document.getElementById('app-toast');
    if (!t) {
      t = el('div');
      t.id = 'app-toast';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.add('show');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('show'); }, 2000);
  }

  /* ---------- 视图 1：尺寸速查 ---------- */
  function buildSizeCard(entry) {
    var color = CAT_COLORS[entry.category];
    var card = el('div', 'card size-card');
    var top = el('div', 'size-card-top');
    var main = el('div', 'size-card-main');

    var box = el('div', 'paper-box');
    box.appendChild(renderPaperSVG(entry, { heightPx: 92 }));
    main.appendChild(box);

    var info = el('div', 'size-info');
    var nameRow = el('div', 'size-name-row');
    var dot = el('span', 'size-dot');
    dot.style.background = color.deep;
    nameRow.appendChild(dot);
    nameRow.appendChild(el('span', 'size-name', entry.name));
    info.appendChild(nameRow);
    if (entry.aliases && entry.aliases.length) {
      info.appendChild(el('div', 'size-alias', entry.aliases.join(' · ')));
    }
    var mm = el('div', 'size-mm selectable');
    mm.appendChild(document.createTextNode(String(entry.w) + ' × ' + entry.h));
    mm.appendChild(el('span', 'mm-unit', ' mm'));
    info.appendChild(mm);

    var meta = el('div', 'size-meta');
    var pat = entry.patterns && entry.patterns[0];
    /* 装订展示与筛选标签同源：A/B 系等双模式尺寸统一显示「活页/定页」 */
    var hasHuo = entry.tags && entry.tags.indexOf('活页') >= 0;
    var hasDing = entry.tags && entry.tags.indexOf('定页') >= 0;
    var bindingShort = hasHuo && hasDing ? '活页/定页' : (hasHuo ? '活页' : (hasDing ? '定页' : entry.binding.split('（')[0].split('(')[0]));
    if (pat) {
      var l1 = el('div');
      l1.appendChild(el('b', null, bindingShort));
      l1.appendChild(document.createTextNode(' · ' + pat.label));
      meta.appendChild(l1);
      if (entry.patterns.length > 1) {
        var labels = [];
        for (var pi = 0; pi < entry.patterns.length; pi++) labels.push(entry.patterns[pi].label);
        meta.appendChild(el('div', null, '另有 ' + labels.slice(1).join(' / ')));
      }
      if (pat.special) meta.appendChild(el('div', null, pat.special));
    } else {
      meta.appendChild(el('div', null, bindingShort + '（无孔位）'));
    }
    info.appendChild(meta);
    main.appendChild(info);

    var badges = el('div', 'size-badges');
    if (entry.popBadge === '新手首选') badges.appendChild(el('span', 'badge badge-hot', '★ 新手首选'));
    if (entry.popBadge === '小众慎重') badges.appendChild(el('span', 'badge badge-niche', '⚠️ 小众慎重'));
    if (entry.popBadge === '追星专用') badges.appendChild(el('span', 'badge badge-star', '⭐ 追星专用'));
    top.appendChild(main);
    top.appendChild(badges);
    card.appendChild(top);

    /* 详情区 */
    var detail = el('div', 'size-detail');
    function row(dt, dd) {
      if (!dd) return;
      var r = el('div', 'detail-row');
      r.appendChild(el('span', 'dt', dt));
      r.appendChild(document.createTextNode(dd));
      detail.appendChild(r);
    }
    row('规格归属：', entry.standard);
    row('装订：', entry.binding);
    if (entry.patterns && entry.patterns.length > 1) {
      var allLabels = [];
      for (var di = 0; di < entry.patterns.length; di++) allLabels.push(entry.patterns[di].label);
      row('孔位方案：', allLabels.join('；'));
    }
    if (entry.variant) {
      row('宽度变体：', '另有 ' + entry.variant[0] + '×' + entry.variant[1] + ' 标注（各家偏差 1~3mm）');
    }
    row('用法：', entry.usage);
    if (entry.storage && entry.storage.canHold && entry.storage.canHold.length) {
      row('可收纳：', entry.storage.canHold.join('、'));
    }
    if (entry.storage && entry.storage.storedIn && entry.storage.storedIn.length) {
      row('可放入：', entry.storage.storedIn.join('、'));
    }
    if (entry.dualUse && entry.dualUse.length) {
      row('定活两用：', entry.dualUse.join('；'));
    }
    row('人气：', entry.popularity);
    if (entry.warning) detail.appendChild(el('div', 'detail-warn', '⚠️ ' + entry.warning));
    if (entry.errata) detail.appendChild(el('div', 'detail-errata', '📝 数据备注：' + entry.errata));
    card.appendChild(detail);

    var actions = el('div', 'card-actions');
    var toggle = el('button', 'detail-toggle press', '详情 ▾');
    toggle.type = 'button';
    toggle.addEventListener('click', function () {
      var open = detail.classList.toggle('open');
      toggle.textContent = open ? '收起 ▴' : '详情 ▾';
    });
    actions.appendChild(toggle);
    var cmpBtn = el('button', 'cmp-toggle press', compareIds.indexOf(entry.id) >= 0 ? '✓ 已加对比' : '+ 对比');
    cmpBtn.type = 'button';
    if (compareIds.indexOf(entry.id) >= 0) cmpBtn.classList.add('added');
    cmpBtn.addEventListener('click', function () { toggleCompare(entry.id); });
    actions.appendChild(cmpBtn);
    card.appendChild(actions);

    return { el: card, cat: entry.category, tags: entry.tags || [], search: entry.search, cmpBtn: cmpBtn, id: entry.id };
  }

  function renderBrowse(root) {
    var FILTER_GROUPS = [
      { key: 'bd', label: '装订', options: ['不限', '活页', '定页'] },
      { key: 'xi', label: '系谱', options: ['不限', 'A系', 'B系', 'M系', 'TN系', '欧美系'] },
      { key: 'se', label: '特色', options: ['不限', '新手首选', '小众', '追星'] }
    ];
    var seRow = null;
    function syncSeVisibility() {
      /* 系谱选定后隐藏特色行（特色按需求只在系谱不限时展示） */
      if (seRow) seRow.classList.toggle('hidden', state.filters.xi !== '不限');
    }
    FILTER_GROUPS.forEach(function (g) {
      var row = el('div', 'filter-group');
      row.appendChild(el('span', 'filter-label', g.label));
      var chips = el('div', 'chips');
      g.options.forEach(function (opt) {
        var b = el('button', 'chip press' + (state.filters[g.key] === opt ? ' active' : ''), opt);
        b.type = 'button';
        b.addEventListener('click', function () {
          state.filters[g.key] = opt;
          if (g.key === 'xi' && opt !== '不限' && state.filters.se !== '不限') {
            state.filters.se = '不限';
          }
          storeSet('filters', JSON.stringify(state.filters));
          var all = chips.querySelectorAll('.chip');
          for (var i = 0; i < all.length; i++) all[i].classList.toggle('active', all[i].textContent === opt);
          if (g.key === 'xi' && seRow) {
            /* 恢复特色行的选中态显示 */
            var seChips = seRow.querySelectorAll('.chip');
            for (var j = 0; j < seChips.length; j++) seChips[j].classList.toggle('active', seChips[j].textContent === state.filters.se);
          }
          syncSeVisibility();
          applyFilter();
        });
        chips.appendChild(b);
      });
      row.appendChild(chips);
      root.appendChild(row);
      if (g.key === 'se') seRow = row;
    });
    syncSeVisibility();

    var searchWrap = el('div', 'search-box');
    var input = el('input', 'search-input');
    input.type = 'search';
    input.placeholder = '🔍 名称 / 别名 / 尺寸，如：A7、Personal';
    input.autocomplete = 'off';
    input.addEventListener('input', function () {
      state.q = input.value.trim().toLowerCase();
      applyFilter();
    });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') e.preventDefault();
    });
    searchWrap.appendChild(input);
    root.appendChild(searchWrap);

    var list = el('div', 'size-list');
    root.appendChild(list);
    var emptyTip = el('div', 'empty-tip', '没有匹配的尺寸，换个条件试试～');
    emptyTip.style.display = 'none';
    root.appendChild(emptyTip);

    DB.sizes.forEach(function (entry) {
      var item = buildSizeCard(entry);
      list.appendChild(item.el);
      browseCards.push(item);
    });

    function applyFilter() {
      var visible = 0, i;
      for (i = 0; i < browseCards.length; i++) {
        var it = browseCards[i];
        var ok = true, key;
        for (key in state.filters) {
          var v = state.filters[key];
          if (v !== '不限' && it.tags.indexOf(v) < 0) { ok = false; break; }
        }
        if (ok && state.q && it.search.indexOf(state.q) < 0) ok = false;
        it.el.style.display = ok ? '' : 'none';
        if (ok) visible++;
      }
      emptyTip.style.display = visible ? 'none' : '';
    }
    browseApplyFilter = applyFilter;
    updateCompareButtons();
  }
  var browseApplyFilter = null;

  /* ---------- 视图：尺寸对比 ---------- */
  function toggleCompare(id) {
    var i = compareIds.indexOf(id);
    if (i >= 0) {
      compareIds.splice(i, 1);
    } else {
      if (compareIds.length >= 4) { toast('最多同时对比 4 个尺寸'); return; }
      compareIds.push(id);
      toast('已加入对比（' + compareIds.length + '/4）');
    }
    storeSet('compareIds', JSON.stringify(compareIds));
    updateCompareButtons();
  }
  function updateCompareButtons() {
    browseCards.forEach(function (c) {
      var added = compareIds.indexOf(c.id) >= 0;
      c.cmpBtn.textContent = added ? '✓ 已加对比' : '+ 对比';
      c.cmpBtn.classList.toggle('added', added);
    });
  }
  function fmtDelta(d) { return (d > 0 ? '+' : '') + d + 'mm'; }
  function samePattern(a, b) {
    var pa = a.patterns && a.patterns[0], pb = b.patterns && b.patterns[0];
    if (!pa || !pb) return false;
    return pa.system === pb.system;
  }
  function fitText(a, b) {
    var ab = a.w <= b.w && a.h <= b.h;
    var ba = b.w <= a.w && b.h <= a.h;
    if (ab && !ba) return '；' + a.name + ' 可整体放入 ' + b.name;
    if (ba && !ab) return '；' + b.name + ' 可整体放入 ' + a.name;
    return '；两尺寸互不包含';
  }
  var compareMode = storeGet('compareMode') === 'stack' ? 'stack' : 'side';
  function renderCompare(root) {
    if (!compareIds.length) {
      var empty = el('div', 'card');
      empty.appendChild(el('div', 'sec-title', '')).appendChild(el('span', 'sec-emoji', '⚖️'));
      empty.lastChild.appendChild(document.createTextNode('尺寸对比'));
      empty.appendChild(el('p', 'sec-note',
        '在「尺寸速查」卡片上点「+ 对比」，把想比较的尺寸加进来（最多 4 个）。这里会把它们按同一比例尺并排摆放，并算出宽高差、孔位异同和包含关系。'));
      var go = el('button', 'chip press', '📏 去挑选尺寸');
      go.type = 'button';
      go.addEventListener('click', function () { goTab('browse'); });
      empty.appendChild(go);
      root.appendChild(empty);
      return;
    }
    var sel = compareIds.map(function (id) { return sizeById[id]; });

    var bar = el('div', 'chips');
    sel.forEach(function (s) {
      var chip = el('button', 'chip press', s.name + ' ✕');
      chip.type = 'button';
      chip.addEventListener('click', function () {
        toggleCompare(s.id);
        root.innerHTML = '';
        renderCompare(root);
      });
      bar.appendChild(chip);
    });
    root.appendChild(bar);

    /* 对比模式：并排 / 叠放 */
    var modeChips = el('div', 'chips');
    [['side', '⬓ 并排'], ['stack', '▣ 叠放']].forEach(function (p) {
      var c = el('button', 'chip press' + (compareMode === p[0] ? ' active' : ''), p[1]);
      c.type = 'button';
      c.addEventListener('click', function () {
        compareMode = p[0];
        storeSet('compareMode', p[0]);
        root.innerHTML = '';
        renderCompare(root);
      });
      modeChips.appendChild(c);
    });
    root.appendChild(modeChips);

    var maxDim = 0;
    sel.forEach(function (s) { maxDim = Math.max(maxDim, s.w, s.h); });
    var scale = 300 / maxDim;
    var color = CAT_COLORS[sel[0].category] || CAT_COLORS['中型'];
    if (compareMode === 'stack') {
      /* 叠放：同一比例尺、左上角同起点叠加，半透明看差异 */
      var stackNote = el('div', 'sec-note', '全部按左上角对齐叠加（半透明），错边处就是尺寸差异。');
      root.appendChild(stackNote);
      var stack = el('div', 'cmp-stack');
      var stackH = 0;
      sel.forEach(function (s, i) {
        var sv = renderPaperSVG(s, { scaleMmPerPx: scale, plain: true });
        sv.style.position = 'absolute';
        sv.style.left = '0';
        sv.style.top = '0';
        sv.style.opacity = String(Math.max(0.35, 0.85 - i * 0.18));
        stack.appendChild(sv);
        stackH = Math.max(stackH, parseFloat(sv.getAttribute('height')));
      });
      stack.style.height = (stackH + 8) + 'px';
      root.appendChild(stack);
    } else {
      root.appendChild(el('div', 'sec-note', '同一比例尺并排，大小区一目了然'));
      var row = el('div', 'cmp-row');
      sel.forEach(function (s) {
        var cell = el('div', 'cmp-cell');
        cell.appendChild(renderPaperSVG(s, { scaleMmPerPx: scale }));
        cell.appendChild(el('div', 'cmp-cell-name', s.name));
        cell.appendChild(el('div', 'cmp-cell-dim selectable', s.w + ' × ' + s.h + ' mm'));
        var pat = s.patterns && s.patterns[0];
        cell.appendChild(el('div', 'cmp-cell-holes', pat ? pat.label : '定页'));
        row.appendChild(cell);
      });
      root.appendChild(row);
    }

    /* 图例 */
    var legend = el('div', 'chips');
    sel.forEach(function (s) {
      var c = CAT_COLORS[s.category] || CAT_COLORS['中型'];
      var item = el('span', 'sys-member');
      item.appendChild(el('b', null, s.name));
      item.appendChild(document.createTextNode(' ' + s.w + '×' + s.h));
      item.style.borderLeft = '4px solid ' + c.deep;
      legend.appendChild(item);
    });
    root.appendChild(legend);

    var tbl = el('div', 'card');
    tbl.appendChild(el('div', 'sec-title', '')).appendChild(el('span', 'sec-emoji', '📊'));
    tbl.lastChild.appendChild(document.createTextNode('差异（相对 ' + sel[0].name + '）'));
    sel.slice(1).forEach(function (s) {
      var line = el('div', 'detail-row');
      line.appendChild(el('b', null, s.name));
      line.appendChild(document.createTextNode('：宽 ' + fmtDelta(s.w - sel[0].w) +
        '，高 ' + fmtDelta(s.h - sel[0].h) +
        '，孔位' + (samePattern(s, sel[0]) ? '相同（可直接互换）' : '不同（环架不通用）') +
        fitText(sel[0], s)));
      tbl.appendChild(line);
    });
    root.appendChild(tbl);
  }

  /* ---------- 视图：活页孔标尺 ---------- */
  /* orient: 'v' 纵向（默认，沿纸边从上到下）/ 'h' 横向。
     标尺含真实页边距：两纸边虚线之间 = 纸张真实高度。
     双刻度行：棕字 = 距首孔累积；绿字 = 距纸边累积（已计入页边距）。 */
  function buildRulerSVG(entry, pat, orient) {
    var gaps = pat.gaps;
    var span = 0, i, j;
    for (i = 0; i < gaps.length; i++) span += gaps[i];
    var marginTB = Math.round(((entry.h - span) / 2) * 10) / 10;
    var axis = 17, r = 2.6, headH = 6;           /* 孔位轴线横坐标 / 顶部标题区高度 */
    var edgeTop = headH + 2.5;                    /* 上纸边位置 */
    var hole0 = edgeTop + marginTB;               /* 首孔位置 */
    var cInk = '#9a8577';

    if (orient === 'v') {
      var vh = edgeTop + entry.h + 6, vw = 34;
      var svgV = svgEl('svg', { viewBox: '0 0 ' + vw + ' ' + vh, width: vw + 'mm', height: vh + 'mm', role: 'img' });
      /* 标题行：总跨（独立一行右对齐，独占顶部区域，不与其他元素重叠） */
      var ttV = svgEl('text', { x: vw - 1.5, y: 5.2, 'text-anchor': 'end', 'font-size': 3.4, fill: '#3fa98b', 'font-weight': 'bold' });
      ttV.textContent = '总跨 ' + span + 'mm';
      svgV.appendChild(ttV);
      /* 上下纸边（真实距离） */
      svgV.appendChild(svgEl('line', { x1: 4, y1: edgeTop, x2: 26, y2: edgeTop, stroke: cInk, 'stroke-width': 0.3, 'stroke-dasharray': '1.2 1' }));
      svgV.appendChild(svgEl('line', { x1: 4, y1: edgeTop + entry.h, x2: 26, y2: edgeTop + entry.h, stroke: cInk, 'stroke-width': 0.3, 'stroke-dasharray': '1.2 1' }));
      var tEdgeV = svgEl('text', { x: 4, y: edgeTop + 3.4, 'font-size': 3, fill: cInk });
      tEdgeV.textContent = '纸边';
      svgV.appendChild(tEdgeV);
      /* 轴线 */
      svgV.appendChild(svgEl('line', { x1: axis, y1: edgeTop, x2: axis, y2: edgeTop + entry.h, stroke: '#c9b39e', 'stroke-width': 0.25 }));
      /* 首孔/末孔距纸边标注（右侧尺寸区） */
      var mTop = svgEl('text', { x: axis + 3.5, y: edgeTop + marginTB / 2 + 1.1, 'font-size': 3, fill: '#3fa98b', 'font-weight': 'bold' });
      mTop.textContent = marginTB;
      svgV.appendChild(mTop);
      var mBot = svgEl('text', { x: axis + 3.5, y: hole0 + span + marginTB / 2 + 1.1, 'font-size': 3, fill: '#3fa98b', 'font-weight': 'bold' });
      mBot.textContent = marginTB;
      svgV.appendChild(mBot);
      var y = hole0;
      for (i = 0; i <= gaps.length; i++) {
        svgV.appendChild(svgEl('circle', { cx: axis, cy: y, r: r, fill: '#ffffff', stroke: '#5c4b51', 'stroke-width': 0.35 }));
        if (i < gaps.length) {
          var tlV = svgEl('text', { x: axis + 3.5, y: y + gaps[i] / 2 + 1.2, 'font-size': 3.4, fill: '#e86a92', 'font-weight': 'bold' });
          tlV.textContent = gaps[i];
          svgV.appendChild(tlV);
          y += gaps[i];
        }
      }
      /* 双刻度：棕=距首孔 0/19/38…；绿=距纸边（已含页边距） */
      var cumV = 0;
      for (j = 0; j <= gaps.length; j++) {
        var tcV = svgEl('text', { x: axis - 3.5, y: hole0 + cumV + 1.1, 'text-anchor': 'end', 'font-size': 3, fill: cInk });
        tcV.textContent = cumV;
        svgV.appendChild(tcV);
        var tgV = svgEl('text', { x: axis - 9.5, y: hole0 + cumV + 1.1, 'text-anchor': 'end', 'font-size': 2.8, fill: '#3fa98b' });
        tgV.textContent = Math.round((marginTB + cumV) * 10) / 10;
        svgV.appendChild(tgV);
        if (j < gaps.length) cumV += gaps[j];
      }
      /* 底部尾区：双刻度图例（单行，避开所有元素） */
      var lgV = svgEl('text', { x: 1.5, y: edgeTop + entry.h + 4.2, 'font-size': 2.8, fill: cInk });
      lgV.textContent = '棕:距首孔 · 绿:距纸边';
      svgV.appendChild(lgV);
      return svgV;
    }

    /* 横向：纸边为左右两条竖虚线，按真实页宽；双刻度行在轴线下方 */
    var vhH = 32;
    var edgeL = headH + 2.5;
    var vwH = edgeL + entry.h + 5;
    var svg = svgEl('svg', { viewBox: '0 0 ' + vwH + ' ' + vhH, width: vwH + 'mm', height: vhH + 'mm', role: 'img' });
    var ttH = svgEl('text', { x: vwH - 1.5, y: 5.2, 'text-anchor': 'end', 'font-size': 3.4, fill: '#3fa98b', 'font-weight': 'bold' });
    ttH.textContent = '总跨 ' + span + 'mm';
    svg.appendChild(ttH);
    svg.appendChild(svgEl('line', { x1: edgeL, y1: 8, x2: edgeL, y2: 24, stroke: cInk, 'stroke-width': 0.3, 'stroke-dasharray': '1.2 1' }));
    svg.appendChild(svgEl('line', { x1: edgeL + entry.h, y1: 8, x2: edgeL + entry.h, y2: 24, stroke: cInk, 'stroke-width': 0.3, 'stroke-dasharray': '1.2 1' }));
    var tEdgeL = svgEl('text', { x: edgeL, y: 6.8, 'font-size': 3, fill: cInk });
    tEdgeL.textContent = '纸边';
    svg.appendChild(tEdgeL);
    svg.appendChild(svgEl('line', { x1: edgeL, y1: 13, x2: edgeL + entry.h, y2: 13, stroke: '#c9b39e', 'stroke-width': 0.25 }));
    var mTopH = svgEl('text', { x: edgeL + marginTB / 2, y: 9.8, 'text-anchor': 'middle', 'font-size': 3, fill: '#3fa98b', 'font-weight': 'bold' });
    mTopH.textContent = marginTB;
    svg.appendChild(mTopH);
    var mBotH = svgEl('text', { x: edgeL + entry.h - marginTB / 2, y: 9.8, 'text-anchor': 'middle', 'font-size': 3, fill: '#3fa98b', 'font-weight': 'bold' });
    mBotH.textContent = marginTB;
    svg.appendChild(mBotH);
    var x = edgeL + marginTB;
    for (i = 0; i <= gaps.length; i++) {
      svg.appendChild(svgEl('circle', { cx: x, cy: 13, r: r, fill: '#ffffff', stroke: '#5c4b51', 'stroke-width': 0.35 }));
      if (i < gaps.length) {
        var tlH = svgEl('text', { x: x + gaps[i] / 2, y: 9.8, 'text-anchor': 'middle', 'font-size': 3.4, fill: '#e86a92', 'font-weight': 'bold' });
        tlH.textContent = gaps[i];
        svg.appendChild(tlH);
        x += gaps[i];
      }
    }
    var cumH = 0;
    for (j = 0; j <= gaps.length; j++) {
      var tcH = svgEl('text', { x: edgeL + marginTB + cumH, y: 22.4, 'text-anchor': 'middle', 'font-size': 3, fill: cInk });
      tcH.textContent = cumH;
      svg.appendChild(tcH);
      var tgH = svgEl('text', { x: edgeL + marginTB + cumH, y: 26, 'text-anchor': 'middle', 'font-size': 2.8, fill: '#3fa98b' });
      tgH.textContent = Math.round((marginTB + cumH) * 10) / 10;
      svg.appendChild(tgH);
      if (j < gaps.length) cumH += gaps[j];
    }
    var lgH = svgEl('text', { x: edgeL, y: 30.8, 'font-size': 2.8, fill: cInk });
    lgH.textContent = '棕:距首孔 · 绿:距纸边';
    svg.appendChild(lgH);
    return svg;
  }
  function renderRuler(root) {
    var punched = DB.sizes.filter(function (s) { return s.patterns && s.patterns.length; });
    if (!sizeById[rulerState.sizeId] || !sizeById[rulerState.sizeId].patterns || !sizeById[rulerState.sizeId].patterns.length) {
      rulerState.sizeId = punched.length ? punched[0].id : 'personal';
    }
    var card = el('div', 'card');
    card.appendChild(el('div', 'sec-title', '')).appendChild(el('span', 'sec-emoji', '📐'));
    card.lastChild.appendChild(document.createTextNode('选择尺寸（按孔系分组）'));
    var select = el('select', 'pick-select');
    var groupOrder = [];
    var groupMap = {};
    punched.forEach(function (s) {
      var sysName = s.patterns[0].systemName || '其他';
      if (!groupMap[sysName]) { groupMap[sysName] = []; groupOrder.push(sysName); }
      groupMap[sysName].push(s);
    });
    groupOrder.forEach(function (sysName) {
      var grp = el('optgroup', null, '');
      grp.setAttribute('label', sysName);
      groupMap[sysName].forEach(function (s) {
        var o = el('option', null, s.name + '（' + s.w + '×' + s.h + '）');
        o.value = s.id;
        if (s.id === rulerState.sizeId) o.selected = true;
        grp.appendChild(o);
      });
      select.appendChild(grp);
    });
    select.addEventListener('change', function () {
      rulerState.sizeId = select.value;
      rulerState.patternIdx = 0;
      storeSet('rulerSize', select.value);
      root.innerHTML = '';
      renderRuler(root);
    });
    card.appendChild(select);
    var ochips = el('div', 'chips');
    [['v', '纵向'], ['h', '横向']].forEach(function (p) {
      var c = el('button', 'chip press' + (rulerState.orientation === p[0] ? ' active' : ''), p[1]);
      c.type = 'button';
      c.addEventListener('click', function () {
        rulerState.orientation = p[0];
        storeSet('rulerOrient', p[0]);
        root.innerHTML = '';
        renderRuler(root);
      });
      ochips.appendChild(c);
    });
    card.appendChild(ochips);
    root.appendChild(card);

    var entry = sizeById[rulerState.sizeId];
    if (entry.patterns.length > 1) {
      var pchips = el('div', 'chips');
      entry.patterns.forEach(function (p, i) {
        var c = el('button', 'chip press' + (i === rulerState.patternIdx ? ' active' : ''), p.label);
        c.type = 'button';
        c.addEventListener('click', function () {
          rulerState.patternIdx = i;
          root.innerHTML = '';
          renderRuler(root);
        });
        pchips.appendChild(c);
      });
      root.appendChild(pchips);
    }
    var pat = entry.patterns[Math.min(rulerState.patternIdx, entry.patterns.length - 1)];
    var scroll = el('div', 'ruler-scroll');
    scroll.appendChild(buildRulerSVG(entry, pat, rulerState.orientation || 'v'));
    root.appendChild(scroll);
    var marginTB = Math.round((entry.h - pat.span) / 2 * 10) / 10;
    var info = el('div', 'pair-box');
    var l1 = el('div');
    l1.appendChild(el('b', null, entry.name + ' · ' + pat.label));
    info.appendChild(l1);
    info.appendChild(el('div', null, '总孔跨：' + pat.span + 'mm · 首末孔距纸边：' + marginTB + 'mm（上下居中）'));
    info.appendChild(el('div', 'dual-tip', '刻度两排：棕字=距首孔累积，绿字=距纸边累积（已含页边距，可拿尺子从纸边直接量）。📏 标尺按真实物理毫米渲染，两虚线间=纸张真实高度。屏幕受设备校准影响，最终以打孔器实测为准。'));
    root.appendChild(info);
  }

  /* ---------- 视图：拼版打印 ---------- */
  var currentPlan = null;   /* 当前预览对应的排版（自动或手动），导出用它 */
  var printManual = null;   /* 手动排版状态：{placements, paperW, paperH}；null=自动 */
  var printSel = -1;        /* 手动模式选中的内页下标 */
  var printGuides = null;   /* 拖拽吸附参考线 {v:[], h:[]} */
  var printStatuses = [];   /* 每个摆放的状态：green 正常 / orange 重叠 / red 溢出 */
  function getPrintPaper() {
    var pid = printState.paperId, i;
    if (pid.indexOf('c:') === 0) {
      var p = customPapers[parseInt(pid.slice(2), 10)];
      return p ? { w: p.w, h: p.h, name: p.name } : null;
    }
    for (i = 0; i < DB.papers.length; i++) {
      if (DB.papers[i].id === pid) return { w: DB.papers[i].w, h: DB.papers[i].h, name: DB.papers[i].name };
    }
    return null;
  }
  /* 单元展开：每份一条；对开 → 宽×2（两张连排，相对位置锁定为一个单元） */
  function buildUnits() {
    var units = [];
    printState.items.forEach(function (it, idx) {
      var w = it.spread ? it.w * 2 : it.w;
      var n = Math.max(1, it.qty || 1);
      for (var q = 0; q < n; q++) {
        units.push({
          w: w, h: it.h, itemIdx: idx,
          spread: !!it.spread,
          holeSide: it.spread ? null : (it.holeSide || 'left')
        });
      }
    });
    return units;
  }
  /* 自动排版：从左上角靠边密排（FFDH 首适应递减高度），正放/旋转两种优先序各跑一遍，
     取溢出/重叠更少的结果——旋转的收益被合理评估。容纳不下的内页也会被接受（错位摆放，
     标红提示，用户可手动旋转/拖拽调整）。 */
  function placementStatuses(plan) {
    var st = [];
    var n = plan.placements.length;
    for (var i = 0; i < n; i++) {
      var p = plan.placements[i];
      var s = 'green';
      if (p.x < -0.01 || p.y < -0.01 || p.x + p.w > plan.paperW + 0.01 || p.y + p.h > plan.paperH + 0.01) {
        s = 'red';
      } else {
        for (var j = 0; j < n; j++) {
          if (j === i) continue;
          var q = plan.placements[j];
          var ox = Math.min(p.x + p.w, q.x + q.w) - Math.max(p.x, q.x);
          var oy = Math.min(p.y + p.h, q.y + q.h) - Math.max(p.y, q.y);
          if (ox > 0.5 && oy > 0.5) { s = 'orange'; break; }
        }
      }
      st.push(s);
    }
    return st;
  }
  function packGreedy(paperW, paperH, margin, gap, allowRotate, units, rotFirst) {
    var W = paperW - margin * 2, H = paperH - margin * 2;
    var rows = [];          /* 已开行：{ y, h, x }（可用区相对坐标，x 含累计间隙） */
    var placements = [];
    var forced = 0;
    var oi, o, ri;
    var order = units.map(function (u, i) { return i; });
    order.sort(function (a, b) {
      var ua = units[a], ub = units[b];
      return (Math.max(ub.w, ub.h) - Math.max(ua.w, ua.h)) || (ub.w - ua.w);
    });
    order.forEach(function (i) {
      var u = units[i];
      var orients = rotFirst
        ? [{ w: u.h, h: u.w, rot: true }, { w: u.w, h: u.h, rot: false }]
        : [{ w: u.w, h: u.h, rot: false }, { w: u.h, h: u.w, rot: true }];
      if (u.w === u.h || !allowRotate) orients = orients.slice(orients.length - 1);
      var target = null;    /* 命中的行 */
      var fresh = false;
      /* 先试已开行（首个装得下的方向，行序优先） */
      for (oi = 0; oi < orients.length && !target; oi++) {
        o = orients[oi];
        for (ri = 0; ri < rows.length; ri++) {
          var row = rows[ri];
          if (row.h >= o.h - 0.01 && W - row.x >= o.w - 0.01) {
            target = row;
            break;
          }
        }
      }
      /* 再试新开一行（宽与高都须在纸内，正放优先） */
      for (oi = 0; oi < orients.length && !target; oi++) {
        o = orients[oi];
        if (o.w > W + 0.01) continue;
        var usedH = 0;
        rows.forEach(function (rw) { usedH += rw.h + gap; });
        if (rows.length) usedH -= gap;
        if (usedH < 0) usedH = 0;
        if (usedH + o.h <= H + 0.01) {
          target = { y: usedH, h: o.h, x: 0 };
          fresh = true;
          break;
        }
      }
      /* 仍放不下：接受溢出，错位摆到左上（标红），等待手动旋转/拖拽 */
      if (!target) {
        forced++;
        var px = margin, py = margin;
        if (forced > 1) {
          px = margin + (forced * 6) % Math.max(1, W - Math.min(u.w, W) + 0.01);
          py = margin + (forced * 4) % Math.max(1, H - Math.min(u.h, H) + 0.01);
        }
        var fo = orients[0];
        if (fo.w > W + 0.01 || fo.h > H + 0.01) fo = orients[orients.length - 1];
        placements.push({
          x: px, y: py, w: fo.w, h: fo.h,
          itemIdx: u.itemIdx, rotated: fo.rot,
          spread: !!u.spread, holeSide: u.spread ? null : (u.holeSide || 'left')
        });
        return;
      }
      if (fresh) {
        rows.push({ y: target.y, h: o.h, x: 0 });
        target = rows[rows.length - 1];
      }
      placements.push({
        x: margin + target.x, y: margin + target.y,
        w: o.w, h: o.h,
        itemIdx: u.itemIdx, rotated: o.rot,
        spread: !!u.spread, holeSide: u.spread ? null : (u.holeSide || 'left')
      });
      target.x += o.w + gap;
    });
    var area = 0;
    var placeCount = {};
    placements.forEach(function (p) {
      area += p.w * p.h;
      placeCount[p.itemIdx] = (placeCount[p.itemIdx] || 0) + 1;
    });
    var r = {
      count: placements.length, placements: placements,
      paperW: paperW, paperH: paperH, margin: margin, gap: gap,
      forced: forced, placeCount: placeCount,
      utilization: placements.length ? Math.round(area / (paperW * paperH) * 100) : 0
    };
    var statuses = placementStatuses(r);
    r.redCount = 0;
    r.orangeCount = 0;
    statuses.forEach(function (x) {
      if (x === 'red') r.redCount++;
      if (x === 'orange') r.orangeCount++;
    });
    return r;
  }
  function packItems(paperW, paperH, margin, gap, allowRotate, units) {
    var best = null, bestRed = -1, bestOrange = -1;
    [false, true].forEach(function (rotFirst) {
      var r = packGreedy(paperW, paperH, margin, gap, allowRotate, units, rotFirst);
      if (!best || r.redCount < bestRed || (r.redCount === bestRed && r.orangeCount < bestOrange)) {
        best = r;
        bestRed = r.redCount;
        bestOrange = r.orangeCount;
      }
    });
    return best;
  }
  function drawPlan(canvas, plan, pxPerMm, opts) {
    var W = Math.round(plan.paperW * pxPerMm), H = Math.round(plan.paperH * pxPerMm);
    canvas.width = W;
    canvas.height = H;
    if (opts.cssW) canvas.style.width = opts.cssW + 'px';
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, W, H);
    var s = pxPerMm, i, c, k, p, gi, g, g2;
    if (opts.marks && opts.marksOnly) {
      /* 只打印切割线：每个内页画完整矩形轮廓（可当纯裁切模板），对开加折线 */
      ctx.strokeStyle = '#8a7a6d';
      ctx.lineWidth = Math.max(1, s * (opts.markWidth || 0.3));
      if (opts.markStyle === 'dashed') ctx.setLineDash([3 * s, 2 * s]);
      for (i = 0; i < plan.placements.length; i++) {
        p = plan.placements[i];
        ctx.strokeRect(p.x * s, p.y * s, p.w * s, p.h * s);
        if (p.spread) {
          ctx.beginPath();
          if (p.rotated) { ctx.moveTo(p.x * s, (p.y + p.h / 2) * s); ctx.lineTo((p.x + p.w) * s, (p.y + p.h / 2) * s); }
          else { ctx.moveTo((p.x + p.w / 2) * s, p.y * s); ctx.lineTo((p.x + p.w / 2) * s, (p.y + p.h) * s); }
          ctx.stroke();
        }
      }
      ctx.setLineDash([]);
    }
    if (opts.marks && !opts.marksOnly) {
      /* 常规模式：四角裁切角标 */
      ctx.strokeStyle = '#8a7a6d';
      ctx.lineWidth = Math.max(1, s * (opts.markWidth || 0.3));
      if (opts.markStyle === 'dashed') ctx.setLineDash([3 * s, 2 * s]);
      var t = 3 * s, off = 1.2 * s;
      for (i = 0; i < plan.placements.length; i++) {
        p = plan.placements[i];
        var corners = [[p.x, p.y, -1, -1], [p.x + p.w, p.y, 1, -1], [p.x, p.y + p.h, -1, 1], [p.x + p.w, p.y + p.h, 1, 1]];
        for (k = 0; k < corners.length; k++) {
          c = corners[k];
          var cx = c[0] * s, cy = c[1] * s, sx = c[2], sy = c[3];
          ctx.beginPath();
          ctx.moveTo(cx + sx * off, cy);
          ctx.lineTo(cx + sx * (off + t), cy);
          ctx.moveTo(cx, cy + sy * off);
          ctx.lineTo(cx, cy + sy * (off + t));
          ctx.stroke();
        }
      }
      ctx.setLineDash([]);
    }
    if (!opts.marksOnly) {
      for (i = 0; i < plan.placements.length; i++) {
        p = plan.placements[i];
        var stCol = '#e86a92';
        if (opts.statusColors && opts.statuses && opts.statuses[i]) {
          stCol = opts.statuses[i] === 'red' ? '#d64545' : (opts.statuses[i] === 'orange' ? '#d98a35' : '#3fa98b');
        }
        ctx.fillStyle = '#fff0f6';
        ctx.fillRect(p.x * s, p.y * s, p.w * s, p.h * s);
        ctx.strokeStyle = stCol;
        ctx.lineWidth = Math.max(1, s * 0.25);
        ctx.strokeRect(p.x * s, p.y * s, p.w * s, p.h * s);
        if (p.spread) {
          ctx.save();
          ctx.strokeStyle = '#b08d6e';
          ctx.lineWidth = Math.max(1, s * 0.2);
          ctx.setLineDash([2.5 * s, 2 * s]);
          ctx.beginPath();
          if (p.rotated) { ctx.moveTo(p.x * s, (p.y + p.h / 2) * s); ctx.lineTo((p.x + p.w) * s, (p.y + p.h / 2) * s); }
          else { ctx.moveTo((p.x + p.w / 2) * s, p.y * s); ctx.lineTo((p.x + p.w / 2) * s, (p.y + p.h) * s); }
          ctx.stroke();
          ctx.restore();
        }
      }
      /* 内页文字标注：版式 + 尺寸，便于识别 */
      for (i = 0; i < plan.placements.length; i++) {
        p = plan.placements[i];
        var it2 = printState.items[p.itemIdx];
        if (!it2) continue;
        var tw = p.w, th = p.h;
        var fsz = Math.min(5, Math.max(2.6, Math.min(tw, th) / 9)) * s;
        var name2 = it2.name + (it2.spread ? '·对开' : '') + (it2.holeSide === 'right' ? '·右孔' : (it2.holeSide === 'left' ? '·左孔' : ''));
        var dim2 = (p.w) + '×' + (p.h);
        ctx.fillStyle = '#b0557e';
        ctx.font = '600 ' + fsz + 'px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(name2, (p.x + tw / 2) * s, (p.y + th / 2) * s - fsz * 0.7);
        ctx.font = Math.max(2.4 * s, fsz * 0.78) + 'px sans-serif';
        ctx.fillStyle = '#c77f9d';
        ctx.fillText(dim2 + 'mm', (p.x + tw / 2) * s, (p.y + th / 2) * s + fsz * 0.75);
      }
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
    }
    if (opts.holeMarks) {
      ctx.strokeStyle = '#8a66c6';
      ctx.lineWidth = Math.max(1, s * 0.22);
      for (i = 0; i < plan.placements.length; i++) {
        p = plan.placements[i];
        var it = printState.items[p.itemIdx];
        if (!it) continue;
        var sz = sizeById[it.sizeId];
        var pat = sz && sz.patterns && sz.patterns[0];
        if (!pat || !pat.gaps) continue;
        var span = 0;
        for (gi = 0; gi < pat.gaps.length; gi++) span += pat.gaps[gi];
        var inset = 8;
        if (!p.rotated) {
          var hx = (p.holeSide === 'right' ? p.x + p.w - inset : p.x + inset) * s;
          var hy = p.y + (p.h - span) / 2;
          for (g = 0; g <= pat.gaps.length; g++) {
            ctx.beginPath();
            ctx.arc(hx, hy * s, 2.2 * s, 0, Math.PI * 2);
            ctx.stroke();
            if (g < pat.gaps.length) hy += pat.gaps[g];
          }
        } else {
          var hy2 = (p.holeSide === 'right' ? p.y + p.h - inset : p.y + inset) * s;
          var hx2 = p.x + (p.w - span) / 2;
          for (g2 = 0; g2 <= pat.gaps.length; g2++) {
            ctx.beginPath();
            ctx.arc(hx2 * s, hy2, 2.2 * s, 0, Math.PI * 2);
            ctx.stroke();
            if (g2 < pat.gaps.length) hx2 += pat.gaps[g2];
          }
        }
      }
    }
    /* 手动编辑态：选中高亮 + 吸附参考线 */
    if (opts.sel >= 0 && opts.sel < plan.placements.length) {
      p = plan.placements[opts.sel];
      ctx.strokeStyle = '#8a66c6';
      ctx.lineWidth = Math.max(2, s * 0.5);
      ctx.strokeRect(p.x * s, p.y * s, p.w * s, p.h * s);
    }
    if (opts.guides) {
      ctx.strokeStyle = '#3fa98b';
      ctx.lineWidth = Math.max(1, s * 0.2);
      ctx.setLineDash([2 * s, 2 * s]);
      for (i = 0; i < (opts.guides.v || []).length; i++) {
        ctx.beginPath();
        ctx.moveTo(opts.guides.v[i] * s, 0);
        ctx.lineTo(opts.guides.v[i] * s, H);
        ctx.stroke();
      }
      for (i = 0; i < (opts.guides.h || []).length; i++) {
        ctx.beginPath();
        ctx.moveTo(0, opts.guides.h[i] * s);
        ctx.lineTo(W, opts.guides.h[i] * s);
        ctx.stroke();
      }
      ctx.setLineDash([]);
    }
  }
  function renderPrint(root) {
    root.appendChild(el('p', 'sec-note',
      '三步出图：① 添加一个或多个内页（可混搭，可选对开/左右孔）→ ② 选纸张与参数（自动从左上角靠边密排，优先最大利用率）→ ③ 生成打印图存相册。预览图可直接拖拽内页微调（自动吸附对齐），打印时选「实际大小 / 100% 缩放」。'));

    /* ① 内页清单 */
    var c1 = el('div', 'card');
    c1.appendChild(el('div', 'sec-title', '')).appendChild(el('span', 'sec-emoji', '📒'));
    c1.lastChild.appendChild(document.createTextNode('已添加的内页'));
    var listEl = el('div', 'item-list');
    c1.appendChild(listEl);

    var addSel = el('select', 'pick-select');
    var og = el('optgroup', null, '');
    og.setAttribute('label', '常用手帐尺寸');
    DB.sizes.forEach(function (s) {
      var o = el('option', null, s.name + '（' + s.w + '×' + s.h + '）');
      o.value = s.id;
      addSel.appendChild(o);
    });
    addSel.appendChild(og);
    var oCustom = el('option', null, '✏️ 自定义宽高');
    oCustom.value = 'custom';
    addSel.appendChild(oCustom);
    c1.appendChild(addSel);
    var customRow = el('div', 'form-row hidden');
    var fCustomW = buildNumField('内页宽 mm', null, 20, 300, '');
    var fCustomH = buildNumField('内页高 mm', null, 20, 300, '');
    customRow.appendChild(fCustomW.wrap);
    customRow.appendChild(fCustomH.wrap);
    c1.appendChild(customRow);

    var modeRow = el('div', 'form-row inline-field');
    modeRow.appendChild(el('span', 'num-label', '版式'));
    var layoutChips = el('div', 'chips');
    var LAYOUT_DEFS = [
      { key: 'plain', label: '单页无孔' },
      { key: 'spread', label: '双页对开', need: '定页' },
      { key: 'holeL', label: '单页左孔', need: '活页' },
      { key: 'holeR', label: '单页右孔', need: '活页' }
    ];
    var layoutChipEls = [];
    LAYOUT_DEFS.forEach(function (l) {
      var c = el('button', 'chip press', l.label);
      c.type = 'button';
      c.addEventListener('click', function () { setAddLayout(l.key); });
      layoutChips.appendChild(c);
      layoutChipEls.push({ key: l.key, el: c, def: l });
    });
    modeRow.appendChild(layoutChips);
    c1.appendChild(modeRow);
    var addBtn = el('button', 'print-add press', '＋ 添加到纸张');
    addBtn.type = 'button';
    c1.appendChild(addBtn);
    root.appendChild(c1);

    var addLayout = 'plain';
    function setAddLayout(key) {
      addLayout = key;
      layoutChipEls.forEach(function (x) { x.el.classList.toggle('active', x.key === key); });
    }
    function syncAddVisibility() {
      var s = sizeById[addSel.value];
      var isDingye = !!(s && s.tags && s.tags.indexOf('定页') >= 0);
      var isHuoye = !!(s && s.tags && s.tags.indexOf('活页') >= 0);
      layoutChipEls.forEach(function (x) {
        var hide = (x.def.need === '定页' && !isDingye) || (x.def.need === '活页' && !isHuoye);
        x.el.classList.toggle('hidden', hide);
      });
      /* 切换尺寸时，版式重置为该类型的默认：定页→双页对开；活页→单页左孔；其余→单页无孔 */
      setAddLayout(isDingye ? 'spread' : (isHuoye ? 'holeL' : 'plain'));
    }
    addSel.addEventListener('change', function () {
      customRow.classList.toggle('hidden', addSel.value !== 'custom');
      syncAddVisibility();
    });

    /* ② 纸张（按系列分组 + 方向 + 我的纸张） */
    var c2 = el('div', 'card');
    c2.appendChild(el('div', 'sec-title', '')).appendChild(el('span', 'sec-emoji', '📄'));
    c2.lastChild.appendChild(document.createTextNode('打印纸张'));
    var paperSel = el('select', 'pick-select');
    var seriesOrder = [];
    var seriesMap = {};
    DB.papers.forEach(function (p) {
      if (!seriesMap[p.series]) { seriesMap[p.series] = []; seriesOrder.push(p.series); }
      seriesMap[p.series].push(p);
    });
    seriesOrder.forEach(function (seName) {
      var grp = el('optgroup', null, '');
      grp.setAttribute('label', seName + '纸张');
      seriesMap[seName].forEach(function (p) {
        var o = el('option', null, p.name + '（' + p.w + '×' + p.h + ' · ' + p.inch + '）');
        o.value = p.id;
        if (printState.paperId === p.id) o.selected = true;
        grp.appendChild(o);
      });
      paperSel.appendChild(grp);
    });
    if (customPapers.length) {
      var ogC = el('optgroup', null, '');
      ogC.setAttribute('label', '我的纸张');
      customPapers.forEach(function (p, i) {
        var o = el('option', null, p.name + '（' + p.w + '×' + p.h + '）');
        o.value = 'c:' + i;
        if (printState.paperId === 'c:' + i) o.selected = true;
        ogC.appendChild(o);
      });
      paperSel.appendChild(ogC);
    }
    var oNew = el('option', null, '＋ 新建自定义纸张');
    oNew.value = '__new';
    if (printState.paperId === '__new') oNew.selected = true;
    paperSel.appendChild(oNew);
    c2.appendChild(paperSel);

    var orientRow = el('div', 'form-row inline-field');
    orientRow.appendChild(el('span', 'num-label', '纸张方向'));
    var orientChips = el('div', 'chips');
    [['v', '竖向'], ['h', '横向']].forEach(function (p) {
      var c = el('button', 'chip press' + (printState.paperOrient === p[0] ? ' active' : ''), p[1]);
      c.type = 'button';
      c.addEventListener('click', function () {
        printState.paperOrient = p[0];
        persistPrintState();
        root.innerHTML = '';
        renderPrint(root);
      });
      orientChips.appendChild(c);
    });
    orientRow.appendChild(orientChips);
    c2.appendChild(orientRow);

    var newPaperRow = el('div', 'form-row' + (printState.paperId === '__new' ? '' : ' hidden'));
    var npW = buildNumField('纸宽 mm', null, 50, 600, '');
    var npH = buildNumField('纸高 mm', null, 50, 600, '');
    newPaperRow.appendChild(npW.wrap);
    newPaperRow.appendChild(npH.wrap);
    var npSave = el('button', 'chip press', '💾 保存并使用');
    npSave.type = 'button';
    newPaperRow.appendChild(npSave);
    c2.appendChild(newPaperRow);
    if (customPapers.length) {
      var manage = el('div', 'chips');
      customPapers.forEach(function (p, i) {
        var d = el('button', 'chip press', '🗑 ' + p.name);
        d.type = 'button';
        d.addEventListener('click', function () {
          customPapers.splice(i, 1);
          persistCustomPapers();
          if (printState.paperId === 'c:' + i) printState.paperId = 'a4';
          root.innerHTML = '';
          renderPrint(root);
        });
        manage.appendChild(d);
      });
      c2.appendChild(el('div', 'sec-note', '我的纸张（点删除）：'));
      c2.appendChild(manage);
    }
    root.appendChild(c2);

    /* ③ 参数 */
    var c3 = el('div', 'card');
    c3.appendChild(el('div', 'sec-title', '')).appendChild(el('span', 'sec-emoji', '⚙️'));
    c3.lastChild.appendChild(document.createTextNode('排版参数'));
    c3.appendChild(el('div', 'sec-note', '自动排版策略：从左上角靠边密排，优先最大利用率。改下面的参数会重新自动排版；在预览图上点选并拖拽可进入手动微调。'));
    var paramRow = el('div', 'form-row');
    var fMargin = buildNumField('边距 mm', 'margin', 0, 30, printState.margin);
    var fGap = buildNumField('间隙 mm', 'gap', 0, 20, printState.gap);
    paramRow.appendChild(fMargin.wrap);
    paramRow.appendChild(fGap.wrap);
    c3.appendChild(paramRow);
    var rotCheck = buildCheck('允许旋转 90° 摆放（可能一页放更多）', 'allowRotate');
    c3.appendChild(rotCheck);

    c3.appendChild(el('div', 'sec-note', '切割线：'));
    var marksCheck = buildCheck('打印切割标记', 'marks');
    c3.appendChild(marksCheck);
    var marksRow = el('div', 'form-row' + (printState.marks ? '' : ' hidden'));
    var styleCol = el('div', 'num-field');
    styleCol.appendChild(el('span', 'num-label', '样式'));
    var styleChips = el('div', 'chips');
    var styleChipEls = [];
    [['solid', '实线'], ['dashed', '虚线']].forEach(function (p) {
      var c = el('button', 'chip press' + (printState.markStyle === p[0] ? ' active' : ''), p[1]);
      c.type = 'button';
      c.addEventListener('click', function () {
        printState.markStyle = p[0];
        persistPrintState();
        styleChipEls.forEach(function (sc) { sc.el.classList.toggle('active', sc.key === p[0]); });
        redrawPreview();
      });
      styleChips.appendChild(c);
      styleChipEls.push({ key: p[0], el: c });
    });
    styleCol.appendChild(styleChips);
    marksRow.appendChild(styleCol);
    var widthCol = el('div', 'num-field');
    widthCol.appendChild(el('span', 'num-label', '线宽'));
    var widthChips = el('div', 'chips');
    var widthChipEls = [];
    [[0.18, '细'], [0.3, '中'], [0.45, '粗']].forEach(function (p) {
      var c = el('button', 'chip press' + (printState.markWidth === p[0] ? ' active' : ''), p[1]);
      c.type = 'button';
      c.addEventListener('click', function () {
        printState.markWidth = p[0];
        persistPrintState();
        widthChipEls.forEach(function (wc) { wc.el.classList.toggle('active', wc.key === p[0]); });
        redrawPreview();
      });
      widthChips.appendChild(c);
      widthChipEls.push({ key: p[0], el: c });
    });
    widthCol.appendChild(widthChips);
    marksRow.appendChild(widthCol);
    c3.appendChild(marksRow);
    var marksOnlyCheck = buildCheck('只打印切割线（不画内页框，可当纯裁切模板）', 'marksOnly');
    c3.appendChild(marksOnlyCheck);
    c3.appendChild(buildCheck('打印孔位标记（辅助打孔对位，活页有效）', 'holeMarks'));
    root.appendChild(c3);

    /* ④ 预览 · 手动调整 · 导出 */
    var c4 = el('div', 'card');
    c4.appendChild(el('div', 'sec-title', '')).appendChild(el('span', 'sec-emoji', '✋'));
    c4.lastChild.appendChild(document.createTextNode('预览与手动调整'));
    var resultLine = el('div', 'print-result');
    c4.appendChild(resultLine);
    var editorRow = el('div', 'form-row');
    editorRow.style.display = 'none';
    var rotBtn = el('button', 'chip press', '🔄 旋转所选 90°');
    rotBtn.type = 'button';
    var removeBtn = el('button', 'chip press', '✕ 移除所选');
    removeBtn.type = 'button';
    var resetBtn = el('button', 'chip press', '↺ 重置自动排版');
    resetBtn.type = 'button';
    editorRow.appendChild(rotBtn);
    editorRow.appendChild(removeBtn);
    editorRow.appendChild(resetBtn);
    c4.appendChild(editorRow);
    var editorTip = el('div', 'dual-tip', '点选内页后拖动摆放；靠近纸张边缘、边距线或相邻内页会自动吸附（绿虚线为参考）。颜色：绿=正常，橙=重叠，红=溢出。');
    editorTip.style.display = 'none';
    c4.appendChild(editorTip);
    var previewWrap = el('div', 'print-preview');
    c4.appendChild(previewWrap);
    var fallback = el('div', 'print-fallback');
    c4.appendChild(fallback);
    var exportBtn = el('button', 'print-export press', '🖨️ 生成打印图并保存到相册');
    exportBtn.type = 'button';
    exportBtn.addEventListener('click', function () { exportPrint(fallback, exportBtn); });
    c4.appendChild(exportBtn);
    c4.appendChild(el('div', 'dual-tip', '💡 打印时选择「实际大小 / 100% 缩放」，不要选「适应页面」，尺寸才准确。'));
    root.appendChild(c4);

    var drag = null;

    function effPaper() {
      var base = getPrintPaper();
      if (!base) return null;
      return printState.paperOrient === 'h'
        ? { w: base.h, h: base.w, name: base.name + ' 横向' }
        : { w: base.w, h: base.h, name: base.name };
    }
    function refreshList() {
      listEl.innerHTML = '';
      if (!printState.items.length) {
        listEl.appendChild(el('div', 'sec-note', '还没有内页：在下方选择尺寸后点「添加到纸张」。'));
        return;
      }
      var plan = printManual || currentPlan;
      var itemSt = {};
      var rank = { green: 0, orange: 1, red: 2 };
      if (plan && plan.placements) {
        plan.placements.forEach(function (p, idx) {
          var s = printStatuses[idx] || 'green';
          var prev = itemSt[p.itemIdx];
          if (!prev || rank[s] > rank[prev]) itemSt[p.itemIdx] = s;
        });
      }
      printState.items.forEach(function (it, i) {
        var st = itemSt[i] || 'green';
        var row = el('div', 'item-row st-' + st);
        var suf = it.spread ? ' · 对开' : (it.holeSide === 'right' ? ' · 右孔' : (it.holeSide === 'left' ? ' · 左孔' : ''));
        row.appendChild(el('span', 'item-name', it.name + suf));
        row.appendChild(el('span', 'item-dim selectable', (it.spread ? it.w * 2 + '×' + it.h : it.w + '×' + it.h) + ' mm'));
        if (st === 'orange') row.appendChild(el('span', 'item-badge orange', '重叠'));
        if (st === 'red') row.appendChild(el('span', 'item-badge red', '溢出'));
        if (st === 'green') row.appendChild(el('span', 'item-badge ok', '✓'));
        var del = el('button', 'chip press', '✕');
        del.type = 'button';
        del.addEventListener('click', function () {
          printState.items.splice(i, 1);
          persistPrintState();
          refreshList();
          recompute();
        });
        row.appendChild(del);
        listEl.appendChild(row);
      });
    }
    function canvasToMM(e) {
      var r = canvas.getBoundingClientRect();
      return {
        x: (e.clientX - r.left) / r.width * currentPlan.paperW,
        y: (e.clientY - r.top) / r.height * currentPlan.paperH
      };
    }
    function activePlacements() {
      return printManual ? printManual.placements : (currentPlan ? currentPlan.placements : []);
    }
    function hitTest(m) {
      var list = activePlacements();
      for (var i = list.length - 1; i >= 0; i--) {
        var p = list[i];
        if (m.x >= p.x && m.x <= p.x + p.w && m.y >= p.y && m.y <= p.y + p.h) return i;
      }
      return -1;
    }
    function nearestTarget(cands, v) {
      var best = null, bd = 3; /* 吸附阈值 3mm */
      for (var i = 0; i < cands.length; i++) {
        var d = Math.abs(cands[i] - v);
        if (d <= bd) { bd = d; best = cands[i]; }
      }
      return best;
    }
    function applySnap(nx, ny, w, h, selfIdx) {
      var guides = { v: [], h: [] };
      var xs = [0, printState.margin, currentPlan.paperW - w, (currentPlan.paperW - w) / 2];
      var ys = [0, printState.margin, currentPlan.paperH - h, (currentPlan.paperH - h) / 2];
      var list = printManual.placements;
      for (var i = 0; i < list.length; i++) {
        if (i === selfIdx) continue;
        var p = list[i];
        xs.push(p.x, p.x + p.w, p.x + p.w / 2 - w / 2, p.x - w);
        ys.push(p.y, p.y + p.h, p.y + p.h / 2 - h / 2, p.y - h);
      }
      var sx = nearestTarget(xs, nx);
      if (sx !== null) { nx = sx; guides.v.push(sx, sx + w); }
      var sy = nearestTarget(ys, ny);
      if (sy !== null) { ny = sy; guides.h.push(sy, sy + h); }
      return { x: nx, y: ny, guides: guides };
    }
    function updateResultLine() {
      resultLine.innerHTML = '';
      if (!currentPlan) return;
      var redC = 0, orangeC = 0;
      printStatuses.forEach(function (x) {
        if (x === 'red') redC++;
        if (x === 'orange') orangeC++;
      });
      var hint = (redC + orangeC) > 0 ? ' · 红色溢出 ' + redC + ' / 橙色重叠 ' + orangeC + '（可拖拽或旋转调整）' : '';
      if (printManual) {
        if (!printManual.placements.length) {
          resultLine.appendChild(el('div', 'detail-warn', '手动排版已清空：点「重置自动排版」恢复，或继续添加内页。'));
          return;
        }
        var area = 0;
        printManual.placements.forEach(function (p) { area += p.w * p.h; });
        var u = Math.round(area / (printManual.paperW * printManual.paperH) * 100);
        resultLine.appendChild(el('div', 'print-num selectable',
          '✋ 手动排版 · 共 ' + printManual.placements.length + ' 张 · 利用率 ' + u + '%' + hint));
      } else {
        resultLine.appendChild(el('div', 'print-num selectable',
          '自动排版（靠边密排） · ' + currentPlan.count + ' 张 · 利用率 ' + currentPlan.utilization + '%' + hint));
      }
    }
    function redrawPreview() {
      previewWrap.innerHTML = '';
      if (!currentPlan || !currentPlan.placements.length) {
        editorRow.style.display = 'none';
        editorTip.style.display = 'none';
        updateResultLine();
        return;
      }
      var manualOn = !!printManual;
      editorRow.style.display = manualOn ? '' : 'none';
      editorTip.style.display = manualOn ? '' : 'none';
      printStatuses = placementStatuses(currentPlan);
      updateResultLine();
      var scale = Math.min(1, (window.innerWidth >= 720 ? 430 : 340) / currentPlan.paperW);
      canvas = document.createElement('canvas');
      previewWrap.appendChild(canvas);
      canvas.style.touchAction = 'none';
      drawPlan(canvas, currentPlan, scale * (window.devicePixelRatio > 1 ? 2 : 1), {
        cssW: Math.round(currentPlan.paperW * scale),
        marks: printState.marks,
        markStyle: printState.markStyle,
        markWidth: printState.markWidth,
        marksOnly: printState.marksOnly,
        holeMarks: printState.holeMarks,
        statuses: printStatuses,
        statusColors: true,
        sel: printSel,
        guides: printGuides
      });
      bindCanvasEvents();
    }
    var canvas = null;
    function bindCanvasEvents() {
      canvas.addEventListener('pointerdown', function (e) {
        if (!currentPlan || !activePlacements().length) return;
        var m = canvasToMM(e);
        printSel = hitTest(m);
        if (printSel >= 0) {
          if (!printManual) {
            var n = currentPlan.placements.length;
            printManual = {
              paperW: currentPlan.paperW, paperH: currentPlan.paperH,
              count: n,
              placements: currentPlan.placements.map(function (p) {
                return { x: p.x, y: p.y, w: p.w, h: p.h, itemIdx: p.itemIdx, rotated: p.rotated, spread: p.spread, holeSide: p.holeSide };
              })
            };
            currentPlan = printManual;
          }
          var p = printManual.placements[printSel];
          drag = { idx: printSel, dx: m.x - p.x, dy: m.y - p.y };
          if (canvas.setPointerCapture) {
            try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* 忽略 */ }
          }
        }
        redrawPreview();
      });
      canvas.addEventListener('pointermove', function (e) {
        if (!drag) return;
        var m = canvasToMM(e);
        var p = printManual.placements[drag.idx];
        var snap = applySnap(m.x - drag.dx, m.y - drag.dy, p.w, p.h, drag.idx);
        p.x = Math.min(Math.max(0, snap.x), printManual.paperW - p.w);
        p.y = Math.min(Math.max(0, snap.y), printManual.paperH - p.h);
        printGuides = snap.guides;
        redrawPreview();
      });
      function endDrag() {
        if (!drag) return;
        drag = null;
        printGuides = null;
        redrawPreview();
      }
      canvas.addEventListener('pointerup', endDrag);
      canvas.addEventListener('pointercancel', endDrag);
    }
    rotBtn.addEventListener('click', function () {
      if (printSel < 0 || !printManual) { toast('先在预览图上点选一个内页'); return; }
      var p = printManual.placements[printSel];
      var cx = p.x + p.w / 2, cy = p.y + p.h / 2;
      var nw = p.h, nh = p.w;
      p.x = Math.min(Math.max(0, cx - nw / 2), printManual.paperW - nw);
      p.y = Math.min(Math.max(0, cy - nh / 2), printManual.paperH - nh);
      p.w = nw;
      p.h = nh;
      p.rotated = !p.rotated;
      redrawPreview();
    });
    removeBtn.addEventListener('click', function () {
      if (printSel < 0 || !printManual) { toast('先在预览图上点选一个内页'); return; }
      var p = printManual.placements[printSel];
      var it = printState.items[p.itemIdx];
      if (it) {
        it.qty = (it.qty || 1) - 1;
        if (it.qty <= 0) {
          var removedIdx = p.itemIdx;
          printState.items.splice(removedIdx, 1);
          /* 重映射剩余预览元素的 itemIdx，保持与清单联动 */
          printManual.placements.forEach(function (pp) {
            if (pp.itemIdx > removedIdx) pp.itemIdx--;
          });
          persistPrintState();
        }
      }
      printManual.placements.splice(printSel, 1);
      printManual.count = printManual.placements.length;
      printSel = -1;
      refreshList();
      redrawPreview();
    });
    resetBtn.addEventListener('click', function () {
      printManual = null;
      printSel = -1;
      printGuides = null;
      recompute();
      toast('已恢复自动排版');
    });

    function recompute() {
      var hadManual = !!printManual;
      printManual = null;
      printSel = -1;
      printGuides = null;
      var paper = effPaper();
      resultLine.innerHTML = '';
      if (!paper) {
        currentPlan = null;
        redrawPreview();
        resultLine.appendChild(el('div', 'detail-warn', '请选择纸张'));
        refreshList();
        return;
      }
      var units = buildUnits();
      if (!units.length) {
        currentPlan = null;
        redrawPreview();
        resultLine.appendChild(el('div', 'detail-warn', '请至少添加一个内页'));
        refreshList();
        return;
      }
      currentPlan = packItems(paper.w, paper.h, printState.margin, printState.gap, printState.allowRotate, units);
      redrawPreview();
      refreshList();
      if (hadManual) toast('参数已变更，已恢复自动排版');
    }

    addBtn.addEventListener('click', function () {
      var it;
      if (addSel.value === 'custom') {
        var w = parseFloat(fCustomW.input.value), h = parseFloat(fCustomH.input.value);
        if (!(w >= 20 && w <= 300 && h >= 20 && h <= 300)) { toast('自定义内页宽高需在 20~300mm 之间'); return; }
        it = { sizeId: 'custom', name: '自定义 ' + w + '×' + h, w: w, h: h };
      } else {
        var s = sizeById[addSel.value];
        it = { sizeId: s.id, name: s.name, w: s.w, h: s.h };
      }
      it.spread = addLayout === 'spread';
      it.holeSide = it.spread ? null : (addLayout === 'holeR' ? 'right' : (addLayout === 'holeL' ? 'left' : null));
      it.qty = 1;
      printState.items.push(it);
      persistPrintState();
      refreshList();
      recompute();
      toast('已添加：' + it.name + (it.spread ? ' · 对开' : (it.holeSide === 'right' ? ' · 右孔' : ' · 左孔')));
    });

    refreshList();
    recompute();
  }
  function buildNumField(label, stateKey, min, max, value) {
    var wrap = el('label', 'num-field');
    wrap.appendChild(el('span', 'num-label', label));
    var input = el('input', 'num-input');
    input.type = 'number';
    input.min = String(min);
    input.max = String(max);
    input.step = '1';
    if (value !== '' && value !== null && value !== undefined) input.value = String(value);
    wrap.appendChild(input);
    return { wrap: wrap, input: input,
      apply: function () {
        var v = parseFloat(input.value);
        if (isNaN(v)) return null;
        v = Math.min(max, Math.max(min, v));
        if (stateKey) { printState[stateKey] = v; persistPrintState(); }
        return v;
      } };
  }
  function buildCheck(label, key) {
    var wrap = el('label', 'check-field');
    var box = el('input');
    box.type = 'checkbox';
    box.checked = printState[key] === true;
    box.addEventListener('change', function () {
      printState[key] = box.checked;
      persistPrintState();
    });
    wrap.appendChild(box);
    wrap.appendChild(el('span', null, ' ' + label));
    return wrap;
  }
  function exportPrint(fallback, btn) {
    var plan = currentPlan;
    if (!plan || !plan.placements || !plan.placements.length) { toast('当前参数放不下一张，先调整排版'); return; }
    var old = btn.textContent;
    btn.textContent = '⏳ 生成中…';
    btn.disabled = true;
    setTimeout(function () {
      try {
        var dpi = 300, pxPerMm = dpi / 25.4;
        if (plan.paperW * pxPerMm * plan.paperH * pxPerMm > 16e6) {
          dpi = 150; pxPerMm = dpi / 25.4;
          toast('纸张较大，已自动改用 150dpi');
        }
        var c = document.createElement('canvas');
        drawPlan(c, plan, pxPerMm, {
          marks: printState.marks,
          markStyle: printState.markStyle,
          markWidth: printState.markWidth,
          marksOnly: printState.marksOnly,
          holeMarks: printState.holeMarks
        });
        var dataURL = c.toDataURL('image/png');
        var bridge = window.xhs && window.xhs.miniTool;
        if (bridge && typeof bridge.saveImageToPhotosAlbum === 'function') {
          var p = bridge.saveImageToPhotosAlbum({ filePath: dataURL });
          if (p && typeof p.then === 'function') {
            p.then(function () {
              toast('✅ 已保存到相册，打印时选「实际大小」');
            }).catch(function (err) {
              toast('保存失败：' + ((err && err.errMsg) || '未知原因'));
            }).then(function () {
              resetExportBtn(btn, old);
            });
          } else {
            resetExportBtn(btn, old);
          }
        } else {
          fallback.innerHTML = '';
          fallback.appendChild(el('div', 'dual-tip', '已生成打印图，可下载或右键另存（打印时选「实际大小」）：'));
          var img = el('img', 'print-img');
          img.src = dataURL;
          img.alt = '拼版打印图';
          fallback.appendChild(img);
          var dl = el('a', 'print-download press', '⬇️ 下载打印图 PNG');
          dl.href = dataURL;
          dl.download = '手帐拼版打印图.png';
          fallback.appendChild(dl);
          resetExportBtn(btn, old);
        }
      } catch (e) {
        toast('生成失败：' + (e && e.message ? e.message : '未知错误'));
        resetExportBtn(btn, old);
      }
    }, 30);
  }
  function resetExportBtn(btn, old) {
    btn.textContent = old;
    btn.disabled = false;
  }

  /* ---------- 视图 2：孔位体系 ---------- */
  function buildSystemCard(sy) {
    var card = el('div', 'card');
    var head = el('div', 'sys-head');
    head.appendChild(el('span', 'sys-name', sy.name));
    card.appendChild(head);

    if (sy.dots) {
      var dots = el('div', 'sys-dots');
      dots.appendChild(renderDotsSVG(sy.dots));
      card.appendChild(dots);
    }
    var meta = el('div', 'sys-meta');
    var m1 = el('div');
    m1.appendChild(el('b', null, '孔位：'));
    m1.appendChild(document.createTextNode(sy.holesDisp));
    meta.appendChild(m1);
    if (sy.pitchDisp !== '—') {
      var m2 = el('div');
      m2.appendChild(el('b', null, '孔距：'));
      m2.appendChild(document.createTextNode(sy.pitchDisp));
      meta.appendChild(m2);
    }
    if (sy.origin) {
      var m3 = el('div');
      m3.appendChild(el('b', null, '来源：'));
      m3.appendChild(document.createTextNode(sy.origin));
      meta.appendChild(m3);
    }
    card.appendChild(meta);

    if (sy.memberIds && sy.memberIds.length) {
      var mem = el('div', 'sys-members');
      sy.memberIds.forEach(function (id, mi) {
        var mb = el('button', 'sys-member press', sy.members[mi] || id);
        mb.type = 'button';
        mb.addEventListener('click', function () {
          var target = sizeById[id];
          if (!target || !target.patterns || !target.patterns.length) { toast('该尺寸没有孔位数据'); return; }
          rulerState.sizeId = id;
          var pi = 0;
          for (var kk = 0; kk < target.patterns.length; kk++) {
            if (target.patterns[kk].system === sy.id) pi = kk;
          }
          rulerState.patternIdx = pi;
          storeSet('rulerSize', id);
          goTab('ruler');
        });
        mem.appendChild(mb);
      });
      card.appendChild(mem);
    }
    if (sy.note) {
      var note = el('div', 'sys-meta');
      note.textContent = sy.note;
      card.appendChild(note);
    }
    return card;
  }

  function renderSystems(root) {
    root.appendChild(el('p', 'sec-note', '同一孔位体系的内页/环架可直接互换；不同体系不能混用。点体系里的尺寸名，可跳转到对应孔标尺 📐。'));
    DB.systems.forEach(function (sy) { root.appendChild(buildSystemCard(sy)); });

    var red = el('div', 'card card-red');
    red.appendChild(el('div', 'sec-title', '')).appendChild(el('span', 'sec-emoji', '🚫'));
    var redT = el('span', null, '不能混用（红黑榜）');
    red.lastChild.appendChild(redT);
    DB.relations.incompatible.forEach(function (t) {
      red.appendChild(el('div', 'red-item', '✕ ' + t));
    });
    red.appendChild(el('div', 'red-item', '✓ 日系 9.5mm 系：同孔距同孔数内互相通用（B5 26孔 ↔ B5 Half 26孔 等）'));
    root.appendChild(red);
  }

  /* ---------- 视图 3：联动关系 ---------- */
  function buildWidthBars(group, maxW, color) {
    var wrap = el('div', 'bar-group');
    wrap.appendChild(el('div', 'sec-title', '')).appendChild(el('span', 'sec-emoji', '📐'));
    wrap.lastChild.appendChild(document.createTextNode(group.title));
    group.bars.forEach(function (b) {
      var row = el('div', 'bar-row');
      var label = el('div', 'bar-label', b.name);
      label.title = b.name;
      row.appendChild(label);
      var track = el('div', 'bar-track');
      var fill = el('div', 'bar-fill', b.w + 'mm');
      fill.style.width = Math.max(12, Math.round(b.w / maxW * 100)) + '%';
      fill.style.background = color;
      track.appendChild(fill);
      row.appendChild(track);
      wrap.appendChild(row);
    });
    if (group.note) wrap.appendChild(el('div', 'sec-note', group.note));
    return wrap;
  }

  function renderRelations(root) {
    /* 宽度阶梯：条长按组内统一宽度，跨组用同一比例尺对比 */
    var BAR_COLORS = ['#e86a92', '#3fa98b', '#d98a35'];
    var maxW = 0, gi;
    for (gi = 0; gi < DB.relations.widthGroups.length; gi++) {
      maxW = Math.max(maxW, DB.relations.widthGroups[gi].width_mm);
    }
    DB.relations.widthGroups.forEach(function (g, idx) {
      var bars = g.members.map(function (m) { return { name: m, w: g.width_mm }; });
      root.appendChild(buildWidthBars(
        { title: '宽度同为 ' + g.width_mm + 'mm', bars: bars, note: g.note },
        maxW, BAR_COLORS[idx % BAR_COLORS.length]
      ));
    });

    /* 任一边相等：某尺寸的宽 = 另一尺寸的高（宽高交叉，混排组才展示） */
    var sides = [];
    DB.sizes.forEach(function (s) {
      sides.push({ n: s.name, k: '宽', v: s.w });
      sides.push({ n: s.name, k: '高', v: s.h });
    });
    sides.sort(function (a, b) { return a.v - b.v; });
    var xGroups = [];
    var curG = null;
    sides.forEach(function (sd) {
      if (curG && curG.v === sd.v) curG.items.push(sd);
      else { curG = { v: sd.v, items: [sd] }; xGroups.push(curG); }
    });
    var xMixed = xGroups.filter(function (g) {
      return g.v >= 40 &&
        g.items.some(function (x) { return x.k === '宽'; }) &&
        g.items.some(function (x) { return x.k === '高'; });
    });
    if (xMixed.length) {
      var xg = el('div', 'card');
      xg.appendChild(el('div', 'sec-title', '')).appendChild(el('span', 'sec-emoji', '↔'));
      xg.lastChild.appendChild(document.createTextNode('任一边相等（一边的宽 = 另一边的高）'));
      xMixed.forEach(function (g) {
        var line = el('div', 'pair-row');
        line.appendChild(el('b', null, g.v + 'mm：'));
        line.appendChild(document.createTextNode(
          g.items.map(function (x) { return x.n + '（' + x.k + '）'; }).join(' · ')));
        xg.appendChild(line);
      });
      root.appendChild(xg);
    }

    root.appendChild(el('div', 'sec-title', '')).appendChild(el('span', 'sec-emoji', '🔄'));
    root.lastChild.appendChild(document.createTextNode('同孔位可直接互换'));
    DB.relations.ringGroups.forEach(function (g) {
      var row = el('div', 'pair-row');
      row.appendChild(el('b', null, g.name));
      row.appendChild(document.createTextNode('：' + g.members.join('、')));
      root.appendChild(row);
    });

    var red = el('div', 'card card-red');
    red.appendChild(el('div', 'sec-title', '')).appendChild(el('span', 'sec-emoji', '🚫'));
    red.lastChild.appendChild(document.createTextNode('不能混用'));
    DB.relations.incompatible.forEach(function (t) {
      red.appendChild(el('div', 'red-item', '✕ ' + t));
    });
    root.appendChild(red);

    root.appendChild(el('div', 'sec-title', '')).appendChild(el('span', 'sec-emoji', '🧺'));
    root.lastChild.appendChild(document.createTextNode('收纳兼容（小纸放大本）'));
    DB.relations.nesting.forEach(function (r) {
      var box = el('div', 'pair-box');
      box.appendChild(el('b', null, r.container));
      box.appendChild(document.createTextNode(' 可收纳：'));
      box.appendChild(el('span', 'pair-hold', r.holds.join('、')));
      root.appendChild(box);
    });
    root.appendChild(el('div', 'link-star', '★ ' + DB.relations.bestLinkage));

    root.appendChild(el('div', 'sec-title', '')).appendChild(el('span', 'sec-emoji', '🎀'));
    root.lastChild.appendChild(document.createTextNode('定活两用组合'));
    DB.relations.dualUse.combos.forEach(function (c) {
      var box = el('div', 'pair-box');
      box.appendChild(el('b', null, c.fixed));
      box.appendChild(document.createTextNode(' + ' + c.loose.join(' / ')));
      if (c.tip) box.appendChild(el('div', 'dual-tip', '💡 ' + c.tip));
      root.appendChild(box);
    });
  }

  /* ---------- 视图 4：新手指南 ---------- */
  function renderGuide(root) {
    var g = DB.guidance;
    var rec = el('div', 'card');
    rec.appendChild(el('div', 'sec-title', '')).appendChild(el('span', 'sec-emoji', '🌟'));
    rec.lastChild.appendChild(document.createTextNode('新手入坑首选'));
    g.beginner.recommended.forEach(function (name) {
      var row = el('div', 'guide-rec');
      row.appendChild(el('span', 'guide-rec-icon', name.indexOf('Personal') >= 0 ? '💗' : '💛'));
      var body = el('div');
      body.appendChild(el('div', 'guide-rec-name', name));
      body.appendChild(el('div', 'guide-rec-reason', g.beginner.reason));
      row.appendChild(body);
      rec.appendChild(row);
    });
    rec.appendChild(el('div', 'guide-motto', '「' + g.beginner.motto + '」'));
    root.appendChild(rec);

    var niche = el('div', 'card');
    niche.appendChild(el('div', 'sec-title', '')).appendChild(el('span', 'sec-emoji', '⚠️'));
    niche.lastChild.appendChild(document.createTextNode('小众尺寸 · 配件少慎重'));
    var chips = el('div', 'chips');
    g.niche.sizes.forEach(function (n) { chips.appendChild(el('span', 'chip', n)); });
    niche.appendChild(chips);
    niche.appendChild(el('div', 'sec-note', g.niche.reason + ' ' + g.niche.origin));
    root.appendChild(niche);

    var notes = el('div', 'card');
    notes.appendChild(el('div', 'sec-title', '')).appendChild(el('span', 'sec-emoji', '🛍️'));
    notes.lastChild.appendChild(document.createTextNode('购买须知'));
    var ul = el('ul', 'note-list');
    g.notes.forEach(function (n) { ul.appendChild(el('li', null, n)); });
    notes.appendChild(ul);
    root.appendChild(notes);

    var err = el('div', 'card');
    err.appendChild(el('div', 'sec-title', '')).appendChild(el('span', 'sec-emoji', '📝'));
    err.lastChild.appendChild(document.createTextNode('数据勘误与口径'));
    DB.errata.forEach(function (e) {
      var item = el('div', 'errata-item');
      item.appendChild(el('div', 'errata-q', e.item));
      item.appendChild(el('div', 'errata-i', '疑点：' + e.issue));
      item.appendChild(el('div', 'errata-r', '✓ ' + e.resolution));
      err.appendChild(item);
    });
    root.appendChild(err);
  }

  /* ---------- 视图注册表（追加配置即可扩展；dynamic 视图每次激活重新渲染） ---------- */
  var VIEWS = [
    { id: 'browse', icon: '📏', label: '尺寸速查', render: renderBrowse },
    { id: 'systems', icon: '📌', label: '孔位体系', render: renderSystems },
    { id: 'relations', icon: '🔗', label: '联动关系', render: renderRelations },
    { id: 'compare', icon: '⚖️', label: '尺寸对比', render: renderCompare, dynamic: true },
    { id: 'ruler', icon: '📐', label: '孔标尺', render: renderRuler, dynamic: true },
    { id: 'print', icon: '🖨️', label: '拼版打印', render: renderPrint, dynamic: true },
    { id: 'guide', icon: '🎀', label: '新手指南', render: renderGuide }
  ];

  /* ---------- 初始化 ---------- */
  var activateFn = null;
  function goTab(id) {
    if (!activateFn) return;
    for (var i = 0; i < VIEWS.length; i++) {
      if (VIEWS[i].id === id) { activateFn(i); return; }
    }
  }
  function init() {
    if (supportsFlexGap()) document.documentElement.classList.add('supports-flex-gap');

    var tabsRoot = $('#tabs');
    var viewsRoot = $('#views');
    var initial = 0;

    VIEWS.forEach(function (v, i) {
      var b = el('button', 'tab press');
      b.type = 'button';
      b.textContent = v.icon + ' ' + v.label;
      b.addEventListener('click', function () { activate(i); });
      tabsRoot.appendChild(b);
      v.tabEl = b;

      var sec = el('section', 'view');
      sec.id = 'view-' + v.id;
      viewsRoot.appendChild(sec);
      v.el = sec;
      v.done = false;
      if (v.id === state.tab) initial = i;
    });

    function activate(i) {
      var v = VIEWS[i];
      if (!v) return;
      for (var j = 0; j < VIEWS.length; j++) {
        VIEWS[j].tabEl.classList.toggle('active', j === i);
        VIEWS[j].el.classList.toggle('active', j === i);
      }
      if (!v.done || v.dynamic) {
        if (v.dynamic) v.el.innerHTML = ''; /* 动态视图每次重渲染，避免内容叠加 */
        v.render(v.el);
        v.done = true;
        if (v.id === 'browse' && browseApplyFilter) browseApplyFilter();
      }
      state.tab = v.id;
      storeSet('tab', v.id);
      window.scrollTo(0, 0);
    }

    activateFn = activate;
    activate(initial);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* 对外暴露 */
  window.App = {
    version: '1.2.0-web',
    flavor: 'web',
    DB: DB,
    renderPaperSVG: renderPaperSVG,
    renderDotsSVG: renderDotsSVG,
    packItems: packItems,
    placementStatuses: placementStatuses,
    goTab: goTab
  };
})();
