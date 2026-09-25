/* =========================================================
 * 模块F：界面状态机 + 事务编排 + 视图路由
 * 依赖：config/storage/tokens/lottery/collection/feedback/tear（运行时）
 *
 * 状态机（《计划树.md》§6.3）：
 *   IDLE → SELECTING → TEARING → OPENING → REVEAL → RESULT → IDLE
 * 非法迁移一律忽略并告警，从根上杜绝「双击开两盒」。
 *
 * 开盒事务（D13，§6.1）：
 *   校验 → 扣费 → 随机 → 收藏 → 持久化(带超时) → 撕条动画
 *   持久化完成前不出现任何动画元素。
 * ========================================================= */
(function () {
  'use strict';
  var BlindBox = window.BlindBox = window.BlindBox || {};

  var STATES = {
    IDLE: 'IDLE',
    SELECTING: 'SELECTING',
    TEARING: 'TEARING',
    OPENING: 'OPENING',
    REVEAL: 'REVEAL',
    RESULT: 'RESULT'
  };

  var TRANSITIONS = {
    IDLE: ['SELECTING'],
    SELECTING: ['TEARING'],
    TEARING: ['OPENING'],
    OPENING: ['REVEAL'],
    REVEAL: ['RESULT'],
    RESULT: ['IDLE']
  };

  var app = {
    save: null,
    machine: STATES.IDLE,
    view: 'home',      /* 'home' | 'shelf' */
    currentTab: 'ALL',
    coverIndex: 0      /* 当前盲盒封面在 COVERS 中的下标 */
  };

  /* 每次抽奖随机选取一张封面：全部盲盒共用这一张 */
  function randomizeCover() {
    var covers = BlindBox.COVERS;
    if (covers && covers.length) {
      app.coverIndex = Math.floor(Math.random() * covers.length);
    }
  }

  function goto(next) {
    var allowed = TRANSITIONS[app.machine] || [];
    if (allowed.indexOf(next) === -1) {
      if (window.console && console.warn) {
        console.warn('state: 非法迁移 ' + app.machine + ' -> ' + next);
      }
      return false;
    }
    app.machine = next;
    return true;
  }

  function isIdle() {
    return app.machine === STATES.IDLE;
  }

  /* ---------- 开盒（含事务） ---------- */

  function onBoxClick() {
    if (!isIdle()) return; /* 动画/结果期间忽略一切开盒点击 */
    var save = app.save;

    if (!BlindBox.tokens.canOpen(save)) {
      BlindBox.feedback.toast('还差 ' + BlindBox.tokens.remainingForOpen(save) + ' 枚代币');
      BlindBox.views.pulseBoxStatus();
      return;
    }

    if (!goto('SELECTING')) return;

    /* —— 事务：内存变更全部完成后才允许进入动画 —— */
    BlindBox.tokens.spendForOpen(save);
    var prizeId = BlindBox.lottery.rollPrizeId();
    BlindBox.collection.addPrize(save, prizeId);
    save.statistics.totalOpenCount += 1;
    var prize = BlindBox.findPrize(prizeId);

    /* 集齐系列奖励：一次性 +66（决策表扩展，见 config.js SERIES_BONUS） */
    var bonusSeries = null;
    if (BlindBox.collection.seriesJustCompleted(save, prize.seriesId)) {
      save.seriesBonus[prize.seriesId] = 1;
      save.tokens.balance += BlindBox.RULES.SERIES_BONUS;
      bonusSeries = prize.seriesId;
    }

    BlindBox.views.renderHome(); /* 数字先行（数据展示，非动画） */

    BlindBox.storage.persistSaveSafe(save).then(function () {
      /* 无论成败（失败已置 degraded 并提示），内存态都是正确且唯一事实 */
      if (bonusSeries) {
        var series = BlindBox.findSeries(bonusSeries);
        BlindBox.feedback.toast('集齐「' + series.name + '」！奖励 ' + BlindBox.RULES.SERIES_BONUS + ' 代币');
      }
      BlindBox.tear.show(prize);
      goto('TEARING');
      BlindBox.views.renderHome();
    });
  }

  /* ---------- 领取代币 ---------- */

  function onClaimClick() {
    if (!isIdle()) return;
    var res = BlindBox.tokens.claimPending(app.save, Date.now());
    if (res.claimed <= 0) {
      if (res.reason === 'clockBack') BlindBox.feedback.toast('设备时间异常，暂时无法领取');
      else BlindBox.feedback.toast('还没有攒够 10 分钟哦');
      return;
    }
    BlindBox.feedback.floatText(document.getElementById('btn-claim'), '+' + res.claimed + ' 🪙');
    BlindBox.views.renderHome();
    BlindBox.storage.persistSaveSafe(app.save);
  }

  /* ---------- 视图路由 ---------- */

  function switchView(view) {
    app.view = view;
    if (view === 'shelf') BlindBox.views.renderShelf();
    else BlindBox.views.renderHome();
    BlindBox.views.showView(view);
  }

  function setTab(tabId) {
    app.currentTab = tabId;
    BlindBox.views.renderShelf();
  }

  /* visibilitychange 恢复：时间可能已前进，重算待领取 */
  function refreshAfterVisible() {
    if (app.view === 'home') BlindBox.views.renderHome();
    else BlindBox.views.renderShelf();
  }

  /* ---------- 兑换码（隐藏功能，连点金币 7 次触发） ---------- */

  function openRedeem() {
    if (!isIdle()) return;
    app.redeemOpen = true;
    BlindBox.views.showRedeem();
  }

  function closeRedeem() {
    app.redeemOpen = false;
    BlindBox.views.hideRedeem();
  }

  function submitRedeem(value) {
    var res = BlindBox.tokens.redeemCode(app.save, value);
    if (res.ok) {
      closeRedeem();
      BlindBox.views.renderHome();
      BlindBox.feedback.toast('兑换成功，+' + res.tokens + ' 代币');
      BlindBox.storage.persistSaveSafe(app.save);
    } else if (res.reason === 'used') {
      BlindBox.feedback.toast('该兑换码已被使用');
    } else {
      BlindBox.feedback.toast('兑换码无效，请检查后重试');
    }
    return res.ok;
  }

  BlindBox.state = {
    app: app,
    STATES: STATES,
    goto: goto,
    isIdle: isIdle,
    randomizeCover: randomizeCover,
    openRedeem: openRedeem,
    closeRedeem: closeRedeem,
    submitRedeem: submitRedeem,
    onBoxClick: onBoxClick,
    onClaimClick: onClaimClick,
    switchView: switchView,
    setTab: setTab,
    refreshAfterVisible: refreshAfterVisible
  };
})();
