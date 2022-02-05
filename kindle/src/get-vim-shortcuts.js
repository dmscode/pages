var json = []
var tempTitle
document.querySelectorAll('article > h2, article > table').forEach(se=>{
  if(se.tagName==='H2'){
    tempTitle = se.innerText
    return
  }
  const t = {}
  t.title = tempTitle
  t.table = []
  se.querySelectorAll('tr').forEach(tr=>{
    if(!tr.querySelector('td')) {
      console.log(tr.innerText)
      return
    }
    const arr = tr.querySelectorAll('td')
    const keySource = arr[1].innerText
    const key = []
    keySource.split(/\//g)
             .forEach(keys=>{
               key.push(keys.trim().split(/\s+\+\s+/g))
             })
    t.table.push({
      keySource,
      key,
      desc : arr[0].innerText,
    })
  })
  json.push(t)
})

console.log(JSON.stringify(json))