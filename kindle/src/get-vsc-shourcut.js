// https://support.microsoft.com/zh-cn/windows/windows-%E7%9A%84%E9%94%AE%E7%9B%98%E5%BF%AB%E6%8D%B7%E6%96%B9%E5%BC%8F-dcc61a57-8ff0-cffe-9796-cb9706c75eec
var json = []
var temp = []
document.querySelectorAll('.keybindings-body').forEach(se=>{
  const t = {}
  t.table = []
  se.querySelectorAll('.monaco-list-row').forEach(tr=>{
    if(temp.indexOf(tr.id) !== -1) return
    temp.push(tr.id)
    console.log(temp.length)
    const tds = tr.querySelectorAll('.monaco-table-td')
    if(
      !/默认值/.test(tds[4].innerText) || tds[2].innerText.length===0
    ){
      console.log(tds[4], tds[2].innerText.length, tr.innerText)
      return
    }
    t.table.push({
      keySource : tds[2].innerText,
      desc : tds[1].innerText,
    })
  })
  json.push(t)
})

console.log(JSON.stringify(json))