/* =========================================================
 * 模块D：随机系统
 * 依赖：config.js（PRIZES / totalWeight）
 *
 * 权重随机采用「累计区间 + 单点落区间」（D6）：
 *   先把全池建成累计权重表，一次掷点命中区间，绝不逐个 if 判断。
 * ========================================================= */
(function () {
  'use strict';
  var BlindBox = window.BlindBox = window.BlindBox || {};

  var cumulative = null; /* [{id, end}]，end 为累计权重上界，末项 = 1000 */

  function buildTable() {
    var table = [];
    var acc = 0;
    var prizes = BlindBox.PRIZES;
    for (var i = 0; i < prizes.length; i++) {
      acc += prizes[i].weight;
      table.push({ id: prizes[i].id, end: acc });
    }
    cumulative = table;
    return table;
  }

  /* 概率合法性检查（T105）：可对运行奖池或测试注入的临时奖池调用 */
  function validatePool() {
    var prizes = BlindBox.PRIZES;
    var sum = 0;
    var seen = {};
    for (var i = 0; i < prizes.length; i++) {
      var p = prizes[i];
      if (seen[p.id]) throw new Error('奖品 ID 重复: ' + p.id);
      seen[p.id] = true;
      if (typeof p.weight !== 'number' || !(p.weight > 0)) {
        throw new Error('权重必须为正数: ' + p.id);
      }
      sum += p.weight;
    }
    if (sum !== 1000) throw new Error('权重合计必须为 1000，当前 ' + sum);
    buildTable();
    return true;
  }

  /*
   * 掷点抽取：point ∈ [0, 1000)，落在哪个累计区间就中哪个奖品。
   * @param rng 可注入随机源（测试用），默认 Math.random
   */
  function rollPrizeId(rng) {
    var random = typeof rng === 'function' ? rng : Math.random;
    if (!cumulative) buildTable();
    var point = Math.floor(random() * 1000);
    if (point < 0) point = 0;
    if (point > 999) point = 999;
    for (var i = 0; i < cumulative.length; i++) {
      if (point < cumulative[i].end) return cumulative[i].id;
    }
    return cumulative[cumulative.length - 1].id;
  }

  BlindBox.lottery = {
    buildTable: buildTable,
    validatePool: validatePool,
    rollPrizeId: rollPrizeId
  };
})();
