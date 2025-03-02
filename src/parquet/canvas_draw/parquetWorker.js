import wasmInit, { readParquet } from 'parquet-wasm'

// Asynchronously initialize WebAssembly
async function initializeParquetWasm() {
  await wasmInit(
    'https://cdn.jsdelivr.net/npm/parquet-wasm@0.6.1/esm/parquet_wasm_bg.wasm'
  )
  console.log('parquet-wasm initialized')
}

await initializeParquetWasm()

self.postMessage({ action: 'ready' })

let table

self.onmessage = async (event) => {
  const { action } = event.data

  // Log to main thread
  postMessage({
    action: 'log',
    message: 'recieved: ' + JSON.stringify(event.data),
  }) // 傳回主執行緒

  if (action === 'loadParquet') {
    const { arrayBuffer } = event.data
    try {
      // 轉換為 Uint8Array
      const parquetData = new Uint8Array(arrayBuffer)

      // 讀取 Parquet 文件
      const wasmTable = readParquet(parquetData)

      // 轉換為 JS Arrow Table
      import('apache-arrow').then((arrow) => {
        table = arrow.tableFromIPC(wasmTable.intoIPCStream())

        // 取得欄位名稱
        console.log('Schema:', table.schema.toString())

        postMessage({
          action: 'parquet loaded',
          totalRows: table.numRows,
        })
      })
    } catch (error) {
      postMessage({ action: 'error', error: error.message })
    }
  }

  if (action === 'loadData') {
    const { offset, PAGE_SIZE } = event.data

    try {
      postMessage({ action: 'data', content: loadNextPage(offset, PAGE_SIZE) })
    } catch (error) {
      postMessage({ action: 'error', error: error.message })
    }
  }

  if (action === 'autoLoadData') {
    const { offset, PAGE_SIZE } = event.data

    try {
      postMessage({
        action: 'auto data',
        content: loadNextPage(offset, PAGE_SIZE),
      })
    } catch (error) {
      postMessage({ action: 'error', error: error.message })
    }
  }
}

const loadNextPage = (offset, PAGE_SIZE) => {
  // 逐行讀取 x, y 欄位
  const rows = []
  for (let i = offset; i < Math.min(offset + PAGE_SIZE, table.numRows); i++) {
    const x = table.getChild('x')?.get(i)
    const y = table.getChild('y')?.get(i)
    rows.push({ x, y })
  }

  console.log('讀取的資料：', rows)

  return rows
}
