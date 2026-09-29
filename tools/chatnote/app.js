'use strict';

/* ================= 基础工具 ================= */
const $ = (s, p = document) => p.querySelector(s);
const el = (tag, cls) => { const n = document.createElement(tag); if (cls) n.className = cls; return n; };
const pad = n => String(n).padStart(2, '0');
const uid = () => (crypto.randomUUID
  ? crypto.randomUUID()
  : Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10));
const clamp = (v, a, b) => Math.min(Math.max(v, a), b);

function sameDay(a, b) {
  const x = new Date(a), y = new Date(b);
  return x.getFullYear() === y.getFullYear() && x.getMonth() === y.getMonth() && x.getDate() === y.getDate();
}
function fmtHM(ts) { const d = new Date(ts); return pad(d.getHours()) + ':' + pad(d.getMinutes()); }
function fmtFull(ts) {
  const d = new Date(ts);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}
function dayKey(ts) {
  const d = new Date(ts);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function fmtDayLabel(ts) {
  const now = new Date();
  const yest = new Date(now); yest.setDate(yest.getDate() - 1);
  if (sameDay(ts, now)) return '今天';
  if (sameDay(ts, yest)) return '昨天';
  const d = new Date(ts);
  if (d.getFullYear() === now.getFullYear()) return `${d.getMonth() + 1}月${d.getDate()}日`;
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}
function fmtListTime(ts) {
  const now = new Date();
  const yest = new Date(now); yest.setDate(yest.getDate() - 1);
  if (sameDay(ts, now)) return fmtHM(ts);
  if (sameDay(ts, yest)) return '昨天';
  const d = new Date(ts);
  if (d.getFullYear() === now.getFullYear()) return `${d.getMonth() + 1}月${d.getDate()}日`;
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}
function exportStamp() {
  const d = new Date();
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}`;
}

/* ================= 主题与气泡色 ================= */
const darkMQ = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
const isDark = () => !!(darkMQ && darkMQ.matches);

/* 马卡龙预设：基于常见 IM 气泡色校准，bg/fg 成对保证对比度 */
const BUBBLE_PRESETS = [
  { name: '微信绿', bg: '#95EC69', fg: '#123010' },
  { name: '薄荷',   bg: '#B5EAD7', fg: '#1E4B3A' },
  { name: '樱花',   bg: '#FFB7C5', fg: '#5A1A2E' },
  { name: '蜜桃',   bg: '#FFD3B6', fg: '#5C3A21' },
  { name: '柠檬',   bg: '#FFF3A3', fg: '#5A5312' },
  { name: '天空',   bg: '#A0C4FF', fg: '#12305A' },
  { name: '香芋',   bg: '#D0BFF6', fg: '#3A2560' },
  { name: '奶咖',   bg: '#E3CBA8', fg: '#4A3620' },
];
const BUBBLE_DARK_DEFAULT = { bg: '#2D6A45', fg: '#EEFBF0' };
const bubbleOf = t => (t && t.bubble) ? t.bubble : (isDark() ? BUBBLE_DARK_DEFAULT : BUBBLE_PRESETS[0]);

function applyBubbleVars(t) {
  const sc = $('#screen-chat');
  if (t && t.bubble) {
    sc.style.setProperty('--bubble', t.bubble.bg);
    sc.style.setProperty('--bubble-text', t.bubble.fg);
  } else {
    sc.style.removeProperty('--bubble');
    sc.style.removeProperty('--bubble-text');
  }
}

/* ================= 数据与存储 ================= */
const DATA_KEY = 'chatnote:data.v1';
const DRAFT_KEY = 'chatnote:drafts.v1';
const SETTINGS_KEY = 'chatnote:settings.v1';
let store = { version: 1, topics: [] };
let drafts = {};
let settings = { openOn: 'list', timelineSide: 'right', lastTopicId: null };

function loadData() {
  try {
    const raw = localStorage.getItem(DATA_KEY);
    if (raw) { const d = JSON.parse(raw); if (d && Array.isArray(d.topics)) store = d; }
  } catch (e) { console.warn('load data failed', e); }
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (raw) { const d = JSON.parse(raw); if (d && typeof d === 'object') drafts = d; }
  } catch (e) { console.warn('load drafts failed', e); }
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) { const d = JSON.parse(raw); if (d && typeof d === 'object') settings = { ...settings, ...d }; }
  } catch (e) { console.warn('load settings failed', e); }
}

let saveTimer = 0, dirty = false, lastErrToast = 0;
function scheduleSave() {
  dirty = true;
  clearTimeout(saveTimer);
  saveTimer = setTimeout(flushSave, 300);
}
function flushSave() {
  clearTimeout(saveTimer); saveTimer = 0;
  if (!dirty) return; dirty = false;
  try {
    localStorage.setItem(DATA_KEY, JSON.stringify(store));
    localStorage.setItem(DRAFT_KEY, JSON.stringify(drafts));
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    const now = Date.now();
    if (now - lastErrToast > 3000) { lastErrToast = now; toast('保存失败：浏览器存储不可用或已满'); }
  }
}
window.addEventListener('pagehide', flushSave);
window.addEventListener('beforeunload', flushSave);
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flushSave(); });

function bumpActivity(t) { t.updatedAt = Date.now(); }
const getTopic = id => store.topics.find(t => t.id === id);
const topicDisplayName = t => t.name || '新话题';
function deriveTitle(text) {
  return text.split('\n')[0].trim().replace(/\s+/g, ' ').slice(0, 12);
}

/* 默认会话：显式 isDefault；否则回退第一个（最早创建） */
function getDefaultTopic() {
  return store.topics.find(t => t.isDefault) || store.topics[0] || null;
}
function createTopic() {
  const t = { id: uid(), name: '', createdAt: Date.now(), updatedAt: Date.now(), messages: [], nameSet: false, bubble: null };
  store.topics.push(t);
  scheduleSave();
  return t;
}
function toggleDefault(t) {
  if (t.isDefault) {
    delete t.isDefault;
    scheduleSave();
    toast('已取消默认（回退为第一个会话）');
  } else {
    store.topics.forEach(x => { delete x.isDefault; });
    t.isDefault = true;
    scheduleSave();
    toast('已设为默认会话');
  }
  renderList();
}

/* ================= Toast ================= */
let toastTimer = 0;
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg; t.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.hidden = true; }, 1800);
}

/* ================= 弹层 / 弹窗 ================= */
const OVERLAYS = ['#sheet-overlay', '#export-overlay', '#timeline-overlay', '#modal-overlay'];
function closeOverlays() {
  OVERLAYS.forEach(s => { $(s).hidden = true; });
  closeTimeline();
}
function showOverlay(node) { closeOverlays(); node.hidden = false; }
const anyOverlayOpen = () => OVERLAYS.some(s => !$(s).hidden);

/* 自定义底部弹层骨架：build(g1) 填充内容组，自动带「取消」 */
function openCustomSheet(build) {
  const sheet = $('#sheet'); sheet.textContent = '';
  const g1 = el('div', 'sheet-group');
  build(g1);
  const g2 = el('div', 'sheet-group');
  const gap = el('div', 'sheet-gap');
  const cancel = el('button', 'sheet-item cancel');
  cancel.textContent = '取消';
  cancel.addEventListener('click', closeOverlays);
  g2.append(cancel);
  sheet.append(g1, gap, g2);
  showOverlay($('#sheet-overlay'));
}

function openSheet(items) {
  openCustomSheet(g1 => {
    for (const it of items) {
      if (it.custom) { g1.append(it.custom); continue; }
      const b = el('button', 'sheet-item' + (it.danger ? ' danger' : ''));
      b.textContent = it.label;
      b.addEventListener('click', () => { closeOverlays(); it.fn(); });
      g1.append(b);
    }
  });
}

function radioRow(name, val, label, checked, onChange) {
  const lb = el('label', 'exp-opt');
  const r = el('input'); r.type = 'radio'; r.name = name; r.value = val;
  r.checked = !!checked;
  r.addEventListener('change', () => onChange(val));
  const sp = el('span'); sp.textContent = label;
  lb.append(r, sp);
  return lb;
}

function promptModal(cfg, onOk) {
  const ok = $('#modal-ok');
  $('#modal-title').textContent = cfg.title;
  ok.textContent = cfg.ok || '确定';
  ok.classList.toggle('danger', !!cfg.danger);
  const body = $('#modal-body'); body.textContent = '';
  const field = cfg.textarea ? el('textarea', 'modal-field') : el('input', 'modal-field');
  if (cfg.textarea) field.rows = 5;
  if (cfg.maxlength) field.maxLength = cfg.maxlength;
  field.value = cfg.value || '';
  field.placeholder = cfg.placeholder || '';
  body.append(field);
  ok.onclick = () => { if (onOk(field.value) === false) return; closeOverlays(); };
  showOverlay($('#modal-overlay'));
  if (!cfg.textarea) {
    field.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); ok.click(); } });
  }
  setTimeout(() => { field.focus(); field.setSelectionRange(field.value.length, field.value.length); }, 60);
}

function confirmModal(text, onOk) {
  const ok = $('#modal-ok');
  $('#modal-title').textContent = '确认操作';
  ok.textContent = '删除';
  ok.classList.add('danger');
  const body = $('#modal-body'); body.textContent = '';
  const p = el('p', 'modal-text'); p.textContent = text;
  body.append(p);
  ok.onclick = () => { closeOverlays(); onOk(); };
  showOverlay($('#modal-overlay'));
}

/* ================= 剪贴板 ================= */
async function copyText(text, done) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      done && done(); return;
    }
  } catch (e) { /* 降级 */ }
  try {
    const ta = el('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;left:-9999px;top:0';
    document.body.append(ta);
    ta.focus(); ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    if (ok) done && done(); else toast('复制失败，请手动复制');
  } catch (e) { toast('复制失败，请手动复制'); }
}

/* ================= 路由与状态 ================= */
const PAGE = 100;
let currentTopic = null;
let renderedCount = 0;
let selecting = false;
let selectedIds = new Set();
let focusOnEnter = false;
let expanded = false;
let editing = false, editingMsg = null;
let pendingJump = null;          // {topicId, msgId} 列表时间线/合并视图跳转用
let allTotal = 0, allRendered = 0;

/* 输入框展开/收起（全屏多行编辑）：超限自动展开，「收起」手动返回 */
let collapseHold = false; // 手动收起后暂不自动展开，直到内容重新放得下
function setExpanded(on) {
  expanded = on;
  $('#screen-chat').classList.toggle('expanded', on);
  $('#btn-collapse').hidden = !on;
  if (on) {
    input.style.height = '';
  } else {
    autoGrow();
  }
}
/* 输入导致内容超出小输入框可视范围时自动进入全屏编辑 */
function maybeAutoExpand() {
  if (expanded) return;
  if (input.scrollHeight > 122) {
    if (collapseHold) return;
    setExpanded(true);
  } else {
    collapseHold = false;
  }
}

/* 编辑态：复用输入框（绿框 + 「编辑中……」tab） */
function startEdit(m) {
  if (!currentTopic) return;
  editing = true; editingMsg = m;
  $('#screen-chat').classList.add('editing');
  $('#edit-tab').hidden = false;
  $('#btn-send').textContent = '保存';
  input.value = m.text;
  autoGrow(); updateSendState();
  setTimeout(() => { input.focus(); input.setSelectionRange(input.value.length, input.value.length); }, 60);
}
function exitEditMode() {
  editing = false; editingMsg = null;
  $('#screen-chat').classList.remove('editing');
  $('#edit-tab').hidden = true;
  $('#btn-send').textContent = '发送';
}
/* 退出编辑后把输入框还原为该话题草稿（保存/取消共用），并回到普通对话状态 */
function restoreComposerFromDraft() {
  if (expanded) setExpanded(false);
  const t = currentTopic;
  input.value = (t && drafts[t.id]) || '';
  autoGrow(); updateSendState();
}
function cancelEdit() {
  if (!editing) return;
  exitEditMode();
  restoreComposerFromDraft();
}
function saveEdit() {
  const m = editingMsg, t = currentTopic;
  if (!m || !t) { exitEditMode(); restoreComposerFromDraft(); return; }
  const text = input.value.trim();
  if (!text) { toast('内容不能为空'); return; }
  m.text = text.replace(/\n+$/, '');
  m.edited = true; m.updatedAt = Date.now();
  bumpActivity(t);
  scheduleSave();
  exitEditMode();
  restoreComposerFromDraft();
  rerenderPreserve();
  renderList();
}

function route() {
  closeOverlays();
  setExpanded(false);
  if (editing) cancelEdit();
  const m = location.hash.match(/^#\/c\/(.+)$/);
  const isAll = location.hash === '#/all';
  const t = m ? getTopic(m[1]) : null;
  const entering = t && (!currentTopic || currentTopic.id !== t.id);
  $('#screen-all').classList.toggle('hide', !isAll);
  if (t) {
    currentTopic = t;
    $('#screen-list').classList.add('hide');
    $('#screen-chat').classList.remove('hide');
    if (entering) {
      setSelecting(false);
      renderedCount = Math.min(PAGE, t.messages.length);
      input.value = drafts[t.id] || '';
      autoGrow(); updateSendState();
      settings.lastTopicId = t.id;
      scheduleSave();
      applyBubbleVars(t);
    }
    $('#chat-title').textContent = topicDisplayName(t);
    renderMessages();
    if (entering) {
      if (pendingJump && pendingJump.topicId === t.id) {
        jumpToMessage(pendingJump.msgId);
        pendingJump = null;
      } else {
        scrollBottom();
      }
      if (focusOnEnter) { focusOnEnter = false; input.focus(); }
    }
  } else if (isAll) {
    currentTopic = null;
    setSelecting(false);
    $('#screen-chat').classList.add('hide');
    $('#screen-list').classList.add('hide');
    renderAllView();
  } else {
    currentTopic = null;
    setSelecting(false);
    $('#screen-chat').classList.add('hide');
    $('#screen-list').classList.remove('hide');
    renderList();
  }
}

/* 定位到指定消息：必要时扩展分页，滚动 + 高亮 */
function jumpToMessage(msgId) {
  const t = currentTopic; if (!t) return;
  const idx = t.messages.findIndex(x => x.id === msgId);
  if (idx < 0) return;
  const need = t.messages.length - idx;
  if (need > renderedCount) {
    renderedCount = Math.min(need, t.messages.length);
    renderMessages();
  }
  const row = $('#msg-list').querySelector(`[data-id="${msgId}"]`);
  if (row) {
    row.scrollIntoView({ block: 'center' });
    row.classList.remove('flash');
    void row.offsetWidth;
    row.classList.add('flash');
    setTimeout(() => row.classList.remove('flash'), 1800);
  }
}

/* ================= 话题列表 ================= */
const topicActivity = t => t.updatedAt || t.createdAt;

function renderList() {
  const wrap = $('#topic-list'); wrap.textContent = '';
  const def = getDefaultTopic();
  const topics = [...store.topics].sort((a, b) => topicActivity(b) - topicActivity(a));
  for (const t of topics) {
    const item = el('div', 'topic-item');
    item.dataset.id = t.id;
    const main = el('div', 'ti-main');
    const name = el('div', 'ti-name'); name.textContent = topicDisplayName(t);
    if (t === def) { const tag = el('b', 'def-tag'); tag.textContent = '默认'; name.append(tag); }
    const row2 = el('div', 'ti-preview');
    const draft = drafts[t.id];
    if (draft) {
      const tag = el('b', 'draft-tag'); tag.textContent = '草稿：';
      row2.append(tag, document.createTextNode(draft));
    } else {
      const last = t.messages[t.messages.length - 1];
      row2.textContent = last ? last.text : '暂无笔记';
    }
    main.append(name, row2);
    const side = el('div', 'ti-side');
    const time = el('div', 'ti-time'); time.textContent = fmtListTime(topicActivity(t));
    const more = el('button', 'ti-more'); more.textContent = '⋯';
    more.setAttribute('aria-label', '话题菜单');
    more.addEventListener('click', e => { e.stopPropagation(); openTopicMenu(t); });
    side.append(time, more);
    item.append(main, side);
    item.addEventListener('click', () => { location.hash = '#/c/' + t.id; });
    attachLongPress(item, () => openTopicMenu(t));
    wrap.append(item);
  }
  $('#list-empty').hidden = topics.length > 0;
}

function renameTopic(t) {
  promptModal({
    title: '重命名话题',
    value: t.name,
    placeholder: '留空则使用默认名',
    maxlength: 20,
    ok: '保存',
  }, v => {
    v = v.trim();
    t.name = v;
    t.nameSet = true;
    scheduleSave();
    if (currentTopic && currentTopic.id === t.id) $('#chat-title').textContent = topicDisplayName(t);
    renderList();
  });
}

function confirmDeleteTopic(t) {
  confirmModal(`删除话题「${topicDisplayName(t)}」及其 ${t.messages.length} 条笔记？此操作不可恢复。`, () => {
    store.topics = store.topics.filter(x => x.id !== t.id);
    delete drafts[t.id];
    scheduleSave(); renderList();
    if (currentTopic && currentTopic.id === t.id) location.hash = '#/';
  });
}

function openTopicMenu(t) {
  openSheet([
    { label: '重命名', fn: () => renameTopic(t) },
    { label: '导出', fn: () => openExport(t, 'all') },
    { custom: buildSwatchRow(t) },
    { label: '恢复默认配色', fn: () => { delete t.bubble; scheduleSave(); if (currentTopic && currentTopic.id === t.id) applyBubbleVars(t); } },
    { label: t.isDefault ? '取消默认会话' : '设为默认会话', fn: () => toggleDefault(t) },
    { label: '删除话题', danger: true, fn: () => confirmDeleteTopic(t) },
  ]);
}

/* ================= 色板 ================= */
function buildSwatchRow(t) {
  const row = el('div', 'swatch-row');
  for (const p of BUBBLE_PRESETS) {
    const cell = el('button', 'swatch-cell');
    const c = el('span', 'swatch'); c.style.background = p.bg;
    if (t.bubble && t.bubble.bg === p.bg) c.classList.add('on');
    const nm = el('span', 'swatch-name'); nm.textContent = p.name;
    cell.append(c, nm);
    cell.addEventListener('click', () => {
      t.bubble = { bg: p.bg, fg: p.fg };
      scheduleSave();
      if (currentTopic && currentTopic.id === t.id) applyBubbleVars(t);
      row.querySelectorAll('.swatch.on').forEach(x => x.classList.remove('on'));
      c.classList.add('on');
    });
    row.append(cell);
  }
  return row;
}

/* ================= 对话页渲染 ================= */
function renderMessages() {
  const t = currentTopic; if (!t) return;
  const list = $('#msg-list'); list.textContent = '';
  const msgs = t.messages;
  const start = Math.max(0, msgs.length - renderedCount);
  let prevDay = null;
  for (let i = start; i < msgs.length; i++) {
    const m = msgs[i];
    const dk = dayKey(m.createdAt);
    if (dk !== prevDay) { list.append(dateSep(m.createdAt)); prevDay = dk; }
    list.append(msgRow(m));
  }
  $('#chat-empty').hidden = msgs.length > 0;
}

function dateSep(ts) {
  const div = el('div', 'date-sep');
  const span = el('span'); span.textContent = fmtDayLabel(ts);
  div.append(span);
  return div;
}

function msgRow(m) {
  const row = el('div', 'msg-row' + (selectedIds.has(m.id) ? ' checked' : ''));
  row.dataset.id = m.id;
  const check = el('div', 'check'); check.textContent = '✓';
  const col = el('div', 'msg-col');
  const bubble = el('div', 'bubble'); bubble.textContent = m.text;
  const meta = el('div', 'msg-meta');
  meta.textContent = fmtHM(m.createdAt) + (m.edited ? ' · 已编辑' : '');
  const more = el('button', 'msg-more'); more.textContent = '⋯';
  more.addEventListener('click', e => { e.stopPropagation(); openMsgMenu(m); });
  col.append(bubble, meta, more);
  row.append(check, col);
  row.addEventListener('click', () => {
    if (!selecting) return;
    if (fillMode) { fillRangeTo(m); exitFillMode(); return; }
    toggleSelect(m.id);
  });
  attachLongPress(row, () => longPressMsg(m));
  attachMouseLongPress(row, m);
  attachRangeSelect(row, m);
  return row;
}

function rerenderPreserve() {
  const area = $('#msg-area');
  const atBottom = area.scrollHeight - area.scrollTop - area.clientHeight < 60;
  const top = area.scrollTop;
  if (currentTopic) renderedCount = Math.min(renderedCount, currentTopic.messages.length);
  renderMessages();
  if (atBottom) scrollBottom(); else area.scrollTop = top;
}

function scrollBottom() {
  requestAnimationFrame(() => {
    const a = $('#msg-area');
    a.scrollTop = a.scrollHeight;
  });
}

/* 上滑到顶加载更早消息，锚定滚动位置（对话页/合并视图共用） */
function attachPaging(areaSel, canLoad, load) {
  $(areaSel).addEventListener('scroll', () => {
    if (!canLoad()) return;
    const area = $(areaSel);
    if (area.scrollTop >= 60) return;
    const prevH = area.scrollHeight, prevTop = area.scrollTop;
    load();
    area.scrollTop = area.scrollHeight - prevH + prevTop;
  });
}
attachPaging('#msg-area',
  () => !!currentTopic && renderedCount < currentTopic.messages.length,
  () => { renderedCount = Math.min(renderedCount + PAGE, currentTopic.messages.length); renderMessages(); });

/* ================= 消息操作 ================= */
/* 长按消息：进入多选并选中该条；手指不松继续拖 = 直接扩展范围选择 */
function longPressMsg(m, x, y) {
  if (!selecting && currentTopic) {
    setSelecting(true);
    toggleSelect(m.id);
    if (x != null) {
      const row = $('#msg-list').querySelector(`[data-id="${m.id}"]`);
      if (row) pendingRange = { m, row, x, y, paint: 'on' };
    }
  }
}

function openMsgMenu(m) {
  if (!currentTopic) return;
  openSheet([
    { label: '复制', fn: () => copyText(m.text, () => toast('已复制')) },
    { label: '编辑', fn: () => startEdit(m) },
    { label: '删除', danger: true, fn: () => confirmModal('删除这条笔记？此操作不可恢复。', () => deleteMessage(m.id)) },
    { label: '多选', fn: () => { setSelecting(true); toggleSelect(m.id); } },
  ]);
}

function deleteMessage(id) {
  const t = currentTopic; if (!t) return;
  if (editing && editingMsg && editingMsg.id === id) cancelEdit();
  const idx = t.messages.findIndex(m => m.id === id);
  if (idx >= 0) t.messages.splice(idx, 1);
  selectedIds.delete(id);
  scheduleSave();
  rerenderPreserve();
}
/* ================= 多选 ================= */
function setSelecting(on) {
  selecting = on;
  exitFillMode();
  $('#screen-chat').classList.toggle('selecting', on);
  $('#chat-top-select').hidden = !on;
  if (!on) {
    endRange();
    selectedIds.clear();
    $('#msg-list').querySelectorAll('.checked').forEach(r => r.classList.remove('checked'));
  }
  if (on && editing) cancelEdit();
  updateSelectUI();
}

/* 「到这里」定位状态：点击目标消息 = 从最近已选填充区间 */
let fillMode = false;
function exitFillMode() {
  fillMode = false;
  const b = $('#btn-fill-here');
  if (b) b.classList.remove('on');
}

function updateSelectUI() {
  const n = selectedIds.size;
  $('#sel-count').textContent = `已选 ${n}`;
  /* 单选：编辑 | 复制 | 删除；多条或 0 条：导出 | 删除所选 */
  const single = n === 1;
  $('#btn-edit-selected').hidden = !single;
  $('#btn-copy-selected').hidden = !single;
  $('#btn-del-selected').hidden = !single;
  $('#btn-export-selected').hidden = single;
  $('#btn-del-multi').hidden = single;
  const ex = $('#btn-export-selected'), de = $('#btn-del-multi');
  ex.textContent = `导出（${n}）`;
  ex.disabled = !n;
  de.disabled = !n;
  const id = single ? [...selectedIds][0] : null;
  const m = id && currentTopic ? currentTopic.messages.find(x => x.id === id) : null;
  $('#btn-edit-selected').disabled = !m;
  $('#btn-copy-selected').disabled = !m;
  $('#btn-del-selected').disabled = !m;
}

function toggleSelect(id) {
  if (selectedIds.has(id)) selectedIds.delete(id); else selectedIds.add(id);
  const row = $('#msg-list').querySelector(`[data-id="${id}"]`);
  if (row) row.classList.toggle('checked', selectedIds.has(id));
  updateSelectUI();
}

/* ---------- 范围选择（按住拖动 = 选择到当前位置） ---------- */
let rangeDrag = null; // {anchorId, marker}

function renderedRows() { return [...$('#msg-list').querySelectorAll('.msg-row')]; }

function startRange(m, row, paint) {
  exitFillMode(); // 拖动开始即退出「到这里」定位状态
  if (rangeDrag || !selecting) return;
  /* 快照拖动开始时的选中态：区间外恢复原状 */
  const base = new Map();
  renderedRows().forEach(r => base.set(r.dataset.id, r.classList.contains('checked')));
  const anchorWasChecked = row.classList.contains('checked');
  if (!selectedIds.has(m.id)) {
    selectedIds.add(m.id);
    row.classList.add('checked');
  }
  const marker = el('div', 'sel-marker');
  $('#msg-list').append(marker);
  /* 刷选方向：起手已选中 = 本次滑动刷掉选中；起手未选中 = 本次滑动选入 */
  rangeDrag = {
    anchorId: m.id, marker, base,
    paint: paint || (anchorWasChecked ? 'off' : 'on'),
    startX: null, lastX: null, lastY: null, lastMsg: m, scrollTimer: 0,
  };
  moveRange(m, row);
  startAutoScroll();
  showFillChip();
  updateSelectUI();
}

function moveRange(m, row) {
  if (!rangeDrag) return;
  const rows = renderedRows();
  const ai = rows.findIndex(r => r.dataset.id === rangeDrag.anchorId);
  const ti = rows.findIndex(r => r.dataset.id === m.id);
  if (ai < 0 || ti < 0) return;
  const from = Math.min(ai, ti), to = Math.max(ai, ti);
  const base = rangeDrag.base;
  const paintOn = rangeDrag.paint !== 'off';
  /* 选入刷：区间内强制选中；取消刷：区间内全部取消（含锚点），区间外一律恢复拖动前状态 */
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const id = r.dataset.id;
    let want;
    if (i >= from && i <= to) want = paintOn;
    else want = !!base.get(id);
    const has = selectedIds.has(id);
    if (want && !has) { selectedIds.add(id); r.classList.add('checked'); }
    else if (!want && has) { selectedIds.delete(id); r.classList.remove('checked'); }
  }
  /* 标记线：向上划在顶部边界之上，向下划在底部边界之下 */
  const mk = rangeDrag.marker;
  if (ti <= ai) rows[from].before(mk); else rows[to].after(mk);
  rangeDrag.lastMsg = m;
  positionFillChip();
  updateSelectUI();
}

function endRange() {
  if (!rangeDrag) return;
  stopAutoScroll();
  hideFillChip();
  rangeDrag.marker.remove();
  rangeDrag = null;
  suppressClick = true;
  setTimeout(() => { suppressClick = false; }, 400);
}

/* 「选择到这里」：以最近的已选消息为起点、当前消息为终点，区间内全部选中（大跨度） */
/* baseSel 传入拖动开始前的选中快照时，以快照里的最近已选为起点（用于拖动浮标触发） */
function fillRangeTo(m, baseSel) {
  const t = currentTopic; if (!t) return;
  const idxMap = new Map(t.messages.map((x, i) => [x.id, i]));
  const ti = idxMap.get(m.id);
  if (ti == null) return;
  let nearest = null, best = Infinity;
  const consider = (id, on) => {
    if (!on) return;
    const idx = idxMap.get(id);
    if (idx == null) return;
    const d = Math.abs(idx - ti);
    if (d < best) { best = d; nearest = idx; }
  };
  if (baseSel) baseSel.forEach((on, id) => consider(id, on));
  else selectedIds.forEach(id => consider(id, true));
  const from = nearest == null ? ti : Math.min(nearest, ti);
  const to = nearest == null ? ti : Math.max(nearest, ti);
  for (let i = from; i <= to; i++) {
    const mm = t.messages[i];
    selectedIds.add(mm.id);
    const row = $('#msg-list').querySelector(`[data-id="${mm.id}"]`);
    if (row) row.classList.add('checked');
  }
  updateSelectUI();
}

/* 从已选中消息起手：滑动即进入范围选择（选择到当前位置）；未选中消息需按住 420ms */
let pendingRange = null; // {m, row, x, y}

function applyRangeAt(x, y) {
  /* 按 Y 就近命中消息行：对行间空隙、标记线插入引起的位移、视口边缘都稳健 */
  let target = null, best = Infinity;
  for (const r of renderedRows()) {
    const rr = r.getBoundingClientRect();
    if (!rr.height) continue;
    const d = y < rr.top ? rr.top - y : (y > rr.bottom ? y - rr.bottom : 0);
    if (d < best) { best = d; target = r; }
  }
  if (target && target.dataset.id) {
    const mm = currentTopic && currentTopic.messages.find(x2 => x2.id === target.dataset.id);
    if (mm) moveRange(mm, target);
  }
}

function trackRangePoint(x, y) {
  if (!rangeDrag) return;
  if (rangeDrag.startX == null) rangeDrag.startX = x;
  rangeDrag.lastX = x; rangeDrag.lastY = y;
  /* 拖动中左滑超过半屏宽度 = 「选择到这里」：以拖动前最近已选为起点、当前边界为终点填充 */
  const half = Math.min(window.innerWidth, 640) / 2;
  if (rangeDrag.startX - x >= half) { triggerFillHere(); return; }
  applyRangeAt(x, y);
}

/* 拖到消息区边缘时自动滚动，扫过的消息全部纳入选择 */
function startAutoScroll() {
  rangeDrag.scrollTimer = setInterval(() => {
    if (!rangeDrag || rangeDrag.lastY == null) return;
    const area = $('#msg-area');
    const r = area.getBoundingClientRect();
    const edge = 56;
    let dy = 0;
    if (rangeDrag.lastY < r.top + edge) dy = -Math.ceil((r.top + edge - rangeDrag.lastY) / 4);
    else if (rangeDrag.lastY > r.bottom - edge) dy = Math.ceil((rangeDrag.lastY - (r.bottom - edge)) / 4);
    if (!dy) return;
    area.scrollTop += dy;
    applyRangeAt(rangeDrag.lastX, rangeDrag.lastY);
  }, 16);
}

function stopAutoScroll() {
  if (rangeDrag && rangeDrag.scrollTimer) {
    clearInterval(rangeDrag.scrollTimer);
    rangeDrag.scrollTimer = 0;
  }
}

/* 「选择到当前」提示标签：贴着标记线移动（限制在消息区范围内），触发靠左滑半屏 */
function showFillChip() {
  const chip = document.getElementById('fill-chip');
  chip.hidden = false;
  positionFillChip();
}
function positionFillChip() {
  const chip = document.getElementById('fill-chip');
  if (chip.hidden || !rangeDrag || !rangeDrag.marker) return;
  const mr = rangeDrag.marker.getBoundingClientRect();
  const ar = $('#msg-area').getBoundingClientRect();
  chip.style.top = Math.round(clamp(mr.top, ar.top + 18, ar.bottom - 18)) + 'px';
}
function hideFillChip() {
  document.getElementById('fill-chip').hidden = true;
}

/* 滑到浮标触发：以拖动前最近的已选消息为起点、当前边界为终点填充区间 */
function triggerFillHere() {
  if (!rangeDrag) return;
  const { base, lastMsg } = rangeDrag;
  endRange();
  if (lastMsg) fillRangeTo(lastMsg, base);
}

function attachRangeSelect(row, m) {
  let holdTimer = 0, sx = 0, sy = 0;
  /* 按住 420ms = 选中锚点并武装橡皮筋；「选择到这里」由左滑半屏触发 */
  const holdFire = () => {
    startRange(m, row);
    trackRangePoint(sx, sy);
  };
  row.addEventListener('touchstart', e => {
    if (!selecting || rangeDrag) return;
    if (e.touches.length !== 1) return;
    sx = e.touches[0].clientX; sy = e.touches[0].clientY;
    if (row.classList.contains('checked')) {
      pendingRange = { m, row, x: sx, y: sy, paint: 'off' };
    }
    holdTimer = setTimeout(() => { holdTimer = 0; holdFire(); }, 420);
  }, { passive: true });
  row.addEventListener('touchmove', e => {
    if (holdTimer && Math.hypot(e.touches[0].clientX - sx, e.touches[0].clientY - sy) > 10) {
      clearTimeout(holdTimer); holdTimer = 0;
    }
  }, { passive: true });
  row.addEventListener('touchend', () => { clearTimeout(holdTimer); holdTimer = 0; pendingRange = null; }, { passive: true });
  row.addEventListener('touchcancel', () => { clearTimeout(holdTimer); holdTimer = 0; pendingRange = null; }, { passive: true });
  /* 桌面鼠标：按住不动 420ms = 选择到这里；按住已选中消息拖动 = 立即范围选择；未选中拖动前需按住 */
  row.addEventListener('mousedown', e => {
    if (!selecting || rangeDrag) return;
    if (e.button !== 0) return;
    e.preventDefault();
    const checked = row.classList.contains('checked');
    const mx = e.clientX, my = e.clientY;
    const hold = setTimeout(() => {
      startRange(m, row);
      trackRangePoint(mx, my);
      wireMouseMove();
    }, 420);
    if (checked) {
      const begin = ev => {
        if (Math.hypot(ev.clientX - mx, ev.clientY - my) < 6) return;
        clearTimeout(hold);
        document.removeEventListener('mousemove', begin);
        if (rangeDrag) return;
        startRange(m, row);
        trackRangePoint(ev.clientX, ev.clientY);
        wireMouseMove();
      };
      document.addEventListener('mousemove', begin);
      document.addEventListener('mouseup', () => { clearTimeout(hold); document.removeEventListener('mousemove', begin); }, { once: true });
    } else {
      const cancel = ev => {
        if (Math.hypot(ev.clientX - mx, ev.clientY - my) > 10) {
          clearTimeout(hold);
          document.removeEventListener('mousemove', cancel);
        }
      };
      document.addEventListener('mousemove', cancel);
      document.addEventListener('mouseup', () => { clearTimeout(hold); document.removeEventListener('mousemove', cancel); }, { once: true });
    }
  });
}

function wireMouseMove() {
  const onMove = ev => {
    if (!rangeDrag) return;
    trackRangePoint(ev.clientX, ev.clientY);
  };
  const up = () => {
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup', up);
    endRange();
  };
  document.addEventListener('mousemove', onMove);
  document.addEventListener('mouseup', up);
}

document.addEventListener('touchmove', e => {
  if (rangeDrag) {
    e.preventDefault();
    const t = e.touches[0];
    trackRangePoint(t.clientX, t.clientY);
    return;
  }
  if (pendingRange) {
    const t = e.touches[0];
    if (Math.hypot(t.clientX - pendingRange.x, t.clientY - pendingRange.y) > 10) {
      const { m, row, paint } = pendingRange;
      pendingRange = null;
      startRange(m, row, paint);
      trackRangePoint(t.clientX, t.clientY);
      e.preventDefault();
    }
  }
}, { passive: false });
document.addEventListener('touchend', () => { pendingRange = null; if (rangeDrag) endRange(); }, { passive: true });
document.addEventListener('touchcancel', () => { pendingRange = null; if (rangeDrag) endRange(); }, { passive: true });

/* ================= 导出（Markdown） ================= */
function mdEntries(msgs, withTime) {
  return msgs.map(m => (withTime ? fmtFull(m.createdAt) + '\n\n' : '') + m.text).join('\n\n');
}

function buildExportText(t, scope, withTime) {
  const msgs = scope === 'selected' ? t.messages.filter(m => selectedIds.has(m.id)) : t.messages;
  const body = mdEntries(msgs, withTime);
  return (scope === 'all' ? `# ${topicDisplayName(t)}\n\n` : '') + body;
}

