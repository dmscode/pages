// https://support.apple.com/zh-cn/HT201236
var json = []
document.querySelectorAll('#sections > div').forEach(se=>{
  if(!se.querySelector('h2')) return
  const t = {}
  t.title = se.querySelector('h2').innerText.replace(/\n\s*/g, ''),
  t.table = []
  se.querySelectorAll('li').forEach(tr=>{
    if(!tr.querySelector('strong')) {
      console.log(tr.innerText)
      return
    }
    const arr = tr.innerText.split('：')
    const keySource = arr.shift().trim()
    const key = []
    keySource.replace(/左箭头/g, '←')
             .replace(/右箭头/g, '→')
             .replace(/上箭头/g, '↑')
             .replace(/下箭头/g, '↓')
             .replace(/[-–][^\w]+ \(([^)])\)/g, '-$1')
             .split(/或/g)
             .forEach(keys=>{
               key.push(keys.trim().split(/[-–]/g))
             })
    t.table.push({
      keySource,
      key,
      desc : arr.join('：'),
    })
  })
  json.push(t)
})

console.log(JSON.stringify(json))

// https://support.apple.com/zh-cn/HT204434
var json = []
document.querySelectorAll('#sections > div').forEach(se=>{
  if(!se.querySelector('h2')) return
  const t = {}
  t.title = se.querySelector('h2').innerText.replace(/\n\s*/g, ''),
  t.table = []
  se.querySelectorAll('tr').forEach(tr=>{
    if(!tr.querySelector('td')) {
      console.log(tr.innerText)
      return
    }
    const arr = tr.querySelectorAll('td')
    const keySource = arr[1].innerText
    const key = []
    keySource.replace(/左箭头/g, '←')
             .replace(/右箭头/g, '→')
             .replace(/上箭头/g, '↑')
             .replace(/下箭头/g, '↓')
             .replace(/[-–][^\w]+ \(([^)])\)/g, '-$1')
             .split(/或/g)
             .forEach(keys=>{
               key.push(keys.trim().split(/[-–]/g))
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

// https://support.apple.com/zh-cn/guide/safari/cpsh003/mac

var json = []
document.querySelectorAll('.Subhead').forEach(se=>{
  if(!se.querySelector('h2')) return
  const t = {}
  t.title = se.querySelector('h2').innerText.replace(/\n\s*/g, ''),
  t.table = []
  se.querySelectorAll('tr').forEach(tr=>{
    if(!tr.querySelector('td')) {
      console.log(tr.innerText)
      return
    }
    const arr = tr.querySelectorAll('td')
    const keySource = arr[1].innerText
    const key = []
    keySource.replace(/左箭头/g, '←')
             .replace(/右箭头/g, '→')
             .replace(/上箭头/g, '↑')
             .replace(/下箭头/g, '↓')
             .replace(/[-–][^\w]+ \(([^)])\)/g, '-$1')
             .split(/或/g)
             .forEach(keys=>{
               key.push(keys.trim().split(/[-–]/g))
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

// https://support.apple.com/zh-cn/guide/mac-help/mh26783/mac

var json = []
document.querySelectorAll('#article-section').forEach(se=>{
  if(!se.querySelector('h1')) return
  const t = {}
  t.title = se.querySelector('h1').innerText.replace(/\n\s*/g, ''),
  t.table = []
  se.querySelectorAll('tr').forEach(tr=>{
    if(!tr.querySelector('td')) {
      console.log(tr.innerText)
      return
    }
    const arr = tr.querySelectorAll('td')
    const keySource = arr[1].innerText
    const key = []
    keySource.replace(/左箭头/g, '←')
             .replace(/右箭头/g, '→')
             .replace(/上箭头/g, '↑')
             .replace(/下箭头/g, '↓')
             .replace(/[-–][^\w]+ \(([^)])\)/g, '-$1')
             .split(/或/g)
             .forEach(keys=>{
               key.push(keys.trim().split(/[-–]/g))
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
