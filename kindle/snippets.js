/**
 * 绘制圆角矩形
 *
 * @param {CanvasRenderingContext2D} ctx 画布上下文对象
 * @param {number} x 矩形左上角横坐标
 * @param {number} y 矩形左上角纵坐标
 * @param {number} w 矩形宽度
 * @param {number} h 矩形高度
 * @param {number|undefined} r1 左上角半径，缺省为 0
 * @param {number|undefined} r2 右上角半径，缺省为 r1
 * @param {number|undefined} r3 右下角半径，缺省为 r2
 * @param {number|undefined} r4 左下角半径，缺省为 r3
 */
var drawRoundedRect = function(ctx, x, y, w, h, r1, r2, r3, r4){
  if(isNaN(r1)){ r1 = 0 }
  if(isNaN(r2)){ r2 = r1 }
  if(isNaN(r3)){ r3 = r2 }
  if(isNaN(r4)){ r4 = r3 }

  var ptA = { 'x': x,   'y': y+h-r4 }
  var ptB = { 'x': x,   'y': y }
  var ptC = { 'x': x+w, 'y': y }
  var ptD = { 'x': x+w, 'y': y+h }
  var ptE = { 'x': x,   'y': y+h }

  ctx.beginPath();

  ctx.moveTo(ptA.x, ptA.y);
  ctx.arcTo(ptB.x, ptB.y, ptC.x, ptC.y, r1);
  ctx.arcTo(ptC.x, ptC.y, ptD.x, ptD.y, r2);
  ctx.arcTo(ptD.x, ptD.y, ptE.x, ptE.y, r3);
  ctx.arcTo(ptE.x, ptE.y, ptA.x, ptA.y, r4);
  ctx.closePath()
}

/**
 * 直角的倒角过渡
 *
 * @param {CanvasRenderingContext2D} ctx 画布上下文对象
 * @param {number} x1 起点横坐标
 * @param {number} y1 起点纵坐标
 * @param {number} x2 重点横坐标
 * @param {number} y2 重点纵坐标
 * @param {number} r 倒角半径
 * @param {boolean} isClockwise 是否顺时针方向
 */
var rightCornerTo = function(ctx, x1, y1, x2, y2, r, isClockwise){
  var p = (x1<=x2 && y1<=y2)||(x1>=x2 && y1>=y2)
        ? (isClockwise ? {x: x2, y: y1} : {x: x1, y: y2} )
        : (isClockwise ? {x: x1, y: y2} : {x: x2, y: y1} )
  ctx.arcTo(p.x, p.y, x2, y2, r)
}