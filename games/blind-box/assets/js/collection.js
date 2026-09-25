/* =========================================================
 * 模块E：收藏系统
 * 依赖：config.js（PRIZES / findPrize）
 * 排序按配置预设顺序固定排列（D9）；只存获得过的奖品。
 * ========================================================= */
(function () {
  'use strict';
  var BlindBox = window.BlindBox = window.BlindBox || {};

  function addPrize(save, prizeId) {
    if (!BlindBox.findPrize(prizeId)) return false;
    if (!save.collection[prizeId]) save.collection[prizeId] = 0;
    save.collection[prizeId] += 1;
    return true;
  }

  function countOf(save, prizeId) {
    return save.collection[prizeId] || 0;
  }

  /* [{prize, count}]，按配置顺序 */
  function orderedList(save) {
    var out = [];
    var prizes = BlindBox.PRIZES;
    for (var i = 0; i < prizes.length; i++) {
      var cnt = save.collection[prizes[i].id];
      if (cnt > 0) out.push({ prize: prizes[i], count: cnt });
    }
    return out;
  }

  function listBySeries(save, seriesId) {
    var out = [];
    var prizes = BlindBox.PRIZES;
    for (var i = 0; i < prizes.length; i++) {
      if (prizes[i].seriesId !== seriesId) continue;
      var cnt = save.collection[prizes[i].id];
      if (cnt > 0) out.push({ prize: prizes[i], count: cnt });
    }
    return out;
  }

  function totalOwned(save) {
    var total = 0;
    for (var key in save.collection) {
      if (Object.prototype.hasOwnProperty.call(save.collection, key)) {
        total += save.collection[key];
      }
    }
    return total;
  }

  /* 集齐判定：该系列全部奖品均已获得，且集齐奖励尚未发放过 */
  function seriesJustCompleted(save, seriesId) {
    if (!BlindBox.findSeries(seriesId)) return false;
    if (save.seriesBonus && save.seriesBonus[seriesId]) return false;
    var prizes = BlindBox.PRIZES;
    for (var i = 0; i < prizes.length; i++) {
      if (prizes[i].seriesId === seriesId && !(save.collection[prizes[i].id] > 0)) {
        return false;
      }
    }
    return true;
  }

  BlindBox.collection = {
    addPrize: addPrize,
    countOf: countOf,
    orderedList: orderedList,
    listBySeries: listBySeries,
    totalOwned: totalOwned,
    seriesJustCompleted: seriesJustCompleted
  };
})();
