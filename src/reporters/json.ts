import fs from 'fs-extra'
import type { SizeAnalysisResult, UnusedAnalysisResult, CompressResult } from '../types/analysis.js'

/**
 * 输出 JSON 格式报告
 */
export async function writeJsonReport<T>(filePath: string, data: T): Promise<void> {
  await fs.writeJson(filePath, data, { spaces: 2 })
}

/**
 * 生成 HTML 格式的体积分析报告
 */
export function generateSizeHtmlReport(result: SizeAnalysisResult): string {
  const topFiles = result.files.slice(0, 20)

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mini Program Bundle Analysis</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; }
    h1 { color: #333; }
    .summary { display: flex; gap: 20px; margin: 20px 0; }
    .card { background: #f5f5f5; padding: 20px; border-radius: 8px; flex: 1; }
    .card h3 { margin: 0 0 10px; color: #666; }
    .card .value { font-size: 24px; font-weight: bold; color: #333; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background: #f5f5f5; }
    .bar { height: 20px; background: #4CAF50; border-radius: 4px; }
    .suggestions { background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; }
    .suggestions li { margin: 5px 0; }
  </style>
</head>
<body>
  <h1>📦 Mini Program Bundle Analysis</h1>

  <div class="summary">
    <div class="card">
      <h3>Total Size</h3>
      <div class="value">${formatBytes(result.totalSize)}</div>
    </div>
    <div class="card">
      <h3>Total Files</h3>
      <div class="value">${result.totalFiles}</div>
    </div>
    <div class="card">
      <h3>Images</h3>
      <div class="value">${result.images.count} (${formatBytes(result.images.totalSize)})</div>
    </div>
  </div>

  <h2>Top 20 Files</h2>
  <table>
    <thead>
      <tr>
        <th>File</th>
        <th>Size</th>
        <th>Percent</th>
        <th>Distribution</th>
      </tr>
    </thead>
    <tbody>
      ${topFiles
        .map(
          (file) => `
        <tr>
          <td>${file.path}</td>
          <td>${formatBytes(file.size)}</td>
          <td>${file.percent.toFixed(2)}%</td>
          <td><div class="bar" style="width: ${Math.min(file.percent * 2, 100)}%"></div></td>
        </tr>`
        )
        .join('')}
    </tbody>
  </table>

  ${
    result.suggestions.length > 0
      ? `
    <div class="suggestions">
      <h3>💡 Optimization Suggestions</h3>
      <ul>
        ${result.suggestions.map((s) => `<li>${s}</li>`).join('')}
      </ul>
    </div>`
      : ''
  }
</body>
</html>`
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
