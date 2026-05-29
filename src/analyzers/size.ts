import path from 'node:path'
import { scanDirectory, type FileInfo } from '../utils/file.js'
import { isImageFile, getFileExtension } from '../utils/path.js'
import { formatSize, formatPercent } from '../utils/format.js'
import type { SizeAnalysisResult } from '../types/analysis.js'

/**
 * 分析项目包体积
 */
export async function analyzeSize(
  projectDir: string,
  options: {
    ignore?: string[]
    warnOnLargeFile?: number
  } = {}
): Promise<SizeAnalysisResult> {
  const { ignore = ['node_modules', '.git', 'dist'], warnOnLargeFile = 100 } = options

  // 扫描所有文件
  const files = await scanDirectory(projectDir, { ignore })

  // 计算总体积
  const totalSize = files.reduce((sum, file) => sum + file.size, 0)

  // 按类型分组
  const sizeByType: Record<string, { size: number; count: number }> = {}
  for (const file of files) {
    const ext = file.extension || 'unknown'
    if (!sizeByType[ext]) {
      sizeByType[ext] = { size: 0, count: 0 }
    }
    sizeByType[ext].size += file.size
    sizeByType[ext].count += 1
  }

  // 按目录分组
  const sizeByDir: Record<string, { size: number; count: number }> = {}
  for (const file of files) {
    const dir = path.dirname(file.relativePath) || '.'
    if (!sizeByDir[dir]) {
      sizeByDir[dir] = { size: 0, count: 0 }
    }
    sizeByDir[dir].size += file.size
    sizeByDir[dir].count += 1
  }

  // 按体积排序
  const sortedFiles = [...files].sort((a, b) => b.size - a.size)

  // 计算每个文件的占比
  const fileList = sortedFiles.map((file) => ({
    path: file.relativePath,
    size: file.size,
    percent: totalSize > 0 ? (file.size / totalSize) * 100 : 0,
    type: getFileExtension(file.path) || 'unknown',
  }))

  // 图片统计
  const imageFiles = files.filter((file) => isImageFile(file.path))
  const imagesByFormat: Record<string, { size: number; count: number }> = {}
  for (const file of imageFiles) {
    const ext = file.extension || 'unknown'
    if (!imagesByFormat[ext]) {
      imagesByFormat[ext] = { size: 0, count: 0 }
    }
    imagesByFormat[ext].size += file.size
    imagesByFormat[ext].count += 1
  }

  const images = {
    totalSize: imageFiles.reduce((sum, file) => sum + file.size, 0),
    count: imageFiles.length,
    byFormat: imagesByFormat,
  }

  // 生成优化建议
  const suggestions: string[] = []

  // 检查大文件
  const largeFiles = sortedFiles.filter((f) => f.size > warnOnLargeFile * 1024)
  if (largeFiles.length > 0) {
    suggestions.push(`发现 ${largeFiles.length} 个大于 ${warnOnLargeFile}KB 的文件`)
  }

  // 检查可压缩的图片
  const compressibleImages = imageFiles.filter((f) => f.size > 10 * 1024)
  if (compressibleImages.length > 0) {
    const totalImageSize = compressibleImages.reduce((sum, f) => sum + f.size, 0)
    suggestions.push(
      `${compressibleImages.length} 张图片可压缩，预计可节省 ${formatSize(totalImageSize * 0.5)}`
    )
  }

  // 检查未使用的图片（需要依赖分析，这里简化处理）
  if (imageFiles.length > 0) {
    suggestions.push('运行 `wdc unused` 检测未使用的图片')
  }

  return {
    totalSize,
    totalFiles: files.length,
    sizeByType,
    sizeByDir,
    files: fileList,
    images,
    suggestions,
  }
}
