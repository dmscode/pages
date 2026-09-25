/* =========================================================
 * 模块I：视图渲染 —— 主界面 / 展示架 / 结果卡 / 降级横幅
 * 依赖：config/tokens/collection/storage/state（运行时）
 * 只做渲染与 DOM 构建（createElement + textContent），不含游戏规则。
 * ========================================================= */
(function () {
  'use strict';
  var BlindBox = window.BlindBox = window.BlindBox || {};

  var gridBuilt = false;
  var degradedEl = null;

  function q(id) { return document.getElementById(id); }

  function setText(id, text) {
    var el = q(id);
    if (el && el.textContent !== text) el.textContent = text;
  }

  /* 奖品形象渲染：./ 开头 = 包内图片；否则按 emoji 文本兜底 */
  function renderVisual(el, prize) {
    if (!el) return;
    el.textContent = '';
    var v = String(prize.visual || '');
    if (v.indexOf('./') === 0) {
      var img = document.createElement('img');
      img.className = 'prize-img';
      img.src = v;
      img.alt = prize.name;
      el.appendChild(img);
    } else {
      el.textContent = v;
    }
  }

  function formatCountdown(ms) {
    if (!(ms > 0)) ms = 0;
    var total = Math.ceil(ms / 1000);
    var m = Math.floor(total / 60);
    var s = total % 60;
    return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
  }

  /* ---------- 视图切换 ---------- */

  function showView(view) {
    q('view-home').className = view === 'home' ? 'view' : 'view view-hidden';
    q('view-shelf').className = view === 'shelf' ? 'view' : 'view view-hidden';
  }

  /* ---------- 主界面 ---------- */

  function buildBoxGrid() {
    if (gridBuilt) return;
    gridBuilt = true;
    var grid = q('box-grid');
    for (var i = 0; i < BlindBox.RULES.BOX_COUNT; i++) {
      var cell = document.createElement('button');
      cell.type = 'button';
      cell.className = 'box-cell';
      if (BlindBox.COVERS && BlindBox.COVERS.length) {
        var cover = document.createElement('img');
        cover.className = 'box-cover';
        cover.alt = '';
        cell.appendChild(cover);
      } else {
        var emoji = document.createElement('span');
        emoji.className = 'box-emoji';
        emoji.textContent = '🎁';
        cell.appendChild(emoji);
      }
      grid.appendChild(cell);
    }
  }

  function applyBoxCovers() {
    var covers = BlindBox.COVERS;
    if (!covers || !covers.length) return;
    var src = covers[BlindBox.state.app.coverIndex % covers.length];
    var cells = q('box-grid').children;
    for (var i = 0; i < cells.length; i++) {
      var img = cells[i].querySelector('.box-cover');
      if (img && img.getAttribute('src') !== src) img.setAttribute('src', src);
    }
  }

  function renderHome() {
    var save = BlindBox.state.app.save;
    if (!save) return;
    buildBoxGrid();

    setText('coin-balance', String(save.tokens.balance));

    var now = Date.now();
    var info = BlindBox.tokens.pendingInfo(save, now);
    setText('claim-pending', String(info.claimable));

    var nextEl = q('claim-next');
    if (info.clockBack) nextEl.textContent = '设备时间异常';
    else if (info.saturated) nextEl.textContent = '待领取已攒满，快去领取';
    else if (info.claimable > 0) nextEl.textContent = '已攒 ' + info.claimable + ' 枚，可领取';
    else nextEl.textContent = '下一枚 ' + formatCountdown(info.nextCoinAt - now);

    q('btn-claim').className = info.claimable > 0 ? 'btn-claim' : 'btn-claim btn-dim';

    var canOpen = BlindBox.tokens.canOpen(save);
    setText('box-status', canOpen
      ? '可以撕开盲盒了（代币 ' + save.tokens.balance + '）'
      : '还差 ' + BlindBox.tokens.remainingForOpen(save) + ' 枚（' + save.tokens.balance + ' / ' + BlindBox.RULES.BOX_PRICE + '）');

    var cells = q('box-grid').children;
    for (var i = 0; i < cells.length; i++) {
      cells[i].className = canOpen ? 'box-cell' : 'box-cell box-dim';
    }
    applyBoxCovers();

    setText('shelf-count', String(BlindBox.collection.totalOwned(save)));
    renderDegraded();
  }

  function pulseBoxStatus() {
    var el = q('box-status');
    if (!el) return;
    el.classList.remove('pulse');
    void el.offsetWidth;
    el.classList.add('pulse');
  }

  /* ---------- 展示架 ---------- */

  function renderShelfTabs() {
    var bar = q('shelf-tabs');
    bar.textContent = '';
    var current = BlindBox.state.app.currentTab;
    var tabs = [{ id: 'ALL', name: '全部' }].concat(BlindBox.SERIES);
    for (var i = 0; i < tabs.length; i++) {
      var t = document.createElement('button');
      t.type = 'button';
      t.className = 'shelf-tab' + (tabs[i].id === current ? ' shelf-tab-active' : '');
      t.setAttribute('data-tab', tabs[i].id);
      t.textContent = tabs[i].name;
      bar.appendChild(t);
    }
  }

  function buildCard(item) {
    var card = document.createElement('div');
    card.className = 'shelf-card';

    var visual = document.createElement('div');
    visual.className = 'card-visual';
    renderVisual(visual, item.prize);
    card.appendChild(visual);

    var name = document.createElement('div');
    name.className = 'card-name';
    name.textContent = item.prize.name;
    card.appendChild(name);

    var tags = document.createElement('div');
    tags.className = 'card-tags';
    var r = BlindBox.RARITY[item.prize.rarity];
    var chip = document.createElement('div');
    chip.className = 'rarity-chip ' + r.cls;
    chip.textContent = r.name;
    tags.appendChild(chip);
    var count = document.createElement('div');
    count.className = 'count-chip';
    count.textContent = '× ' + item.count;
    tags.appendChild(count);
    card.appendChild(tags);

    return card;
  }

  function buildEmptyState(seriesId) {
    var wrap = document.createElement('div');
    wrap.className = 'shelf-empty';
    var emoji = document.createElement('div');
    emoji.className = 'shelf-empty-emoji';
    emoji.textContent = seriesId === 'ALL' ? '📦' : '🗂️';
    var text = document.createElement('div');
    text.className = 'shelf-empty-text';
    text.textContent = seriesId === 'ALL'
      ? '还没有收藏品，去撕一个盲盒吧！'
      : '这个系列还没有收藏品。';
    wrap.appendChild(emoji);
    wrap.appendChild(text);
    return wrap;
  }

  function renderShelf() {
    if (!BlindBox.state.app.save) return;
    renderShelfTabs();

    var grid = q('shelf-grid');
    grid.textContent = '';
    var tab = BlindBox.state.app.currentTab;
    var items = tab === 'ALL'
      ? BlindBox.collection.orderedList(BlindBox.state.app.save)
      : BlindBox.collection.listBySeries(BlindBox.state.app.save, tab);

    if (!items.length) {
      grid.appendChild(buildEmptyState(tab));
      return;
    }
    for (var i = 0; i < items.length; i++) {
      grid.appendChild(buildCard(items[i]));
    }
  }

  /* ---------- 结果卡 ---------- */

  function showResult(prize) {
    renderVisual(q('result-visual'), prize);
    setText('result-name', prize.name);
    var r = BlindBox.RARITY[prize.rarity];
    var badge = q('result-rarity');
    badge.textContent = r.name;
    badge.className = 'rarity-chip ' + r.cls;
    setText('result-count', '已拥有 × ' + BlindBox.collection.countOf(BlindBox.state.app.save, prize.id));
    q('result-modal').className = 'overlay result-modal';
    BlindBox.state.goto('RESULT');
  }

  function hideResult() {
    q('result-modal').className = 'overlay result-modal overlay-hidden';
  }

  /* ---------- 兑换码弹窗 ---------- */

  function showRedeem() {
    var input = q('redeem-input');
    if (input) input.value = '';
    q('redeem-modal').className = 'overlay result-modal';
    if (input) input.focus();
  }

  function hideRedeem() {
    q('redeem-modal').className = 'overlay result-modal overlay-hidden';
  }

  /* ---------- 存储降级横幅（T501：常驻轻提示） ---------- */

  function renderDegraded() {
    var degraded = BlindBox.storage.env.degraded;
    if (degraded && !degradedEl) {
      degradedEl = document.createElement('div');
      degradedEl.className = 'degraded-banner';
      degradedEl.textContent = '⚠️ 进度可能无法保存';
      document.body.appendChild(degradedEl);
    } else if (!degraded && degradedEl) {
      if (degradedEl.parentNode) degradedEl.parentNode.removeChild(degradedEl);
      degradedEl = null;
    }
  }

  BlindBox.views = {
    showView: showView,
    renderHome: renderHome,
    renderShelf: renderShelf,
    showResult: showResult,
    hideResult: hideResult,
    showRedeem: showRedeem,
    hideRedeem: hideRedeem,
    pulseBoxStatus: pulseBoxStatus,
    renderVisual: renderVisual
  };
})();