function buildExportAllText(withTime) {
  const topics = [...store.topics].sort((a, b) => a.createdAt - b.createdAt);
  const parts = topics.map(t => `## ${topicDisplayName(t)}\n\n${mdEntries(t.messages, withTime)}`);
  return `# ChatNote 导出\n\n${parts.join('\n\n')}`;
}

/* 导出「包含时间」勾选行（单会话/全部会话共用），返回 checkbox 元素 */
function expTimeRow(parent) {
  const lb = el('label', 'exp-opt');
  const ck = el('input'); ck.type = 'checkbox'; ck.checked = true;
  const sp = el('span'); sp.textContent = '包含时间（YYYY-MM-DD HH:mm:ss）';
  lb.append(ck, sp);
  parent.append(lb);
  return ck;
}

function openExport(t, defaultScope) {
  if (!t) return;
  const sheet = $('#export-sheet'); sheet.textContent = '';

  const scopes = [];
  if (selecting && selectedIds.size > 0) scopes.push(['selected', `已选条目（${selectedIds.size}）`]);
  scopes.push(['all', `全部条目（${t.messages.length}）`]);
  const scopeVal = scopes.some(s => s[0] === defaultScope) ? defaultScope : scopes[0][0];

  const l1 = el('div', 'exp-label'); l1.textContent = '导出范围';
  sheet.append(l1);
  for (const [val, label] of scopes) {
    const lb = el('label', 'exp-opt');
    const r = el('input'); r.type = 'radio'; r.name = 'exp-scope'; r.value = val;
    r.checked = val === scopeVal;
    const sp = el('span'); sp.textContent = label;
    lb.append(r, sp); sheet.append(lb);
  }

  const l2 = el('div', 'exp-label'); l2.textContent = '时间';
  sheet.append(l2);
  const ck = expTimeRow(sheet);

  const btns = el('div', 'exp-btns');
  const bd = el('button', 'exp-btn primary'); bd.textContent = '下载 Markdown';
  const bc = el('button', 'exp-btn'); bc.textContent = '复制到剪贴板';
  btns.append(bd, bc); sheet.append(btns);

  const readScope = () => {
    const r = sheet.querySelector('input[name="exp-scope"]:checked');
    return r ? r.value : 'all';
  };
  bd.addEventListener('click', () => doExport(t, 'download', readScope(), ck.checked));
  bc.addEventListener('click', () => doExport(t, 'copy', readScope(), ck.checked));
  showOverlay($('#export-overlay'));
}

