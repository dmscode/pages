/* =========================================================
 * 模块J：装配入口（最后加载）
 * 依赖：全部模块
 * ========================================================= */
(function () {
  'use strict';
  var BlindBox = window.BlindBox = window.BlindBox || {};

  function onReady(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  var tickerId = null;

  function startTicker() {
    if (tickerId === null) {
      tickerId = setInterval(function () {
        if (BlindBox.state.app.view === 'home') BlindBox.views.renderHome();
      }, 1000);
    }
  }

  function stopTicker() {
    if (tickerId !== null) {
      clearInterval(tickerId);
      tickerId = null;
    }
  }

  function bindEvents() {
    /* 12 个盲盒共用一个委托监听 */
    document.getElementById('box-grid').addEventListener('click', function (e) {
      var cell = e.target && e.target.closest ? e.target.closest('.box-cell') : null;
      if (cell) BlindBox.state.onBoxClick();
    });

    document.getElementById('btn-claim').addEventListener('click', function () {
      BlindBox.state.onClaimClick();
    });

    document.getElementById('btn-shelf').addEventListener('click', function () {
      BlindBox.state.switchView('shelf');
    });

    document.getElementById('btn-back').addEventListener('click', function () {
      BlindBox.state.switchView('home');
    });

    document.getElementById('shelf-tabs').addEventListener('click', function (e) {
      var tab = e.target && e.target.closest ? e.target.closest('.shelf-tab') : null;
      if (!tab) return;
      BlindBox.state.setTab(tab.getAttribute('data-tab'));
    });

    document.getElementById('btn-continue').addEventListener('click', function () {
      if (BlindBox.state.app.machine !== 'RESULT') return;
      BlindBox.views.hideResult();
      BlindBox.state.randomizeCover(); /* 每次抽奖后重新随机封面 */
      BlindBox.state.goto('IDLE');
      BlindBox.views.renderHome();
    });

    /* 隐藏功能：连点金币余额 7 次 → 兑换码输入框（1.5 秒内点满） */
    var taps = 0;
    var tapTimer = null;
    document.getElementById('coin-chip').addEventListener('click', function () {
      if (!BlindBox.state.isIdle()) return;
      taps += 1;
      if (tapTimer) clearTimeout(tapTimer);
      tapTimer = setTimeout(function () { taps = 0; }, 1500);
      if (taps >= 7) {
        taps = 0;
        BlindBox.state.openRedeem();
      }
    });
    document.getElementById('btn-redeem-ok').addEventListener('click', function () {
      BlindBox.state.submitRedeem(document.getElementById('redeem-input').value);
    });
    document.getElementById('redeem-input').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') BlindBox.state.submitRedeem(this.value);
    });
    document.getElementById('btn-redeem-cancel').addEventListener('click', function () {
      BlindBox.state.closeRedeem();
    });

    /* 动画循环/倒计时在页面不可见时暂停，恢复时重算（P11） */
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'hidden') {
        stopTicker();
      } else {
        startTicker();
        BlindBox.state.refreshAfterVisible();
      }
    });
  }

  onReady(function () {
    /* 启动期配置校验：奖池错误立即暴露（T002） */
    try {
      BlindBox.validateConfig();
      BlindBox.lottery.validatePool();
    } catch (e) {
      alert('配置错误：' + e.message);
      return;
    }

    BlindBox.storage.init(Date.now()).then(function (loaded) {
      BlindBox.state.app.save = loaded.save;
      BlindBox.state.randomizeCover(); /* 首次进入随机封面 */

      bindEvents();
      BlindBox.views.showView('home');
      BlindBox.views.renderHome();
      startTicker();

      if (loaded.corrupted) BlindBox.feedback.toast('存档已损坏，已重置为新档');
      /* loaded.fresh 且未损坏 → 新玩家静默初始化 */
    });
  });
})();
