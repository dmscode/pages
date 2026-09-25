/* =========================================================
 * ★ 模块H：易撕条开盒仪式
 * 依赖：config.js（RULES）、storage.js、state.js、views.js（运行时调用）
 *
 * 交互规格（《计划树.md》§6.4）：
 *   - 拉环在易撕条左端，向左轻拉：行程固定很短（≤110px），拖过 70% 自动完成；
 *   - 行程按「拉环起点到屏幕左缘」动态收紧，拉环全程可见不滑出屏幕；
 *   - < 70% 松手 / pointercancel → 回弹可重试；
 *   - 奖品在进入撕条前已落盘，回弹/中断不产生任何数据损失；
 *   - 撕条完全由手势驱动（无自动开启、无兜底按钮）；
 *   - 动画只用 transform/opacity；will-change 仅拖拽期间挂载；
 *   - Pointer Events 不可用时降级 touch events。
 * ========================================================= */
(function () {
  'use strict';
  var BlindBox = window.BlindBox = window.BlindBox || {};

  var overlay, boxEl, strip, pull, tornEdge, prizePop, confettiLayer, hint;
  var bound = false;
  var active = false;        /* overlay 展示中 */
  var completed = false;     /* 本次撕裂是否已完成 */
  var dragging = false;
  var activePointerId = null;
  var startX = 0;
  var progress = 0;
  var trackLen = 110;        /* 撕动行程：固定短行程，show() 时按屏幕左缘收紧 */
  var currentPrize = null;
  var rafId = null;

  var slowFrames = 0;
  var lowPerf = false;       /* 运行期检测：连续掉帧后进入简化档 */

  var reducedMql = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  function reducedMotion() {
    return !!(reducedMql && reducedMql.matches);
  }

  function q(id) { return document.getElementById(id); }

  /* ---------- DOM 进度渲染 ---------- */

  function applyProgress() {
    var x = progress * trackLen;
    strip.style.transform = 'translateX(' + x + 'px) rotate(' + (progress * 4) + 'deg)';
    tornEdge.style.width = (progress * 100) + '%';
    boxEl.style.transform = 'rotate(' + (progress * 1.5) + 'deg)';
  }

  function setProgress(p) {
    progress = p;
    if (progress < 0) progress = 0;
    if (progress > 1) progress = 1;
    applyProgress();
  }

  /* ---------- 补间（rAF；低性能/减动效直接到终点） ---------- */

  function tween(from, to, duration, onDone) {
    if (reducedMotion() || lowPerf) {
      setProgress(to);
      if (onDone) onDone();
      return;
    }
    var start = null;
    slowFrames = 0;
    var step = function (ts) {
      if (start === null) start = ts;
      var dt = ts - (step.last || ts);
      step.last = ts;
      if (dt > 50) {
        slowFrames++;
        if (slowFrames >= 2) lowPerf = true; /* T304：连续掉帧 → 后续走简化档 */
      }
      var t = (ts - start) / duration;
      if (t > 1) t = 1;
      var eased = 1 - (1 - t) * (1 - t);
      setProgress(from + (to - from) * eased);
      if (t < 1 && !lowPerf) {
        rafId = requestAnimationFrame(step);
      } else {
        if (lowPerf) setProgress(to);
        rafId = null;
        if (onDone) onDone();
      }
    };
    rafId = requestAnimationFrame(step);
  }

  function springBack() {
    strip.classList.remove('strip-active');
    tween(progress, 0, 300, function () {
      hint.textContent = '按住拉环，轻轻向右撕开';
    });
  }

  /* ---------- 完成撕裂 → OPENING 编排 ---------- */

  function finishDrag() {
    if (completed) return;
    completed = true;
    dragging = false;
    activePointerId = null;
    strip.classList.remove('strip-active');
    hint.textContent = '撕开了！';

    BlindBox.state.goto('OPENING');

    /* 易撕条向右飞走（transition 由 style.transition 声明，内联 transform 驱动） */
    strip.style.transition = 'transform .35s ease-in, opacity .35s ease-in';
    strip.style.transform = 'translateX(140%) rotate(18deg)';
    strip.style.opacity = '0';
    tornEdge.style.width = '100%';
    boxEl.style.transform = '';
    boxEl.classList.add('box-open');

    spawnConfetti();
    if (navigator.vibrate) {
      try { navigator.vibrate(15); } catch (e) { /* 可选增强，失败静默 */ }
    }

    setTimeout(function () {
      BlindBox.views.renderVisual(prizePop, currentPrize);
      prizePop.className = 'prize-pop prize-pop-show';
    }, 350);

    setTimeout(function () {
      BlindBox.state.goto('REVEAL');
      BlindBox.views.showResult(currentPrize); /* 内部迁移到 RESULT 并弹结果卡 */
      hideOverlay();
    }, 1400);
  }

  function spawnConfetti() {
    var colors = ['#ff6b81', '#ffd166', '#6bcbef', '#95d4a0', '#c792ea'];
    var count = reducedMotion() ? 4 : (lowPerf ? 4 : 10);
    for (var i = 0; i < count; i++) {
      var piece = document.createElement('div');
      piece.className = 'confetti';
      piece.style.background = colors[i % colors.length];
      piece.style.left = (38 + Math.random() * 24) + '%';
      piece.style.top = '42%';
      confettiLayer.appendChild(piece);
      (function (pc, i) {
        var tx = (Math.random() - 0.5) * 230;
        var ty = -70 - Math.random() * 130;
        var rot = (Math.random() - 0.5) * 560;
        setTimeout(function () {
          pc.style.transform = 'translate(' + tx + 'px,' + ty + 'px) rotate(' + rot + 'deg)';
          pc.style.opacity = '0';
        }, 30 + i * 18);
      })(piece, i);
    }
    setTimeout(clearConfetti, 1100);
  }

  function clearConfetti() {
    if (!confettiLayer) return;
    while (confettiLayer.firstChild) confettiLayer.removeChild(confettiLayer.firstChild);
  }

  /* ---------- Pointer 手势 ---------- */

  function onPointerDown(e) {
    if (!active || completed || dragging) return;
    activePointerId = e.pointerId;
    startX = e.clientX;
    dragging = true;
    strip.classList.add('strip-active');
    e.preventDefault();
  }

  function onPointerMove(e) {
    if (!dragging || e.pointerId !== activePointerId) return;
    setProgress((e.clientX - startX) / trackLen); /* 向右拉为正 */
    if (progress >= 0.98) finishDrag();
  }

  function onPointerUp(e) {
    if (!dragging || e.pointerId !== activePointerId) return;
    dragging = false;
    activePointerId = null;
    if (progress >= BlindBox.RULES.TEAR_COMPLETE_RATIO) finishDrag();
    else springBack();
  }

  function onPointerCancel(e) {
    if (!dragging || e.pointerId !== activePointerId) return;
    dragging = false;
    activePointerId = null;
    springBack(); /* pointercancel 一律回弹（B-24） */
  }

  /* ---------- Touch 降级手势 ---------- */

  function findTouch(list, id) {
    for (var i = 0; i < list.length; i++) {
      if (list[i].identifier === id) return list[i];
    }
    return null;
  }

  function onTouchStart(e) {
    if (!active || completed || dragging) return;
    var t = e.changedTouches[0];
    activePointerId = t.identifier;
    startX = t.clientX;
    dragging = true;
    strip.classList.add('strip-active');
    e.preventDefault();
  }

  function onTouchMove(e) {
    if (!dragging) return;
    var t = findTouch(e.changedTouches, activePointerId);
    if (!t) return;
    setProgress((t.clientX - startX) / trackLen); /* 向右拉为正 */
    if (progress >= 0.98) finishDrag();
  }

  function onTouchEnd(e) { endTouch(e, false); }
  function onTouchCancel(e) { endTouch(e, true); }

  function endTouch(e, cancelled) {
    if (!dragging) return;
    var t = findTouch(e.changedTouches, activePointerId);
    if (!t) return;
    dragging = false;
    activePointerId = null;
    if (!cancelled && progress >= BlindBox.RULES.TEAR_COMPLETE_RATIO) finishDrag();
    else springBack();
  }

  /* ---------- 生命周期 ---------- */

  function bindOnce() {
    if (bound) return;
    bound = true;
    overlay = q('tear-overlay');
    boxEl = q('tear-box');
    strip = q('tear-strip');
    pull = q('strip-pull');
    tornEdge = q('torn-edge');
    prizePop = q('prize-pop');
    confettiLayer = q('confetti-layer');
    hint = q('tear-hint');

    if (window.PointerEvent) {
      pull.addEventListener('pointerdown', onPointerDown);
      document.addEventListener('pointermove', onPointerMove);
      document.addEventListener('pointerup', onPointerUp);
      document.addEventListener('pointercancel', onPointerCancel);
    } else {
      pull.addEventListener('touchstart', onTouchStart);
      document.addEventListener('touchmove', onTouchMove);
      document.addEventListener('touchend', onTouchEnd);
      document.addEventListener('touchcancel', onTouchCancel);
    }
  }

  function show(prize) {
    bindOnce();
    currentPrize = prize;
    completed = false;
    dragging = false;
    activePointerId = null;
    if (rafId !== null && window.cancelAnimationFrame) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }

    /* 复位 DOM 到未撕状态 */
    boxEl.classList.remove('box-open');
    boxEl.style.transform = '';
    strip.style.transition = 'none';
    strip.style.opacity = '1';
    strip.classList.remove('strip-active');
    setProgress(0);
    prizePop.className = 'prize-pop';
    prizePop.textContent = '';
    clearConfetti();
    hint.textContent = '按住拉环，轻轻向右撕开';

    overlay.className = 'overlay tear-overlay';
    active = true;

    /* 撕动行程：固定短行程；拉环在左端，右侧空间充足，不会滑出屏幕 */
    trackLen = 110;
  }

  function hideOverlay() {
    active = false;
    overlay.className = 'overlay tear-overlay overlay-hidden';
    boxEl.classList.remove('box-open');
    strip.style.transition = 'none';
    strip.style.opacity = '1';
    setProgress(0);
    prizePop.className = 'prize-pop';
    prizePop.textContent = '';
    clearConfetti();
  }

  BlindBox.tear = {
    show: show
  };
})();