function openExportAll() {
  openCustomSheet(g1 => {
    const l = el('div', 'exp-label');
    l.textContent = `导出全部会话（${store.topics.length} 个话题）`;
    g1.append(l);
    const ck = expTimeRow(g1);
    const btns = el('div', 'exp-btns');
    const bd = el('button', 'exp-btn primary'); bd.textContent = '下载 Markdown';
    const bc = el('button', 'exp-btn'); bc.textContent = '复制到剪贴板';
    btns.append(bd, bc); g1.append(btns);
    bd.addEventListener('click', () => doExportAll('download', ck.checked));
    bc.addEventListener('click', () => doExportAll('copy', ck.checked));
  });
}

function downloadText(text, filename, okMsg) {
  try {
    const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = el('a');
    a.href = url; a.download = filename;
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 3000);
    closeOverlays();
    toast(okMsg);
  } catch (e) { toast('下载失败'); }
}

function doExport(t, mode, scope, withTime) {
  const count = scope === 'selected' ? selectedIds.size : t.messages.length;
  if (!count) { toast('没有可导出的内容'); return; }
  const text = buildExportText(t, scope, withTime);
  if (mode === 'copy') {
    copyText(text, () => { closeOverlays(); toast(`已复制 ${count} 条到剪贴板`); });
  } else {
    const safeName = topicDisplayName(t).replace(/[\\/:*?"<>|]/g, '').trim() || '导出';
    downloadText(text, `${safeName}_${exportStamp()}.md`, `已下载 ${count} 条`);
  }
}

function doExportAll(mode, withTime) {
  const total = store.topics.reduce((s, t) => s + t.messages.length, 0);
  if (!total) { toast('没有可导出的内容'); return; }
  const text = buildExportAllText(withTime);
  if (mode === 'copy') {
    copyText(text, () => { closeOverlays(); toast(`已复制 ${total} 条到剪贴板`); });
  } else {
    downloadText(text, `ChatNote_${exportStamp()}.md`, `已下载 ${store.topics.length} 个会话`);
  }
}

/* ================= 发送与草稿 ================= */
const input = $('#input');
const allInput = $('#all-input');

function autoGrowEl(inp) {
  inp.style.height = 'auto';
  inp.style.height = Math.min(inp.scrollHeight, 120) + 'px';
}
function autoGrow() {
  if (expanded) return;
  autoGrowEl(input);
}
function updateSendState() {
  $('#btn-send').disabled = !input.value.trim();
}
function scheduleDraft() {
  if (editing) return; // 编辑态不改写草稿
  if (!currentTopic) return;
  const v = input.value;
  if (v.trim()) {
    drafts[currentTopic.id] = v;
    bumpActivity(currentTopic);
  } else {
    delete drafts[currentTopic.id];
  }
  scheduleSave();
}

/* 追加消息：自动命名 + 活跃度 + 持久化（对话页与合并视图共用）；返回是否触发了自动命名 */
function appendMessage(t, text) {
  t.messages.push({ id: uid(), text, createdAt: Date.now(), updatedAt: Date.now(), edited: false });
  let renamed = false;
  if (!t.nameSet && !t.name) { t.name = deriveTitle(text); renamed = true; }
  bumpActivity(t);
  scheduleSave();
  return renamed;
}

function send() {
  if (editing) { saveEdit(); return; }
  const t = currentTopic; if (!t) return;
  const text = input.value.trim();
  if (!text) return;
  if (appendMessage(t, text)) $('#chat-title').textContent = topicDisplayName(t);
  delete drafts[t.id];
  input.value = '';
  if (expanded) setExpanded(false); // 发送后回到普通对话状态
  autoGrow(); updateSendState();
  renderedCount = Math.min(renderedCount + 1, t.messages.length);
  renderMessages();
  scrollBottom();
}

input.addEventListener('input', () => { autoGrow(); maybeAutoExpand(); updateSendState(); scheduleDraft(); });
$('#btn-send').addEventListener('click', send);

/* 展开 / 收起输入框、取消编辑 */
$('#btn-collapse').addEventListener('click', () => { collapseHold = true; setExpanded(false); });
$('#btn-edit-cancel').addEventListener('click', cancelEdit);

/* ================= 全部会话（合并视图） ================= */
function allEntries() {
  const items = [];
  for (const t of store.topics) {
    for (const m of t.messages) items.push({ t, m });
  }
  items.sort((a, b) => a.m.createdAt - b.m.createdAt || a.t.createdAt - b.t.createdAt);
  return items;
}

function renderAllView() {
  const items = allEntries();
  allTotal = items.length;
  allRendered = Math.min(PAGE, allTotal);
  renderAllList(items);
}

function renderAllList(items) {
  const list = items || allEntries();
  allTotal = list.length;
  const wrap = $('#all-list'); wrap.textContent = '';
  const start = Math.max(0, list.length - allRendered);
  let prevDay = null;
  for (let i = start; i < list.length; i++) {
    const { t, m } = list[i];
    const dk = dayKey(m.createdAt);
    if (dk !== prevDay) { wrap.append(dateSep(m.createdAt)); prevDay = dk; }
    wrap.append(allRow(t, m));
  }
  $('#all-empty').hidden = list.length > 0;
}

function allRow(t, m) {
  const row = el('div', 'msg-row');
  row.dataset.id = m.id;
  const col = el('div', 'msg-col');
  const bcol = bubbleOf(t);
  const bubble = el('div', 'bubble');
  bubble.textContent = m.text;
  bubble.style.background = bcol.bg;
  bubble.style.color = bcol.fg;
  const meta = el('div', 'msg-meta');
  meta.textContent = `${topicDisplayName(t)} · ${fmtHM(m.createdAt)}${m.edited ? ' · 已编辑' : ''}`;
  col.append(bubble, meta);
  row.append(col);
  row.addEventListener('click', () => {
    pendingJump = { topicId: t.id, msgId: m.id };
    location.hash = '#/c/' + t.id;
  });
  return row;
}

attachPaging('#all-area',
  () => location.hash === '#/all' && allRendered < allTotal,
  () => { allRendered = Math.min(allRendered + PAGE, allTotal); renderAllList(); });

function scrollBottomAll() {
  requestAnimationFrame(() => {
    const a = $('#all-area');
    a.scrollTop = a.scrollHeight;
  });
}

function sendToDefault() {
  const text = allInput.value.trim();
  if (!text) return;
  appendMessage(getDefaultTopic() || createTopic(), text);
  allInput.value = '';
  autoGrowEl(allInput);
  $('#all-send').disabled = true;
  allRendered = Math.min(allRendered + 1, allTotal + 1);
  renderAllList();
  scrollBottomAll();
}

allInput.addEventListener('input', () => {
  autoGrowEl(allInput);
  $('#all-send').disabled = !allInput.value.trim();
});
$('#all-send').addEventListener('click', sendToDefault);

/* ================= 时间线 ================= */
const tlOverlay = $('#timeline-overlay');
const tlCanvas = $('#tl-canvas');
const tlRail = $('#tl-rail');
const tlPreview = $('#tl-preview');
const tlPreviewName = $('#tl-preview-name');
const tlPreviewBubble = $('#tl-preview-bubble');
const tlChip = $('#tl-date-chip');
let tlState = null;          // {scope:'topic'|'all', entries:[{t,m}], pitch}
let tlScrubbing = false;
let tlHoverIdx = -1;

function openTimeline(scope) {
  let entries;
  if (scope === 'topic') {
    if (!currentTopic) return;
    entries = currentTopic.messages.map(m => ({ t: currentTopic, m }));
    $('#timeline-title').textContent = `时间线 · ${topicDisplayName(currentTopic)}`;
  } else {
    entries = allEntries();
    $('#timeline-title').textContent = '时间线 · 全部会话';
  }
  if (!entries.length) { toast('暂无消息'); return; }
  tlState = { scope, entries, pitch: 0 };
  tlOverlay.classList.toggle('tl-left', settings.timelineSide === 'left');
  tlOverlay.classList.toggle('tl-right', settings.timelineSide !== 'left');
  hideTlFloat();
  showOverlay(tlOverlay);
  requestAnimationFrame(drawTimeline);
}

function closeTimeline() {
  if (tlOverlay.hidden) return;
  tlOverlay.hidden = true;
  tlState = null;
  tlScrubbing = false;
  hideTlFloat();
}

function hideTlFloat() {
  tlPreview.hidden = true;
  tlChip.hidden = true;
  tlHoverIdx = -1;
}

function drawTimeline() {
  if (!tlState || tlOverlay.hidden) return;
  const w = tlRail.clientWidth, h = tlRail.clientHeight;
  if (!w || !h) return;
  const dpr = window.devicePixelRatio || 1;
  tlCanvas.width = Math.round(w * dpr);
  tlCanvas.height = Math.round(h * dpr);
  const ctx = tlCanvas.getContext('2d');
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, w, h);
  const n = tlState.entries.length;
  /* 间距上限：消息少时居中收拢，避免稀疏铺满全屏 */
  const pitch = Math.min(h / n, 28);
  const off = Math.max(0, (h - pitch * n) / 2);
  tlState.pitch = pitch;
  tlState.offset = off;
  const dark = isDark();
  const labelColor = dark ? '#8f959e' : '#878e98';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '9px -apple-system,BlinkMacSystemFont,sans-serif';
  let lastLabelY = -99, prevDay = null;
  tlState.entries.forEach((en, i) => {
    const y = off + pitch * i + pitch / 2;
    ctx.fillStyle = bubbleOf(en.t).bg;
    ctx.fillRect(5, y - 0.75, w - 10, 1.5);
    const dk = dayKey(en.m.createdAt);
    if (dk !== prevDay) {
      prevDay = dk;
      if (y - lastLabelY >= 14) {
        const d = new Date(en.m.createdAt);
        const yy = d.getFullYear();
        const label = yy === new Date().getFullYear()
          ? `${d.getMonth() + 1}/${d.getDate()}`
          : `${String(yy).slice(2)}/${d.getMonth() + 1}/${d.getDate()}`;
        ctx.fillStyle = labelColor;
        ctx.fillText(label, w / 2, Math.max(6, y - 8));
        lastLabelY = y;
      }
    }
  });
}

function tlIdxFromY(clientY) {
  if (!tlState || !tlState.pitch) return -1;
  const rect = tlCanvas.getBoundingClientRect();
  const n = tlState.entries.length;
  const y = clientY - rect.top - (tlState.offset || 0);
  return clamp(Math.floor(y / tlState.pitch), 0, n - 1);
}

function tlShowPreview(idx, clientY) {
  if (!tlState || idx < 0) return;
  const en = tlState.entries[idx];
  tlHoverIdx = idx;
  const bcol = bubbleOf(en.t);
  if (tlState.scope === 'all') {
    tlPreviewName.hidden = false;
    tlPreviewName.textContent = topicDisplayName(en.t);
  } else {
    tlPreviewName.hidden = true;
  }
  tlPreviewBubble.textContent = en.m.text;
  tlPreviewBubble.style.background = bcol.bg;
  tlPreviewBubble.style.color = bcol.fg;
  tlPreview.hidden = false;
  const stage = $('#timeline-stage').getBoundingClientRect();
  requestAnimationFrame(() => {
    const ph = tlPreview.offsetHeight;
    tlPreview.style.top = clamp(clientY - stage.top, ph / 2 + 8, Math.max(ph / 2 + 8, stage.height - ph / 2 - 8)) + 'px';
  });
  tlChip.textContent = fmtDayLabel(en.m.createdAt);
  tlChip.hidden = false;
  const crect = tlCanvas.getBoundingClientRect();
  tlChip.style.top = (clientY - crect.top) + 'px';
}

function tlJump(idx) {
  if (!tlState || idx < 0) return;
  const { scope, entries } = tlState;
  const { t, m } = entries[idx];
  closeTimeline();
  if (scope === 'topic') {
    jumpToMessage(m.id);
  } else {
    pendingJump = { topicId: t.id, msgId: m.id };
    location.hash = '#/c/' + t.id;
  }
}

const tlOverPreview = e => {
  if (tlPreview.hidden) return false;
  const pr = tlPreview.getBoundingClientRect();
  return e.clientX >= pr.left && e.clientX <= pr.right && e.clientY >= pr.top && e.clientY <= pr.bottom;
};

tlRail.addEventListener('pointerdown', e => {
  if (!tlState || e.pointerType === 'mouse') return;
  tlScrubbing = true;
  try { tlRail.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
  tlShowPreview(tlIdxFromY(e.clientY), e.clientY);
});
tlRail.addEventListener('pointermove', e => {
  if (!tlState) return;
  if (e.pointerType === 'mouse' && !tlScrubbing) {
    tlShowPreview(tlIdxFromY(e.clientY), e.clientY);
    return;
  }
  if (!tlScrubbing) return;
  if (tlOverPreview(e)) { tlJump(tlHoverIdx); return; }
  tlShowPreview(tlIdxFromY(e.clientY), e.clientY);
});
const tlPointerEnd = e => {
  if (!tlScrubbing) return;
  tlScrubbing = false;
  if (!tlState) return;
  const rr = tlRail.getBoundingClientRect();
  const overRail = e.clientX >= rr.left && e.clientX <= rr.right && e.clientY >= rr.top && e.clientY <= rr.bottom;
  if (overRail || tlOverPreview(e)) tlJump(tlIdxFromY(e.clientY));
  else hideTlFloat();
};
tlRail.addEventListener('pointerup', tlPointerEnd);
tlRail.addEventListener('pointercancel', () => { tlScrubbing = false; if (tlState) hideTlFloat(); });
tlRail.addEventListener('pointerleave', () => { if (!tlScrubbing) hideTlFloat(); });
/* 鼠标：点击轨道直接跳转（触摸路径在 pointerup 中处理） */
tlRail.addEventListener('click', e => {
  if (!tlState || tlScrubbing) return;
  tlJump(tlIdxFromY(e.clientY));
});
$('#btn-timeline-close').addEventListener('click', closeTimeline);
$('#timeline-overlay .backdrop').addEventListener('click', closeTimeline);
window.addEventListener('resize', () => {
  if (tlState && !tlOverlay.hidden) requestAnimationFrame(drawTimeline);
});

/* ================= 长按 / 右键 ================= */
let suppressClick = false;
document.addEventListener('click', e => {
  if (suppressClick) { e.stopPropagation(); e.preventDefault(); suppressClick = false; }
}, true);

function attachLongPress(node, fn) {
  let timer = 0, sx = 0, sy = 0, fired = false;
  node.addEventListener('touchstart', e => {
    if (selecting) return;
    if (e.touches.length !== 1) { clearTimeout(timer); return; }
    fired = false;
    sx = e.touches[0].clientX; sy = e.touches[0].clientY;
    timer = setTimeout(() => { fired = true; fn(sx, sy); }, 480);
  }, { passive: true });
  node.addEventListener('touchmove', e => {
    if (timer && Math.hypot(e.touches[0].clientX - sx, e.touches[0].clientY - sy) > 10) {
      clearTimeout(timer); timer = 0;
    }
  }, { passive: true });
  const end = () => {
    if (fired) { suppressClick = true; setTimeout(() => { suppressClick = false; }, 400); }
    clearTimeout(timer); timer = 0;
  };
  node.addEventListener('touchend', end, { passive: true });
  node.addEventListener('touchcancel', () => { clearTimeout(timer); timer = 0; }, { passive: true });
}

document.addEventListener('contextmenu', e => {
  const row = e.target.closest('.msg-row,.topic-item');
  if (!row) return;
  e.preventDefault();
  if (selecting || suppressClick || anyOverlayOpen()) return;
  if (row.classList.contains('msg-row')) {
    const m = currentTopic && currentTopic.messages.find(x => x.id === row.dataset.id);
    if (m) openMsgMenu(m);
  } else {
    const t = getTopic(row.dataset.id);
    if (t) openTopicMenu(t);
  }
});

/* 桌面鼠标长按：按住左键 480ms 不动 = 触摸长按（进入多选）；按住继续移动 = 扩展范围选择 */
function attachMouseLongPress(row, m) {
  let timer = 0, sx = 0, sy = 0;
  row.addEventListener('mousedown', e => {
    if (selecting || rangeDrag) return;
    if (e.button !== 0) return;
    if (e.target.closest('.msg-more')) return;
    sx = e.clientX; sy = e.clientY;
    timer = setTimeout(() => {
      timer = 0;
      longPressMsg(m, sx, sy);
      const rowEl = $('#msg-list').querySelector(`[data-id="${m.id}"]`);
      const begin = ev => {
        if (rangeDrag) return;
        startRange(m, rowEl, 'on');
        trackRangePoint(ev.clientX, ev.clientY);
        wireMouseMove();
      };
      document.addEventListener('mousemove', begin);
      /* 抑制点击放在抬起时刻：长按多久都不会因松手 click 而取消选中 */
      document.addEventListener('mouseup', () => {
        document.removeEventListener('mousemove', begin);
        if (!rangeDrag) {
          suppressClick = true;
          setTimeout(() => { suppressClick = false; }, 400);
        }
      }, { once: true });
    }, 480);
  });
  row.addEventListener('mousemove', e => {
    if (timer && Math.hypot(e.clientX - sx, e.clientY - sy) > 10) { clearTimeout(timer); timer = 0; }
  });
  const clear = () => { clearTimeout(timer); timer = 0; };
  row.addEventListener('mouseup', clear);
  row.addEventListener('mouseleave', clear);
}

/* ================= 顶栏与各入口 ================= */
$('#fab-new').addEventListener('click', () => {
  const t = createTopic();
  focusOnEnter = true;
  location.hash = '#/c/' + t.id;
});

$('#fab-quick').addEventListener('click', () => {
  const t = getDefaultTopic() || createTopic();
  focusOnEnter = true;
  location.hash = '#/c/' + t.id;
});

$('#btn-settings').addEventListener('click', openSettingsSheet);
$('#btn-timeline-list').addEventListener('click', () => openTimeline('all'));
$('#btn-all-view').addEventListener('click', () => { location.hash = '#/all'; });
$('#btn-all-back').addEventListener('click', () => { location.hash = '#/'; });
$('#btn-timeline-chat').addEventListener('click', () => openTimeline('topic'));
$('#btn-timeline-select').addEventListener('click', () => openTimeline('topic'));

$('#btn-back').addEventListener('click', () => { location.hash = '#/'; });
$('#chat-title').addEventListener('click', () => { if (currentTopic) renameTopic(currentTopic); });
$('#btn-more').addEventListener('click', () => {
  if (!currentTopic) return;
  const t = currentTopic;
  openSheet([
    { label: '多选', fn: () => { setSelecting(true); } },
    { label: '导出', fn: () => openExport(t, 'all') },
    { custom: buildSwatchRow(t) },
    { label: '恢复默认配色', fn: () => { delete t.bubble; scheduleSave(); applyBubbleVars(t); } },
    { label: t.isDefault ? '取消默认会话' : '设为默认会话', fn: () => toggleDefault(t) },
    { label: '重命名话题', fn: () => renameTopic(t) },
    { label: '删除话题', danger: true, fn: () => confirmDeleteTopic(t) },
  ]);
});

$('#btn-select-all').addEventListener('click', () => {
  if (!currentTopic) return;
  exitFillMode();
  selectedIds = new Set(currentTopic.messages.map(m => m.id));
  $('#msg-list').querySelectorAll('.msg-row').forEach(r => r.classList.add('checked'));
  updateSelectUI();
});
$('#btn-fill-here').addEventListener('click', () => {
  fillMode = !fillMode;
  $('#btn-fill-here').classList.toggle('on', fillMode);
  if (fillMode) toast('点击目标消息，完成区间选择');
});
$('#btn-select-cancel').addEventListener('click', () => setSelecting(false));
$('#btn-export-selected').addEventListener('click', () => openExport(currentTopic, 'selected'));
$('#btn-del-multi').addEventListener('click', () => {
  if (!selectedIds.size) return;
  confirmModal(`删除已选的 ${selectedIds.size} 条笔记？此操作不可恢复。`, () => {
    currentTopic.messages = currentTopic.messages.filter(m => !selectedIds.has(m.id));
    selectedIds.clear();
    scheduleSave();
    setSelecting(false);
    rerenderPreserve();
  });
});
$('#btn-edit-selected').addEventListener('click', () => {
  const id = [...selectedIds][0];
  const m = currentTopic && currentTopic.messages.find(x => x.id === id);
  if (!m) return;
  setSelecting(false);
  startEdit(m);
});
$('#btn-copy-selected').addEventListener('click', () => {
  const id = [...selectedIds][0];
  const m = currentTopic && currentTopic.messages.find(x => x.id === id);
  if (m) copyText(m.text, () => toast('已复制'));
});
$('#btn-del-selected').addEventListener('click', () => {
  const id = [...selectedIds][0];
  if (!id) return;
  confirmModal('删除这条笔记？此操作不可恢复。', () => deleteMessage(id));
});

$('#modal-cancel').addEventListener('click', closeOverlays);
document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  if (!tlOverlay.hidden) closeTimeline();
  else if (fillMode) exitFillMode();
  else if (editing) cancelEdit();
  else if (expanded) setExpanded(false);
  else closeOverlays();
});
document.querySelectorAll('.overlay .backdrop').forEach(b => b.addEventListener('click', closeOverlays));

