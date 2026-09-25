/* =========================================================
 * 模块C：代币系统
 * 依赖：config.js（RULES）、storage.js（存档结构）
 *
 * 核心原则（D3~D5、D12）：
 *   一切以「当前时间 − 计时基准」的时间戳差值计算，绝不做实时累加；
 *   时间余数保留；饱和领取后基准重置；时间回拨不产生负数。
 * lastClaimAt 一律为 epoch 毫秒数字，禁止字符串日期解析。
 * ========================================================= */
(function () {
  'use strict';
  var BlindBox = window.BlindBox = window.BlindBox || {};

  function isFiniteNumber(n) {
    return typeof n === 'number' && isFinite(n);
  }

  /*
   * 纯函数：本次可领取多少枚 + 下一次计时基准
   * @returns {claimable, nextBase, saturated, clockBack, fresh}
   */
  function computeClaimable(now, lastClaimAt) {
    var rate = BlindBox.RULES.RATE_MS;
    var cap = BlindBox.RULES.POOL_CAP;

    if (!isFiniteNumber(lastClaimAt) || lastClaimAt <= 0) {
      return { claimable: 0, nextBase: now, saturated: false, clockBack: false, fresh: true };
    }
    if (now < lastClaimAt) {
      /* 时间回拨：本次 0 枚，基准不动，等时间追上（D12） */
      return { claimable: 0, nextBase: lastClaimAt, saturated: false, clockBack: true, fresh: false };
    }

    var minutes = Math.floor((now - lastClaimAt) / rate);
    var claimable = Math.min(minutes, cap);
    var saturated = minutes >= cap;
    var nextBase = saturated ? now : lastClaimAt + claimable * rate; /* 余数保留 */
    return { claimable: claimable, nextBase: nextBase, saturated: saturated, clockBack: false, fresh: false };
  }

  /* 主界面展示用：待领取数量 + 下一枚时间点 */
  function pendingInfo(save, now) {
    var res = computeClaimable(now, save.tokenTimer.lastClaimAt);
    var nextCoinAt = null;
    if (res.fresh) {
      nextCoinAt = now + BlindBox.RULES.RATE_MS; /* 新玩家：从现在起计时 */
    } else if (!res.clockBack && !res.saturated) {
      var base = save.tokenTimer.lastClaimAt;
      var minutes = Math.floor((now - base) / BlindBox.RULES.RATE_MS);
      nextCoinAt = base + (minutes + 1) * BlindBox.RULES.RATE_MS;
    }
    return {
      claimable: res.claimable,
      nextCoinAt: nextCoinAt,
      saturated: res.saturated,
      clockBack: res.clockBack,
      fresh: res.fresh
    };
  }

  /* 领取：天然幂等——领取后基准前移，重复调用只会得到 0（T103 防重） */
  function claimPending(save, now) {
    var res = computeClaimable(now, save.tokenTimer.lastClaimAt);
    if (res.claimable <= 0) {
      return { claimed: 0, reason: res.clockBack ? 'clockBack' : 'notEnough' };
    }
    save.tokens.balance += res.claimable;
    save.tokenTimer.lastClaimAt = res.nextBase;
    return { claimed: res.claimable };
  }

  function canOpen(save) {
    return save.tokens.balance >= BlindBox.RULES.BOX_PRICE;
  }

  function remainingForOpen(save) {
    return Math.max(0, BlindBox.RULES.BOX_PRICE - save.tokens.balance);
  }

  /* 消费：调用方必须先 canOpen；内部再校验一次，不足直接拒绝且不改动数据（T104） */
  function spendForOpen(save) {
    if (!canOpen(save)) return false;
    save.tokens.balance -= BlindBox.RULES.BOX_PRICE;
    return true;
  }

  /* =========================================================
   * 兑换码（隐藏功能）：严格匹配（区分大小写、去首尾空格），整份存档限一次。
   * 返回 {ok:true, tokens} 或 {ok:false, reason:'empty'|'invalid'|'used'}
   * ========================================================= */
  function redeemCode(save, input) {
    var code = String(input == null ? '' : input).trim();
    if (!code) return { ok: false, reason: 'empty' };

    var codes = BlindBox.REDEEM_CODES || [];
    var hit = null;
    for (var i = 0; i < codes.length; i++) {
      if (codes[i].code === code) { hit = codes[i]; break; }
    }
    if (!hit) return { ok: false, reason: 'invalid' };
    if (save.redeemed && save.redeemed[hit.code]) return { ok: false, reason: 'used' };

    if (!save.redeemed) save.redeemed = {};
    save.redeemed[hit.code] = 1;
    save.tokens.balance += hit.tokens;
    return { ok: true, tokens: hit.tokens };
  }

  BlindBox.tokens = {
    computeClaimable: computeClaimable,
    pendingInfo: pendingInfo,
    claimPending: claimPending,
    canOpen: canOpen,
    remainingForOpen: remainingForOpen,
    spendForOpen: spendForOpen,
    redeemCode: redeemCode
  };
})();
