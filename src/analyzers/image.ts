import path from 'node:path'
import fs from 'fs-extra'
import { scanImages, type FileInfo } from '../utils/file.js'
import { formatSize, formatPercent } from '../utils/format.js'
import type { CompressResult } from '../types/analysis.js'

export interface CompressOptions {
  quality: number
  output?: string
  backup?: boolean
  threshold?: number
  dryRun?: boolean
}

/**
 * 压缩项目中的图片
 */
export async function compressImages(
  projectDir: string,
  options: CompressOptions
): Promise<CompressResult> {
  const {
    quality = 80,
    output,
    backup = false,
    threshold = 10240, // 10KB
    dryRun = false,
  } = options

  // 扫描图片文件
  const images = await scanImages(projectDir, ['node_modules', '.git', 'dist'])

  // 过滤大于阈值的图片
  const targetImages = images.filter((img) => img.size > threshold)

  if (targetImages.length === 0) {
    return {
      processedCount: 0,
      originalSize: 0,
      compressedSize: 0,
      savedSize: 0,
      savedPercent: 0,
      files: [],
    }
  }

  // 尝试加载 sharp
  let sharp: any
  try {
    sharp = (await import('sharp')).default
  } catch {
    throw new Error(
      'sharp is not installed. Run: npm install sharp\n' +
      'Note: sharp requires Node.js 18+ and may need platform-specific installation.'
    )
  }

  const results: CompressResult['files'] = []
  let totalOriginalSize = 0
  let totalCompressedSize = 0

  for (const image of targetImages) {
    try {
      const originalSize = image.size

      if (dryRun) {
        // 预估压缩后大小
        const estimatedSize = Math.round(originalSize * (quality / 100) * 0.7)
        results.push({
          path: image.relativePath,
          originalSize,
          compressedSize: estimatedSize,
          savedPercent: ((originalSize - estimatedSize) / originalSize) * 100,
        })
        totalOriginalSize += originalSize
        totalCompressedSize += estimatedSize
        continue
      }

      // 备份原文件
      if (backup) {
        const backupPath = `${image.path}.backup`
        await fs.copy(image.path, backupPath)
      }

      // 压缩图片
      const outputPath = output
        ? path.join(output, image.relativePath)
        : image.path

      // 确保输出目录存在
      await fs.ensureDir(path.dirname(outputPath))

      const ext = path.extname(image.path).toLowerCase()
      let sharpInstance = sharp(image.path)

      // 根据格式设置压缩选项
      switch (ext) {
        case '.jpg':
        case '.jpeg':
          sharpInstance = sharpInstance.jpeg({ quality, mozjpeg: true })
          break
        case '.png':
          sharpInstance = sharpInstance.png({
            quality,
            compressionLevel: 9,
            palette: true,
          })
          break
        case '.webp':
          sharpInstance = sharpInstance.webp({ quality })
          break
        case '.gif':
          // GIF 压缩有限，主要做格式转换
          sharpInstance = sharpInstance.gif()
          break
        default:
          // 其他格式保持原样
          break
      }

      const buffer = await sharpInstance.toBuffer()
      const compressedSize = buffer.length

      // 只有压缩后更小才写入
      if (compressedSize < originalSize) {
        await fs.writeFile(outputPath, buffer)
      }

      results.push({
        path: image.relativePath,
        originalSize,
        compressedSize: Math.min(compressedSize, originalSize),
        savedPercent: ((originalSize - Math.min(compressedSize, originalSize)) / originalSize) * 100,
      })

      totalOriginalSize += originalSize
      totalCompressedSize += Math.min(compressedSize, originalSize)
    } catch (error) {
      console.error(`Failed to compress ${image.path}:`, error)
    }
  }

  return {
    processedCount: results.length,
    originalSize: totalOriginalSize,
    compressedSize: totalCompressedSize,
    savedSize: totalOriginalSize - totalCompressedSize,
    savedPercent: totalOriginalSize > 0
      ? ((totalOriginalSize - totalCompressedSize) / totalOriginalSize) * 100
      : 0,
    files: results,
  }
}
