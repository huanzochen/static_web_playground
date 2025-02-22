import wasmInit, { readParquet } from "parquet-wasm";

// Asynchronously initialize WebAssembly
async function initializeParquetWasm() {
  await wasmInit("https://cdn.jsdelivr.net/npm/parquet-wasm@0.6.1/esm/parquet_wasm_bg.wasm");
  console.log("parquet-wasm initialized");
}

await initializeParquetWasm();

async function loadParquet() {
  // 讀取 parquet 檔案
  const response = await fetch("/10Mpoints.parquet");
  if (!response.ok) {
    throw new Error("無法讀取 Parquet 文件");
  }

  // 轉換為 Uint8Array
  const arrayBuffer = await response.arrayBuffer();
  const parquetData = new Uint8Array(arrayBuffer);

  // 讀取 Parquet 文件
  const wasmTable = readParquet(parquetData);

  // 轉換為 JS Arrow Table
  import("apache-arrow").then(arrow => {
    const table = arrow.tableFromIPC(wasmTable.intoIPCStream());

    // 取得欄位名稱
    console.log("Schema:", table.schema.toString());

    // 逐行讀取 x, y 欄位
    const rows = [];
    for (let i = 0; i < Math.min(10_000, table.numRows); i++) {
      const x = table.getChild("x")?.get(i);
      const y = table.getChild("y")?.get(i);
      rows.push({ x, y });
    }

    console.log("讀取的資料：", rows);
    
    // 顯示結果
    document.getElementById("output").textContent = "Loaded Done"
  });
}

// 執行讀取
loadParquet().catch(error => {
  console.error("讀取 Parquet 失敗：", error);
});
