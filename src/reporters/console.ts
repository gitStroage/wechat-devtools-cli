import chalk from 'chalk'
import Table from 'cli-table3'
import { formatSize, formatPercent, truncate } from '../utils/format.js'
import type { SizeAnalysisResult, UnusedAnalysisResult, CompressResult } from '../types/analysis.js'

/**
 * 输出体积分析报告到控制台
 */
export function printSizeReport(result: SizeAnalysisResult, detail = false): void {
  console.log()
  console.log(chalk.bold('📦 Mini Program Bundle Analysis'))
  console.log(chalk.gray('━'.repeat(50)))

  // 总体统计
  console.log()
  console.log(
    `Total: ${chalk.bold(formatSize(result.totalSize))} | Files: ${chalk.bold(result.totalFiles)}`
  )

  // 体积分布 (Top 10)
  console.log()
  console.log(chalk.bold('📁 Size Distribution (Top 10):'))

  const table = new Table({
    head: [chalk.white('File'), chalk.white('Size'), chalk.white('Percent')],
    colWidths: [50, 12, 10],
    style: { head: [] },
  })

  const topFiles = result.files.slice(0, 10)
  for (const file of topFiles) {
    const sizeColor = file.size > 100 * 1024 ? chalk.red : file.size > 50 * 1024 ? chalk.yellow : chalk.green
    table.push([
      truncate(file.path, 45),
      sizeColor(formatSize(file.size)),
      formatPercent(file.percent),
    ])
  }
  console.log(table.toString())

  // 图片统计
  if (result.images.count > 0) {
    console.log()
    console.log(chalk.bold('🖼️  Image Distribution:'))

    const imgTable = new Table({
      head: [chalk.white('Format'), chalk.white('Size'), chalk.white('Count')],
      colWidths: [20, 15, 10],
      style: { head: [] },
    })

    for (const [format, data] of Object.entries(result.images.byFormat)) {
      imgTable.push([format, formatSize(data.size), data.count.toString()])
    }
    console.log(imgTable.toString())
  }

  // 按类型统计
  if (detail) {
    console.log()
    console.log(chalk.bold('📊 Size by Type:'))

    const typeTable = new Table({
      head: [chalk.white('Type'), chalk.white('Size'), chalk.white('Count'), chalk.white('Percent')],
      colWidths: [15, 15, 10, 10],
      style: { head: [] },
    })

    const sortedTypes = Object.entries(result.sizeByType).sort(
      ([, a], [, b]) => b.size - a.size
    )

    for (const [type, data] of sortedTypes) {
      const percent = result.totalSize > 0 ? (data.size / result.totalSize) * 100 : 0
      typeTable.push([type, formatSize(data.size), data.count.toString(), formatPercent(percent)])
    }
    console.log(typeTable.toString())
  }

  // 优化建议
  if (result.suggestions.length > 0) {
    console.log()
    console.log(chalk.bold('💡 Optimization Suggestions:'))
    for (const suggestion of result.suggestions) {
      console.log(chalk.yellow('  •'), suggestion)
    }
  }
}

/**
 * 输出未使用代码报告到控制台
 */
export function printUnusedReport(result: UnusedAnalysisResult): void {
  console.log()
  console.log(chalk.bold('🔍 Unused Code Detection'))
  console.log(chalk.gray('━'.repeat(50)))

  if (result.unusedFiles.length === 0) {
    console.log()
    console.log(chalk.green('✓ No unused files found!'))
    return
  }

  // 按类型分组显示
  console.log()
  console.log(chalk.bold(`📄 Unused Files (${result.unusedFiles.length}):`))

  const table = new Table({
    head: [chalk.white('File'), chalk.white('Type'), chalk.white('Size')],
    colWidths: [50, 12, 12],
    style: { head: [] },
  })

  for (const file of result.unusedFiles) {
    table.push([truncate(file.path, 45), file.type, formatSize(file.size)])
  }
  console.log(table.toString())

  // 总计
  console.log()
  console.log(
    chalk.bold('📊 Total:'),
    `${result.unusedFiles.length} files, ${chalk.yellow(formatSize(result.totalReclaimableSize))} reclaimable`
  )
}

/**
 * 输出压缩报告到控制台
 */
export function printCompressReport(result: CompressResult): void {
  console.log()
  console.log(chalk.bold('🖼️  Image Compression'))
  console.log(chalk.gray('━'.repeat(50)))

  if (result.files.length === 0) {
    console.log()
    console.log(chalk.green('✓ No files to compress!'))
    return
  }

  // 压缩结果表格
  console.log()
  const table = new Table({
    head: [chalk.white('File'), chalk.white('Original'), chalk.white('Compressed'), chalk.white('Saved')],
    colWidths: [45, 12, 12, 10],
    style: { head: [] },
  })

  for (const file of result.files) {
    table.push([
      truncate(file.path, 40),
      formatSize(file.originalSize),
      formatSize(file.compressedSize),
      chalk.green(formatPercent(file.savedPercent)),
    ])
  }
  console.log(table.toString())

  // 总计
  console.log()
  console.log(chalk.bold('📈 Summary:'))
  console.log(`  Processed: ${result.processedCount} files`)
  console.log(`  Original:  ${formatSize(result.originalSize)}`)
  console.log(`  Compressed: ${formatSize(result.compressedSize)}`)
  console.log(`  Saved:     ${chalk.green(formatSize(result.savedSize))} (${chalk.green(formatPercent(result.savedPercent))})`)
}
