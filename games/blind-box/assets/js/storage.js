/* =========================================================
 * 模块B：本地存档适配层
 * 依赖：config.js（RULES / findPrize）
 *
 * 架构（《计划树.md》§1 P6 / §4 / 附录 B-1）：
 *   容器 Storage API（window.xhs.miniTool，客户端 9.46+）优先；
 *   localStorage 仅作低版本/无容器回退（容器不保证其持久）；
 *   读写失败一律容忍（返回 false / 默认存档），绝不抛出中断游戏；
 *   persistSave 经串行写队列，防止异步乱序覆盖。
 * ========================================================= */
(function () {
  'use strict';
  var BlindBox = window.BlindBox = window.BlindBox || {};

  var SAVE_KEY = 'blindbox.save.v1';
  var SAVE_VERSION = 1;
  var STORAGE_MIN_CLIENT_VERSION = 9460;

  /* mode: 'container' | 'local' | 'unavailable'；degraded: 最近一次写入是否失败 */
  var env = { mode: 'unknown', clientVersion: 0, degraded: false };

  var writeChain = Promise.resolve();

  function isFiniteNumber(n) {
    return typeof n === 'number' && isFinite(n);
  }

  /* 数字被改成字符串等脏数据：能救则救（T403） */
  function toNonNegativeInt(v, fallback) {
    if (typeof v === 'number' && isFinite(v)) {
      var ni = Math.floor(v);
      if (ni >= 0) return ni;
      return fallback;
    }
    if (typeof v === 'string' && v !== '' && isFinite(Number(v))) {
      var ns = Math.floor(Number(v));
      if (ns >= 0) return ns;
    }
    return fallback;
  }

  function getClientVersion(buildVersion) {
    /* 末 3 位是编译序号，版本比较需忽略（js-api.md） */
    return Math.floor((Number(buildVersion) || 0) / 1000);
  }

  function readSyncBuildVersion() {
    var xhs = window.xhs;
    var lo = xhs && xhs.launchOptions;
    var me = lo && lo.miniToolEnv;
    var v = me ? Number(me.buildVersion) : 0;
    return v > 0 ? v : 0;
  }

  function probeLocalStorage() {
    try {
      var k = '__bb_probe__';
      window.localStorage.setItem(k, '1');
      window.localStorage.removeItem(k);
      return true;
    } catch (e) {
      return false;
    }
  }

  function hasContainerStorageApi(miniTool) {
    return !!miniTool &&
      typeof miniTool.setStorage === 'function' &&
      typeof miniTool.getStorage === 'function';
  }

  function markLocal() {
    env.mode = probeLocalStorage() ? 'local' : 'unavailable';
    return env;
  }

  /* 同步 launchOptions 优先，取不到再异步 getLaunchOptions，仍取不到视为不支持 */
  function detectEnvironment() {
    var xhs = window.xhs;
    var miniTool = xhs && xhs.miniTool;
    var syncV = readSyncBuildVersion();

    if (syncV && getClientVersion(syncV) >= STORAGE_MIN_CLIENT_VERSION && hasContainerStorageApi(miniTool)) {
      env.mode = 'container';
      env.clientVersion = getClientVersion(syncV);
      return Promise.resolve(env);
    }

    if (miniTool && typeof miniTool.getLaunchOptions === 'function') {
      return miniTool.getLaunchOptions().then(function (lo) {
        var me = lo && lo.miniToolEnv;
        var v = me ? Number(me.buildVersion) : 0;
        if (v && getClientVersion(v) >= STORAGE_MIN_CLIENT_VERSION && hasContainerStorageApi(miniTool)) {
          env.mode = 'container';
          env.clientVersion = getClientVersion(v);
        } else {
          markLocal();
        }
        return env;
      }, function () {
        markLocal();
        return env;
      });
    }

    markLocal();
    return Promise.resolve(env);
  }

  function createDefaultSave(now) {
    return {
      version: SAVE_VERSION,
      tokens: { balance: BlindBox.RULES.INITIAL_TOKENS }, /* 新玩家初始代币 */
      tokenTimer: { lastClaimAt: now },
      collection: {},
      statistics: { totalOpenCount: 0 },
      redeemed: {},   /* 已使用的兑换码（彩蛋），key=兑换码原文 */
      seriesBonus: {} /* 已发放集齐奖励的系列，key=系列 ID */
    };
  }

  /* 存档校验与修复（《计划树.md》§4 六条规则） */
  function sanitizeSave(raw, now) {
    var result = { save: null, corrupted: false, changed: false, fresh: false };
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
      result.corrupted = true;
      return result;
    }

    var save = createDefaultSave(now);
    var changed = false;

    var rawBalance = raw.tokens ? raw.tokens.balance : undefined;
    var balance = toNonNegativeInt(rawBalance, 0);
    if (balance !== rawBalance) changed = true;
    save.tokens.balance = balance;

    var lca = raw.tokenTimer ? raw.tokenTimer.lastClaimAt : undefined;
    if (!isFiniteNumber(lca) || lca <= 0) {
      save.tokenTimer.lastClaimAt = now;
      changed = true;
    } else {
      save.tokenTimer.lastClaimAt = lca;
    }

    var col = raw.collection;
    if (col && typeof col === 'object' && !Array.isArray(col)) {
      for (var key in col) {
        if (!Object.prototype.hasOwnProperty.call(col, key)) continue;
        if (!BlindBox.findPrize(key)) { changed = true; continue; } /* 未知奖品 ID → 忽略 */
        var cnt = toNonNegativeInt(col[key], 0);
        if (cnt !== col[key]) changed = true;
        if (cnt > 0) save.collection[key] = cnt;
      }
    } else if (col != null) {
      changed = true;
    }

    var rawToc = raw.statistics ? raw.statistics.totalOpenCount : undefined;
    var toc = toNonNegativeInt(rawToc, 0);
    if (toc !== rawToc) changed = true;
    save.statistics.totalOpenCount = toc;

    /* 已用兑换码：键为码原文 */
    var rd = raw.redeemed;
    if (rd && typeof rd === 'object' && !Array.isArray(rd)) {
      for (var k1 in rd) {
        if (Object.prototype.hasOwnProperty.call(rd, k1) && k1) save.redeemed[k1] = 1;
      }
    } else if (rd != null) {
      changed = true;
    }

    /* 集齐奖励：只保留已知系列 ID */
    var sb = raw.seriesBonus;
    if (sb && typeof sb === 'object' && !Array.isArray(sb)) {
      for (var k2 in sb) {
        if (!Object.prototype.hasOwnProperty.call(sb, k2)) continue;
        if (BlindBox.findSeries(k2)) save.seriesBonus[k2] = 1;
        else changed = true;
      }
    } else if (sb != null) {
      changed = true;
    }

    if (raw.version !== SAVE_VERSION) changed = true; /* 未来版本迁移入口；当前统一归位 v1 */

    result.save = save;
    result.changed = changed;
    return result;
  }

  function containerRead() {
    var miniTool = window.xhs && window.xhs.miniTool;
    return miniTool.getStorage({ key: SAVE_KEY }).then(function (res) {
      return res && typeof res.data === 'string' ? res.data : null;
    });
  }

  function localRead() {
    try {
      return Promise.resolve(window.localStorage.getItem(SAVE_KEY));
    } catch (e) {
      return Promise.reject(e);
    }
  }

  function loadSave(now) {
    var reading;
    if (env.mode === 'container') reading = containerRead();
    else if (env.mode === 'local') reading = localRead();
    else reading = Promise.reject(new Error('storage unavailable'));

    return reading.then(function (raw) {
      if (raw == null || raw === '') {
        return { save: createDefaultSave(now), corrupted: false, changed: false, fresh: true };
      }
      var parsed;
      try {
        parsed = JSON.parse(raw);
      } catch (e) {
        return { save: createDefaultSave(now), corrupted: true, changed: false, fresh: true };
      }
      var s = sanitizeSave(parsed, now);
      if (s.corrupted) s.save = createDefaultSave(now);
      s.fresh = !!s.corrupted;
      return s;
    }, function () {
      /* 读失败：内存新档继续玩，并标记降级（数据可能仍在，写回成功即可恢复） */
      env.degraded = true;
      return { save: createDefaultSave(now), corrupted: false, changed: false, fresh: true };
    });
  }

  function containerWrite(payload) {
    var miniTool = window.xhs && window.xhs.miniTool;
    return miniTool.setStorage({ key: SAVE_KEY, data: payload }).then(function () {
      return true;
    }, function () {
      return false;
    });
  }

  function localWrite(payload) {
    try {
      window.localStorage.setItem(SAVE_KEY, payload);
      return Promise.resolve(true);
    } catch (e) {
      return Promise.resolve(false);
    }
  }

  function writeOnce(payload) {
    if (env.mode === 'container') return containerWrite(payload);
    if (env.mode === 'local') return localWrite(payload);
    return Promise.resolve(false);
  }

  /* 串行写队列：连续多次 persist 按调用顺序落盘，杜绝旧数据覆盖新数据 */
  function persistSave(save) {
    var payload;
    try {
      payload = JSON.stringify(save);
    } catch (e) {
      return Promise.resolve(false);
    }
    var run = function () {
      return writeOnce(payload).then(function (ok) {
        env.degraded = !ok;
        return ok;
      });
    };
    writeChain = writeChain.then(run, run);
    return writeChain;
  }

  /* 带超时保护：超时按失败处理（调用方降级提示），写入继续在后台尝试 */
  function persistSaveSafe(save) {
    return Promise.race([
      persistSave(save),
      new Promise(function (resolve) {
        setTimeout(function () { resolve(false); }, BlindBox.RULES.PERSIST_TIMEOUT_MS);
      })
    ]);
  }

  function init(now) {
    return detectEnvironment().then(function () {
      return loadSave(now);
    });
  }

  BlindBox.storage = {
    env: env,
    SAVE_KEY: SAVE_KEY,
    SAVE_VERSION: SAVE_VERSION,
    STORAGE_MIN_CLIENT_VERSION: STORAGE_MIN_CLIENT_VERSION,
    getClientVersion: getClientVersion,
    detectEnvironment: detectEnvironment,
    createDefaultSave: createDefaultSave,
    sanitizeSave: sanitizeSave,
    loadSave: loadSave,
    persistSave: persistSave,
    persistSaveSafe: persistSaveSafe,
    init: init
  };
})();
