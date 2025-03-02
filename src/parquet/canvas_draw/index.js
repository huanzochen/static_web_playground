const worker = new Worker(new URL('./parquetWorker.js', import.meta.url), {
  type: 'module',
})

const randomColor = [
  '#5C7285',
  '#818C78',
  '#A7B49E',
  '#E2E0C8',
  '#E6B2BA',
  '#FAD0C4',
]

const output = document.getElementById('output')
const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')

canvas.width = window.innerWidth - 10
canvas.height = window.innerWidth - 10
const width = canvas.width
const height = canvas.height

const PAGE_SIZE = 100_000
let offset = 0
let totalRows

let autoLoadTimeoutId
let stopAutoLoad = false

const updateLoadingUI = () => {
  console.log(`正在載入第 ${offset / PAGE_SIZE + 1} 頁...`)
  output.textContent = `正在載入第 ${offset / PAGE_SIZE + 1} 頁...`
}

const getRandomColor = () => {
  const rand = Math.floor(Math.random() * randomColor.length)
  return randomColor[rand]
}

const scale = (value, min, max, newMin, newMax) => {
  return ((value - min) / (max - min)) * (newMax - newMin) + newMin
}

const updateContent = (content) => {
  content.forEach((el) => {
    const scaledX = scale(el.x, 0, 1000, 0, width)
    const scaledY = scale(el.y, 0, 1000, 0, height)

    ctx.beginPath()
    ctx.arc(scaledX, scaledY, 5, 0, 2 * Math.PI)
    ctx.fillStyle = getRandomColor()
    ctx.fill()
  })
  loadNext()
}

updateLoadingUI()

async function loadParquetFile() {
  try {
    // 讀取 parquet 檔案
    const response = await fetch('/10Mpoints_1000x1000.parquet')
    if (!response.ok) throw new Error('無法讀取 Parquet 文件')

    // 轉換為 Uint8Array
    const arrayBuffer = await response.arrayBuffer()

    // 確保 `arrayBuffer` 是 `ArrayBuffer`
    if (!(arrayBuffer instanceof ArrayBuffer)) {
      throw new Error('arrayBuffer 格式錯誤')
    }
    console.log('✅ 傳輸前的 arrayBuffer:', arrayBuffer.byteLength)

    worker.postMessage({ action: 'loadParquet', arrayBuffer }, [arrayBuffer])
  } catch (error) {
    console.error('Fetch 失敗:', error)
  }
}

worker.onmessage = (event) => {
  const { action, error, message } = event.data

  if (action === 'ready') {
    // 請 worker 進行讀取
    loadParquetFile()
  }

  // logging
  if (action === 'log') console.log('Worker:', message)

  if (action === 'parquet loaded') {
    const { totalRows: newTotalRows } = event.data
    totalRows = newTotalRows

    console.log(`Parquet 檔案加載完成！ 共 ${totalRows} 行`)

    worker.postMessage({ action: 'loadData', offset, PAGE_SIZE })
  }

  if (action === 'data') {
    const { content } = event.data
    updateContent(content)
  }

  if (action === 'auto data') {
    const { content } = event.data
    updateContent(content)
  }

  if (action === 'error') {
    console.error('worker 讀取失敗:', error)
  }
}

const loadNext = () => {
  offset += PAGE_SIZE
  updateLoadingUI()
  worker.postMessage({ action: 'autoLoadData', offset, PAGE_SIZE })
}

document.getElementById('auto_next').addEventListener('click', () => {
  stopAutoLoad = false
  loadNext()
})

document.getElementById('stop_auto').addEventListener('click', () => {
  stopAutoLoad = true
  clearTimeout(autoLoadTimeoutId)
  console.log('auto load stop')
})
