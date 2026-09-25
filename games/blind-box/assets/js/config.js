/* =========================================================
 * 模块A：游戏配置 —— 规则常量 / 系列 / 奖池 / 启动校验
 * 依赖：无（加载顺序第 1）
 * 原则：游戏规则只出现在这里，不散落在界面代码里。
 *
 * 奖池来源：用户提供的奖品图（奖品图.png，6 系列 × 12，2026-09-25 切图），
 * 与《计划树.md》§3 初版规划不同——实际以本文件为准。
 * 图片：game/assets/img/{ID}.webp；visual 指向 ./ 相对路径时渲染为图片。
 *
 * 权重设计：普通 10（1%）、稀有 20（2%）、超稀有 26（2.6%）；
 * 4 个招牌普通奖品（A02/B03/D01/F02）+1 凑整，全池合计 1000。
 * ========================================================= */
(function () {
  'use strict';
  var BlindBox = window.BlindBox = window.BlindBox || {};

  /* 规则定稿见《计划树.md》§2 决策表 */
  var RULES = {
    BOX_COUNT: 20,            // 主界面盲盒数量（4×5；纯视觉选择，概率一致；调这里即可增减行数）
    BOX_PRICE: 12,            // 开盒消耗代币
    INITIAL_TOKENS: 24,       // 新玩家初始代币（约可试抽两次）
    RATE_MS: 10 * 60 * 1000,  // 10 分钟 = 1 枚
    POOL_CAP: 10,             // 待领取池上限；饱和领取后计时基准重置
    PERSIST_TIMEOUT_MS: 500,  // 持久化等待上限；超时按「可能未保存」降级，不阻塞动画
    TEAR_COMPLETE_RATIO: 0.7, // 撕条进度阈值：松手时达到即自动完成
    SERIES_BONUS: 66          // 集齐一个系列的一次性奖励代币
  };

  /* 隐藏功能：兑换码（连点金币余额 7 次打开输入框）。
     每个码整份存档只能使用一次；码明文存于包内，属彩蛋性质，不做防作弊（D11）。 */
  var REDEEM_CODES = [
    { code: '超级无敌旋风霹雳可爱稻米鼠', tokens: 200 },
    { code: 'Super_Super_LOVELY_Dao_Mouse', tokens: 1000 },
    { code: '稻米鼠的神秘粮仓', tokens: 200 },
    { code: '盲盒小铺开业快乐', tokens: 200 },
    { code: '谢谢你玩我的小铺鸭', tokens: 200 },
    { code: '今天也要开心拆盒鸭', tokens: 200 },
    { code: '隐藏款在向你招手', tokens: 200 }
  ];

  /* 盲盒封面：展示的全部盲盒共用随机选取的一张（每次抽奖后重新随机） */
  var COVERS = [
    './assets/img/covers/cover-1.webp',
    './assets/img/covers/cover-2.webp',
    './assets/img/covers/cover-3.webp',
    './assets/img/covers/cover-4.webp',
    './assets/img/covers/cover-5.webp',
    './assets/img/covers/cover-6.webp',
    './assets/img/covers/cover-7.webp',
    './assets/img/covers/cover-8.webp'
  ];

  var RARITY = {
    common: { id: 'common', name: '普通', cls: 'rarity-common' },
    rare:   { id: 'rare',   name: '稀有', cls: 'rarity-rare' },
    epic:   { id: 'epic',   name: '超稀有', cls: 'rarity-epic' }
  };

  var SERIES = [
    { id: 'A', name: '咖啡系列', icon: '☕' },
    { id: 'B', name: '旅行系列', icon: '🧳' },
    { id: 'C', name: '黑金典藏', icon: '👑' },
    { id: 'D', name: '萌宠系列', icon: '🐾' },
    { id: 'E', name: '露营系列', icon: '⛺' },
    { id: 'F', name: '魔法系列', icon: '🔮' }
  ];

  /* weight 为整数权重（0.1% = 1），全池合计必须 = 1000（见 validateConfig）
     每系列 11 个常规 + 1 个发光隐藏款（超稀有）；增删奖品只改本表。 */
  var PRIZES = [
    { id: 'A01', seriesId: 'A', name: '小熊咖啡师', visual: './assets/img/A01.webp', rarity: 'common', weight: 10 },
    { id: 'A02', seriesId: 'A', name: '招牌拿铁', visual: './assets/img/A02.webp', rarity: 'common', weight: 11 },
    { id: 'A03', seriesId: 'A', name: '雪顶咖啡', visual: './assets/img/A03.webp', rarity: 'common', weight: 10 },
    { id: 'A04', seriesId: 'A', name: '复古磨豆机', visual: './assets/img/A04.webp', rarity: 'rare', weight: 20 },
    { id: 'A05', seriesId: 'A', name: '可颂小熊', visual: './assets/img/A05.webp', rarity: 'common', weight: 10 },
    { id: 'A06', seriesId: 'A', name: '咖啡豆先生', visual: './assets/img/A06.webp', rarity: 'common', weight: 10 },
    { id: 'A07', seriesId: 'A', name: '手冲咖啡壶', visual: './assets/img/A07.webp', rarity: 'common', weight: 10 },
    { id: 'A08', seriesId: 'A', name: '咖啡小推车', visual: './assets/img/A08.webp', rarity: 'rare', weight: 20 },
    { id: 'A09', seriesId: 'A', name: '冰淇淋咖啡', visual: './assets/img/A09.webp', rarity: 'common', weight: 10 },
    { id: 'A10', seriesId: 'A', name: '焦糖果露', visual: './assets/img/A10.webp', rarity: 'common', weight: 10 },
    { id: 'A11', seriesId: 'A', name: '猫猫拿铁', visual: './assets/img/A11.webp', rarity: 'rare', weight: 20 },
    { id: 'A12', seriesId: 'A', name: '鎏金皇冠拿铁（隐藏款）', visual: './assets/img/A12.webp', rarity: 'epic', weight: 26 },

    { id: 'B01', seriesId: 'B', name: '环球小熊', visual: './assets/img/B01.webp', rarity: 'common', weight: 10 },
    { id: 'B02', seriesId: 'B', name: '玩具小飞机', visual: './assets/img/B02.webp', rarity: 'common', weight: 10 },
    { id: 'B03', seriesId: 'B', name: '复古旅行箱', visual: './assets/img/B03.webp', rarity: 'common', weight: 11 },
    { id: 'B04', seriesId: 'B', name: '小小地球仪', visual: './assets/img/B04.webp', rarity: 'common', weight: 10 },
    { id: 'B05', seriesId: 'B', name: '胶片相机', visual: './assets/img/B05.webp', rarity: 'rare', weight: 20 },
    { id: 'B06', seriesId: 'B', name: '指路牌', visual: './assets/img/B06.webp', rarity: 'common', weight: 10 },
    { id: 'B07', seriesId: 'B', name: '露营巴士', visual: './assets/img/B07.webp', rarity: 'rare', weight: 20 },
    { id: 'B08', seriesId: 'B', name: '护照与机票', visual: './assets/img/B08.webp', rarity: 'common', weight: 10 },
    { id: 'B09', seriesId: 'B', name: '地图与罗盘', visual: './assets/img/B09.webp', rarity: 'common', weight: 10 },
    { id: 'B10', seriesId: 'B', name: '草帽墨镜', visual: './assets/img/B10.webp', rarity: 'common', weight: 10 },
    { id: 'B11', seriesId: 'B', name: '小帆船', visual: './assets/img/B11.webp', rarity: 'rare', weight: 20 },
    { id: 'B12', seriesId: 'B', name: '环球水晶球（隐藏款）', visual: './assets/img/B12.webp', rarity: 'epic', weight: 26 },

    { id: 'C01', seriesId: 'C', name: '绅士黑猫', visual: './assets/img/C01.webp', rarity: 'rare', weight: 20 },
    { id: 'C02', seriesId: 'C', name: '黑金王冠', visual: './assets/img/C02.webp', rarity: 'common', weight: 10 },
    { id: 'C03', seriesId: 'C', name: '黑金礼盒', visual: './assets/img/C03.webp', rarity: 'common', weight: 10 },
    { id: 'C04', seriesId: 'C', name: '白玫瑰', visual: './assets/img/C04.webp', rarity: 'common', weight: 10 },
    { id: 'C05', seriesId: 'C', name: '珍珠天鹅', visual: './assets/img/C05.webp', rarity: 'rare', weight: 20 },
    { id: 'C06', seriesId: 'C', name: '星月摆件', visual: './assets/img/C06.webp', rarity: 'common', weight: 10 },
    { id: 'C07', seriesId: 'C', name: '钻石之王', visual: './assets/img/C07.webp', rarity: 'rare', weight: 20 },
    { id: 'C08', seriesId: 'C', name: '黑金棋王', visual: './assets/img/C08.webp', rarity: 'common', weight: 10 },
    { id: 'C09', seriesId: 'C', name: '白玫瑰花桶', visual: './assets/img/C09.webp', rarity: 'common', weight: 10 },
    { id: 'C10', seriesId: 'C', name: '黑金沙漏', visual: './assets/img/C10.webp', rarity: 'common', weight: 10 },
    { id: 'C11', seriesId: 'C', name: '星环仪', visual: './assets/img/C11.webp', rarity: 'common', weight: 10 },
    { id: 'C12', seriesId: 'C', name: '鎏金水晶球（隐藏款）', visual: './assets/img/C12.webp', rarity: 'epic', weight: 26 },

    { id: 'D01', seriesId: 'D', name: '元气柯基', visual: './assets/img/D01.webp', rarity: 'common', weight: 11 },
    { id: 'D02', seriesId: 'D', name: '奶猫', visual: './assets/img/D02.webp', rarity: 'common', weight: 10 },
    { id: 'D03', seriesId: 'D', name: '猫爪糖果', visual: './assets/img/D03.webp', rarity: 'common', weight: 10 },
    { id: 'D04', seriesId: 'D', name: '胡萝卜兔', visual: './assets/img/D04.webp', rarity: 'common', weight: 10 },
    { id: 'D05', seriesId: 'D', name: '瓜子仓鼠', visual: './assets/img/D05.webp', rarity: 'common', weight: 10 },
    { id: 'D06', seriesId: 'D', name: '碗碗猫', visual: './assets/img/D06.webp', rarity: 'rare', weight: 20 },
    { id: 'D07', seriesId: 'D', name: '小鹦鹉', visual: './assets/img/D07.webp', rarity: 'rare', weight: 20 },
    { id: 'D08', seriesId: 'D', name: '金鱼缸', visual: './assets/img/D08.webp', rarity: 'common', weight: 10 },
    { id: 'D09', seriesId: 'D', name: '小狗屋', visual: './assets/img/D09.webp', rarity: 'common', weight: 10 },
    { id: 'D10', seriesId: 'D', name: '粉粉书包', visual: './assets/img/D10.webp', rarity: 'common', weight: 10 },
    { id: 'D11', seriesId: 'D', name: '猫爬架', visual: './assets/img/D11.webp', rarity: 'rare', weight: 20 },
    { id: 'D12', seriesId: 'D', name: '樱花猫水晶球（隐藏款）', visual: './assets/img/D12.webp', rarity: 'epic', weight: 26 },

    { id: 'E01', seriesId: 'E', name: '童子军小熊', visual: './assets/img/E01.webp', rarity: 'common', weight: 10 },
    { id: 'E02', seriesId: 'E', name: '小帐篷', visual: './assets/img/E02.webp', rarity: 'common', weight: 10 },
    { id: 'E03', seriesId: 'E', name: '篝火', visual: './assets/img/E03.webp', rarity: 'common', weight: 10 },
    { id: 'E04', seriesId: 'E', name: '露营行囊', visual: './assets/img/E04.webp', rarity: 'common', weight: 10 },
    { id: 'E05', seriesId: 'E', name: '复古提灯', visual: './assets/img/E05.webp', rarity: 'rare', weight: 20 },
    { id: 'E06', seriesId: 'E', name: '折叠椅', visual: './assets/img/E06.webp', rarity: 'common', weight: 10 },
    { id: 'E07', seriesId: 'E', name: '尤克里里', visual: './assets/img/E07.webp', rarity: 'rare', weight: 20 },
    { id: 'E08', seriesId: 'E', name: '露营汤锅', visual: './assets/img/E08.webp', rarity: 'common', weight: 10 },
    { id: 'E09', seriesId: 'E', name: '保温壶', visual: './assets/img/E09.webp', rarity: 'common', weight: 10 },
    { id: 'E10', seriesId: 'E', name: '松鼠树桩', visual: './assets/img/E10.webp', rarity: 'rare', weight: 20 },
    { id: 'E11', seriesId: 'E', name: '藏宝图罗盘', visual: './assets/img/E11.webp', rarity: 'common', weight: 10 },
    { id: 'E12', seriesId: 'E', name: '极光帐篷（隐藏款）', visual: './assets/img/E12.webp', rarity: 'epic', weight: 26 },

    { id: 'F01', seriesId: 'F', name: '小魔女', visual: './assets/img/F01.webp', rarity: 'rare', weight: 20 },
    { id: 'F02', seriesId: 'F', name: '黑猫使魔', visual: './assets/img/F02.webp', rarity: 'common', weight: 11 },
    { id: 'F03', seriesId: 'F', name: '魔法书', visual: './assets/img/F03.webp', rarity: 'common', weight: 10 },
    { id: 'F04', seriesId: 'F', name: '星月水晶球', visual: './assets/img/F04.webp', rarity: 'common', weight: 10 },
    { id: 'F05', seriesId: 'F', name: '魔药瓶', visual: './assets/img/F05.webp', rarity: 'common', weight: 10 },
    { id: 'F06', seriesId: 'F', name: '飞天扫帚', visual: './assets/img/F06.webp', rarity: 'common', weight: 10 },
    { id: 'F07', seriesId: 'F', name: '小小幼龙', visual: './assets/img/F07.webp', rarity: 'rare', weight: 20 },
    { id: 'F08', seriesId: 'F', name: '魔法帽', visual: './assets/img/F08.webp', rarity: 'common', weight: 10 },
    { id: 'F09', seriesId: 'F', name: '悬空城堡', visual: './assets/img/F09.webp', rarity: 'rare', weight: 20 },
    { id: 'F10', seriesId: 'F', name: '占星仪', visual: './assets/img/F10.webp', rarity: 'common', weight: 10 },
    { id: 'F11', seriesId: 'F', name: '魔法卷轴', visual: './assets/img/F11.webp', rarity: 'common', weight: 10 },
    { id: 'F12', seriesId: 'F', name: '幻彩飞龙（隐藏款）', visual: './assets/img/F12.webp', rarity: 'epic', weight: 26 }
  ];

  function findPrize(id) {
    for (var i = 0; i < PRIZES.length; i++) {
      if (PRIZES[i].id === id) return PRIZES[i];
    }
    return null;
  }

  function findSeries(id) {
    for (var i = 0; i < SERIES.length; i++) {
      if (SERIES[i].id === id) return SERIES[i];
    }
    return null;
  }

  function totalWeight() {
    var sum = 0;
    for (var i = 0; i < PRIZES.length; i++) sum += PRIZES[i].weight;
    return sum;
  }

  /* 启动期概率校验：奖池配置错误立即抛错，绝不允许带病运行（D6/T002） */
  function validateConfig() {
    var seen = {};
    for (var i = 0; i < PRIZES.length; i++) {
      var p = PRIZES[i];
      if (seen[p.id]) throw new Error('奖品 ID 重复: ' + p.id);
      seen[p.id] = true;
      if (!findSeries(p.seriesId)) throw new Error('未知系列: ' + p.id + ' -> ' + p.seriesId);
      if (!RARITY[p.rarity]) throw new Error('未知稀有度: ' + p.id + ' -> ' + p.rarity);
      if (typeof p.weight !== 'number' || !(p.weight > 0) || p.weight % 1 !== 0) {
        throw new Error('权重必须为正整数: ' + p.id);
      }
      if (String(p.visual).indexOf('./assets/img/') !== 0) {
        throw new Error('visual 必须指向包内 ./assets/img/: ' + p.id);
      }
    }
    if (!COVERS.length) throw new Error('COVERS 不能为空');
    for (var j = 0; j < COVERS.length; j++) {
      if (String(COVERS[j]).indexOf('./assets/img/covers/') !== 0) {
        throw new Error('封面必须指向包内 ./assets/img/covers/: ' + COVERS[j]);
      }
    }
    var seenCode = {};
    for (var k = 0; k < REDEEM_CODES.length; k++) {
      var rc = REDEEM_CODES[k];
      if (!rc.code || seenCode[rc.code]) throw new Error('兑换码缺失或重复: ' + rc.code);
      seenCode[rc.code] = true;
      if (typeof rc.tokens !== 'number' || !(rc.tokens > 0) || rc.tokens % 1 !== 0) {
        throw new Error('兑换码代币数必须为正整数: ' + rc.code);
      }
    }
    var sum = totalWeight();
    if (sum !== 1000) throw new Error('权重合计必须为 1000（=100%），当前 ' + sum);
    return true;
  }

  BlindBox.RULES = RULES;
  BlindBox.REDEEM_CODES = REDEEM_CODES;
  BlindBox.RARITY = RARITY;
  BlindBox.COVERS = COVERS;
  BlindBox.SERIES = SERIES;
  BlindBox.PRIZES = PRIZES;
  BlindBox.findPrize = findPrize;
  BlindBox.findSeries = findSeries;
  BlindBox.totalWeight = totalWeight;
  BlindBox.validateConfig = validateConfig;
})();
