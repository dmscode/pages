/**
 * 获取链接中的 get 参数。
 *
 * @param {string} key 要获取的键值
 * @param {string|undefined} defVal 默认值
 * @return {string}
 */
var getQuery = function(key, defVal){
  var reg = new RegExp('^.*[?&]'+key+'=([^#&]+)(?:[#&].*)?$', '')
  if(window.location.search && reg.test(window.location.search)){
    return decodeURIComponent(window.location.search.replace(reg, '$1'))
  }
  return defVal
}
/**
 * 将数字两位化输出。
 *
 * @param {number} num
 * @return {string}
 */
var dbNum = function(num){
  return num>9 ? ''+num : '0'+num
}
/** @type {number} 获取用户指定的时区 */
var timeZone = +getQuery('tz', -new Date().getTimezoneOffset()/60)
/** @type {number} 时间偏移量（毫秒） */
var timeOffset = (timeZone*60+new Date().getTimezoneOffset())*6e4
/**
 * 修正时间偏移量
 *
 * 加入时间偏移量之后的计算好混乱啊
 * 这时候应该注意自己要的是什么
 * 要时间点：就加偏移，从这个时间点获得的年月日就都正确了
 * 要时间间隔：两侧都加或者都不加，这样就没有影响了
 *
 * @param {Date|number} [time=new Date()]
 * @return {Date}
 */
var fixDate = function(time){
  time = time ? +time : +new Date()
  return new Date(time+timeOffset)
}