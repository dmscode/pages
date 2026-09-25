/* =========================================================
 * 模块G：反馈系统 —— toast / 浮动文字
 * 依赖：无（仅 DOM）
 * 全部 DOM 由 createElement + textContent 构建，不经 innerHTML。
 * ========================================================= */
(function () {
  'use strict';
  var BlindBox = window.BlindBox = window.BlindBox || {};

  function getToastContainer() {
    return document.getElementById('toast-container');
  }

  function toast(msg) {
    var box = getToastContainer();
    if (!box) return;
    var el = document.createElement('div');
    el.className = 'toast';
    el.textContent = msg;
    box.appendChild(el);
    void el.offsetWidth; /* 强制 reflow，保证过渡生效 */
    el.className = 'toast toast-show';
    setTimeout(function () {
      el.className = 'toast';
      setTimeout(function () {
        if (el.parentNode) el.parentNode.removeChild(el);
      }, 300);
    }, 1800);
  }

  /* 从锚点元素上方浮起并消散（+N 提示） */
  function floatText(anchorEl, text) {
    if (!anchorEl) return;
    var rect = anchorEl.getBoundingClientRect();
    var el = document.createElement('div');
    el.className = 'float-tip';
    el.textContent = text;
    el.style.left = (rect.left + rect.width / 2) + 'px';
    el.style.top = rect.top + 'px';
    document.body.appendChild(el);
    setTimeout(function () { el.className = 'float-tip float-tip-go'; }, 20);
    setTimeout(function () {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, 900);
  }

  BlindBox.feedback = {
    toast: toast,
    floatText: floatText
  };
})();
