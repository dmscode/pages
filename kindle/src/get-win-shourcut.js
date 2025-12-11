// https://support.microsoft.com/zh-cn/windows/windows-%E7%9A%84%E9%94%AE%E7%9B%98%E5%BF%AB%E6%8D%B7%E6%96%B9%E5%BC%8F-dcc61a57-8ff0-cffe-9796-cb9706c75eec
var json = []
document.querySelectorAll('#WindowsVersion-supTabControlContent-1 section.ocpSection').forEach(se=>{
  const t = {}
  t.title = se.querySelector('h2').innerText.replace(/\n\s*/g, ''),
  t.table = []
  se.querySelectorAll('tr').forEach(tr=>{
    if(!tr.querySelectorAll('td').length){
      return
    }
    t.table.push({
      keySource : tr.querySelectorAll('td')[0].innerText.replace(/\n\s*/g, ''),
      desc : tr.querySelectorAll('td')[1].innerText.replace(/\n\s*/g, '').trim(),
    })
  })
  json.push(t)
})

json.forEach(group=>{
  group.table.forEach(sk=>{
    sk.key = sk.keySource
            .replace(/Windows 徽标键/g, 'Win')
            .replace(/空格键/g, 'Space')
            .replace(/\s+键/g, '')
            .replace(/（及箭头键）/g, ' + 箭头键')
            .replace(/按 Shift 与任何箭头键/g, 'Shift + 箭头键')
            .replace(/箭头键/g, '方向键')
            .replace(/向左键/g, '←')
            .replace(/向右键/g, '→')
            .replace(/向上键/g, '↑')
            .replace(/向下键/g, '↓')
            .replace(/ （数字 1–9）/g, '')
            .replace(/数字/g, '1~9')
            .replace(/(句号|逗号|分号|加号|减号|正斜杠|反斜杠|星号)\s*\((.)\)/g, '$2')
            .split(/（\s*或\s*/g)
    // console.log(sk.keySource)
    sk.key.forEach((keys, i)=>{
      sk.key[i] = keys
                  .replace(/^([^（]*)）/g, '$1')
                  .replace(/\s*或\s*/g, ' 或 ')
                  .trim().split(/\s+\+\s+/g)
    })
    // console.log(sk.key)
  })
})

console.log(JSON.stringify(json))