import parquet from 'parquetjs-lite'
import path from 'path'
import { fileURLToPath } from 'url'

async function generateParquetFile(filename, numPoints) {
  const __filename = fileURLToPath(import.meta.url)
  const __dirname = path.dirname(__filename)
  const filePath = path.join(__dirname, "../public", filename)
  console.log(`開始生成 ${numPoints} 個點...`)

  const schema = new parquet.ParquetSchema({
    x: { type: 'DOUBLE' },
    y: {type: 'DOUBLE'}
  })

  const writer = await parquet.ParquetWriter.openFile(schema, filePath)

  for (let i = 0; i < numPoints; i++){
    const x = Math.random() * 1000;
    const y = Math.random() * 1000;
    await writer.appendRow({ x, y })
    
    if (i % 100_000 === 0) {
      console.log(`已產生 ${i} 個點...`)
    }
  }

  await writer.close();
  console.log(`Parquet 文件 "${filePath}" 已完成！`)
}


generateParquetFile("points.parquet", 10_000_000)