/* ================= 设置面板与启动页 ================= */
function openSettingsSheet() {
  openCustomSheet(g1 => {
    const l1 = el('div', 'exp-label'); l1.textContent = '启动页';
    g1.append(l1);
    g1.append(radioRow('set-open', 'list', '列表页', settings.openOn === 'list', v => { settings.openOn = v; scheduleSave(); }));
    g1.append(radioRow('set-open', 'last', '上次对话', settings.openOn === 'last', v => { settings.openOn = v; scheduleSave(); }));
    const l2 = el('div', 'exp-label'); l2.textContent = '时间线位置';
    g1.append(l2);
    g1.append(radioRow('set-tl', 'right', '右侧（默认）', settings.timelineSide === 'right', v => { settings.timelineSide = v; scheduleSave(); }));
    g1.append(radioRow('set-tl', 'left', '左侧', settings.timelineSide === 'left', v => { settings.timelineSide = v; scheduleSave(); }));
    const l3 = el('div', 'exp-label'); l3.textContent = '数据';
    g1.append(l3);
    const b = el('button', 'sheet-item');
    b.textContent = '导出全部会话';
    b.addEventListener('click', () => { closeOverlays(); openExportAll(); });
    g1.append(b);
  });
}

function applyStartupRoute() {
  if (settings.openOn !== 'last' || !settings.lastTopicId) return;
  if (location.hash && location.hash !== '#/') return; // 显式 hash 优先
  if (!getTopic(settings.lastTopicId)) return;
  location.hash = '#/c/' + settings.lastTopicId;
}

/* ================= 软键盘适配 ================= */
const app = $('#app');
const vv = window.visualViewport;
if (vv) {
  const applyVV = () => {
    app.style.height = vv.height + 'px';
    app.style.transform = vv.offsetTop > 0 ? `translateY(${vv.offsetTop}px)` : '';
    if (vv.height < document.documentElement.clientHeight) window.scrollTo(0, 0);
    autoGrow();
    autoGrowEl(allInput);
  };
  vv.addEventListener('resize', applyVV);
  vv.addEventListener('scroll', applyVV);
  applyVV();
}
window.addEventListener('resize', () => { autoGrow(); autoGrowEl(allInput); });

/* ================= 启动 ================= */
loadData();
applyStartupRoute();
route();
window.addEventListener('hashchange', route);
